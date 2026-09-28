import json
import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

NEON_URI = "postgresql://neondb_owner:REDACTED_PASSWORD@ep-bold-shape-awxwzyxn-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require"

def seed_history():
    print("🔌 Conectando ao Neon para popular histórico...")
    conn = psycopg2.connect(NEON_URI)
    conn.autocommit = True
    cursor = conn.cursor()

    with open('.tmp/historical_summary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    user_id = 'd8225585-6cf1-4dc7-ba96-724bc2bb7cc0'

    month_mapping = {
        'dez_25': '2025-12',
        'jan_26': '2026-01',
        'fev_26': '2026-02',
        'mar_26': '2026-03',
        'abr_26': '2026-04',
        'mai_26': '2026-05',
        'jun_26': '2026-06',
        'jul_26': '2026-07',
        'ago_26': '2026-08',
        'set_26': '2026-09',
        'out_26': '2026-10',
        'nov_26': '2026-11',
        'dez_26': '2026-12'
    }

    for m_key, m_val in data.items():
        month_year = month_mapping.get(m_key, m_key)
        pj = m_val.get('pj', {})
        pf = m_val.get('pf', {})
        inv = m_val.get('investments', {})

        cursor.execute("""
            INSERT INTO public.monthly_history (
                user_id, month_year,
                pj_gross_revenue, pj_taxes, pj_accounting_fee, pj_net_profit, pj_prolabore_withdrawn,
                pf_total_income, pf_total_expenses, pf_invested_amount, pf_net_savings,
                categories_breakdown
            ) VALUES (
                %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s
            ) ON CONFLICT (user_id, month_year) DO UPDATE SET
                pj_gross_revenue = EXCLUDED.pj_gross_revenue,
                pj_taxes = EXCLUDED.pj_taxes,
                pj_accounting_fee = EXCLUDED.pj_accounting_fee,
                pj_prolabore_withdrawn = EXCLUDED.pj_prolabore_withdrawn,
                pf_total_income = EXCLUDED.pf_total_income,
                pf_total_expenses = EXCLUDED.pf_total_expenses,
                categories_breakdown = EXCLUDED.categories_breakdown;
        """, (
            user_id, month_year,
            pj.get('gross', 0), pj.get('taxes', 0), pj.get('accounting', 0), pj.get('leftover', 0), pj.get('prolabore', 0),
            pf.get('income', 0), pf.get('expenses', 0), inv.get('total_allocated', 0), pf.get('income', 0) - pf.get('expenses', 0),
            json.dumps(pf.get('categories', {}))
        ))

    print("✅ Histórico completo de Dez/25 a Dez/26 inserido no Neon Postgres!")
    cursor.close()
    conn.close()

if __name__ == '__main__':
    seed_history()
