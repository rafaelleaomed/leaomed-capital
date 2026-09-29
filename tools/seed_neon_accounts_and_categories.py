import os
import sys
import uuid
import psycopg2
from psycopg2.extras import execute_values
import hashlib

sys.stdout.reconfigure(encoding='utf-8')

NEON_URI = os.environ.get("DATABASE_URL")
if not NEON_URI:
    print("❌ ERRO: Variável de ambiente DATABASE_URL não configurada.")
    sys.exit(1)

USER_ID = os.environ.get("USER_ID", "d8225585-6cf1-4dc7-ba96-724bc2bb7cc0")

if "--force" not in sys.argv:
    print("⚠️ PROTEÇÃO ATIVA: Este script executa inserts e atualizações em lote nas tabelas de contas e categorias.")
    print("   Para confirmar a execução, passe o parâmetro --force:")
    print("   python tools/seed_neon_accounts_and_categories.py --force")
    sys.exit(0)

def get_uuid(name: str):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"apex_{name}"))

def seed():
    conn = psycopg2.connect(NEON_URI)
    cur = conn.cursor()
    print("Conectado ao Neon Serverless Postgres...")

    # 1. Accounts
    acc_inter_id = get_uuid("inter_pj")
    acc_itau_id = get_uuid("itau_pf")
    acc_nubank_id = get_uuid("nubank_pf")
    acc_c6_id = get_uuid("c6_pf")

    accounts = [
        (acc_inter_id, USER_ID, "PJ", "item_inter", "acc_inter_pj", "Conta Corrente PJ", "Banco Inter"),
        (acc_itau_id, USER_ID, "PF", "item_itau", "acc_itau_pf", "Cartão Itaú", "Banco Itaú"),
        (acc_nubank_id, USER_ID, "PF", "item_nubank", "acc_nubank_pf", "Cartão Nubank", "Nubank"),
        (acc_c6_id, USER_ID, "PF", "item_c6", "acc_c6_pf", "Cartão C6 Carbon Black", "C6 Bank")
    ]

    for acc in accounts:
        cur.execute("""
            INSERT INTO public.accounts (id, user_id, type, pluggy_item_id, pluggy_account_id, name, institution)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (pluggy_account_id) DO UPDATE 
            SET name = EXCLUDED.name, institution = EXCLUDED.institution, type = EXCLUDED.type;
        """, (acc[0], acc[1], acc[2], acc[3], acc[4], acc[5], acc[6]))
    print("Contas cadastradas com sucesso (Inter PJ, Itaú, Nubank, C6)!")

    # 2. Categorias e Subcategorias
    categories_data = [
        # Obrigatórias PF
        ("Transporte", "PF", [
            ("Parcela T-Cross Cartão", True, ["t-cross", "cartao"]),
            ("Parcela T-Cross Financiamento", True, ["financiamento", "vw"]),
            ("Taxas / Imprevistos / Acessórios", False, ["oficina", "acessorios", "manutencao"]),
            ("Combustível", False, ["ipiranga", "shell", "posto", "combustivel"]),
            ("Estacionamentos", False, ["estapar", "estacionamento"]),
            ("Portas WRV", False, ["wrv", "funilaria"]),
            ("Seguro Veículo", True, ["porto seguro", "seguro auto", "azul"]),
            ("Táxi / Uber", False, ["uber", "99app", "taxi"])
        ]),
        ("Casa", "PF", [
            ("Supermercado", False, ["verdemar", "supernosso", "carrefour", "epa", "supermercado"]),
            ("Condomínio", True, ["condominio", "administradora"]),
            ("Aluguel", True, ["aluguel", "imobiliaria"]),
            ("IPTU", True, ["iptu", "prefeitura"]),
            ("Lava e Seca", True, ["lava e seca", "eletrodomestico"]),
            ("TV TCL", True, ["tv tcl", "televisao"]),
            ("Luz (Cemig)", True, ["cemig", "energia eletrica"]),
            ("Sofá Sala", True, ["sofa", "moveis"]),
            ("IPTV", True, ["iptv", "streaming tv"]),
            ("Celular (Vivo)", True, ["vivo", "telefonia"]),
            ("Tela Janelas", True, ["tela mosquiteiro", "janela"]),
            ("Internet Fibra", True, ["claro fibra", "internet", "fibra"]),
            ("Lixeira / Utensílios", False, ["utensilios", "lixeira"]),
            ("Adega", True, ["adega eletrolux"]),
            ("AirFryer", True, ["airfryer philips"])
        ]),
        ("Financiamento", "PF", [
            ("Parcela Gramado Parks", True, ["gramado parks", "multipropriedade"]),
            ("Condomínio Buona Vitta", True, ["buona vitta", "condominio resort"])
        ]),
        ("Saúde", "PF", [
            ("Plano de Saúde", True, ["unimed", "bradesco saude", "sulamerica"]),
            ("Seguro de Vida AZOS", True, ["azos", "seguro de vida"]),
            ("Academia", True, ["smart fit", "bodytech", "academia"]),
            ("Farmácia / Remédios", False, ["droga raia", "araujo", "pacheco", "farmacia"])
        ]),
        ("Alimentação", "PF", [
            ("Almoço / Lanches Diários", False, ["restaurante", "almoco", "cafe", "padaria"])
        ]),
        ("Pets", "PF", [
            ("Areia / Ração / Brinquedos", False, ["petz", "cobasi", "veterinario", "racao"])
        ]),
        ("Impostos e Taxas PF", "PF", [
            ("Anuidade CRM", True, ["crm", "crm-mg", "conselho medicina"])
        ]),

        # Não Obrigatórias PF
        ("Compras", "PF", [
            ("Presentes", False, ["presente", "aniversario"]),
            ("Suplementos (Growth/Whey)", False, ["growth", "suplemento", "whey", "creatina"]),
            ("Aliança Solitário (Parcela)", True, ["vivara", "joalheria", "alianca"]),
            ("BoateBus", False, ["boatebus", "evento"]),
            ("Samsung S26 Ultra (Parcela)", True, ["samsung", "s26", "smartphone"]),
            ("Aliexpress / Shopee", False, ["aliexpress", "shopee", "importacao"]),
            ("Doações", False, ["doacao", "caridade"]),
            ("Conserto Tela S23U", False, ["assistencia tecnica", "tela"]),
            ("Roupas", False, ["zara", "reserva", "vestuario", "loja"])
        ]),
        ("Lazer", "PF", [
            ("Jogos Mineirão (Cruzeiro)", False, ["socio torcedor", "ingresso cruzeiro", "mineirao"]),
            ("Resenhas / Aniversários", False, ["resenha", "churrasco", "festa"]),
            ("Bares / Baladas", False, ["bar", "choperia", "balada"]),
            ("Futebol / Esportes", False, ["pelada", "quadra"]),
            ("Apostas / Bets", False, ["bet365", "sportingbet"])
        ]),
        ("Viagem", "PF", [
            ("Hospedagem", False, ["airbnb", "booking", "hotel"]),
            ("Combustível Viagem", False, ["combustivel viagem", "pedagio"]),
            ("Compras em Viagem", False, ["souvenir", "duty free"]),
            ("Alimentação em Viagem", False, ["restaurante viagem"])
        ]),
        ("Restaurantes & Delivery", "PF", [
            ("Almoço / Jantar GRI", False, ["restaurante grill", "jantar"]),
            ("Ifood Delivery", False, ["ifood", "rappi"]),
            ("Sorvetes / Sobremesas", False, ["bacio di latte", "sorveteria"])
        ]),
        ("Serviços de Assinaturas", "PF", [
            ("Empiricus SOROS", True, ["empiricus"]),
            ("Curso IA Danilo", True, ["hotmart", "curso danilo"]),
            ("MyProfit", True, ["myprofit"]),
            ("Mobills", True, ["mobills"]),
            ("Ifood Club", True, ["ifood club"]),
            ("CapCut Pro", True, ["capcut"])
        ]),

        # PJ
        ("Empresa - Receitas", "PJ", [
            ("Honorários Médicos PJ", False, ["faturamento", "honorarios", "nota fiscal"])
        ]),
        ("Empresa - Despesas Fixas", "PJ", [
            ("Tributos DAS Simples", True, ["das", "receita federal", "simples nacional"]),
            ("Contabilidade", True, ["contabilidade", "honorarios contabeis"]),
            ("Tarifas Inter PJ", False, ["tarifa bancaria", "manutencao conta"]),
            ("Pró-Labore Transferência", True, ["pro-labore", "transferencia pf"])
        ])
    ]

    for cat_name, scope, subcats in categories_data:
        cur.execute("""
            INSERT INTO public.categories (name, scope)
            VALUES (%s, %s)
            ON CONFLICT (name, scope) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        """, (cat_name, scope))
        cat_id = cur.fetchone()[0]

        for sub_name, is_fixed, kws in subcats:
            cur.execute("""
                INSERT INTO public.subcategories (category_id, name, is_fixed, keywords)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (category_id, name) DO UPDATE
                SET is_fixed = EXCLUDED.is_fixed, keywords = EXCLUDED.keywords;
            """, (cat_id, sub_name, is_fixed, kws))

    print("Categorias e Subcategorias sincronizadas no Neon com sucesso!")

    # 3. Transações de Junho/2026 (Planilha Real)
    transactions = [
        # Transporte
        (USER_ID, acc_c6_id, 6837.22, "2026-06-10", "Parcela T-Cross Cartão C6", "Transporte", "Parcela T-Cross Cartão", True),
        (USER_ID, acc_inter_id, 3336.28, "2026-06-15", "Parcela Financiamento T-Cross VW", "Transporte", "Parcela T-Cross Financiamento", True),
        (USER_ID, acc_c6_id, 708.32, "2026-06-18", "Posto Ipiranga Combustivel", "Transporte", "Combustível", False),
        (USER_ID, acc_c6_id, 663.75, "2026-06-20", "Estapar Estacionamentos Hospitais", "Transporte", "Estacionamentos", False),
        (USER_ID, acc_c6_id, 700.00, "2026-06-22", "Revisão e Acessórios T-Cross", "Transporte", "Taxas / Imprevistos / Acessórios", False),
        (USER_ID, acc_c6_id, 500.00, "2026-06-25", "Portas WRV Reparo", "Transporte", "Portas WRV", False),
        (USER_ID, acc_c6_id, 336.83, "2026-06-05", "Porto Seguro Auto Mensal", "Transporte", "Seguro Veículo", True),
        (USER_ID, acc_nubank_id, 81.15, "2026-06-28", "Uber Viagens", "Transporte", "Táxi / Uber", False),

        # Casa
        (USER_ID, acc_c6_id, 1690.80, "2026-06-12", "Supermercado Verdemar e Supernosso", "Casa", "Supermercado", False),
        (USER_ID, acc_inter_id, 1451.79, "2026-06-08", "Condomínio Residencial Edifício", "Casa", "Condomínio", True),
        (USER_ID, acc_inter_id, 500.00, "2026-06-10", "Aluguel Vaga / Garagem", "Casa", "Aluguel", True),
        (USER_ID, acc_inter_id, 359.73, "2026-06-15", "IPTU Parcela 06/10", "Casa", "IPTU", True),
        (USER_ID, acc_c6_id, 355.00, "2026-06-10", "Lava e Seca Midea Parcela", "Casa", "Lava e Seca", True),
        (USER_ID, acc_c6_id, 250.92, "2026-06-10", "TV TCL 55 Pol Parcela", "Casa", "TV TCL", True),
        (USER_ID, acc_inter_id, 216.00, "2026-06-18", "Cemig Conta de Energia", "Casa", "Luz (Cemig)", True),
        (USER_ID, acc_c6_id, 197.00, "2026-06-10", "Sofá Retrátil Sala Parcela", "Casa", "Sofá Sala", True),
        (USER_ID, acc_c6_id, 147.00, "2026-06-02", "IPTV Anual Mensalidade", "Casa", "IPTV", True),
        (USER_ID, acc_c6_id, 139.99, "2026-06-16", "Vivo Celular Pós", "Casa", "Celular (Vivo)", True),
        (USER_ID, acc_c6_id, 130.00, "2026-06-10", "Tela Janelas Parcela", "Casa", "Tela Janelas", True),
        (USER_ID, acc_c6_id, 89.90, "2026-06-20", "Claro Internet Fibra 500M", "Casa", "Internet Fibra", True),

        # Financiamento
        (USER_ID, acc_inter_id, 1925.41, "2026-06-25", "Gramado Parks Parcela 36", "Financiamento", "Parcela Gramado Parks", True),
        (USER_ID, acc_inter_id, 377.49, "2026-06-25", "Condomínio Buona Vitta Resort", "Financiamento", "Condomínio Buona Vitta", True),

        # Saúde
        (USER_ID, acc_inter_id, 509.00, "2026-06-10", "Unimed Plano de Saúde", "Saúde", "Plano de Saúde", True),
        (USER_ID, acc_c6_id, 353.76, "2026-06-05", "Azos Seguro de Vida", "Saúde", "Seguro de Vida AZOS", True),
        (USER_ID, acc_c6_id, 299.98, "2026-06-02", "Academia Bodytech / Smartfit", "Saúde", "Academia", True),
        (USER_ID, acc_c6_id, 115.27, "2026-06-14", "Drogaria Araujo Medicamentos", "Saúde", "Farmácia / Remédios", False),

        # Não Obrigatórias: Compras & Lazer
        (USER_ID, acc_c6_id, 950.78, "2026-06-19", "Presentes Diversos e Lembranças", "Compras", "Presentes", False),
        (USER_ID, acc_c6_id, 480.56, "2026-06-11", "Growth Suplementos Whey Creatina", "Compras", "Suplementos (Growth/Whey)", False),
        (USER_ID, acc_c6_id, 382.37, "2026-06-10", "Vivara Aliança Solitário Parcela", "Compras", "Aliança Solitário (Parcela)", True),
        (USER_ID, acc_c6_id, 310.00, "2026-06-21", "BoateBus Evento Comemoração", "Compras", "BoateBus", False),
        (USER_ID, acc_c6_id, 274.66, "2026-06-10", "Samsung Galaxy S26 Ultra Parcela", "Compras", "Samsung S26 Ultra (Parcela)", True),
        (USER_ID, acc_c6_id, 492.10, "2026-06-07", "Ingressos Mineirão Cruzeiro Cabuloso", "Lazer", "Jogos Mineirão (Cruzeiro)", False),
        (USER_ID, acc_c6_id, 204.26, "2026-06-24", "iFood Restaurantes e Delivery", "Restaurantes & Delivery", "Ifood Delivery", False),
        (USER_ID, acc_c6_id, 204.30, "2026-06-27", "Almoço Grill Especial", "Restaurantes & Delivery", "Almoço / Jantar GRI", False),

        # Receitas PF
        (USER_ID, acc_inter_id, -25979.99, "2026-06-05", "Transferência Pró-Labore / Distribuição Lucros", "Receitas PF", "Pró-Labore Líquido", True)
    ]

    for uid, acc_id, amount, dt, desc, cat, subcat, is_fixed in transactions:
        raw_id = f"seed_{dt}_{desc[:15]}"
        hash_seed = hashlib.md5(f"{uid}_{amount}_{dt}_{desc}".encode()).hexdigest()
        
        cur.execute("""
            INSERT INTO public.transactions (
                user_id, raw_id, account_id, amount, currency, date, competence_date,
                description, category, subcategory, is_fixed, is_ignored, hash
            )
            VALUES (%s, %s, %s, %s, 'BRL', %s, %s, %s, %s, %s, %s, FALSE, %s)
            ON CONFLICT (hash) DO UPDATE
            SET amount = EXCLUDED.amount, category = EXCLUDED.category, subcategory = EXCLUDED.subcategory;
        """, (uid, raw_id, acc_id, amount, dt, dt, desc, cat, subcat, is_fixed, hash_seed))

    conn.commit()
    cur.close()
    conn.close()
    print("Sucesso! Banco de Dados Neon 100% populado e conectado!")

if __name__ == "__main__":
    seed()
