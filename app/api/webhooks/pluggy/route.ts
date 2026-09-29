import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase Service Role credentials not configured');
  }
  return createClient(url, key);
};

export async function POST(req: Request) {
  try {
    const event = await req.json();

    console.log('Received Pluggy webhook:', event.event);
    console.log('Event ID:', event.eventId);

    const supabase = getSupabaseAdmin();

    // Salvar na tabela webhook_events para processamento assíncrono idempotente
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        external_event_id: event.eventId, // Para idempotência
        event_type: event.event,
        item_id: event.itemId,
        payload: event,
        status: 'pending'
      });

    if (error) {
      // Se der erro de constraint unique, significa que o webhook já foi recebido antes.
      // Retornamos 200 de qualquer forma para a Pluggy não ficar fazendo retry desnecessário se já temos o evento.
      if (error.code === '23505') { // 23505 é unique_violation no Postgres
        console.log(`[Webhook] Evento ${event.eventId} já existe (Idempotência). Ignorando.`);
      } else {
        console.error(`[Webhook] Erro ao salvar evento no banco:`, error);
        // Mesmo com erro de banco, tentamos não prender a Pluggy, mas podemos retornar 500 para retry se for falha de rede do banco
        return Response.json({ error: 'Database error' }, { status: 500 });
      }
    } else {
      console.log(`[Webhook] Evento ${event.eventId} enfileirado com sucesso.`);
    }

    // IMPORTANT: Return 2XX within 5 seconds
    return Response.json({ received: true });
    
  } catch (err) {
    console.error('[Webhook] Falha no parsing do evento:', err);
    return Response.json({ error: 'Bad Request' }, { status: 400 });
  }
}
