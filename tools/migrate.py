import os
import psycopg2
from urllib.parse import urlparse
import sys
from dotenv import load_dotenv

# Configurando stdout para utf-8
sys.stdout.reconfigure(encoding='utf-8')

# Carrega variáveis do .env
load_dotenv()

# Pegar a string de conexão
supabase_password = os.environ.get('SUPABASE_DB_PASSWORD')
supabase_url = os.environ.get('SUPABASE_URL')
if not supabase_password or not supabase_url:
    print("Erro: SUPABASE_DB_PASSWORD ou SUPABASE_URL não encontrados.")
    exit(1)

host = supabase_url.replace('https://', 'db.')
host = host.replace('.co', '.co') # db.dulkpyhjrgcxmqwszvrt.supabase.co


# Lendo o arquivo SQL
sql_file_path = "database/01_initial_schema.sql"
try:
    with open(sql_file_path, "r", encoding="utf-8") as file:
        sql_commands = file.read()
except FileNotFoundError:
    print(f"Erro: Arquivo {sql_file_path} não encontrado.")
    exit(1)

# Conectando e executando
try:
    print(f"Conectando ao banco de dados Supabase ({host})...")
    conn = psycopg2.connect(
        host=host,
        database="postgres",
        user="postgres",
        password=supabase_password,
        port=5432
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Executando a migração SQL...")
    cursor.execute(sql_commands)
    
    print("✅ Migração concluída com sucesso!")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"❌ Erro ao executar a migração: {e}")
    exit(1)
