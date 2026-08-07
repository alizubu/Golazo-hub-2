'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { Avatar } from './UI';
import MatchStatsModal from './MatchStatsModal';
import {
  getThemeStyles,
  speedToDuration,
  StatusTag,
  SeparatorItem,
  BreakingBadge,
  StatsBadge,
  StreakBadge,
  HighlightBadge,
  ShinyBadge,
  BADGE_STYLES
} from './SportsTickerBadges';

// ── Match Chip Component ───────────────────────────────────────────────────
function MatchChip({ match, home, away, theme, isLive, onClick, showAvatars, previewMode, momentumTeam, showtimeGoals }) {
  const isHomeMomentum = isLive && momentumTeam === 'home';
  const isAwayMomentum = isLive && momentumTeam === 'away';

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-4 py-2 mx-1.5 shrink-0 transition-all overflow-hidden ${previewMode ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:opacity-90'}`}
      style={{ ...theme.chip, borderRadius: theme.radius, fontFamily: theme.font }}
    >
      {/* Momentum Backgrounds */}
      {isHomeMomentum && <div className="absolute inset-y-0 left-0 w-1/2 aurora-bg opacity-50 z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to right, black, transparent)' }} />}
      {isAwayMomentum && <div className="absolute inset-y-0 right-0 w-1/2 aurora-bg opacity-50 z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} />}

      {/* Showtime Goals Light Sweep */}
      {showtimeGoals && isLive && <div className="absolute inset-0 pointer-events-none shiny z-10" />}

      <div className="relative z-10 flex items-center gap-2.5">
        {showAvatars && <Avatar p={home} size={22} />}
        <span className="text-[12px] font-bold tracking-wide" style={{ color: theme.team }}>{home.name}</span>
        
        <div className="flex flex-col items-center">
          {showtimeGoals && isLive && <span className="text-[8px] font-black text-amber-400 bg-amber-950/80 px-1 rounded uppercase tracking-widest leading-none mb-0.5 shadow-[0_0_5px_rgba(245,158,11,0.5)]">Highlight Reel</span>}
          <span
            className="text-[15px] font-extrabold tabular-nums px-1"
            style={{ color: showtimeGoals && isLive ? '#fcd34d' : theme.score, fontFamily: theme.mono ? "'JetBrains Mono', monospace" : theme.font, textShadow: showtimeGoals && isLive ? '0 0 10px rgba(245,158,11,0.5)' : 'none' }}
          >
            {match.homeScore ?? 0}–{match.awayScore ?? 0}
          </span>
        </div>

        <span className="text-[12px] font-bold tracking-wide" style={{ color: theme.team }}>{away.name}</span>
        {showAvatars && <Avatar p={away} size={22} />}
      </div>
      <div className="relative z-10 ml-1">
        <StatusTag status={isLive ? "LIVE" : "FT"} time={isLive ? (match.liveState?.clock ? `${Math.floor(match.liveState.clock / 60)}'` : "LIVE") : "FT"} theme={theme} />
      </div>
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function SportsTicker({ matches = [], announcements = [], players = [], tickerConfig, previewMode = false, standings = [] }) {
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const cfg = tickerConfig ?? {
    enabled: true, source: 'live_recent', speed: 50,
    showAvatars: true, pauseOnHover: true, theme: 'glass-frost',
    size: 'normal', separator: 'dot', breakingNews: '',
    showStats: false, showHighlights: false, showStreaks: false,
  };

  const theme = getThemeStyles(cfg.theme);

  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
  const getPlayer = useCallback(id => playerMap.get(id), [playerMap]);

  const [stingerActive, setStingerActive] = useState(false);
  
  useEffect(() => {
    if (cfg.replayTrigger) {
      // Delay state update to the next tick to avoid cascading render warnings
      const t1 = setTimeout(() => setStingerActive(true), 0);
      const t2 = setTimeout(() => setStingerActive(false), 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [cfg.replayTrigger]);

  // ── Enhanced Smart Content: Stats ─────────────────────────────────────────
  const statsItems = useMemo(() => {
    if (!cfg.showStats) return [];
    const completed = matches.filter(m => m.status === 'completed');
    if (completed.length === 0) return [];

    const playerStats = {};
    players.forEach(p => { playerStats[p.id] = { name: p.name, goals: 0, wins: 0, played: 0, pts: 0, cleanSheets: 0 }; });
    completed.forEach(m => {
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      if (playerStats[m.homeId]) {
        playerStats[m.homeId].goals += hs;
        playerStats[m.homeId].played++;
        if (as === 0) playerStats[m.homeId].cleanSheets++;
        playerStats[m.homeId].pts += hs > as ? 3 : hs === as ? 1 : 0;
      }
      if (playerStats[m.awayId]) {
        playerStats[m.awayId].goals += as;
        playerStats[m.awayId].played++;
        if (hs === 0) playerStats[m.awayId].cleanSheets++;
        playerStats[m.awayId].pts += as > hs ? 3 : hs === as ? 1 : 0;
      }
    });

    const sorted = Object.values(playerStats).filter(s => s.played > 0);
    const result = [];
    const topScorer = [...sorted].sort((a, b) => b.goals - a.goals)[0];
    const topCleanSheet = [...sorted].sort((a, b) => b.cleanSheets - a.cleanSheets)[0];
    
    if (topScorer && topScorer.goals > 0) result.push(`GOLDEN BOOT RACE: ${topScorer.name} leads with ${topScorer.goals} Goals!`);
    if (topCleanSheet && topCleanSheet.cleanSheets > 0) result.push(`BRICK WALL: ${topCleanSheet.name} has ${topCleanSheet.cleanSheets} Clean Sheets.`);
    result.push(`LEAGUE UPDATE: ${completed.length} Matches Officially Completed.`);
    
    return result;
  }, [cfg.showStats, matches, players]);

  // ── Enhanced Smart Content: Highlights ────────────────────────────────────
  const highlightItems = useMemo(() => {
    if (!cfg.showHighlights) return [];
    const completed = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    if (completed.length === 0) return [];
    const result = [];
    
    const recent = completed.slice(0, 10);
    let biggestMargin = 0;
    let biggestMatch = null;
    let totalGoals = 0;
    
    recent.forEach(m => {
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      totalGoals += (hs + as);
      const diff = Math.abs(hs - as);
      if (diff > biggestMargin) { biggestMargin = diff; biggestMatch = m; }
    });

    if (biggestMatch && biggestMargin > 0) {
      const h = getPlayer(biggestMatch.homeId);
      const a = getPlayer(biggestMatch.awayId);
      if (h && a) result.push(`ABSOLUTE ROUT: ${h.name} destroys ${a.name} ${biggestMatch.homeScore}-${biggestMatch.awayScore}!`);
    }
    if (totalGoals > 0) result.push(`GOAL FEST: ${totalGoals} goals scored in the last ${recent.length} games!`);
    return result;
  }, [cfg.showHighlights, matches, getPlayer]);

  // ── Enhanced Smart Content: Streaks ───────────────────────────────────────
  const streakItems = useMemo(() => {
    if (!cfg.showStreaks) return [];
    const completed = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    if (completed.length < 3) return [];
    const result = [];

    players.forEach(p => {
      const myMatches = completed.filter(m => m.homeId === p.id || m.awayId === p.id);
      if (myMatches.length < 3) return;
      let streak = 0;
      let streakType = null;
      for (const m of myMatches) {
        const isHome = m.homeId === p.id;
        const myScore = isHome ? Number(m.homeScore) : Number(m.awayScore);
        const oppScore = isHome ? Number(m.awayScore) : Number(m.homeScore);
        const res = myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : null;
        if (!res) break;
        if (!streakType) streakType = res;
        if (res === streakType) streak++;
        else break;
      }
      if (streak >= 3) {
        if (streakType === 'W') {
          result.push({ text: `UNSTOPPABLE! ${p.name} is on a ${streak}-Game WINNING Streak!`, type: 'win' });
        } else {
          result.push({ text: `IN CRISIS! ${p.name} suffers ${streak} consecutive losses.`, type: 'loss' });
        }
      }
    });

    return result.slice(0, 3);
  }, [cfg.showStreaks, matches, players]);

  useEffect(() => {
    // Inject fonts needed for the themes if they don't exist
    if (!document.getElementById('ticker-fonts')) {
      const link = document.createElement("link");
      link.id = "ticker-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  if (!cfg.enabled && !previewMode) return null;
  const duration = speedToDuration(cfg.speed);

  // ── Build match lists ─────────────────────────────────────────────────────
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

  const items = [];

  // ── Breaking News ─────────────────────────────────────────────────────────
  if (cfg.breakingNews && cfg.breakingNews.trim()) {
    items.push(
      <div key="breaking" className="flex items-center shrink-0 gap-3 font-semibold mx-4">
        <BreakingBadge />
        <span style={{ color: theme.team, fontFamily: theme.font }} className="font-bold tracking-wide text-sm">{cfg.breakingNews}</span>
      </div>
    );
  }

  // ── Live matches ──────────────────────────────────────────────────────────
  liveMatches.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    items.push(
      <MatchChip 
        key={`live-${m.id}`} 
        match={m} home={home} away={away} 
        theme={theme} isLive={true} 
        onClick={() => !previewMode && setSelectedMatchId(m.id)}
        showAvatars={cfg.showAvatars}
        previewMode={previewMode}
        momentumTeam={cfg.momentumTeam}
        showtimeGoals={cfg.highlightReelGoals}
      />
    );
  });

  // ── Completed matches ─────────────────────────────────────────────────────
  recentCompleted.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    items.push(
      <MatchChip 
        key={`ft-${m.id}`} 
        match={m} home={home} away={away} 
        theme={theme} isLive={false} 
        onClick={() => !previewMode && setSelectedMatchId(m.id)}
        showAvatars={cfg.showAvatars}
        previewMode={previewMode}
      />
    );
  });

  // ── Announcements ─────────────────────────────────────────────────────────
  announcements.slice(0, 3).forEach(a => {
    items.push(
      <div key={`ann-${a.id}`} className="flex items-center shrink-0 gap-3 font-semibold mx-4">
        <ShinyBadge label="UPDATE" icon={Megaphone} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)" }} />
        <span style={{ color: theme.team, fontFamily: theme.font }} className="text-sm font-bold tracking-wide">{a.title}</span>
      </div>
    );
  });

  // ── Stats Ticker Items ────────────────────────────────────────────────────
  statsItems.forEach((text, i) => {
    items.push(
      <div key={`stat-${i}`} className="flex items-center shrink-0 gap-3 font-semibold mx-4">
        <StatsBadge />
        <span style={{ color: theme.team, fontFamily: theme.font }} className="text-sm font-bold tracking-wide">{text}</span>
      </div>
    );
  });

  // ── Highlight Reel Items (Auto + Custom) ──────────────────────────────────
  const allHighlights = [...highlightItems, ...(cfg.customHighlights || [])];
  allHighlights.forEach((text, i) => {
    items.push(
      <div key={`hl-${i}`} className="flex items-center shrink-0 gap-3 font-semibold mx-4 relative overflow-visible">
        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse" />
        <span className="text-sm font-black tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" style={{ fontFamily: theme.font }}>
          {text}
        </span>
      </div>
    );
  });

  // ── Player Streak Alerts ──────────────────────────────────────────────────
  streakItems.forEach((item, i) => {
    items.push(
      <div key={`streak-${i}`} className="flex items-center shrink-0 gap-3 font-semibold mx-4">
        <StreakBadge type={item.type} />
        <span style={{ color: theme.team, fontFamily: theme.font }} className="text-sm font-bold tracking-wide">{item.text}</span>
      </div>
    );
  });

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0 && !previewMode) {
    return (
      <div className={`w-full overflow-hidden flex items-center h-16 select-none z-40 relative`} style={theme.wrap} aria-live="polite">
        <div className="w-1/3 h-4 bg-white/10 rounded-full ml-4 animate-pulse" />
      </div>
    );
  }
  if (items.length === 0 && previewMode) {
    items.push(<div key="empty" className="text-sm font-mono text-muted-foreground ml-4">Ticker preview is empty...</div>);
  }

  // ── Add separators between items ──────────────────────────────────────────
  const separatedItems = [];
  items.forEach((item, i) => {
    separatedItems.push(item);
    if (cfg.separator !== 'none') {
      separatedItems.push(<SeparatorItem key={`sep-${i}`} separator={cfg.separator} theme={theme} />);
    }
  });

  const pauseClass = (cfg.pauseOnHover && !previewMode) ? 'hover:[animation-play-state:paused] active:[animation-play-state:paused]' : '';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-custom-marquee { animation: custom-marquee var(--duration, 55s) linear infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-custom-marquee { animation: none !important; } }
        
        .pulse-dot { width: 6px; height: 6px; border-radius: 999px; display: inline-block; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1);} 50% { opacity: .35; transform: scale(0.7);} }

        .shiny { position: relative; }
        .shiny::after {
          content: ''; position: absolute; top: 0; left: -150%; width: 55%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.75), transparent);
          transform: skewX(-20deg); animation: shine 2.6s ease-in-out infinite;
        }
        @keyframes shine { 0% { left: -150%; } 55%,100% { left: 150%; } }
        
        .holo-bg { background: linear-gradient(120deg,#ff9be0,#9bd9ff,#c9ff9b,#ffe39b,#ff9be0); background-size: 300% 300%; animation: holoshift 8s ease infinite; }
        .foil-bg { background: linear-gradient(120deg,#0a3d24,#39ff9c,#0a3d24,#0a5c34); background-size: 300% 300%; animation: holoshift 7s ease infinite; }
        .aurora-bg { background: linear-gradient(120deg,#0b1f3a,#1fc2c2,#5b2a86,#0b1f3a); background-size: 300% 300%; animation: holoshift 9s ease infinite; }
        .auroraSilk-bg { background: linear-gradient(120deg,#3b1f4d,#f14fc4,#5b2a86,#3b1f4d); background-size: 300% 300%; animation: holoshift 9s ease infinite; }
        .mercury-bg { background: linear-gradient(120deg,#e0e0e0,#ffffff,#a0a0a5,#e0e0e0); background-size: 300% 300%; animation: holoshift 4s ease infinite; }
        .silk-bg { background: linear-gradient(120deg,#7a1030,#b31942,#7a1030); background-size: 200% 200%; animation: holoshift 10s ease infinite; }
        @keyframes holoshift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        @keyframes stinger-sweep { 0% { left: -150%; } 50% { left: 0%; } 100% { left: 150%; } }
        .animate-stinger { animation: stinger-sweep 1.5s cubic-bezier(0.8, 0, 0.2, 1) forwards; }
        
        @keyframes slide-in-left { 0% { transform: translateX(-150%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-left { animation: slide-in-left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
      <div 
        className={`w-full overflow-hidden flex items-center select-none z-40 relative py-1 ${theme.extraClass || ''} ${previewMode ? 'rounded-lg border-x border-t' : ''}`} 
        style={{ ...theme.wrap, borderRadius: previewMode ? '8px 8px 0 0' : theme.wrap.borderRadius }} 
        aria-live="polite" 
        role="marquee"
      >
        {/* Gradients on edges for smooth scrolling fade out. Hard to pick colors dynamically, so a dark fade is safe */}
        <div className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r ${theme.page === 'light' ? 'from-white/70' : 'from-black/70'} to-transparent z-10 pointer-events-none`} />
        <div className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l ${theme.page === 'light' ? 'from-white/70' : 'from-black/70'} to-transparent z-10 pointer-events-none`} />
        
        {/* Pause Overlay for Preview */}
        {previewMode && cfg.pauseOnHover && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity pointer-events-auto cursor-help backdrop-blur-[1px]" style={{ borderRadius: theme.wrap.borderRadius }}>
            <span className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-4 border-l-2 border-r-2 border-white block" /> Pause on Hover Active
            </span>
          </div>
        )}

        <div
          className={`flex whitespace-nowrap w-max animate-custom-marquee ${pauseClass}`}
          style={{ '--duration': duration, '--gap': '2rem' }}
        >
          {separatedItems}{separatedItems}
        </div>
        
        {/* Replay Stinger Overlay */}
        {stingerActive && (
          <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none" style={{ borderRadius: previewMode ? '8px 8px 0 0' : theme.wrap.borderRadius }}>
            <div className="absolute top-0 left-[-100%] w-full h-full bg-background skew-x-[-20deg] animate-stinger flex items-center justify-center shadow-[0_0_30px_black] border-x border-amber-500/50">
              <span className="text-amber-400 font-black italic tracking-widest text-lg sm:text-2xl drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" style={{ transform: 'skewX(20deg)' }}>HIGHLIGHT REEL</span>
            </div>
          </div>
        )}
      </div>

      {/* Epic Moment Overlay (Bottom Left) */}
      {!previewMode && cfg.epicMoment?.active && cfg.epicMoment?.playerId && getPlayer(cfg.epicMoment.playerId) && (
        <div className="fixed bottom-20 left-4 sm:left-10 z-[100] pointer-events-none">
           <div className="flex items-center gap-4 bg-black/70 backdrop-blur-xl border border-amber-500/30 p-3 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-slide-in-left">
             <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                <Avatar p={getPlayer(cfg.epicMoment.playerId)} size={64} className="w-full h-full rounded-lg object-cover bg-zinc-900" />
             </div>
             <div className="flex flex-col pr-4 sm:pr-8">
                <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-widest leading-tight">Highlight Reel</span>
                <span className="text-lg sm:text-2xl font-black text-foreground leading-none mt-0.5">{getPlayer(cfg.epicMoment.playerId).name}</span>
                {cfg.epicMoment.text && (
                  <span className="text-xs sm:text-sm font-bold text-zinc-300 mt-1 uppercase tracking-wide">{cfg.epicMoment.text}</span>
                )}
             </div>
           </div>
        </div>
      )}

      {selectedMatchId && !previewMode && (
        <MatchStatsModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </>
  );
}
