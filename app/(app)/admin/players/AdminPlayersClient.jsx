'use client';

import React from 'react';
import { AdminPlayers } from '@/app/components/AdminConsole';
import { useAppContext } from '@/app/components/AppContextProvider';

export default function AdminPlayersClient(props) {
  const { showToast } = useAppContext();

  return (
    <div className="pt-4">
      <AdminPlayers
        {...props}
        showToast={showToast}
      />
    </div>
  );
}
