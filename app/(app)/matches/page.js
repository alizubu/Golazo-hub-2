import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import MatchesClient from './MatchesClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MatchesRoute() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('golazo_user_id')?.value;
  
  if (!userId) redirect('/login');

  let players = [], seasons = [];
  try {
    [players, seasons] = await Promise.all([
      getPlayers(),
      getSeasons(),
    ]);
  } catch (error) {
    console.error('Failed to load matches dependencies:', error);
  }

  const me = players.find(p => p.id === userId);
  const activeSeason = seasons.find((t) => !t.isArchived) || null;

  return (
    <MatchesClient 
      me={me}
      players={players}
      activeSeason={activeSeason}
      seasons={seasons}
    />
  );
}
