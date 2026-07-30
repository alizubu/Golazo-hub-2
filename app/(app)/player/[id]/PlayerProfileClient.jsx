'use client';

import React, { useState } from 'react';
import { PlayerDashboard } from '@/app/components/PlayerViews';
import { useAppContext } from '@/app/components/AppContextProvider';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/app/components/PageHeader';
import HeadToHeadModal from '@/app/components/HeadToHeadModal';
import { Swords } from 'lucide-react';
import { Btn } from '@/app/components/UI';

export default function PlayerProfileClient({ targetPlayer, loggedInPlayer, players, ...props }) {
  const { matches } = useAppContext();
  const router = useRouter();
  const [showH2H, setShowH2H] = useState(false);

  const handleMatchClick = (id) => {
    router.push('/matches?matchId=' + id);
  };

  const isMe = loggedInPlayer?.id === targetPlayer.id;

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <PageHeader title={`${targetPlayer.name}'s Profile`} onBack={() => router.back()} />
        {!isMe && loggedInPlayer && (
          <Btn 
            onClick={() => setShowH2H(true)} 
            className="flex items-center gap-2 bg-claret text-white hover:bg-claret/80 border-none shadow-lg text-xs mr-4 px-3 h-8"
          >
            <Swords size={14} /> Head to Head
          </Btn>
        )}
      </div>

      <PlayerDashboard
        {...props}
        me={targetPlayer}
        players={players}
        matches={matches}
        onMatchClick={handleMatchClick}
        viewOnly={!isMe}
      />

      {showH2H && loggedInPlayer && (
        <HeadToHeadModal 
          playerA={loggedInPlayer} 
          playerB={targetPlayer} 
          allMatches={matches} 
          onClose={() => setShowH2H(false)} 
          onMatchClick={handleMatchClick} 
          players={players} 
        />
      )}
    </>
  );
}
