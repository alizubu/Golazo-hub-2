import { getPlayers } from '@/app/actions/player';
import PlayersClient from './PlayersClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PlayersRoute() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('golazo_user_id')?.value;
  
  if (!userId) redirect('/login');

  let players = [];
  try {
    players = await getPlayers();
  } catch (error) {
    console.error('Failed to load players:', error);
  }

  const me = players.find(p => p.id === userId);

  return (
    <PlayersClient 
      me={me}
      players={players}
    />
  );
}
