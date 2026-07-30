import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import AdminSeasonClient from './AdminSeasonClient';

export const dynamic = 'force-dynamic';

export default async function AdminSeasonRoute() {
  let players = [], seasons = [];

  try {
    [players, seasons] = await Promise.all([
      getPlayers(),
      getSeasons(),
    ]);
  } catch (error) {
    console.error('Failed to load admin season data:', error);
  }

  const activeSeason = seasons.find((t) => !t.isArchived) || null;
  const history = seasons.filter((t) => t.isArchived).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  return (
    <AdminSeasonClient 
      players={players}
      activeSeason={activeSeason}
      history={history}
    />
  );
}
