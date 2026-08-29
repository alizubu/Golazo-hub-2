'use client';

import React from 'react';
import { Menu, AlertTriangle } from 'lucide-react';


const SECTION_LABELS = {
  'admin':                'Dashboard',
  '':                     'Dashboard',
  'admin/players':        'Players',
  'admin/season':         'Tournament',
  'admin/matches':        'Matches',
  'admin/trophies':       'Trophies',
  'admin/announcements':  'Announcements',
  'admin/broadcast':      'Live Control Center',
  'admin/roles':          'Role Manage',
  'admin/settings':       'Settings',
  'hall-of-fame':         'Hall of Fame',
};

export default function AdminTopBar({ currentTab, activeSeason, notifications = [], setTab }) {
  const label = SECTION_LABELS[currentTab] ?? 'Admin';
  const unreadNotifs = notifications.length;

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

      {/* Right: alerts + season chip + admin badge + theme toggle */}
      <div className="flex items-center gap-3">
        {unreadNotifs > 0 ? (
          <button
            onClick={() => setTab && setTab('notifications')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors relative outline-none"
            title="System Alerts"
          >
            <AlertTriangle size={16} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 text-[8px] font-bold text-white items-center justify-center leading-none pb-[1px]">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
            </span>
          </button>
        ) : (
          <button
            onClick={() => setTab && setTab('notifications')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors outline-none"
            title="No Alerts"
          >
            <AlertTriangle size={16} />
          </button>
        )}

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
      </div>
    </div>
  );
}
