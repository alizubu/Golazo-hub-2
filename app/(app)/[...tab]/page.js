import { getPlayers } from '@/app/actions/player';
import { getMatches } from '@/app/actions/match';
import { getSeasons } from '@/app/actions/season';
import { getCelebrations } from '@/app/actions/admin';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import AppShell from '@/app/components/AppShell';

export const dynamic = 'force-dynamic';

export default async function CatchAllTabRoute({ params }) {
  // Extract initial tab from params
  const { tab } = await params;
  const initialTab = tab ? tab.join('/') : '';

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('golazo_session')?.value;

  let session = null;
  let me = null;

  // We fetch players first to resolve "me"
  let players = [];
  try {
    players = await getPlayers();
  } catch (error) {
    console.error('Failed to load players:', error);
  }

  if (sessionCookie === 'admin') {
    session = { type: 'admin' };
  } else if (sessionCookie === 'player') {
    const userId = cookieStore.get('golazo_user_id')?.value;
    const player = players.find(p => p.id === userId);
    if (player) {
      session = { type: 'player', playerId: player.id, player };
      me = player;
    }
  }

  // Fetch all other data in parallel
  let matches = [], seasons = [], announcements = [], trophies = [], notifications = [], history = [];

  try {
    [matches, seasons, announcements, notifications] = await Promise.all([
      getMatches(),
      getSeasons(),
      prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    ]);
    
    // Trophies and History might be needed by some tabs
    trophies = await prisma.trophy.findMany({ include: { player: true, season: true }, orderBy: { dateAwarded: 'desc' } });
    history = await prisma.season.findMany({ where: { isArchived: true }, include: { champion: true, runnerUp: true, matches: true }, orderBy: { endDate: 'desc' } });
  } catch (error) {
    console.error('Failed to load app data:', error);
  }

  return (
    <AppShell 
      initialTab={initialTab}
      session={session}
      me={me}
      players={players}
      matches={matches}
      seasons={seasons}
      announcements={announcements}
      trophies={trophies}
      notifications={notifications}
      history={history}
    />
  );
}
