import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mockdb';

/**
 * Cliente SQL Serverless para consultas diretas no Neon Postgres.
 * Seguro, ultrarrápido e sem bloqueios de conexão em Serverless/Edge.
 */
export const sql = neon(databaseUrl);
