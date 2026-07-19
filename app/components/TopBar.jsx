'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { Badge } from './UI';

export default function TopBar({ session, me, onLogout }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', letterSpacing: '0.5px' }}>FRIENDS eLEAGUE</span>
      </div>
      <div className="flex items-center gap-3">
        {session.type === 'admin' ? (
          <Badge color="var(--gold)">ADMIN</Badge>
        ) : me ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">{me.avatar}</span>
            <span className="hidden sm:inline font-semibold">{me.name}</span>
          </div>
        ) : null}
        <button 
          onClick={onLogout} 
          className="btn-hover p-2 rounded-lg transition-all-fast" 
          style={{ border: '1px solid var(--border)' }} 
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
