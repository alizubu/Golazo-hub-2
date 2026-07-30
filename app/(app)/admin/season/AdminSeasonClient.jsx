'use client';

import React from 'react';
import { AdminSeason } from '@/app/components/AdminConsole';
import { useAppContext } from '@/app/components/AppContextProvider';

export default function AdminSeasonClient(props) {
  const { matches, showToast } = useAppContext();

  return (
    <div className="pt-4">
      <AdminSeason
        {...props}
        matches={matches}
        showToast={showToast}
      />
    </div>
  );
}
