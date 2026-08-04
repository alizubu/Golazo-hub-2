'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Home, Users, Trophy, Calendar, Star, Megaphone,
  Settings, LogOut, X, ChevronRight, Loader2,
} from 'lucide-react';
import { clearAuthCookie } from '@/app/actions/auth';

const NAV_ITEMS = [
  { tab: 'admin',               label: 'Overview',       icon: Home,      matchExact: true },
  { tab: 'admin/players',       label: 'Players',        icon: Users },
  { tab: 'admin/season',        label: 'Tournament',     icon: Trophy },
  { tab: 'admin/matches',       label: 'Matches',        icon: Calendar,  liveIndicator: true },
  { tab: 'admin/trophies',      label: 'Trophies',       icon: Star },
  { tab: 'admin/announcements', label: 'Announcements',  icon: Megaphone },
  { tab: 'hall-of-fame',        label: 'Hall of Fame',   icon: Star },
];

// ══════════════════════════════════════════════════════════════
// NAV ITEM BUTTON — shared between desktop rail and mobile drawer
// ══════════════════════════════════════════════════════════════
function NavItem({ item, active, hasLive, onClick, compact }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.tab)}
      title={compact ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`
        relative w-full flex items-center outline-none transition-colors duration-150 group
        ${compact ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-2.5 my-0.5 text-[13px] font-semibold text-left'}
        ${active ? 'text-white' : 'text-[#565F70] hover:text-[#8A93A3] hover:bg-white/[0.04]'}
      `}
    >
      {/* Active: left border glow */}
      {active && !compact && (
        <motion.div
          layoutId="sidebar-active-border"
          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
          style={{ background: '#29C179', boxShadow: '0 0 10px rgba(41,193,121,0.6)' }}
          transition={{ type: 'spring', bounce: 0.22, duration: 0.4 }}
        />
      )}
      {/* Active: background pill */}
      {active && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0"
          style={{ background: 'rgba(31,138,92,0.1)' }}
          transition={{ type: 'spring', bounce: 0.22, duration: 0.4 }}
        />
      )}

      {/* Icon */}
      <Icon
        size={17}
        className={`relative z-10 flex-shrink-0 transition-colors ${active ? 'text-pitch-bright' : 'text-[#565F70] group-hover:text-[#8A93A3]'}`}
        style={active ? { filter: 'drop-shadow(0 0 5px rgba(41,193,121,0.45))' } : undefined}
      />

      {/* Label */}
      {!compact && (
        <span className="relative z-10 flex-1 truncate">{item.label}</span>
      )}

      {/* Live indicator dot */}
      {item.liveIndicator && hasLive && (
        <span className={`relative z-10 flex-shrink-0 w-2 h-2 rounded-full bg-red-500 ${compact ? 'absolute top-2 right-2' : ''}`}>
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
        </span>
      )}

      {/* Chevron */}
      {active && !compact && (
        <ChevronRight size={12} className="relative z-10 flex-shrink-0 text-pitch-bright/50" />
      )}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// SIDEBAR FOOTER — season chip, admin badge, settings, logout
// ══════════════════════════════════════════════════════════════
function SidebarFooter({ activeSeason, onNavigate, onLogout, isLoggingOut, compact }) {
  return (
    <div className="border-t border-white/[0.06] pt-2 pb-4 flex-shrink-0"
      style={{ paddingLeft: compact ? 0 : 8, paddingRight: compact ? 0 : 8 }}>
      {/* Season chip */}
      {activeSeason && !compact && (
        <div className="px-3 py-2.5 rounded-xl mx-1 mb-2"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] font-bold uppercase tracking-[0.13em] mb-0.5" style={{ color: '#565F70' }}>
            Active Season
          </div>
          <div className="text-xs font-bold truncate" style={{ color: '#8A93A3' }}>{activeSeason.name}</div>
        </div>
      )}
      {/* Admin badge */}
      {!compact && (
        <div className="flex items-center px-4 py-1.5 mb-1">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border"
            style={{ color: '#D9A93B', background: 'rgba(217,169,59,0.08)', borderColor: 'rgba(217,169,59,0.26)' }}>
            ADMIN
          </span>
        </div>
      )}
      {/* Settings */}
      <button
        onClick={() => onNavigate('admin/settings')}
        title={compact ? 'Settings' : undefined}
        className={`
          relative w-full flex items-center gap-3 py-2.5 text-[13px] font-semibold
          text-[#565F70] hover:text-[#8A93A3] hover:bg-white/[0.04] transition-colors outline-none
          ${compact ? 'justify-center px-0' : 'px-4'}
        `}
      >
        <Settings size={16} className="flex-shrink-0" />
        {!compact && <span>Settings</span>}
      </button>
      {/* Logout */}
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        title={compact ? 'Log out' : undefined}
        className={`
          relative w-full flex items-center gap-3 py-2.5 text-[13px] font-semibold
          text-[#565F70] hover:text-[#B23A48] hover:bg-[#B23A48]/10 transition-colors outline-none disabled:opacity-50
          ${compact ? 'justify-center px-0' : 'px-4'}
        `}
      >
        {isLoggingOut
          ? <Loader2 size={16} className="animate-spin flex-shrink-0" />
          : <LogOut size={16} className="flex-shrink-0" />}
        {!compact && <span>{isLoggingOut ? 'Logging out…' : 'Log out'}</span>}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN ADMIN SIDEBAR
// ══════════════════════════════════════════════════════════════
export default function AdminSidebar({ currentTab, setTab, activeSeason, matches = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasLive = matches.some(m => m.status === 'live');

  // Listen for mobile drawer toggle events (fired by AdminTopBar hamburger)
  useEffect(() => {
    const toggle = () => setMobileOpen(p => !p);
    const open   = () => setMobileOpen(true);
    const close  = () => setMobileOpen(false);
    window.addEventListener('admin-sidebar-toggle', toggle);
    window.addEventListener('admin-sidebar-open',   open);
    window.addEventListener('admin-sidebar-close',  close);
    return () => {
      window.removeEventListener('admin-sidebar-toggle', toggle);
      window.removeEventListener('admin-sidebar-open',   open);
      window.removeEventListener('admin-sidebar-close',  close);
    };
  }, []);

  const navigate = (tab) => { setTab(tab); setMobileOpen(false); };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await clearAuthCookie();
    window.location.href = '/login';
  };

  const isActive = (item) => {
    if (item.matchExact) return currentTab === item.tab || currentTab === '' || currentTab === 'admin';
    return currentTab === item.tab || currentTab.startsWith(item.tab + '/');
  };

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR (md+) ═══
          md  → 64px  icon-only rail
          lg+ → 240px full labels */}
      <aside
        aria-label="Admin navigation"
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-[50] bg-[#0C0F16] border-r border-white/[0.06] shadow-2xl overflow-hidden w-16 lg:w-60"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 lg:px-5 gap-3 border-b border-white/[0.06] flex-shrink-0">
          <span className="text-xl leading-none flex-shrink-0 select-none">🏆</span>
          <div className="hidden lg:block min-w-0">
            <div className="font-heading text-[13px] font-black tracking-widest text-white">GOLAZO HUB</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: '#D9A93B', opacity: 0.72 }}>
              Admin Console
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden" aria-label="Admin menu">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.tab}
              item={item}
              active={isActive(item)}
              hasLive={hasLive}
              onClick={navigate}
              compact={false} // label hidden via `hidden lg:block` on the label span via NavItem
            />
          ))}
        </nav>

        <SidebarFooter
          activeSeason={activeSeason}
          onNavigate={navigate}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          compact={false}
        />
      </aside>

      {/* ═══ MOBILE OVERLAY DRAWER (below md) ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-[80] w-72 bg-[#0C0F16] border-r border-white/[0.06] shadow-2xl flex flex-col"
              aria-label="Admin navigation drawer"
            >
              {/* Close */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3.5 right-3.5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close navigation"
              >
                <X size={14} />
              </button>

              {/* Logo */}
              <div className="flex items-center gap-3 h-16 px-5 border-b border-white/[0.06] flex-shrink-0">
                <span className="text-xl select-none">🏆</span>
                <div>
                  <div className="font-heading text-[13px] font-black tracking-widest text-white">GOLAZO HUB</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: '#D9A93B', opacity: 0.72 }}>
                    Admin Console
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 py-2 overflow-y-auto px-2" aria-label="Admin menu">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => navigate(item.tab)}
                      aria-current={active ? 'page' : undefined}
                      className={`
                        relative w-full flex items-center gap-3 px-4 py-3 my-0.5 rounded-xl
                        text-sm font-semibold text-left outline-none transition-colors duration-150
                        ${active ? 'text-white bg-pitch/10' : 'text-[#565F70] hover:text-white hover:bg-white/[0.05]'}
                      `}
                    >
                      {active && (
                        <div
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                          style={{ background: '#29C179', boxShadow: '0 0 8px rgba(41,193,121,0.5)' }}
                        />
                      )}
                      <Icon
                        size={17}
                        className={`flex-shrink-0 ${active ? 'text-pitch-bright' : ''}`}
                        style={active ? { filter: 'drop-shadow(0 0 4px rgba(41,193,121,0.4))' } : undefined}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.liveIndicator && hasLive && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                      )}
                      {active && <ChevronRight size={13} className="text-pitch-bright/50 flex-shrink-0" />}
                    </button>
                  );
                })}
              </nav>

              <SidebarFooter
                activeSeason={activeSeason}
                onNavigate={navigate}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
                compact={false}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
