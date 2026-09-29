import os
import sys
import psycopg2

sys.stdout.reconfigure(encoding='utf-8')

NEON_URI = os.environ.get("DATABASE_URL")
if not NEON_URI:
    print("❌ ERRO: Variável de ambiente DATABASE_URL não configurada.")
    sys.exit(1)

USER_ID = os.environ.get("USER_ID", "d8225585-6cf1-4dc7-ba96-724bc2bb7cc0")

def seed():
    conn = psycopg2.connect(NEON_URI)
    conn.autocommit = True
    cur = conn.cursor()
    print("🔌 Conectando ao Neon para atualizar Investimentos e Parcelamentos...")

    # 1. Atualizar Tabela de Ativos Individuais de Investimento
    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.investment_assets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            asset_name VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            broker VARCHAR(50) NOT NULL,
            quantity NUMERIC(16, 4) DEFAULT 0,
            avg_price NUMERIC(12, 2) DEFAULT 0,
            current_price NUMERIC(12, 2) DEFAULT 0,
            total_invested NUMERIC(14, 2) NOT NULL,
            current_total NUMERIC(14, 2) NOT NULL,
            profit_loss NUMERIC(14, 2) NOT NULL,
            profit_loss_pct NUMERIC(8, 2) NOT NULL,
            operation VARCHAR(20) DEFAULT 'Comprado',
            is_emergency_reserve BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)

    cur.execute("DELETE FROM public.investment_assets WHERE user_id = %s;", (USER_ID,))

    # Dados exatos da imagem media_1790554922684.png
    assets = [
        ("Caixa", "Caixa", "Itau", 0, 0, 0, 29020.73, 33346.93, 4326.19, 14.91, "Comprado", False),
        ("Internacional", "Internacional", "NuInvest", 268, 60.27, 71.89, 16152.11, 19266.23, 3114.12, 19.28, "Comprado", False),
        ("Ações", "Ações", "Itau", 1930, 13.07, 14.68, 25221.59, 28327.03, 3105.44, 12.31, "Comprado", False),
        ("Reserva Emergência", "Reserva Emergência", "Itau", 0, 0, 0, 32000.00, 33418.10, 1418.10, 4.43, "Comprado", True),
        ("Cripto", "Cripto", "NuCrypto", 40.0100, 100.27, 134.47, 4011.69, 5380.14, 1368.45, 34.11, "Comprado", False),
        ("Internacional", "Internacional", "Inter USA", 36.99, 278.68, 300.01, 10308.36, 11097.54, 789.18, 7.66, "Comprado", False),
        ("Caixa", "Caixa", "NuInvest", 0, 0, 0, 10000.00, 10376.89, 376.89, 3.77, "Comprado", False),
        ("Cripto", "Cripto", "Itau", 5, 120.04, 128.19, 600.18, 640.95, 40.77, 6.79, "Comprado", False),
        ("Ações (vendido)", "Ações", "BTG", -1, 46.12, 42.13, -46.12, -42.13, 3.99, 8.65, "Vendido", False),
        ("Ações", "Ações", "NuInvest", 1005, 5.82, 5.55, 5846.01, 5582.30, -263.71, -4.51, "Comprado", False),
        ("Cripto", "Cripto", "Bybit", 96.2300, 104.97, 101.54, 10101.26, 9771.66, -329.60, -3.26, "Comprado", False),
        ("Real Estate", "Real Estate", "NuInvest", 966, 21.35, 20.03, 20627.38, 19350.70, -1276.68, -6.19, "Comprado", False),
        ("Cripto", "Cripto", "MEXC", 9984.0400, 0.33, 0.20, 3317.82, 1960.02, -1357.80, -40.92, "Comprado", False)
    ]

    for name, cat, broker, qtd, pm, pa, invest, atual, ganho, ganho_pct, op, is_res in assets:
        cur.execute("""
            INSERT INTO public.investment_assets (
                user_id, asset_name, category, broker, quantity, avg_price, current_price,
                total_invested, current_total, profit_loss, profit_loss_pct, operation, is_emergency_reserve
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (USER_ID, name, cat, broker, qtd, pm, pa, invest, atual, ganho, ganho_pct, op, is_res))

    print("✅ 13 ativos de investimentos sincronizados no banco!")

    # 2. Metas de Alocação Oficiais (Imagem media_1790555008565.png)
    # Ações: 25%, Real Estate: 15%, Caixa: 30%, Cripto: 5%, Internacional: 25%
    targets = [
        ("Ações", 25.0),
        ("Real Estate", 15.0),
        ("Caixa", 30.0),
        ("Cripto", 5.0),
        ("Internacional", 25.0)
    ]

    for cat_name, pct in targets:
        cur.execute("""
            INSERT INTO public.investment_targets (user_id, asset_class, target_percentage)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, asset_class) DO UPDATE
            SET target_percentage = EXCLUDED.target_percentage;
        """, (USER_ID, cat_name, pct))

    print("✅ Metas de alocação (25/15/30/5/25) atualizadas com sucesso!")

    # 3. Atualizar Parcelamentos Conforme Solicitação e Contrato Buona Vitta GVI126924
    cur.execute("DELETE FROM public.installments WHERE user_id = %s;", (USER_ID,))

    # Entrada Tcross cartão: finaliza Abril/2027 (início Jan/2026 -> 16 parcelas)
    # Samsung S26 Ultra: finaliza Nov/2027 (início Mar/2026 -> 21 parcelas)
    # Gramado Parks (Buona Vitta): Contrato GVI126924 -> 70 parcelas de 10/05/2026 até 10/02/2032 (R$ 1.865,33/mês reajustado pelo IPCA)
    # Condomínio Buona Vitta: Perpétuo (R$ 377,49/mês, nunca vence)
    installments_data = [
        ("Parcela T-Cross Cartão", "Transporte", "Parcela T-Cross Cartão", 16, 6, 6837.22, "C6 Carbon Black", "2026-01-01", "2027-04-30"),
        ("Financiamento T-Cross", "Transporte", "Parcela T-Cross Financiamento", 36, 14, 3336.28, "Banco VW", "2025-05-01", "2028-04-30"),
        ("Parcela Gramado Parks (GVI126924)", "Financiamento", "Parcela Gramado Parks", 70, 5, 1865.33, "Boleto Gramado Parks", "2026-05-10", "2032-02-10"),
        ("Condomínio Buona Vitta Resort", "Financiamento", "Condomínio Buona Vitta", 999, 5, 377.49, "Boleto Condomínio", "2026-02-01", "2099-12-31"),
        ("Samsung S26 Ultra", "Compras", "S26Ultra", 21, 4, 274.66, "C6 Carbon Black", "2026-03-01", "2027-11-30"),
        ("Aliança Solitário Vivara", "Compras", "Aliança Solitário", 10, 7, 382.37, "C6 Carbon Black", "2026-01-01", "2026-10-31"),
        ("Lava e Seca Midea", "Casa", "Lava e seca", 10, 7, 355.00, "Itaú Cartão", "2026-01-01", "2026-10-31"),
        ("TV TCL 55", "Casa", "TV TCL", 10, 7, 250.92, "Nubank Cartão", "2026-01-01", "2026-10-31"),
        ("Sofá Retrátil Sala", "Casa", "Sofa", 10, 4, 197.00, "C6 Carbon Black", "2026-03-01", "2026-12-31")
    ]

    for desc, cat, subcat, total_inst, curr_inst, amount, method, s_date, e_date in installments_data:
        cur.execute("""
            INSERT INTO public.installments (
                user_id, description, category, subcategory, total_installments,
                current_installment, installment_amount, payment_method, start_date, end_date
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (USER_ID, desc, cat, subcat, total_inst, curr_inst, amount, method, s_date, e_date))

    print("✅ Parcelamentos atualizados com as regras contratuais e datas estipuladas!")
    cur.close()
    conn.close()

if __name__ == "__main__":
    seed()
