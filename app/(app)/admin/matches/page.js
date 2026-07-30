import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import AdminMatchesClient from './AdminMatchesClient';

export const dynamic = 'force-dynamic';

export default async function AdminMatchesRoute() {
  let players = [], seasons = [];

  try {
    [players, seasons] = await Promise.all([
      getPlayers(),
      getSeasons(),
    ]);
  } catch (error) {
    console.error('Failed to load admin matches data:', error);
  }

  const activeSeason = seasons.find((t) => !t.isArchived) || null;

  return (
    <AdminMatchesClient 
      players={players}
      activeSeason={activeSeason}
    />
  );
}
