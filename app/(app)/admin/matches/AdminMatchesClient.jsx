'use client';

import React from 'react';
import { AdminMatches, AdminPlayoffs } from '@/app/components/AdminConsole';
import { useAppContext } from '@/app/components/AppContextProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export default function AdminMatchesClient(props) {
  const { matches, showToast } = useAppContext();

  return (
    <div className="pt-4 space-y-6">
      <Tabs defaultValue="league" className="w-full">
        <TabsList className="w-full bg-secondary/50 border border-border/50 p-1 rounded-xl h-12">
          <TabsTrigger value="league" className="flex-1 rounded-lg">League Matches</TabsTrigger>
          <TabsTrigger value="playoffs" className="flex-1 rounded-lg">Playoffs</TabsTrigger>
        </TabsList>
        <TabsContent value="league" className="mt-4">
          <AdminMatches
            {...props}
            matches={matches}
            showToast={showToast}
          />
        </TabsContent>
        <TabsContent value="playoffs" className="mt-4">
          <AdminPlayoffs
            {...props}
            matches={matches}
            showToast={showToast}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
