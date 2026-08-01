'use client';

import React, { useState } from 'react';
import { Megaphone, CheckCircle2, Zap } from 'lucide-react';
import { Avatar } from './UI';
import MatchStatsModal from './MatchStatsModal';

const SPEED_DURATIONS = { slow: '90s', normal: '55s', fast: '30s' };

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
    </span>
  );
}

function ScoreBadge({ home, away, isLive }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black font-score tabular-nums"
      style={isLive ? {
        background: 'rgba(239,68,68,0.15)',
        color: '#f87171',
        boxShadow: '0 0 8px rgba(239,68,68,0.35)',
        border: '1px solid rgba(239,68,68,0.25)',
      } : {
        background: 'rgba(41,193,121,0.12)',
        color: '#29C179',
        boxShadow: '0 0 6px rgba(41,193,121,0.25)',
        border: '1px solid rgba(41,193,121,0.2)',
      }}
    >
      {home ?? 0} <span className="opacity-50 font-normal">-</span> {away ?? 0}
    </span>
  );
}

function Divider() {
  return <span className="text-zinc-700 text-sm mx-3 shrink-0">·</span>;
}

export default function SportsTicker({ matches = [], announcements = [], players = [], tickerConfig }) {
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const cfg = tickerConfig ?? {
    enabled: true, source: 'live_recent', scrollSpeed: 'normal',
    showAvatars: true, pauseOnHover: true,
  };

  if (!cfg.enabled) return null;

  const getPlayer = id => players.find(p => p.id === id);
  const duration = SPEED_DURATIONS[cfg.scrollSpeed] || '55s';

  // Filter matches by source
  const liveMatches = matches.filter(m => m.status === 'live');
  const isToday = m => {
    const d = new Date(m.completedAt || m.scheduledAt || '');
    const now = new Date();
    return d.toDateString() === now.toDateString();
  };

  let recentCompleted = [];
  if (cfg.source === 'live_recent') {
    recentCompleted = matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);
  } else if (cfg.source === 'live_today') {
    recentCompleted = matches.filter(m => m.status === 'completed' && isToday(m));
  } else if (cfg.source === 'custom' && cfg.customMatchIds?.length) {
    recentCompleted = matches.filter(m => cfg.customMatchIds.includes(m.id));
  } else if (cfg.source === 'live') {
    recentCompleted = [];
  } else {
    // fallback: live_recent
    recentCompleted = matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);
  }

  const recentAnnouncements = announcements.slice(0, 3);

  // Build item array
  const items = [];

  liveMatches.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    items.push(
      <button
        key={`live-${m.id}`}
        onClick={() => setSelectedMatch(m)}
        className="flex items-center gap-2 mr-10 shrink-0 group cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider">
          <LiveDot />
          LIVE
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {cfg.showAvatars && <Avatar p={home} size={18} />}
          <span className="text-foreground/90">{home.name}</span>
          <ScoreBadge home={m.homeScore} away={m.awayScore} isLive />
          <span className="text-foreground/90">{away.name}</span>
          {cfg.showAvatars && <Avatar p={away} size={18} />}
        </div>
      </button>
    );
  });

  recentCompleted.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    items.push(
      <button
        key={`ft-${m.id}`}
        onClick={() => setSelectedMatch(m)}
        className="flex items-center gap-2 mr-10 shrink-0 opacity-75 hover:opacity-100 transition-opacity cursor-pointer group"
      >
        <div className="flex items-center gap-1 text-zinc-500 text-[9px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={11} />
          FT
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80">
          {cfg.showAvatars && <Avatar p={home} size={18} />}
          <span>{home.name}</span>
          <ScoreBadge home={m.homeScore} away={m.awayScore} isLive={false} />
          <span>{away.name}</span>
          {cfg.showAvatars && <Avatar p={away} size={18} />}
        </div>
      </button>
    );
  });

  recentAnnouncements.forEach(a => {
    items.push(
      <div key={`ann-${a.id}`} className="flex items-center gap-2 mr-10 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider">
          <Megaphone size={10} />
          UPDATE
        </div>
        <span className="text-sm font-semibold text-foreground/80">{a.title}</span>
      </div>
    );
  });

  if (items.length === 0) return null;

  const pauseClass = cfg.pauseOnHover ? 'hover:[animation-play-state:paused]' : '';

  return (
    <>
      <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 overflow-hidden flex items-center h-10 select-none z-40 relative">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
          className={`flex whitespace-nowrap w-max ${pauseClass}`}
          style={{
            animation: `marquee ${duration} linear infinite`,
            '--gap': '2rem',
          }}
        >
          {/* Duplicate 3x for seamless infinite loop */}
          {items}{items}{items}
        </div>
      </div>

      {/* Match stats modal triggered by click */}
      {selectedMatchId && (
        <MatchStatsModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </>
  );
}
