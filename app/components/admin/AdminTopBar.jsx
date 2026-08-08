'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import ThemeToggle from '@/app/components/shared/ThemeToggle';

const SECTION_LABELS = {
  'admin':                'Dashboard',
  '':                     'Dashboard',
  'admin/players':        'Players',
  'admin/season':         'Tournament',
  'admin/matches':        'Matches',
  'admin/trophies':       'Trophies',
  'admin/announcements':  'Announcements',
  'admin/broadcast':      'Broadcast',
  'admin/roles':          'Role Manage',
  'admin/settings':       'Settings',
  'hall-of-fame':         'Hall of Fame',
};

export default function AdminTopBar({ currentTab, activeSeason }) {
  const label = SECTION_LABELS[currentTab] ?? 'Admin';

  const openSidebar = () =>
    window.dispatchEvent(new CustomEvent('admin-sidebar-toggle'));

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 md:px-6 flex-shrink-0 border-b border-border/40 bg-background/90 backdrop-blur-md"
    >
      {/* Left: hamburger (mobile) + section title */}
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors outline-none"
          aria-label="Toggle navigation"
        >
          <Menu size={16} />
        </button>
        <div>
          <h2 className="font-heading text-sm font-black tracking-wide text-foreground leading-none">
            {label}
          </h2>
          {activeSeason && (
            <p className="text-[10px] mt-0.5 font-medium hidden sm:block text-muted-foreground">
              {activeSeason.name}
            </p>
          )}
        </div>
      </div>

      {/* Right: season chip + admin badge + theme toggle */}
      <div className="flex items-center gap-3">
        {activeSeason && (
          <span
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-pitch-bright/20 bg-pitch-bright/10 text-pitch-bright text-[10px] font-bold uppercase tracking-wider"
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-pitch-bright shadow-[0_0_6px_rgba(41,193,121,0.8)]"
            />
            {activeSeason.type || 'Season'} Active
          </span>
        )}
        <span
          className="flex items-center px-2.5 py-0.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-[10px] font-black tracking-[0.14em] uppercase"
        >
          ADMIN
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
