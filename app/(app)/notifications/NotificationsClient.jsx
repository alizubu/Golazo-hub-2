'use client';

import React from 'react';
import { NotificationsView } from '@/app/components/PlayerViews';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/app/components/PageHeader';

export default function NotificationsClient(props) {
  const router = useRouter();

  return (
    <>
      <PageHeader title="Alerts" onBack={() => router.push('/dashboard')} />
      <div className="p-4 sm:p-8">
        <NotificationsView
          {...props}
          setTab={(tab) => router.push('/' + tab)}
          onMatchClick={(id) => router.push('/matches?matchId=' + id)}
        />
      </div>
    </>
  );
}
