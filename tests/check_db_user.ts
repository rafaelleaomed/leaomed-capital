import { sql } from '../utils/db';

async function check() {
  const users = await sql`SELECT id, email, created_at FROM auth.users WHERE email = 'rafaelleaobh@gmail.com'`;
  console.log('User found:', users);
  if (users.length > 0) {
    const userId = users[0].id;
    const count = await sql`SELECT count(*) as total FROM public.transactions WHERE user_id = ${userId}`;
    console.log('Total transactions in DB:', count[0]?.total);

    const periods = await sql`
      SELECT TO_CHAR(date, 'YYYY-MM') as month_period, count(*) as count, SUM(amount) as sum_amount
      FROM public.transactions 
      WHERE user_id = ${userId}
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month_period DESC
    `;
    console.log('Transactions by period:', periods);
  }
}

check().catch(console.error);
