import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | undefined;

function getClient(): NeonQueryFunction<false, false> {
  if (client) return client;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não configurada. O acesso ao banco foi bloqueado para evitar uso de credencial padrão.');
  }
  client = neon(databaseUrl);
  return client;
}

/**
 * Cliente SQL Serverless para consultas diretas no Neon Postgres.
 * Seguro, ultrarrápido e sem bloqueios de conexão em Serverless/Edge.
 */
// Preview builds can import routes without gaining access to production data.
// Resolve credentials only when a query or client method is actually invoked.
export const sql = new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
  apply(_target, thisArg, args) {
    return Reflect.apply(getClient(), thisArg, args);
  },
  get(_target, property) {
    const activeClient = getClient();
    const value = Reflect.get(activeClient, property);
    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
});

