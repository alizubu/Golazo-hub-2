import prisma from '@/lib/db';
import { getPlayers } from '@/app/actions/player';
import { getSeasons } from '@/app/actions/season';
import { getMatches } from '@/app/actions/match';
import PlayerViews from '@/app/components/PlayerViews';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PlayerProfilePage({ params }) {
  const { id } = await params;
  
  const players = await getPlayers();
  const player = players.find(p => p.id === id);
  if (!player) {
    notFound();
  }

  const seasons = await getSeasons();
  const matches = await getMatches();
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  const trophies = await prisma.trophy.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto p-4 md:p-8 pt-6">
        <PlayerViews
          tab="dashboard"
          me={player}
          players={players}
          seasons={seasons}
          activeSeason={seasons.find((s) => s.isActive) || seasons[0]}
          matches={matches}
          announcements={announcements}
          trophies={trophies}
          notifications={notifications}
          setTab={() => {}}
          viewOnly={true}
        />
      </div>
    </div>
  );
}
