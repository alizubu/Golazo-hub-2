import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import { getMatches } from '@/app/actions/match';
import AdminOverviewClient from './AdminOverviewClient';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewRoute() {
  let players = [], seasons = [], matches = [];

  try {
    [players, seasons, matches] = await Promise.all([
      getPlayers(),
      getSeasons(),
      getMatches(),
    ]);
  } catch (error) {
    console.error('Failed to load admin overview data:', error);
  }

  const activeSeason = seasons.find((t) => !t.isArchived) || null;

  return (
    <AdminOverviewClient 
      players={players}
      seasons={seasons}
      matches={matches}
      activeSeason={activeSeason}
    />
  );
}
