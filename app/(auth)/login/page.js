import { getPlayers } from '@/app/actions/player';
import AuthGate from '@/app/components/shared/AuthGate';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('golazo_session')?.value;
  
  // If already logged in, redirect to dashboard or admin
  if (session === 'admin' || session === 'manager') {
    redirect('/admin');
  } else if (session === 'player') {
    redirect('/dashboard');
  }

  let players = [];
  try {
    players = await getPlayers();
  } catch (error) {
    console.error('Failed to load players for AuthGate:', error);
  }

  return    <AuthGate 
      players={players} 
    />;
}
