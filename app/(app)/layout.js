import { getPlayers } from '@/app/actions/player';
import { getMatches } from '@/app/actions/match';
import prisma from '@/lib/db';
import FloatingNav from '@/app/components/FloatingNav';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PullToRefresh from '@/pwa/components/PullToRefresh';
import PageTransition from '@/pwa/components/PageTransition';

import { AppProvider } from '@/app/components/AppContextProvider';

export default async function AppLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('golazo_session')?.value;
  
  if (!sessionCookie) {
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

  if (sessionCookie === 'admin') {
    session = { type: 'admin', role: 'admin' };
  } else if (sessionCookie === 'manager') {
    session = { type: 'admin', role: 'manager' };
  } else if (sessionCookie === 'player') {
    const userId = cookieStore.get('golazo_user_id')?.value;
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
          <PullToRefresh>
            <PageTransition>
              {children}
            </PageTransition>
          </PullToRefresh>
        </ErrorBoundary>
      </div>
    </AppProvider>
  );
}
