import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import { getMatches } from '@/app/actions/match';
import { HistoryView } from '@/app/components/PlayerViews';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/app/components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function HistoryRoute() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('golazo_user_id')?.value;
  
  if (!userId) redirect('/login');

  let players = [], seasons = [], matches = [];
  try {
    [players, seasons, matches] = await Promise.all([
      getPlayers(),
      getSeasons(),
      getMatches(),
    ]);
  } catch (error) {
    console.error('Failed to load history dependencies:', error);
  }

  const history = seasons.filter((t) => t.isArchived).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  return (
    <>
      <PageHeader title="Hall of Fame" />
      <div className="p-4 sm:p-8">
        <HistoryView 
          players={players}
          history={history}
          matches={matches}
        />
      </div>
    </>
  );
}
