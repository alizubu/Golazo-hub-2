'use client';

import React from 'react';
import MatchesPage from '@/app/components/MatchesPage';
import { useAppContext } from '@/app/components/AppContextProvider';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/app/components/PageHeader';

export default function MatchesClient(props) {
  const { matches } = useAppContext();
  const router = useRouter();

  const handleMatchClick = (id) => {
    // Open modal via query param or state? MatchesPage manages its own modals usually?
    // Actually, PlayerViews managed MatchStatsModal for MatchesPage too.
    // Let's use a query param so we can have a global modal or just render it here.
    router.push('/matches?matchId=' + id);
  };

  return (
    <>
      <PageHeader title="Matches" onBack={() => router.push('/dashboard')} />
      <div className="p-4 sm:p-8">
        <MatchesPage
          {...props}
          matches={matches}
          onMatchClick={handleMatchClick}
        />
      </div>
    </>
  );
}
