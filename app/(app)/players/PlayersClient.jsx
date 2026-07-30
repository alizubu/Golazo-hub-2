'use client';

import React from 'react';
import { RosterView } from '@/app/components/PlayerViews';
import { useAppContext } from '@/app/components/AppContextProvider';
import { useRouter } from 'next/navigation';

export default function PlayersClient(props) {
  const { matches } = useAppContext();
  const router = useRouter();

  return (
    <RosterView
      {...props}
      matches={matches}
      setTab={(tab) => {
        // Fallback for setTab if used inside RosterView
        router.push('/' + tab);
      }}
      onH2HClick={(id) => {
        if (id !== props.me?.id) {
          router.push('/player/' + id);
        }
      }}
    />
  );
}
