'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, Trophy, Calendar, Star, Megaphone, Radio,
  Settings, LogOut, X, ChevronRight, ChevronLeft, Loader2, ShieldAlert, History, TrendingUp
} from 'lucide-react';
import { clearAuthCookie } from '@/app/actions/auth';

const NAV_ITEMS = [
  { tab: 'admin',               label: 'Dashboard',       icon: Home,      matchExact: true },
  { tab: 'admin/players',       label: 'Players',        icon: Users },
  { tab: 'admin/rankings',      label: 'Rankings',       icon: TrendingUp },
  { tab: 'admin/season',        label: 'Tournament',     icon: Trophy },
  { tab: 'admin/history',       label: 'History',        icon: History },
  { tab: 'admin/matches',       label: 'Matches',        icon: Calendar,  liveIndicator: true },
  { tab: 'admin/trophies',      label: 'Trophies',       icon: Star },
  { tab: 'admin/announcements', label: 'Announcements',  icon: Megaphone },
  { tab: 'admin/broadcast',     label: 'Broadcast',      icon: Radio },
  { tab: 'admin/roles',         label: 'Role Manage',    icon: ShieldAlert },
  { tab: 'hall-of-fame',        label: 'Hall of Fame',   icon: Star },
];


function NavItem({ item, active, hasLive, onClick, isMobile = false, isExpanded = true }) {
  const Icon = item.icon;
  const showText = isMobile || isExpanded;
  
  return (
    <button
      onClick={() => onClick(item.tab)}
      title={!showText ? item.label : undefined}
      className={`
        relative w-full flex items-center outline-none group transition-all duration-300
        ${isMobile ? 'justify-start gap-4 px-5 py-3.5 my-1' : (isExpanded ? 'justify-start gap-3.5 px-5 py-3 my-1' : 'justify-center px-0 py-3 my-1')}
      `}
    >
      {/* Hover Background */}
      <div className={`absolute inset-y-0 rounded-xl bg-black/5 dark:bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isMobile ? 'inset-x-3' : (isExpanded ? 'inset-x-3' : 'inset-x-2')}`} />
      
      {/* Active state backgrounds */}
      {active && (
        <motion.div
          layoutId={isMobile ? "mobile-sidebar-active-bg" : "desktop-sidebar-active-bg"}
          className={`absolute inset-y-0 rounded-xl bg-gradient-to-r from-pitch-bright/15 to-transparent border border-pitch-bright/20 ${isMobile ? 'inset-x-3' : (isExpanded ? 'inset-x-3' : 'inset-x-2')}`}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      
      {/* Active Glow Bar */}
      {active && (
        <motion.div
          layoutId={isMobile ? "mobile-sidebar-active-border" : "desktop-sidebar-active-border"}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-pitch-bright rounded-r-full shadow-[0_0_12px_rgba(41,193,121,0.8)]"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}

      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 transition-all duration-300 ${active ? 'text-pitch-bright scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-110'}`}>
        <Icon
          size={18}
          style={active ? { filter: 'drop-shadow(0 0 8px rgba(41,193,121,0.4))' } : undefined}
        />
      </div>

      {/* Label */}
      <span className={`relative z-10 flex-1 truncate transition-all duration-300 text-left text-[13px] ${showText ? 'block opacity-100' : 'hidden opacity-0'} ${active ? 'text-foreground font-bold tracking-wide' : 'text-muted-foreground group-hover:text-foreground font-semibold'}`}>
        {item.label}
      </span>

      {/* Live indicator dot */}
      {item.liveIndicator && hasLive && (
        <span className={`relative z-10 flex-shrink-0 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] ${!showText ? 'absolute top-2 right-2' : ''}`}>
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
        </span>
      )}

      {/* Chevron */}
      {active && (
        <ChevronRight size={14} className={`relative z-10 flex-shrink-0 text-pitch-bright/50 ${showText ? 'block' : 'hidden'}`} />
      )}
    </button>
  );
}

function SidebarFooter({ activeSeason, onNavigate, onLogout, isLoggingOut, isMobile = false, isExpanded = true }) {
  const showText = isMobile || isExpanded;
  
  return (
    <div className={`border-t border-border dark:border-white/[0.04] flex-shrink-0 relative overflow-hidden transition-all duration-300 ${showText ? 'p-4' : 'p-2'}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 dark:from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Season chip */}
      {activeSeason && (
        <div className={`items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-border/50 mb-3 transition-colors hover:bg-black/10 dark:bg-white/[0.05] ${showText ? 'flex' : 'hidden'}`}>
          <div className="w-1.5 h-1.5 bg-pitch-bright rounded-full animate-pulse shadow-[0_0_8px_rgba(41,193,121,0.6)]" />
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Active Season</span>
            <span className="text-xs font-bold text-foreground/90 truncate">{activeSeason.name}</span>
          </div>
        </div>
      )}

      {/* Settings */}
      <button
        onClick={() => onNavigate('admin/settings')}
        title={!showText ? 'Settings' : undefined}
        className={`
          relative w-full flex items-center py-2.5 text-[13px] font-semibold rounded-lg
          text-muted-foreground hover:text-foreground hover:bg-black/5 dark:bg-white/[0.04] transition-colors outline-none
          ${showText ? 'justify-start gap-3 px-4' : 'justify-center px-0'}
        `}
      >
        <Settings size={18} className="flex-shrink-0" />
        <span className={showText ? 'block' : 'hidden'}>Settings</span>
      </button>

      {/* Logout */}
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        title={!showText ? 'Log out' : undefined}
        className={`
          relative w-full flex items-center py-2.5 mt-1 text-[13px] font-semibold rounded-lg
          text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors outline-none disabled:opacity-50
          ${showText ? 'justify-start gap-3 px-4' : 'justify-center px-0'}
        `}
      >
        {isLoggingOut
          ? <Loader2 size={18} className="animate-spin flex-shrink-0" />
          : <LogOut size={18} className="flex-shrink-0" />}
        <span className={showText ? 'block' : 'hidden'}>{isLoggingOut ? 'Logging out…' : 'Log out'}</span>
      </button>
    </div>
  );
}

export default function AdminSidebar({ currentTab, setTab, activeSeason, matches = [], isExpanded = true, onToggleExpand, session, managerPermissions }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasLive = matches.some(m => m.status === 'live');

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

  const navItems = NAV_ITEMS.filter(item => {
    if (session?.role === 'admin') return true;
    if (item.tab === 'admin/roles') return false;
    if (item.tab === 'admin/players') return !!managerPermissions?.canManagePlayers || !!managerPermissions?.canManageProfiles;
    if (item.tab === 'admin/season') return !!managerPermissions?.canManageSeason;
    if (item.tab === 'admin/matches') return !!managerPermissions?.canManageMatches;
    if (item.tab === 'admin/trophies') return !!managerPermissions?.canManageSeason;
    if (item.tab === 'admin/announcements') return !!managerPermissions?.canEditBroadcast;
    if (item.tab === 'admin/broadcast') return !!managerPermissions?.canEditBroadcast;
    return true;
  });

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside
        aria-label="Admin navigation"
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-[50] bg-background dark:bg-[#0A0D14] border-r border-border dark:border-white/[0.04] shadow-2xl transition-all duration-300 ${isExpanded ? 'w-[260px]' : 'w-16'}`}
      >
        {/* Toggle Expand/Collapse Button */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="absolute -right-3.5 top-[18px] z-50 w-7 h-7 flex items-center justify-center bg-[#151921] border border-border text-muted-foreground hover:text-foreground rounded-full shadow-lg transition-transform hover:scale-105"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        {/* Decorative background glow — kept in an inner overflow-hidden container so it doesn't leak out of the aside (which is now overflow-visible because of the toggle button) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-r-2xl">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-pitch-bright/5 to-transparent" />
        </div>

        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-border dark:border-white/[0.04] flex-shrink-0 relative z-10 transition-all duration-300 ${isExpanded ? 'justify-start px-5 gap-3' : 'justify-center px-0'}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 shadow-[0_0_15px_rgba(217,169,59,0.15)] flex-shrink-0 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
             <Trophy size={16} className="text-[#D9A93B]" />
          </div>
          <div className={`min-w-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
            <div className="font-heading text-sm font-black tracking-widest text-foreground/95 truncate">GOLAZO HUB</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldAlert size={10} className="text-[#D9A93B]" />
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] truncate" style={{ color: '#D9A93B', opacity: 0.8 }}>
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden relative z-10" aria-label="Admin menu">
          {navItems.map((item) => (
            <NavItem
              key={item.tab}
              item={item}
              active={isActive(item)}
              hasLive={hasLive}
              onClick={navigate}
              isMobile={false}
              isExpanded={isExpanded}
            />
          ))}
        </nav>

        <SidebarFooter
          activeSeason={activeSeason}
          onNavigate={navigate}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          isMobile={false}
          isExpanded={isExpanded}
        />
      </aside>

      {/* ═══ MOBILE OVERLAY DRAWER ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-[70] bg-background/80 dark:bg-[#0A0D14]/80 backdrop-blur-md"
              aria-hidden="true"
            />

            <motion.aside
              key="drawer"
              initial={{ x: '-100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0.5 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-[80] w-[280px] bg-background dark:bg-[#0A0D14] border-r border-border dark:border-white/[0.04] shadow-2xl flex flex-col"
              aria-label="Admin navigation drawer"
            >
              <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-pitch-bright/5 to-transparent pointer-events-none" />

              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-border text-foreground hover:bg-white/10 transition-colors"
                aria-label="Close navigation"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3 h-14 px-5 border-b border-border dark:border-white/[0.04] flex-shrink-0 relative z-10">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 shadow-[0_0_15px_rgba(217,169,59,0.15)] flex-shrink-0 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                   <Trophy size={16} className="text-[#D9A93B]" />
                </div>
                <div>
                  <div className="font-heading text-sm font-black tracking-widest text-foreground/95">GOLAZO HUB</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShieldAlert size={10} className="text-[#D9A93B]" />
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#D9A93B', opacity: 0.8 }}>
                      Admin Console
                    </div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 py-4 overflow-y-auto px-2 relative z-10" aria-label="Admin menu">
                {navItems.map((item) => (
                  <NavItem
                    key={item.tab}
                    item={item}
                    active={isActive(item)}
                    hasLive={hasLive}
                    onClick={navigate}
                    isMobile={true}
                    isExpanded={true}
                  />
                ))}
              </nav>

              <SidebarFooter
                activeSeason={activeSeason}
                onNavigate={navigate}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
                isMobile={true}
                isExpanded={true}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
