import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import prisma from '@/lib/db';
import AdminTrophiesClient from './AdminTrophiesClient';

export const dynamic = 'force-dynamic';

export default async function AdminTrophiesRoute() {
  let players = [], seasons = [], trophies = [];

  try {
    [players, seasons] = await Promise.all([
      getPlayers(),
      getSeasons(),
    ]);
  } catch (error) {
    console.error('Failed to load admin trophies players/seasons:', error);
  }

  try {
    trophies = await prisma.trophy.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    console.error('Failed to load admin trophies:', error);
  }

  return (
    <AdminTrophiesClient 
      players={players}
      seasons={seasons}
      trophies={trophies}
    />
  );
}
