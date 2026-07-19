import { getPlayers } from '@/app/actions/player';
import { getTournaments } from '@/app/actions/tournament';
import { getMatches } from '@/app/actions/match';
import prisma from '@/lib/db';
import ClientApp from './components/ClientApp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const players = await getPlayers();
  const tournaments = await getTournaments();
  const matches = await getMatches();
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  const adminConfig = { enabled: true }; // Admin login allowed

  return (
    <ClientApp 
      initialPlayers={players}
      initialTournaments={tournaments}
      initialMatches={matches}
      initialNotifications={notifications}
      adminConfig={adminConfig}
    />
  );
}
