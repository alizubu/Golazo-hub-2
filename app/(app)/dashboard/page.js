import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import prisma from '@/lib/db';
import DashboardClient from './DashboardClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('golazo_user_id')?.value;
  
  if (!userId) {
    redirect('/login');
  }

  let players = [], seasons = [], announcements = [], trophies = [];

  try {
    [players, seasons] = await Promise.all([
      getPlayers(),
      getSeasons(),
    ]);
  } catch (error) {
    console.error('Failed to load core data:', error);
  }

  try {
    [announcements, trophies] = await Promise.all([
      prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.trophy.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
  } catch (error) {
    console.error('Failed to load secondary data:', error);
  }

  const me = players.find(p => p.id === userId);
  if (!me) {
    redirect('/login');
  }

  const activeSeason = seasons.find((t) => !t.isArchived) || null;

  return (
    <DashboardClient 
      me={me}
      players={players}
      seasons={seasons}
      activeSeason={activeSeason}
      announcements={announcements}
      trophies={trophies}
    />
  );
}
