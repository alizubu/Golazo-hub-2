'use client';

import React from 'react';
import { AdminTrophies } from '@/app/components/AdminConsole';
import { useAppContext } from '@/app/components/AppContextProvider';

export default function AdminTrophiesClient(props) {
  const { showToast } = useAppContext();

  return (
    <div className="pt-4">
      <AdminTrophies
        {...props}
        showToast={showToast}
      />
    </div>
  );
}
