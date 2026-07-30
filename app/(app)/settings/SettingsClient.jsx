'use client';

import React from 'react';
import SettingsView from '@/app/components/SettingsView';
import { useRouter } from 'next/navigation';

export default function SettingsClient(props) {
  const router = useRouter();

  return (
    <div className="pt-4">
      <SettingsView
        {...props}
        setTab={(tab) => router.push('/' + tab)}
      />
    </div>
  );
}
