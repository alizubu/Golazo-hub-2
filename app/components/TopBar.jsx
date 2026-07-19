'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { Badge, Btn } from './UI';

export default function TopBar({ session, me, onLogout }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <span className="font-display text-lg font-bold tracking-tight">FRIENDS eLEAGUE</span>
      </div>
      <div className="flex items-center gap-4">
        {session.type === 'admin' ? (
          <Badge color="var(--gold)">ADMIN</Badge>
        ) : me ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">{me.avatar}</span>
            <span className="hidden sm:inline font-semibold">{me.name}</span>
          </div>
        ) : null}
        <Btn 
          variant="ghost"
          onClick={onLogout} 
          className="p-2 h-9 w-9 text-muted-foreground hover:text-foreground" 
          title="Log out"
        >
          <LogOut size={16} />
        </Btn>
      </div>
    </div>
  );
}
