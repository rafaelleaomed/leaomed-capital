import os
import sys
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import hashlib
import re

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

SUPABASE_DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD')
SUPABASE_URL = os.environ.get('SUPABASE_URL')
PLUGGY_CLIENT_ID = os.environ.get('PLUGGY_CLIENT_ID')
PLUGGY_CLIENT_SECRET = os.environ.get('PLUGGY_CLIENT_SECRET')
host = SUPABASE_URL.replace('https://', 'db.').replace('.co', '.co') if SUPABASE_URL else ''

def get_pluggy_token():
    res = requests.post("https://api.pluggy.ai/auth", json={
        "clientId": PLUGGY_CLIENT_ID,
        "clientSecret": PLUGGY_CLIENT_SECRET
    })
    res.raise_for_status()
    return res.json().get('apiKey')

def pluggy_request(endpoint, token):
    url = f"https://api.pluggy.ai{endpoint}"
    res = requests.get(url, headers={"accept": "application/json", "X-API-KEY": token})
    res.raise_for_status()
    return res.json()

def clean_desc(desc):
    desc = str(desc).lower()
    desc = re.sub(r'[0-9]+', '', desc)
    desc = re.sub(r'[^\w\s]', '', desc)
    return " ".join(desc.split())

def process_pending_webhooks():
    try:
        conn = psycopg2.connect(host=host, database="postgres", user="postgres", password=SUPABASE_DB_PASSWORD, port=5432)
        conn.autocommit = True
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT * FROM webhook_events WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10")
        events = cursor.fetchall()
        
        if not events:
            print("⏳ Nenhum webhook pending no banco.")
            cursor.close(); conn.close()
            return
        
        token = get_pluggy_token()
        
        for event in events:
            event_id = event['id']
            item_id = event['item_id']
            print(f"\n🔄 Iniciando processamento do webhook {event_id} (Item: {item_id})")
            
            try:
                # 1. Obter o Item (para saber se o status dele está atualizado)
                item_data = pluggy_request(f"/items/{item_id}", token)
                if item_data.get('status') != 'UPDATED':
                    print(f"⚠️ Item {item_id} ainda não está UPDATED (status: {item_data.get('status')}). Ignorando por enquanto.")
                    continue
                    
                # User vinculado estritamente pelo clientUserId
                user_id = item_data.get('clientUserId') 
                if not user_id:
                    print(f"❌ Item {item_id} não possui clientUserId comprovado. Rejeitando por segurança.")
                    cursor.execute("UPDATE webhook_events SET status = 'rejected_no_owner', processed_at = NOW() WHERE id = %s", (event_id,))
                    continue


                # 2. Obter Accounts
                accounts_res = pluggy_request(f"/accounts?itemId={item_id}", token)
                
                for acc in accounts_res.get('results', []):
                    acc_type = 'PJ' if acc.get('type') == 'BUSINESS' else 'PF'
                    pluggy_account_id = acc['id']
                    
                    # 3. Upsert na tabela Accounts
                    cursor.execute("""
                        INSERT INTO accounts (user_id, type, pluggy_item_id, pluggy_account_id, name, institution)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (pluggy_account_id) DO UPDATE SET name = EXCLUDED.name
                        RETURNING id
                    """, (user_id, acc_type, item_id, pluggy_account_id, acc['name'], item_data.get('connector', {}).get('name', 'Instituição')))
                    
                    internal_account_id = cursor.fetchone()['id']
                    
                    # 4. Obter e inserir Transactions
                    txs_res = pluggy_request(f"/transactions?accountId={pluggy_account_id}", token)
                    inserted = 0
                    duplicated = 0
                    
                    for tx in txs_res.get('results', []):
                        raw_id = tx['id']
                        amount = float(tx['amount'])
                        date = tx['date'][:10]
                        desc = clean_desc(tx['description'])
                        
                        hash_input = f"{internal_account_id}_{date}_{abs(amount)}_{desc}"
                        tx_hash = hashlib.md5(hash_input.encode('utf-8')).hexdigest()
                        
                        try:
                            cursor.execute("""
                                INSERT INTO transactions (user_id, raw_id, account_id, amount, date, competence_date, description, hash)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """, (user_id, raw_id, internal_account_id, amount, date, date, tx['description'], tx_hash))
                            inserted += 1
                        except psycopg2.errors.UniqueViolation:
                            duplicated += 1
                            continue # Ignora silenciosamente duplicações baseadas no hash
                    
                    print(f"📊 Conta {acc['name']}: {inserted} novas transações, {duplicated} ignoradas (já existiam).")

                # Concluído com sucesso
                cursor.execute("UPDATE webhook_events SET status = 'completed', processed_at = NOW() WHERE id = %s", (event_id,))
                print(f"✅ Webhook {event_id} FINALIZADO.")

            except Exception as e:
                print(f"❌ Erro na integração: {e}")
                cursor.execute("UPDATE webhook_events SET status = 'error', last_error = %s, retry_count = retry_count + 1 WHERE id = %s", (str(e), event_id))

        cursor.close(); conn.close()
    except Exception as e:
        print(f"🚨 Erro Fatal: {e}")

if __name__ == "__main__":
    process_pending_webhooks()
