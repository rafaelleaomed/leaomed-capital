import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase Service Role credentials not configured');
  }
  return createClient(url, key);
};

export async function POST(req: Request) {
  // Desativação segura por configuração caso Open Finance não esteja ativo nesta etapa
  const isWebhookEnabled = process.env.ENABLE_PLUGGY_WEBHOOK === 'true';
  if (!isWebhookEnabled) {
    return Response.json({
      received: false,
      message: 'Integração de webhook do Open Finance desativada por configuração.'
    }, { status: 200 });
  }

  // Configure this Authorization header in Pluggy's registered webhook headers.
  // Never accept untrusted events with service-role database privileges.
  const secret = process.env.PLUGGY_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: 'Autenticação do webhook não configurada.' }, { status: 503 });
  }
  const provided = Buffer.from(req.headers.get('authorization') || '', 'utf8');
  const expected = Buffer.from(`Bearer ${secret}`, 'utf8');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const event = await req.json();

    if (!event || typeof event !== 'object' || !event.eventId || !event.event) {
      return Response.json({ error: 'Payload de evento inválido.' }, { status: 400 });
    }

    console.log('[Webhook Pluggy] Recebido evento:', event.event, 'ID:', event.eventId);

    const supabase = getSupabaseAdmin();

    // Salvar na tabela webhook_events para processamento assíncrono idempotente
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        external_event_id: event.eventId, // Para idempotência
        event_type: event.event,
        item_id: event.itemId || null,
        payload: event,
        status: 'pending'
      });

    if (error) {
      // Se der erro de constraint unique, significa que o webhook já foi recebido antes.
      if (error.code === '23505') {
        console.log(`[Webhook] Evento ${event.eventId} já existe (Idempotência). Ignorando.`);
      } else {
        console.error(`[Webhook] Erro ao salvar evento no banco:`, error);
        return Response.json({ error: 'Database error' }, { status: 500 });
      }
    } else {
      console.log(`[Webhook] Evento ${event.eventId} enfileirado com sucesso.`);
    }

    return Response.json({ received: true });
    
  } catch (err) {
    console.error('[Webhook] Falha no processamento seguro do evento:', err);
    return Response.json({ error: 'Bad Request' }, { status: 400 });
  }
}

