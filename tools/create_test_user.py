import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Faltam variáveis de ambiente.")
    exit(1)

supabase: Client = create_client(url, key)

email = "teste_dev@plataforma.com"
password = "SenhaSegura123!"

try:
    # Usando a admin API do Supabase para criar um usuário sem precisar de confirmação de email
    response = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True
    })
    print("\n✅ Usuário de teste criado com sucesso no banco de dados!")
    print(f"ID: {response.user.id}")
    print(f"E-mail: {email}")
    print(f"Senha: {password}\n")
    print("👉 Use essas credenciais para fazer login no frontend durante o teste E2E.")
except Exception as e:
    # Se já existir o usuário, a API pode jogar exceção.
    print("\n⚠️ O usuário de teste provavelmente já existe, ou ocorreu um erro:", e)
    print(f"E-mail: {email}")
    print(f"Senha: {password}\n")
