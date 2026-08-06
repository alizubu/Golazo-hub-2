'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Megaphone } from 'lucide-react';
import { Avatar } from './UI';
import MatchStatsModal from './MatchStatsModal';
import {
  THEMES,
  SEPARATORS,
  SIZE_CLASSES,
  getThemeStyles,
  speedToDuration,
  LiveBadge,
  FTBadge,
  ScoreBadge,
  SeparatorItem,
  BreakingBadge,
  StatsBadge,
  StreakBadge,
  HighlightBadge
} from './SportsTickerBadges';

// ── Main Component ───────────────────────────────────────────────────────────
export default function SportsTicker({ matches = [], announcements = [], players = [], tickerConfig, previewMode = false, standings = [] }) {
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const cfg = tickerConfig ?? {
    enabled: true, source: 'live_recent', speed: 50,
    showAvatars: true, pauseOnHover: true, theme: 'classic',
    size: 'normal', separator: 'dot', breakingNews: '',
    showStats: false, showHighlights: false, showStreaks: false,
  };

  const theme = cfg.theme || 'classic';
  const sizeKey = cfg.size || 'normal';
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;

  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
  const getPlayer = useCallback(id => playerMap.get(id), [playerMap]);

  // ── Stats Ticker Items ────────────────────────────────────────────────────
  const statsItems = useMemo(() => {
    if (!cfg.showStats) return [];
    const completed = matches.filter(m => m.status === 'completed');
    if (completed.length === 0) return [];

    const playerStats = {};
    players.forEach(p => { playerStats[p.id] = { name: p.name, goals: 0, wins: 0, played: 0, pts: 0 }; });
    completed.forEach(m => {
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      if (playerStats[m.homeId]) {
        playerStats[m.homeId].goals += hs;
        playerStats[m.homeId].played++;
        playerStats[m.homeId].pts += hs > as ? 3 : hs === as ? 1 : 0;
        if (hs > as) playerStats[m.homeId].wins++;
      }
      if (playerStats[m.awayId]) {
        playerStats[m.awayId].goals += as;
        playerStats[m.awayId].played++;
        playerStats[m.awayId].pts += as > hs ? 3 : hs === as ? 1 : 0;
        if (as > hs) playerStats[m.awayId].wins++;
      }
    });

    const sorted = Object.values(playerStats).filter(s => s.played > 0);
    const result = [];
    const topScorer = [...sorted].sort((a, b) => b.goals - a.goals)[0];
    const leader = [...sorted].sort((a, b) => b.pts - a.pts)[0];
    if (topScorer) result.push(`⚽ Top Scorer: ${topScorer.name} (${topScorer.goals} goals)`);
    if (leader) result.push(`🏆 Leader: ${leader.name} (${leader.pts} pts)`);
    result.push(`📊 ${completed.length} matches played`);
    return result;
  }, [cfg.showStats, matches, players]);

  // ── Highlight Reel Items ──────────────────────────────────────────────────
  const highlightItems = useMemo(() => {
    if (!cfg.showHighlights) return [];
    const completed = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    if (completed.length === 0) return [];
    const result = [];
    // Biggest win from recent matches
    const recent = completed.slice(0, 10);
    let biggestMargin = 0;
    let biggestMatch = null;
    recent.forEach(m => {
      const diff = Math.abs((Number(m.homeScore) || 0) - (Number(m.awayScore) || 0));
      if (diff > biggestMargin) { biggestMargin = diff; biggestMatch = m; }
    });
    if (biggestMatch && biggestMargin > 0) {
      const h = getPlayer(biggestMatch.homeId);
      const a = getPlayer(biggestMatch.awayId);
      if (h && a) result.push(`💥 Biggest win: ${h.name} ${biggestMatch.homeScore}-${biggestMatch.awayScore} ${a.name}`);
    }
    // Total goals recently
    const totalGoals = recent.reduce((sum, m) => sum + (Number(m.homeScore) || 0) + (Number(m.awayScore) || 0), 0);
    if (totalGoals > 0) result.push(`⚡ ${totalGoals} goals in the last ${recent.length} matches`);
    return result;
  }, [cfg.showHighlights, matches, getPlayer]);

  // ── Player Streak Alerts ──────────────────────────────────────────────────
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
        const emoji = streakType === 'W' ? '🔥' : '💀';
        const label = streakType === 'W' ? 'win' : 'loss';
        result.push({ text: `${emoji} ${p.name} is on a ${streak}-game ${label} streak!`, type: streakType === 'W' ? 'win' : 'loss' });
      }
    });

    return result.slice(0, 3);
  }, [cfg.showStreaks, matches, players]);

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

  const recentAnnouncements = announcements.slice(0, 3);
  const items = [];

  // ── Breaking News ─────────────────────────────────────────────────────────
  if (cfg.breakingNews && cfg.breakingNews.trim()) {
    items.push(
      <div key="breaking" className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <BreakingBadge sizeKey={sizeKey} />
        <span className="text-red-200 font-bold">{cfg.breakingNews}</span>
      </div>
    );
  }

  // ── Live matches ──────────────────────────────────────────────────────────
  liveMatches.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    items.push(
      <button
        key={`live-${m.id}`}
        onClick={() => !previewMode && setSelectedMatchId(m.id)}
        className={`flex items-center shrink-0 transition-opacity ${previewMode ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:opacity-90'} ${sz.gap} ${sz.text} font-semibold ${ts.nameCls}`}
      >
        <LiveBadge theme={theme} sizeKey={sizeKey} />
        {cfg.showAvatars && <Avatar p={home} size={sz.avatar} />}
        <span>{home.name}</span>
        <ScoreBadge home={m.homeScore} away={m.awayScore} isLive={true} theme={theme} />
        <span>{away.name}</span>
        {cfg.showAvatars && <Avatar p={away} size={sz.avatar} />}
      </button>
    );
  });

  // ── Completed matches ─────────────────────────────────────────────────────
  recentCompleted.forEach(m => {
    const home = getPlayer(m.homeId);
    const away = getPlayer(m.awayId);
    if (!home || !away) return;
    items.push(
      <button
        key={`ft-${m.id}`}
        onClick={() => !previewMode && setSelectedMatchId(m.id)}
        className={`flex items-center shrink-0 transition-opacity ${previewMode ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:opacity-90'} ${sz.gap} ${sz.text} font-semibold ${ts.nameCls} opacity-75`}
      >
        <FTBadge theme={theme} sizeKey={sizeKey} />
        {cfg.showAvatars && <Avatar p={home} size={sz.avatar} />}
        <span>{home.name}</span>
        <ScoreBadge home={m.homeScore} away={m.awayScore} isLive={false} theme={theme} />
        <span>{away.name}</span>
        {cfg.showAvatars && <Avatar p={away} size={sz.avatar} />}
      </button>
    );
  });

  // ── Announcements ─────────────────────────────────────────────────────────
  recentAnnouncements.forEach(a => {
    items.push(
      <div key={`ann-${a.id}`} className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <div className={`flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${ts.announceBadge}`}>
          <Megaphone size={10} /> UPDATE
        </div>
        <span className={ts.nameCls}>{a.title}</span>
      </div>
    );
  });

  // ── Stats Ticker Items ────────────────────────────────────────────────────
  statsItems.forEach((text, i) => {
    items.push(
      <div key={`stat-${i}`} className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <StatsBadge theme={theme} sizeKey={sizeKey} />
        <span className={ts.nameCls}>{text}</span>
      </div>
    );
  });

  // ── Highlight Reel Items ──────────────────────────────────────────────────
  highlightItems.forEach((text, i) => {
    items.push(
      <div key={`hl-${i}`} className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <HighlightBadge theme={theme} sizeKey={sizeKey} />
        <span className={ts.nameCls}>{text}</span>
      </div>
    );
  });

  // ── Player Streak Alerts ──────────────────────────────────────────────────

  streakItems.forEach((item, i) => {
    items.push(
      <div key={`streak-${i}`} className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <StreakBadge type={item.type} sizeKey={sizeKey} />
        <span className={ts.nameCls}>{item.text}</span>
      </div>
    );
  });

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0 && !previewMode) {
    return (
      <div className={`w-full overflow-hidden flex items-center ${sz.container} select-none z-40 relative ${ts.bg}`} aria-live="polite">
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

  let containerClass = `w-full overflow-hidden flex items-center ${sz.container} select-none z-40 relative `;
  containerClass += ts.bg;
  if (previewMode) containerClass += ' rounded-lg border-x border-t';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-custom-marquee {
          animation: custom-marquee var(--duration, 55s) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-custom-marquee {
            animation: none !important;
          }
        }
        @keyframes ticker-badge-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .ticker-badge-shine {
          position: relative;
          overflow: hidden;
        }
        .ticker-badge-shine::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: ticker-shine-sweep 3s ease-in-out infinite;
        }
        @keyframes ticker-shine-sweep {
          0% { left: -100%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
      `}} />
      <div className={containerClass} aria-live="polite" role="marquee">
        <div className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r ${ts.gradient} to-transparent z-10 pointer-events-none`} />
        <div className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l ${ts.gradient} to-transparent z-10 pointer-events-none`} />
        
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
          {separatedItems}{separatedItems}
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
