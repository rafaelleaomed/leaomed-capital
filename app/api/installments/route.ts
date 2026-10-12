import { NextResponse } from 'next/server';
import { sql } from '@/utils/db';
import { getAuthenticatedUserId } from '@/utils/auth-helpers';

export const dynamic = 'force-dynamic';

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

    return NextResponse.json({ success: true, installments: rows });
  } catch (error) {
    console.error('Erro ao buscar parcelamentos no banco:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha interna ao recuperar projeções de parcelamento.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
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

    const rows = await sql`
      INSERT INTO public.installments (
        user_id, description, category, subcategory, total_installments,
        current_installment, installment_amount, payment_method, start_date, end_date
      ) VALUES (
        ${userId}, ${description}, ${category || 'Geral'}, ${subcategory || 'Geral'}, ${total_installments || 12},
        ${current_installment || 1}, ${installment_amount || 0}, ${payment_method || 'Cartão'}, ${start_date || null}, ${end_date || null}
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
    const {
      id,
      description,
      category,
      subcategory,
      total_installments,
      current_installment,
      installment_amount,
      payment_method,
      end_date
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do parcelamento é obrigatório.' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE public.installments
      SET description = COALESCE(${description}, description),
          category = COALESCE(${category}, category),
          subcategory = COALESCE(${subcategory}, subcategory),
          total_installments = COALESCE(${total_installments}, total_installments),
          current_installment = COALESCE(${current_installment}, current_installment),
          installment_amount = COALESCE(${installment_amount}, installment_amount),
          payment_method = COALESCE(${payment_method}, payment_method),
          end_date = COALESCE(${end_date}, end_date),
          updated_at = NOW()
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
      SET is_active = FALSE, updated_at = NOW()
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
