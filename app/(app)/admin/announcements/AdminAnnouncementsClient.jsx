'use client';

import React from 'react';
import { AdminAnnouncements } from '@/app/components/AdminConsole';
import { useAppContext } from '@/app/components/AppContextProvider';

export default function AdminAnnouncementsClient(props) {
  const { showToast } = useAppContext();

  return (
    <div className="pt-4">
      <AdminAnnouncements
        {...props}
        showToast={showToast}
      />
    </div>
  );
}
