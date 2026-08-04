'use client';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  LogOut, Settings, Menu, Search, Bell, Trophy,
  Home, ListOrdered, Calendar, Swords, Users, Archive, Megaphone, Star, Loader2
} from 'lucide-react';
import { Badge, Btn, Avatar } from './UI';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthCookie } from '@/app/actions/auth';

const playerTabs = [
  { href: "/dashboard", label: "Dashboard", icon: Home, matchRoot: true },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/players", label: "Roster", icon: Users },
  { href: "/history", label: "History", icon: Archive },
  { href: "/hall-of-fame", label: "Hall of Fame", icon: Star },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

const adminTabs = [
  { href: "/admin", label: "Dashboard", icon: Home, matchRoot: true },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/season", label: "Tournament", icon: Trophy },
  { href: "/admin/matches", label: "Matches", icon: Calendar },
  { href: "/admin/trophies", label: "Trophies", icon: Trophy },
  { href: "/hall-of-fame", label: "Hall of Fame", icon: Star },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

export default function FloatingNav({ session, me, players = [], notifications = [], matches = [] }) {
  // Admin sessions use the dedicated AdminSidebar + AdminTopBar instead
  if (session?.type === 'admin') return null;

  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const nextPathname = usePathname();
  const [pathname, setPathname] = useState(nextPathname || (typeof window !== 'undefined' ? window.location.pathname : ''));
  useEffect(() => {
    const handlePop = () => setPathname(window.location.pathname);
    const handleTabChange = (e) => setPathname('/' + e.detail.replace(/^\/+/, ''));
    
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    
    window.addEventListener('popstate', handlePop);
    window.addEventListener('tab-change', handleTabChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('tab-change', handleTabChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    const tabPath = href.replace(/^\/+/, '');
    window.history.pushState(null, '', `/${tabPath}`);
    window.dispatchEvent(new CustomEvent('tab-change', { detail: tabPath }));
    setSheetOpen(false);
  };


  const items = session?.type === "admin" ? adminTabs : playerTabs;

  // Scroll-linked blur/opacity
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0.5, 0.85]);
  const blurAmount = useTransform(scrollY, [0, 80], [12, 24]);

  const unreadCount = notifications.filter(n => {
    if (!me?.lastReadNotificationAt) return true;
    return new Date(n.createdAt) > new Date(me.lastReadNotificationAt);
  }).length;

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await clearAuthCookie();
    window.location.href = '/login';
  };

  const hasLiveMatch = matches.some(m => m.status === 'live');

  return (
    <>
      {/* Full-Width Header */}
      <div className="hidden md:block sticky top-0 z-[60] w-full">
        <motion.div
          className="w-full border-b border-white/10 shadow-lg flex items-center justify-between px-6 h-16 relative overflow-hidden"
          style={{
            backgroundColor: `rgba(10, 14, 20, var(--nav-opacity, 0.75))`,
            backdropFilter: `blur(16px)`,
          }}
          animate={{ backdropFilter: `blur(16px)` }}
        >
          {/* Subtle gradient shimmer border */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
          </div>

          {/* Logo */}
          <Link href={session?.type === "admin" ? "/admin" : "/dashboard"} onClick={(e) => handleNav(e, session?.type === "admin" ? "/admin" : "/dashboard")} className="flex items-center gap-2 flex-shrink-0 z-10 min-w-0 outline-none">
            <span className="text-xl leading-none drop-shadow-sm">🏆</span>
            <span className="hidden xl:inline font-heading text-sm font-bold tracking-tight text-white whitespace-nowrap">
              GOLAZO HUB
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-center lg:justify-around flex-1 min-w-0 px-2 lg:px-6">
            {items.map((it) => {
                const Icon = it.icon;
                const active = it.matchRoot ? pathname === it.href : pathname.startsWith(it.href);
                return (
                  <Link href={it.href} onClick={(e) => handleNav(e, it.href)}
                    key={it.href}
                    className="relative px-2 xl:px-3 py-1.5 h-16 flex items-center gap-1 lg:gap-1.5 text-xs lg:text-[13px] xl:text-sm font-semibold transition-colors whitespace-nowrap outline-none flex-shrink-0 focus-visible:ring-2 focus-visible:ring-pitch-bright"
                  >
                    <span
                      className="relative z-10 flex items-center gap-1.5 transition-colors"
                      style={{ color: active ? 'var(--pitch-bright, #29C179)' : 'hsl(var(--muted-foreground))' }}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span className={`${active ? 'font-bold' : ''}`}>{it.label}</span>
                    {(it.href === '/matches' || it.href === '/admin/matches') && hasLiveMatch && (
                      <span className="flex h-2 w-2 relative ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-pitch-bright shadow-[0_0_10px_rgba(41,193,121,0.6)]"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 z-10 flex-shrink-0 ml-4">


            {/* Admin: ADMIN badge + logout */}
            {session?.type === 'admin' ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-gold/40 text-gold bg-gold/10">
                  ADMIN
                </span>
                <Link href="/admin/settings" onClick={(e) => handleNav(e, "/admin/settings")}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors outline-none"
                  title="Admin Settings"
                >
                  <Settings size={15} />
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors border border-border/50 outline-none"
                  title="Log out"
                >
                  {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                </button>
              </div>
            ) : me ? (
              <>
                {/* Notification Bell */}
                <Link href="/notifications" onClick={(e) => handleNav(e, "/notifications")}
                  className="relative flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright"
                  title="Alerts"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-claret text-white text-[9px] font-bold border-2 border-background">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-pitch-bright border border-white/5 group">
                      <span className="relative flex-shrink-0">
                        <Avatar p={me} size={24} ring="rgba(41, 193, 121, 0.5)" />
                        {/* Online dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                      </span>
                      <span className="hidden sm:inline font-semibold text-xs text-white max-w-[80px] truncate">
                        {me.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-2xl rounded-xl mt-2 z-[70]">
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold leading-none text-foreground">{me.name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">@{me.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuGroup className="p-1">
                      <DropdownMenuItem asChild>
                        <Link href="/settings" onClick={(e) => handleNav(e, "/settings")} className="cursor-pointer rounded-lg hover:bg-secondary focus:bg-secondary py-2 w-full flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <div className="p-1">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive py-2">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}

            </div>
        </motion.div>
      </div>

      {/* Mobile Nav Bar (Top Header) */}
      <div className="md:hidden sticky top-0 z-[60] w-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <motion.div 
          className="w-full border-b border-white/10 shadow-md flex items-center justify-between px-4 h-14 relative overflow-hidden"
          style={{
            backgroundColor: `rgba(10, 14, 20, var(--nav-opacity, 0.85))`,
            backdropFilter: `blur(16px)`,
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
          </div>

          <Link href={session?.type === "admin" ? "/admin" : "/dashboard"} onClick={(e) => handleNav(e, session?.type === "admin" ? "/admin" : "/dashboard")} className="flex items-center gap-2 z-10 outline-none">
            <span className="text-xl leading-none drop-shadow-sm">🏆</span>
            <span className="font-heading text-sm font-bold tracking-tight text-white">GOLAZO HUB</span>
          </Link>
          
          <div className="flex items-center gap-4 z-10">
            {me && (
              <Link href="/settings" onClick={(e) => handleNav(e, "/settings")} className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                <Avatar p={me} size={32} />
              </Link>
            )}
            
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white transition-colors outline-none"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin text-white" /> : <LogOut size={18} />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Navigation Bar (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pb-[env(safe-area-inset-bottom)]">
        <div 
          className="w-full flex items-center justify-around h-16 border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] px-1"
          style={{
            backgroundColor: `rgba(10, 14, 20, 0.95)`,
            backdropFilter: `blur(16px)`,
          }}
        >
          {items.slice(0, 4).map((it) => {
            const Icon = it.icon;
            const active = it.matchRoot ? pathname === it.href : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={(e) => handleNav(e, it.href)}
                className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  active ? 'text-pitch-bright' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Icon size={20} className={active ? 'drop-shadow-[0_0_8px_rgba(41,193,121,0.5)]' : ''} />
                <span className="text-[10px] font-semibold">{it.label}</span>
                
                {(it.href === '/matches' || it.href === '/admin/matches') && hasLiveMatch && (
                  <span className="absolute top-2 right-1/4 w-2 h-2 bg-red-500 rounded-full border border-background animate-pulse" />
                )}
                
                {it.href === '/notifications' && unreadCount > 0 && (
                  <span className="absolute top-2 right-1/4 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-claret text-white text-[8px] font-bold border border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          
          <Link
            href={session?.type === "admin" ? "/admin/settings" : "/settings"}
            onClick={(e) => handleNav(e, session?.type === "admin" ? "/admin/settings" : "/settings")}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              pathname === (session?.type === "admin" ? "/admin/settings" : "/settings")
                ? 'text-pitch-bright'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Settings size={20} className={pathname === (session?.type === "admin" ? "/admin/settings" : "/settings") ? 'drop-shadow-[0_0_8px_rgba(41,193,121,0.5)]' : ''} />
            <span className="text-[10px] font-semibold">Settings</span>
          </Link>
        </div>
      </div>


      {/* Command Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 gap-0 w-screen h-screen sm:h-auto max-w-full sm:max-w-lg sm:rounded-xl bg-card border-border/50 sm:shadow-2xl overflow-hidden m-0 sm:border-solid z-[99999]">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <Command className="bg-transparent">
            <CommandInput placeholder="Search players, tabs..." className="h-12 text-sm border-b border-border/50 rounded-none" />
            <CommandList className="max-h-80 p-2">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </CommandEmpty>
              <CommandGroup heading="Navigation">
                {items.map(it => {
                  const Icon = it.icon;
                  return (
                    <CommandItem
                      key={it.href}
                      value={it.label}
                      onSelect={() => { router.push(it.href); setSearchOpen(false); }}
                      className="flex items-center gap-2 rounded-lg cursor-pointer py-2"
                    >
                      <Icon size={15} className="text-muted-foreground" />
                      <span>{it.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {players.length > 0 && (
                <CommandGroup heading="Players">
                  {players.map(p => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => { router.push('/player/' + (p.username || p.id)); setSearchOpen(false); }}
                      className="flex items-center gap-2 rounded-lg cursor-pointer py-2"
                    >
                      <Avatar p={p} size={24} />
                      <span className="font-semibold">{p.name}</span>
                      {p.teamName && <span className="text-xs text-muted-foreground ml-1">{p.teamName}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
