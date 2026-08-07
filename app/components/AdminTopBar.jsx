'use client';

import React from 'react';
import { Menu } from 'lucide-react';

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
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 md:px-6 flex-shrink-0 border-b border-white/[0.06]"
      style={{ background: 'rgba(11,14,20,0.88)', backdropFilter: 'blur(18px)' }}
    >
      {/* Left: hamburger (mobile) + section title */}
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06] text-[#565F70] hover:text-white hover:bg-white/10 transition-colors outline-none"
          aria-label="Toggle navigation"
        >
          <Menu size={16} />
        </button>
        <div>
          <h2 className="font-heading text-sm font-black tracking-wide text-white leading-none">
            {label}
          </h2>
          {activeSeason && (
            <p className="text-[10px] mt-0.5 font-medium hidden sm:block" style={{ color: '#565F70' }}>
              {activeSeason.name}
            </p>
          )}
        </div>
      </div>

      {/* Right: season chip + admin badge */}
      <div className="flex items-center gap-2">
        {activeSeason && (
          <span
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: '#29C179',
              background: 'rgba(31,138,92,0.1)',
              borderColor: 'rgba(41,193,121,0.2)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#29C179', boxShadow: '0 0 6px rgba(41,193,121,0.8)' }}
            />
            {activeSeason.type || 'Season'} Active
          </span>
        )}
        <span
          className="flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-black tracking-[0.14em] uppercase"
          style={{
            color: '#D9A93B',
            background: 'rgba(217,169,59,0.08)',
            borderColor: 'rgba(217,169,59,0.28)',
          }}
        >
          ADMIN
        </span>
      </div>
    </div>
  );
}
