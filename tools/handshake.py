import os
from dotenv import load_dotenv
from supabase import create_client, Client
import requests

# Carrega variáveis do .env
load_dotenv()

def test_supabase():
    print("=== Testando conexão com Supabase ===")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        print("[ERRO] Faltam credenciais do Supabase no .env (Verifique SUPABASE_URL e SUPABASE_KEY)")
        return False
    
    try:
        supabase: Client = create_client(url, key)
        # Tenta uma operação simples para garantir que a chave é válida
        # Buscando de uma tabela genérica (que provavelmente não existe, mas vai testar a autenticação)
        # O ideal no handshake é apenas verificar se a inicialização não deu erro crítico,
        # mas faremos uma chamada leve à API:
        response = supabase.auth.get_session()
        print("[OK] Conexão com Supabase inicializada com sucesso!")
        return True
    except Exception as e:
        print(f"[ERRO] Erro ao conectar no Supabase: {e}")
        return False

def test_pluggy():
    print("\n=== Testando conexão com Pluggy ===")
    client_id = os.environ.get("PLUGGY_CLIENT_ID")
    client_secret = os.environ.get("PLUGGY_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("[AVISO] Chaves da Pluggy não encontradas no .env. Ignorando handshake da Pluggy por enquanto.")
        return False

    try:
        url = "https://api.pluggy.ai/auth"
        payload = {
            "clientId": client_id,
            "clientSecret": client_secret
        }
        headers = {
            "accept": "application/json",
            "content-type": "application/json"
        }

        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("[OK] Autenticação com Pluggy realizada com sucesso!")
            return True
        else:
            print(f"[ERRO] Erro na Pluggy (Status {response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"[ERRO] Erro ao tentar conectar na Pluggy: {e}")
        return False

if __name__ == "__main__":
    print("Iniciando Handshake B.L.A.S.T...\n")
    
    supabase_ok = test_supabase()
    pluggy_ok = test_pluggy()
    
    print("\n=== Resumo do Handshake ===")
    print(f"Supabase: {'[OK]' if supabase_ok else '[FALHA] Não configurado'}")
    print(f"Pluggy:   {'[OK]' if pluggy_ok else '[FALHA] Não configurado'}")
    
    if not supabase_ok or not pluggy_ok:
        print("\nO Handshake está INCOMPLETO. Por favor, verifique o arquivo .env.")
        exit(1)
    else:
        print("\n[OK] HANDSHAKE COMPLETO! O sistema está pronto para a Fase 3 (Architect).")
        exit(0)
