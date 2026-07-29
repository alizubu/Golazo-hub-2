import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import { getMatches } from '@/app/actions/match';
import prisma from '@/lib/db';
import ClientApp from './components/ClientApp';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const players = await getPlayers();
  const seasons = await getSeasons();
  const matches = await getMatches();
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  const trophies = await prisma.trophy.findMany({ orderBy: { createdAt: 'desc' } });
  const adminConfig = { enabled: true }; // Admin login allowed

  let initialSession = null;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('golazo_session')?.value;
  if (sessionCookie === 'admin') {
    initialSession = { type: 'admin' };
  } else if (sessionCookie === 'player') {
    const userId = cookieStore.get('golazo_user_id')?.value;
    const player = players.find(p => p.id === userId);
    if (player) {
      initialSession = { type: 'player', playerId: player.id, player };
    }
  }

  return (
    <ClientApp 
      initialSession={initialSession}
      initialPlayers={players}
      initialSeasons={seasons}
      initialMatches={matches}
      initialNotifications={notifications}
      initialAnnouncements={announcements}
      initialTrophies={trophies}
      adminConfig={adminConfig}
    />
  );
}
