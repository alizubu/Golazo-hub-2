'use client';

import React, { useState } from 'react';
import { Megaphone, CheckCircle2 } from 'lucide-react';
import { Avatar } from './UI';
import MatchStatsModal from './MatchStatsModal';

const SPEED_DURATIONS = { slow: '90s', normal: '55s', fast: '30s' };

function LiveDot({ theme }) {
  if (theme === 'cyber') return null; // No dot for cyber, just block color
  
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme === 'neon' ? 'bg-white' : 'bg-red-500'}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${theme === 'neon' ? 'bg-white' : 'bg-red-500'}`} />
    </span>
  );
}

function ScoreBadge({ home, away, isLive, theme }) {
  let style = {};
  let className = "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-black font-score tabular-nums shrink-0";
  
  if (theme === 'classic') {
    className += " rounded-full";
    if (isLive) {
      style = { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' };
    } else {
      style = { background: 'rgba(41,193,121,0.12)', color: '#29C179', border: '1px solid rgba(41,193,121,0.2)' };
    }
  } else if (theme === 'neon') {
    className += " rounded-full";
    if (isLive) {
      style = { background: 'transparent', color: '#f87171', border: '1px solid #ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.5)' };
    } else {
      style = { background: 'transparent', color: '#60a5fa', border: '1px solid #60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.5)' };
    }
  } else if (theme === 'cyber') {
    className += " font-mono tracking-widest text-[12px] bg-zinc-900 border border-zinc-700/50";
    if (isLive) {
      style = { color: '#fbbf24' }; // yellow-400
    } else {
      style = { color: '#d4d4d8' }; // zinc-300
    }
  }

  return (
    <span className={className} style={style}>
      {home ?? 0} <span className="opacity-50 font-normal">-</span> {away ?? 0}
    </span>
  );
}

export default function SportsTicker({ matches = [], announcements = [], players = [], tickerConfig, previewMode = false }) {
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const cfg = tickerConfig ?? {
    enabled: true, source: 'live_recent', scrollSpeed: 'normal',
    showAvatars: true, pauseOnHover: true, theme: 'classic'
  };

  const theme = cfg.theme || 'classic';

  if (!cfg.enabled && !previewMode) return null;

  const getPlayer = id => players.find(p => p.id === id);
  const duration = SPEED_DURATIONS[cfg.scrollSpeed] || '55s';

  const liveMatches = matches.filter(m => m.status === 'live');
  const isToday = m => {
    const d = new Date(m.completedAt || m.scheduledAt || '');
    return d.toDateString() === new Date().toDateString();
  };

  let recentCompleted = [];
  if (cfg.source === 'live_recent') {
    recentCompleted = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 5);
  } else if (cfg.source === 'live_today') {
    recentCompleted = matches.filter(m => m.status === 'completed' && isToday(m));
  } else if (cfg.source === 'custom' && cfg.customMatchIds?.length) {
    recentCompleted = matches.filter(m => cfg.customMatchIds.includes(m.id));
  }

  const recentAnnouncements = announcements.slice(0, 3);
  const items = [];

  liveMatches.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    items.push(
      <button
        key={`live-${m.id}`}
        onClick={() => !previewMode && setSelectedMatchId(m.id)}
        className={`flex items-center gap-2 shrink-0 transition-opacity ${previewMode ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:opacity-90'} ${theme === 'cyber' ? 'mr-12' : 'mr-10'}`}
      >
        {theme === 'classic' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider">
            <LiveDot theme={theme} /> LIVE
          </div>
        )}
        {theme === 'neon' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)] text-white text-[9px] font-bold uppercase tracking-wider">
            <LiveDot theme={theme} /> LIVE
          </div>
        )}
        {theme === 'cyber' && (
          <div className="flex items-center px-1.5 py-0.5 bg-yellow-400 text-black text-[10px] font-mono font-black uppercase tracking-widest border-r-2 border-b-2 border-yellow-600">
            [LIVE]
          </div>
        )}

        <div className={`flex items-center gap-1.5 text-sm font-semibold ${theme === 'neon' ? 'text-white' : theme === 'cyber' ? 'text-zinc-300 font-mono' : 'text-foreground'}`}>
          {cfg.showAvatars && theme !== 'cyber' && <Avatar p={home} size={18} />}
          <span>{home.name}</span>
          <ScoreBadge home={m.homeScore} away={m.awayScore} isLive={true} theme={theme} />
          <span>{away.name}</span>
          {cfg.showAvatars && theme !== 'cyber' && <Avatar p={away} size={18} />}
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
        onClick={() => !previewMode && setSelectedMatchId(m.id)}
        className={`flex items-center gap-2 shrink-0 transition-opacity ${previewMode ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:opacity-90'} ${theme === 'classic' ? 'opacity-75' : ''} ${theme === 'cyber' ? 'mr-12' : 'mr-10'}`}
      >
        {theme === 'classic' && (
          <div className="flex items-center gap-1 text-zinc-500 text-[9px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={11} /> FT
          </div>
        )}
        {theme === 'neon' && (
          <div className="flex items-center gap-1 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)] text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={11} /> FT
          </div>
        )}
        {theme === 'cyber' && (
          <div className="flex items-center px-1 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-mono font-black uppercase tracking-widest border border-zinc-700/50">
            [FT]
          </div>
        )}

        <div className={`flex items-center gap-1.5 text-sm font-semibold ${theme === 'neon' ? 'text-zinc-300' : theme === 'cyber' ? 'text-zinc-400 font-mono' : 'text-foreground/80'}`}>
          {cfg.showAvatars && theme !== 'cyber' && <Avatar p={home} size={18} />}
          <span>{home.name}</span>
          <ScoreBadge home={m.homeScore} away={m.awayScore} isLive={false} theme={theme} />
          <span>{away.name}</span>
          {cfg.showAvatars && theme !== 'cyber' && <Avatar p={away} size={18} />}
        </div>
      </button>
    );
  });

  recentAnnouncements.forEach(a => {
    items.push(
      <div key={`ann-${a.id}`} className={`flex items-center gap-2 shrink-0 ${theme === 'cyber' ? 'mr-12' : 'mr-10'}`}>
        {theme === 'classic' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider">
            <Megaphone size={10} /> UPDATE
          </div>
        )}
        {theme === 'neon' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.8)] text-white text-[9px] font-bold uppercase tracking-wider">
            <Megaphone size={10} /> UPDATE
          </div>
        )}
        {theme === 'cyber' && (
          <div className="flex items-center px-1.5 py-0.5 bg-cyan-500 text-black text-[10px] font-mono font-black uppercase tracking-widest border-r-2 border-b-2 border-cyan-700">
            [SYS]
          </div>
        )}
        <span className={`text-sm font-semibold ${theme === 'neon' ? 'text-white' : theme === 'cyber' ? 'text-cyan-400 font-mono tracking-wide' : 'text-foreground/80'}`}>{a.title}</span>
      </div>
    );
  });

  if (items.length === 0 && !previewMode) return null;
  if (items.length === 0 && previewMode) {
    items.push(<div key="empty" className="text-sm font-mono text-muted-foreground ml-4">Ticker preview is empty...</div>);
  }

  const pauseClass = (cfg.pauseOnHover && !previewMode) ? 'hover:[animation-play-state:paused]' : '';

  let containerClass = "w-full overflow-hidden flex items-center h-10 select-none z-40 relative ";
  let gradientFrom = "from-background";
  
  if (theme === 'classic') {
    containerClass += "bg-black/40 backdrop-blur-md border-b border-white/5";
  } else if (theme === 'neon') {
    containerClass += "bg-black border-b border-green-500/20";
    gradientFrom = "from-black";
  } else if (theme === 'cyber') {
    containerClass += "bg-zinc-950 border-b-2 border-yellow-500/50";
    gradientFrom = "from-zinc-950";
  }

  if (previewMode) {
    containerClass += " rounded-lg border-x border-t";
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--gap))); }
        }
        .animate-custom-marquee {
          animation: custom-marquee var(--duration, 55s) linear infinite;
        }
      `}} />
      <div className={containerClass}>
        <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r ${gradientFrom} to-transparent z-10 pointer-events-none`} />
        <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l ${gradientFrom} to-transparent z-10 pointer-events-none`} />
        
        {/* Pause Overlay for Preview */}
        {previewMode && cfg.pauseOnHover && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity pointer-events-auto cursor-help backdrop-blur-[1px]">
            <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-4 border-l-2 border-r-2 border-white block" /> Pause on Hover Active
            </span>
          </div>
        )}

        <div
          className={`flex whitespace-nowrap w-max animate-custom-marquee ${pauseClass}`}
          style={{ '--duration': duration, '--gap': '2rem' }}
        >
          {items}{items}{items}
        </div>
      </div>

      {selectedMatchId && !previewMode && (
        <MatchStatsModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </>
  );
}
