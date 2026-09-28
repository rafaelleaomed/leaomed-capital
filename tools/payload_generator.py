import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime
import calendar

load_dotenv()

SUPABASE_DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD')
SUPABASE_URL = os.environ.get('SUPABASE_URL')
host = SUPABASE_URL.replace('https://', 'db.').replace('.co', '.co') if SUPABASE_URL else ''

def generate_payload(user_id, period_str):
    try:
        conn = psycopg2.connect(host=host, database="postgres", user="postgres", password=SUPABASE_DB_PASSWORD, port=5432)
        conn.autocommit = True
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # O período vem no formato YYYY-MM
        year, month = map(int, period_str.split('-'))
        
        # Busca todas as transações do usuário no período
        cursor.execute("""
            SELECT t.*, a.type as account_type 
            FROM transactions t
            JOIN accounts a ON t.account_id = a.id
            WHERE t.user_id = %s 
              AND EXTRACT(YEAR FROM t.date) = %s 
              AND EXTRACT(MONTH FROM t.date) = %s
        """, (user_id, year, month))
        
        transactions = cursor.fetchall()
        
        # Inicializando a estrutura do Payload
        payload = {
            "period": period_str,
            "balances": {
                "consolidated": 0,
                "pf": 0,
                "pj": 0,
                "investments": 0
            },
            "cash_flow": {
                "total_income": 0,
                "total_expenses": 0,
                "fixed_expenses": 0,
                "variable_expenses": 0
            },
            "categories": [],
            "investments_detail": {
                "total_value": 0,
                "by_class": [],
                "profitability": 0
            },
            "projections": {
                "projected_end_balance": 0,
                "safe_daily_spend": 0,
                "available_to_invest": 0
            },
            "alerts": []
        }
        
        cat_totals = {}
        
        for tx in transactions:
            amt = float(tx['amount'])
            is_pf = tx['account_type'] == 'PF'
            is_pj = tx['account_type'] == 'PJ'
            
            # Balances (Simplificado: apenas somando os fluxos como saldo para o MVP)
            # Numa aplicação real, você somaria os saldos das contas em vez do fluxo
            payload['balances']['consolidated'] += amt
            if is_pf: payload['balances']['pf'] += amt
            if is_pj: payload['balances']['pj'] += amt
            
            if amt > 0:
                payload['cash_flow']['total_income'] += amt
            else:
                payload['cash_flow']['total_expenses'] += abs(amt)
                if tx['is_fixed_expense']:
                    payload['cash_flow']['fixed_expenses'] += abs(amt)
                else:
                    payload['cash_flow']['variable_expenses'] += abs(amt)
                    
            # Categorias
            cat = tx['category'] or 'Outros'
            if amt < 0: # Geralmente agrupamos saídas nas categorias
                cat_totals[cat] = cat_totals.get(cat, 0) + abs(amt)
                
        # Calcula porcentagens de categorias
        total_exp = payload['cash_flow']['total_expenses']
        for cat, val in cat_totals.items():
            payload['categories'].append({
                "name": cat,
                "total": val,
                "percentage": round((val / total_exp * 100), 2) if total_exp > 0 else 0
            })
            
        # Projeções básicas
        current_day = datetime.now().day
        last_day = calendar.monthrange(year, month)[1]
        days_left = last_day - current_day
        if days_left <= 0: days_left = 1
        
        safe_spend = max(0, payload['balances']['consolidated'] / days_left)
        payload['projections']['safe_daily_spend'] = round(safe_spend, 2)
        payload['projections']['projected_end_balance'] = round(payload['balances']['consolidated'], 2)
        
        # Salva o payload na pasta .tmp
        os.makedirs('.tmp', exist_ok=True)
        filename = f".tmp/payload_{user_id}_{period_str}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Payload gerado e salvo em {filename}")
        
        cursor.close(); conn.close()
        return payload
    except Exception as e:
        print(f"🚨 Erro Fatal ao gerar payload: {e}")

if __name__ == "__main__":
    import sys
    # user_id default se não passar argumento
    user_id = sys.argv[1] if len(sys.argv) > 1 else 'd8225585-6cf1-4dc7-ba96-724bc2bb7cc0' # fallback user
    period = datetime.now().strftime('%Y-%m')
    generate_payload(user_id, period)
