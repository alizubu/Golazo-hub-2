'use client';

import React from 'react';
import { AdminSettings } from '@/app/components/AdminConsole';
import { useAppContext } from '@/app/components/AppContextProvider';

export default function AdminSettingsClient(props) {
  const { showToast } = useAppContext();

  return (
    <div className="pt-4">
      <AdminSettings
        {...props}
        showToast={showToast}
      />
    </div>
  );
}
