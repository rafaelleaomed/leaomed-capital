#!/usr/bin/env python3
"""
Script de Migração de user_id: Neon (ID antigo) → Supabase Auth (ID novo)

Execute APÓS criar seu usuário no Supabase Auth com o e-mail rafaelleaobh@gmail.com.

Uso:
  python tools/migrate_user_id.py <NOVO_SUPABASE_USER_ID>

Exemplo:
  python tools/migrate_user_id.py "abc12345-0000-0000-0000-000000000000"

O que faz:
  1. Verifica se o ID antigo (d8225585-...) existe nas tabelas do Neon
  2. Substitui o user_id em todas as tabelas relevantes
  3. Insere o novo usuário na tabela public.users do Neon
  4. Confirma a migração
"""

import sys
import psycopg2

# ── Config ─────────────────────────────────────────────────────────────────
DATABASE_URL = "postgresql://neondb_owner:REDACTED_PASSWORD@ep-bold-shape-awxwzyxn-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require"
OLD_USER_ID  = "d8225585-6cf1-4dc7-ba96-724bc2bb7cc0"
OLD_EMAIL    = "rafaelleaobh@gmail.com"

# Tabelas que têm a coluna user_id
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
        print("Uso: python tools/migrate_user_id.py <NOVO_UUID>")
        sys.exit(1)

    new_user_id = sys.argv[1].strip()
    print(f"\n{'='*60}")
    print(f"Migração de user_id")
    print(f"  OLD: {OLD_USER_ID}")
    print(f"  NEW: {new_user_id}")
    print(f"{'='*60}\n")

    conn = psycopg2.connect(DATABASE_URL)
    cur  = conn.cursor()

    try:
        conn.autocommit = False

        # 1. Verificar se o ID antigo ainda existe
        cur.execute("SELECT id, email FROM public.users WHERE id = %s", (OLD_USER_ID,))
        row = cur.fetchone()
        if not row:
            print("⚠️  ID antigo não encontrado em public.users — pode já ter sido migrado.")
        else:
            print(f"✅ Usuário encontrado: {row[0]} | {row[1]}")

        # 2. Inserir novo usuário (ou ignorar se já existir)
        cur.execute("""
            INSERT INTO public.users (id, email, name, created_at)
            VALUES (%s, %s, 'Rafael Leão', NOW())
            ON CONFLICT (id) DO NOTHING
        """, (new_user_id, OLD_EMAIL))
        print(f"✅ Usuário {new_user_id} inserido em public.users (ou já existia)")

        # 3. Atualizar user_id em todas as tabelas
        for table in TABLES_WITH_USER_ID:
            cur.execute(
                f"UPDATE public.{table} SET user_id = %s WHERE user_id = %s",
                (new_user_id, OLD_USER_ID)
            )
            rows = cur.rowcount
            print(f"  {table}: {rows} registro(s) atualizado(s)")

        # 4. Remover usuário antigo (depois de atualizar FK)
        cur.execute("DELETE FROM public.users WHERE id = %s", (OLD_USER_ID,))
        print(f"✅ Usuário antigo {OLD_USER_ID} removido de public.users")

        conn.commit()
        print("\n🎉 Migração concluída com sucesso!")
        print(f"   Agora faça login no Aethel Wealth com: {OLD_EMAIL}")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Erro durante migração — rollback executado:")
        print(f"   {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run()
