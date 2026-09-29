#!/usr/bin/env python3
"""
Script de Migração de user_id: Neon (ID antigo) → Supabase Auth (ID novo)
"""

import os
import sys
import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("❌ ERRO: Variável de ambiente DATABASE_URL não configurada.")
    sys.exit(1)

OLD_USER_ID = os.environ.get("OLD_USER_ID", "d8225585-6cf1-4dc7-ba96-724bc2bb7cc0")
OLD_EMAIL = os.environ.get("OLD_EMAIL", "usuario@leaomed.local")

TABLES_WITH_USER_ID = [
    "accounts",
    "transactions",
    "installments",
    "investment_assets",
    "investment_positions",
    "investment_targets",
    "monthly_history",
]

def run():
    if len(sys.argv) < 2:
        print("Erro: passe o novo Supabase User ID como argumento.")
        sys.exit(1)

    new_user_id = sys.argv[1].strip()
    print(f"\n{'='*60}")
    print(f"Migração de user_id no Neon PostgreSQL")
    print(f"  OLD: {OLD_USER_ID}")
    print(f"  NEW: {new_user_id}")
    print(f"{'='*60}\n")

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        conn.autocommit = False

        # 1. Alterar email antigo temporariamente
        cur.execute("UPDATE public.users SET email = 'temp_old@domain.local' WHERE id = %s", (OLD_USER_ID,))
        
        # 2. Criar novo usuário na tabela public.users
        cur.execute(
            "INSERT INTO public.users (id, email, name, created_at) VALUES (%s, %s, 'Rafael Leão', NOW()) ON CONFLICT (id) DO NOTHING",
            (new_user_id, OLD_EMAIL)
        )
        print(f"✅ Novo usuário {new_user_id} criado em public.users")

        # 3. Re-vincular todas as tabelas filhas ao novo user_id
        for table in TABLES_WITH_USER_ID:
            cur.execute(f"UPDATE public.{table} SET user_id = %s WHERE user_id = %s", (new_user_id, OLD_USER_ID))
            print(f"  {table}: {cur.rowcount} registro(s) re-vinculado(s)")

        # 4. Deletar usuário antigo
        cur.execute("DELETE FROM public.users WHERE id = %s", (OLD_USER_ID,))
        print(f"✅ Usuário antigo removido de public.users")

        conn.commit()
        print("\n🎉 MIGRAÇÃO NO NEON CONCLUÍDA COM SUCESSO!")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Erro durante migração — rollback executado:\n   {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run()
