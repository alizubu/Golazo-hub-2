import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('golazo_session')?.value;
  
  if (sessionCookie === 'admin' || sessionCookie === 'manager') {
    redirect('/admin');
  } else if (sessionCookie === 'player') {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}

