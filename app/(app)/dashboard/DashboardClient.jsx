'use client';

import React from 'react';
import { PlayerDashboard } from '@/app/components/PlayerViews';
import { useAppContext } from '@/app/components/AppContextProvider';
import { useRouter } from 'next/navigation';

export default function DashboardClient(props) {
  const { matches } = useAppContext();
  const router = useRouter();

  const handleMatchClick = (id) => {
    // Navigate to match details or open modal. For now, we can still use the modal inside PlayerViews if we extract it,
    // or just let PlayerDashboard handle it internally if it does. 
    // PlayerDashboard doesn't actually open the modal itself, it calls onMatchClick.
    router.push('/matches?matchId=' + id);
  };

  const handleH2HClick = (id) => {
    if (id !== props.me?.id) {
      router.push('/player/' + id);
    }
  };

  return (
    <PlayerDashboard
      {...props}
      matches={matches}
      onMatchClick={handleMatchClick}
      onH2HClick={handleH2HClick}
    />
  );
}
