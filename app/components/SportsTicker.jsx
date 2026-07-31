import React from 'react';
import { Megaphone, Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from './UI';

export default function SportsTicker({ matches = [], announcements = [], players = [] }) {
  const getPlayer = (id) => players.find(p => p.id === id);

  // Get live/scheduled matches
  const liveMatches = matches.filter(m => m.status === 'in_progress');
  // Get recently completed matches (last 5)
  const recentMatches = matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  // Get recent urgent announcements (last 3)
  const recentAnnouncements = announcements.slice(0, 3);

  const items = [];

  // 1. Add Live Matches
  liveMatches.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    
    items.push(
      <div key={`live-${m.id}`} className="flex items-center gap-3 mr-12 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
          </span>
          LIVE
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <Avatar p={home} size={20} />
          <span>{home.name}</span>
          <span className="text-pitch">{m.homeScore ?? 0}</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-pitch">{m.awayScore ?? 0}</span>
          <span>{away.name}</span>
          <Avatar p={away} size={20} />
        </div>
      </div>
    );
  });

  // 2. Add Recent Matches
  recentMatches.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    
    items.push(
      <div key={`recent-${m.id}`} className="flex items-center gap-3 mr-12 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={12} />
          FT
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <Avatar p={home} size={20} />
          <span>{home.name}</span>
          <span className="text-muted-foreground">{m.homeScore}</span>
          <span className="text-muted-foreground/50">-</span>
          <span className="text-muted-foreground">{m.awayScore}</span>
          <span>{away.name}</span>
          <Avatar p={away} size={20} />
        </div>
      </div>
    );
  });

  // 3. Add Announcements
  recentAnnouncements.forEach(a => {
    items.push(
      <div key={`ann-${a.id}`} className="flex items-center gap-2 mr-12 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
          <Megaphone size={12} />
          UPDATE
        </div>
        <span className="font-semibold text-sm">{a.title}</span>
      </div>
    );
  });

  if (items.length === 0) return null;

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 overflow-hidden flex items-center h-10 select-none z-40 relative">
      {/* Gradient masks for smooth edge fading */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div 
        className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] w-max"
        style={{ "--duration": "60s", "--gap": "3rem" }}
      >
        {/* Render items twice for infinite loop effect */}
        {items}
        {items}
        {items}
        {items}
      </div>
    </div>
  );
}
