import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL não está configurada. ' +
    'Crie um arquivo .env.local com a variável DATABASE_URL. ' +
    'Veja .env.example para o formato esperado.'
  );
}

/**
 * Cliente SQL Serverless para consultas diretas no Neon Postgres.
 * Seguro, ultrarrápido e sem bloqueios de conexão em Serverless/Edge.
 * A string de conexão NUNCA deve ser hardcoded — use variáveis de ambiente.
 */
export const sql = neon(databaseUrl);
