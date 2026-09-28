import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD')
SUPABASE_URL = os.environ.get('SUPABASE_URL')
host = SUPABASE_URL.replace('https://', 'db.').replace('.co', '.co') if SUPABASE_URL else ''

# Dicionário de Categorias vs Palavras-chave
CATEGORIES = {
    'Alimentação': {
        'Mercado': ['supermercado', 'carrefour', 'pao de acucar', 'atacadao'],
        'Delivery': ['ifood', 'rappi', 'uber eats'],
        'Restaurante': ['restaurante', 'padaria', 'mcdonalds', 'bk']
    },
    'Transporte': {
        'Aplicativo': ['uber', '99', 'cabify'],
        'Combustível': ['posto', 'ipiranga', 'shell', 'petrobras']
    },
    'Moradia': {
        'Contas Fixas': ['light', 'enel', 'sabesp', 'copasa', 'vivo', 'claro', 'tim'],
        'Aluguel/Condomínio': ['condominio', 'quintoandar']
    },
    'Saúde': {
        'Farmácia': ['farmacia', 'drogasil', 'droga raia', 'pacheco'],
        'Plano/Convênio': ['amil', 'unimed', 'sulamerica', 'bradesco saude']
    },
    'Educação': {
        'Mensalidade/Cursos': ['faculdade', 'udemy', 'alura', 'escola']
    },
    'Investimentos': {
        'Aportes': ['xp', 'rico', 'clear', 'nu invest', 'avenue', 'btg']
    },
    'Receitas': {
        'Salário/Pró-labore': ['salario', 'pro labore', 'adiantamento'],
        'Rendimentos': ['rendimento', 'juros', 'dividendos']
    }
}

# Palavras-chave de assinatura global
GLOBAL_SUBSCRIPTIONS = ['netflix', 'spotify', 'amazon prime', 'gympass', 'smartfit']

def determine_category(clean_desc):
    for cat, subcats in CATEGORIES.items():
        for subcat, keywords in subcats.items():
            if any(kw in clean_desc for kw in keywords):
                return cat, subcat
    return 'Outros', 'Não Identificado'

def is_fixed_expense(clean_desc, subcategory):
    if subcategory == 'Contas Fixas':
        return True
    if any(sub in clean_desc for sub in GLOBAL_SUBSCRIPTIONS):
        return True
    return False

def categorize_pending_transactions():
    try:
        conn = psycopg2.connect(host=host, database="postgres", user="postgres", password=SUPABASE_DB_PASSWORD, port=5432)
        conn.autocommit = True
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Seleciona transações não categorizadas (supondo que nulo seja o padrão inicial)
        cursor.execute("SELECT id, description, amount FROM transactions WHERE category IS NULL LIMIT 100")
        transactions = cursor.fetchall()
        
        if not transactions:
            print("⏳ Nenhuma transação pendente de categorização.")
            cursor.close(); conn.close()
            return
            
        print(f"🔄 Processando {len(transactions)} transações para categorização...")
        
        updated_count = 0
        for tx in transactions:
            # Pela lógica do SOP, já deveríamos ter o clean_desc, mas vamos aplicar nas descrições cruas caso seja o único campo
            clean_desc = str(tx['description']).lower()
            
            category, subcategory = determine_category(clean_desc)
            fixed = is_fixed_expense(clean_desc, subcategory)
            
            # Atualiza no banco
            cursor.execute("""
                UPDATE transactions 
                SET category = %s, subcategory = %s, is_fixed_expense = %s
                WHERE id = %s
            """, (category, subcategory, fixed, tx['id']))
            updated_count += 1
            
        print(f"✅ {updated_count} transações categorizadas com sucesso!")
        
        cursor.close(); conn.close()
    except Exception as e:
        print(f"🚨 Erro Fatal na Categorização: {e}")

if __name__ == "__main__":
    categorize_pending_transactions()
