'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthCookie } from '@/app/actions/auth';
import { useActiveRoute } from './nav/useActiveRoute';
import { TopBar } from './nav/TopBar';
import { BottomNav } from './nav/BottomNav';

import {
  Home, Calendar, Users, History as HistoryIcon, Star, Bell,
  Trophy, Megaphone
} from 'lucide-react';
import { Avatar } from './UI';
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

const playerTabs = [
  { href: "/dashboard", label: "Dashboard", icon: Home, matchRoot: true },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/players", label: "Roster", icon: Users },
  { href: "/history", label: "History", icon: HistoryIcon },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  
  const { pathname, isActive, handleNav } = useActiveRoute();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const items = session?.type === "admin" ? adminTabs : playerTabs;

  const unreadCount = notifications.filter(n => {
    if (!me?.lastReadNotificationAt) return true;
    return new Date(n.createdAt) > new Date(me.lastReadNotificationAt);
  }).length;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await clearAuthCookie();
    window.location.href = '/login';
  };

  const hasLiveMatch = matches.some(m => m.status === 'live');

  // Admin sessions use the dedicated AdminSidebar + AdminTopBar instead
  if (session?.type === 'admin') return null;

  return (
    <>
      <TopBar 
        session={session}
        me={me}
        items={items}
        pathname={pathname}
        handleNav={handleNav}
        hasLiveMatch={hasLiveMatch}
        unreadCount={unreadCount}
        isLoggingOut={isLoggingOut}
        handleLogout={handleLogout}
      />
      
      <BottomNav 
        items={items}
        pathname={pathname}
        isActive={isActive}
        handleNav={handleNav}
        hasLiveMatch={hasLiveMatch}
      />

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
