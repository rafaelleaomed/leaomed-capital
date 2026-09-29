import os
import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

NEON_URI = os.environ.get("DATABASE_URL")
if not NEON_URI:
    print("❌ ERRO: Variável de ambiente DATABASE_URL não configurada.")
    sys.exit(1)

def seed_installments():
    print("🔌 Conectando ao Neon para popular parcelamentos...")
    conn = psycopg2.connect(NEON_URI)
    conn.autocommit = True
    cursor = conn.cursor()

    user_id = os.environ.get("USER_ID", "d8225585-6cf1-4dc7-ba96-724bc2bb7cc0")

    items = [
        ('Parcela T-Cross Cartão', 'Transporte', 'Parcela T-Cross Cartão', 12, 6, 6837.22, 'C6 Carbon Black', '2026-01-01', '2026-12-31'),
        ('Financiamento T-Cross', 'Transporte', 'Parcela T-Cross Financiamento', 36, 14, 3336.28, 'Banco VW', '2025-05-01', '2028-04-30'),
        ('Parcela Gramado Parks', 'Financiamento', 'Parcela Gramado Parks', 24, 5, 1925.41, 'Boleto/Débito', '2026-02-01', '2028-01-31'),
        ('Condomínio Buona Vitta', 'Financiamento', 'Condomínio Buona Vitta', 12, 5, 377.49, 'Boleto', '2026-02-01', '2027-01-31'),
        ('Aliança Solitário', 'Compras', 'Aliança Solitário', 10, 7, 382.37, 'C6 Carbon Black', '2026-01-01', '2026-10-31'),
        ('Lava e Seca', 'Casa', 'Lava e seca', 10, 7, 355.00, 'Itaú Cartão', '2026-01-01', '2026-10-31'),
        ('Samsung S26 Ultra', 'Compras', 'S26Ultra', 10, 4, 274.66, 'C6 Carbon Black', '2026-03-01', '2026-12-31'),
        ('TV TCL', 'Casa', 'TV TCL', 10, 7, 250.92, 'Nubank Cartão', '2026-01-01', '2026-10-31'),
        ('Sofá Sala', 'Casa', 'Sofa', 10, 4, 197.00, 'C6 Carbon Black', '2026-03-01', '2026-12-31')
    ]

    for desc, cat, subcat, total_inst, curr_inst, amount, method, s_date, e_date in items:
        cursor.execute("""
            INSERT INTO public.installments (
                user_id, description, category, subcategory,
                total_installments, current_installment, installment_amount,
                payment_method, start_date, end_date, is_active
            ) VALUES (
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, TRUE
            );
        """, (user_id, desc, cat, subcat, total_inst, curr_inst, amount, method, s_date, e_date))

    print("✅ Todos os 9 parcelamentos ativos cadastrados no Neon Postgres!")
    cursor.close()
    conn.close()

if __name__ == '__main__':
    seed_installments()
