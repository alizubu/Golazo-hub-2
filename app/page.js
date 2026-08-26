import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const payload = await getSession();
  
  if (payload?.role === 'admin' || payload?.role === 'manager') {
    redirect('/admin');
  } else if (payload?.role === 'player') {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}

