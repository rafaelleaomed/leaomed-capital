import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada. O acesso ao banco foi bloqueado para evitar uso de credencial padrão.');
}

/**
 * Cliente SQL Serverless para consultas diretas no Neon Postgres.
 * Seguro, ultrarrápido e sem bloqueios de conexão em Serverless/Edge.
 */
export const sql = neon(databaseUrl);
