import { getPlayers } from '@/app/actions/player';
import SettingsClient from './SettingsClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsRoute() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('golazo_user_id')?.value;
  
  if (!userId) redirect('/login');

  let players = [];
  try {
    players = await getPlayers();
  } catch (error) {
    console.error('Failed to load settings dependencies:', error);
  }

  const me = players.find(p => p.id === userId);

  return (
    <SettingsClient 
      me={me}
      players={players}
    />
  );
}
