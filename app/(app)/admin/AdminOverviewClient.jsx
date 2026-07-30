'use client';

import React from 'react';
import AdminOverviewDashboard from '@/app/components/AdminOverviewDashboard';
import { useAppContext } from '@/app/components/AppContextProvider';

export default function AdminOverviewClient(props) {
  const { matches, showToast } = useAppContext();

  return (
    <AdminOverviewDashboard
      {...props}
      matches={matches}
      showToast={showToast}
    />
  );
}
