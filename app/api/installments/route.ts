import { NextResponse } from 'next/server';
import { sql } from '@/utils/db';
import { getAuthenticatedUserId } from '@/utils/auth-helpers';
import { installmentDates } from '@/services/installmentPersistence';

export const dynamic = 'force-dynamic';

function validFields(body: Record<string, unknown>): boolean {
  for (const [key, max] of [['description', 255], ['category', 100], ['subcategory', 100], ['payment_method', 50]] as const) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || String(body[key]).length > max)) return false;
  }
  for (const key of ['current_installment', 'total_installments']) {
    if (body[key] !== undefined && (!Number.isInteger(body[key]) || Number(body[key]) < 1 || Number(body[key]) > 1200)) return false;
  }
  if (body.installment_amount !== undefined && (typeof body.installment_amount !== 'number' || !Number.isFinite(body.installment_amount) || body.installment_amount < 0 || body.installment_amount >= 1e10)) return false;
  for (const key of ['start_date', 'end_date']) {
    if (body[key] !== undefined && body[key] !== null && (typeof body[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(String(body[key])) || !Number.isFinite(Date.parse(String(body[key]))))) return false;
  }
  return true;
}

export async function GET() {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {
    const rows = await sql`
      SELECT id, description, category, subcategory, total_installments, current_installment,
             installment_amount, payment_method, start_date, end_date, is_active
      FROM public.installments
      WHERE user_id = ${userId} AND is_active = TRUE
      ORDER BY installment_amount DESC
    `;

    return NextResponse.json({ success: true, installments: rows }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Erro ao buscar parcelamentos no banco:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha interna ao recuperar projeções de parcelamento.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId, user, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || !validFields(body)) return NextResponse.json({ success: false, error: 'Dados de parcelamento inválidos.' }, { status: 400 });
    const {
      description,
      category,
      subcategory,
      total_installments,
      current_installment,
      installment_amount,
      payment_method,
      start_date,
      end_date
    } = body;

    if (typeof description !== 'string' || !description.trim() || description.length > 255 ||
        (installment_amount !== undefined && (typeof installment_amount !== 'number' || !Number.isFinite(installment_amount) || installment_amount < 0)) ||
        (total_installments !== undefined && (!Number.isInteger(total_installments) || total_installments < 1 || total_installments > 1200)) ||
        (current_installment !== undefined && (!Number.isInteger(current_installment) || current_installment < 1 || current_installment > (total_installments || 12))) ||
        (payment_method !== undefined && (typeof payment_method !== 'string' || payment_method.length > 50))) {
      return NextResponse.json({ success: false, error: 'Dados de parcelamento inválidos.' }, { status: 400 });
    }
    const dates = installmentDates(current_installment || 1, total_installments || 12, start_date, end_date);
    if (user?.email) {
      await sql`INSERT INTO public.users (id, email) VALUES (${userId}, ${user.email.trim().toLowerCase()}) ON CONFLICT (id) DO NOTHING`;
    }

    const rows = await sql`
      INSERT INTO public.installments (
        user_id, description, category, subcategory, total_installments,
        current_installment, installment_amount, payment_method, start_date, end_date
      ) VALUES (
        ${userId}, ${description}, ${category || 'Geral'}, ${subcategory || 'Geral'}, ${total_installments || 12},
        ${current_installment || 1}, ${installment_amount || 0}, ${payment_method || 'Cartão'}, ${dates.start}, ${dates.end}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, installment: rows[0] });
  } catch (error) {
    console.error('Erro ao criar parcelamento no banco:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar novo parcelamento no banco.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || !validFields(body)) return NextResponse.json({ success: false, error: 'Dados de parcelamento inválidos.' }, { status: 400 });
    const {
      id,
      description,
      category,
      subcategory,
      total_installments,
      current_installment,
      installment_amount,
      payment_method,
      start_date,
      end_date
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do parcelamento é obrigatório.' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE public.installments
      SET description = COALESCE(${description ?? null}, description),
          category = COALESCE(${category ?? null}, category),
          subcategory = COALESCE(${subcategory ?? null}, subcategory),
          total_installments = COALESCE(${total_installments ?? null}, total_installments),
          current_installment = COALESCE(${current_installment ?? null}, current_installment),
          installment_amount = COALESCE(${installment_amount ?? null}, installment_amount),
          payment_method = COALESCE(${payment_method ?? null}, payment_method),
          start_date = COALESCE(${start_date ?? null}, start_date),
          end_date = COALESCE(${end_date ?? null}, end_date)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Parcelamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, installment: rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar parcelamento no banco:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar parcelamento no banco.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID é obrigatório.' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE public.installments
      SET is_active = FALSE
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Parcelamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao desativar parcelamento no banco:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha ao excluir parcelamento.' },
      { status: 500 }
    );
  }
}
