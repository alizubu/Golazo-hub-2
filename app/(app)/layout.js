import { getPlayers } from '@/app/actions/player';
import { getMatches } from '@/app/actions/match';
import prisma from '@/lib/db';
import FloatingNav from '@/app/components/user/FloatingNav';
import { getSession } from '@/app/actions/auth';
import ErrorBoundary from '@/app/components/shared/ErrorBoundary';
import { redirect } from 'next/navigation';
import PageTransition from '@/pwa/components/PageTransition';

import { AppProvider } from '@/app/components/shared/AppContextProvider';

export default async function AppLayout({ children }) {
  const payload = await getSession();
  
  if (!payload) {
    redirect('/login');
  }

  let players = [], matches = [], notifications = [];
  try {
    [players, matches] = await Promise.all([
      getPlayers(),
      getMatches(),
    ]);
  } catch (error) {
    console.error('Failed to load core layout data:', error);
  }

  try {
    notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  } catch (error) {
    console.error('Failed to load notifications for layout:', error);
  }

  let session = null;
  let me = null;

  if (payload?.role === 'admin') {
    session = { type: 'admin', role: 'admin' };
  } else if (payload?.role === 'manager') {
    session = { type: 'admin', role: 'manager' };
  } else if (payload?.role === 'player') {
    const userId = payload.id;
    const player = players.find(p => p.id === userId);
    if (player) {
      session = { type: 'player', playerId: player.id, player };
      me = player;
    } else {
      redirect('/login');
    }
  }

  const isAdmin = session?.type === 'admin';

  return (
    <AppProvider initialMatches={matches}>
      <div className={`min-h-screen bg-background text-foreground ${isAdmin ? '' : 'pb-20'}`}>
        <FloatingNav 
          session={session} 
          me={me} 
          players={players} 
          notifications={notifications} 
          matches={matches} 
        />
        <ErrorBoundary>
          <PageTransition>
            {children}
          </PageTransition>
        </ErrorBoundary>
      </div>
    </AppProvider>
  );
}
