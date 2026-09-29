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
    console.error('Erro ao buscar parcelamentos no banco:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao recuperar projeções de parcelamento.' },
      { status: 500 }
    );
  }
}
