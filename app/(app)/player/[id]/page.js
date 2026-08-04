import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import prisma from '@/lib/db';
import PlayerProfileClient from './PlayerProfileClient';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PlayerProfileRoute({ params }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  
  const cookieStore = await cookies();
  const userId = cookieStore.get('golazo_user_id')?.value;
  
  let players = [], seasons = [], announcements = [], trophies = [];

  try {
    [players, seasons] = await Promise.all([
      getPlayers(),
      getSeasons(),
    ]);
  } catch (error) {
    console.error('Failed to load profile core data:', error);
  }

  try {
    [announcements, trophies] = await Promise.all([
      prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.trophy.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
  } catch (error) {
    console.error('Failed to load profile secondary data:', error);
  }

  const targetPlayer = players.find(p => p.id === decodedId || p.username === decodedId);
  if (!targetPlayer) {
    notFound();
  }

  const loggedInPlayer = players.find(p => p.id === userId) || null;
  const activeSeason = seasons.find((t) => !t.isArchived) || null;

  return (
    <PlayerProfileClient 
      targetPlayer={targetPlayer}
      loggedInPlayer={loggedInPlayer}
      players={players}
      seasons={seasons}
      activeSeason={activeSeason}
      announcements={announcements}
      trophies={trophies}
    />
  );
}
