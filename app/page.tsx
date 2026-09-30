import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/utils/supabase-server';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const user = await getAuthenticatedUser();
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
