'use client';

import React, { useState, useMemo } from 'react';
import { Megaphone, CheckCircle2, Zap, TrendingUp, Flame, Trophy } from 'lucide-react';
import { Avatar } from './UI';
import MatchStatsModal from './MatchStatsModal';

// ── Theme Definitions ────────────────────────────────────────────────────────
export const THEMES = [
  { id: 'classic',   name: 'Classic',   emoji: '📺', desc: 'Clean & professional' },
  { id: 'neon',      name: 'Neon',      emoji: '💚', desc: 'Glowing cyberpunk' },
  { id: 'cyber',     name: 'Cyber',     emoji: '🤖', desc: 'Monospace hacker' },
  { id: 'stadium',   name: 'Stadium',   emoji: '🏟️', desc: 'Warm LED board' },
  { id: 'retro',     name: 'Retro',     emoji: '👾', desc: 'Pixelated 8-bit' },
  { id: 'glass',     name: 'Glass',     emoji: '🪟', desc: 'Frosted transparency' },
  { id: 'fire',      name: 'Fire',      emoji: '🔥', desc: 'Red-orange ember' },
  { id: 'arctic',    name: 'Arctic',    emoji: '❄️', desc: 'Icy blue frost' },
  { id: 'royal',     name: 'Royal',     emoji: '👑', desc: 'Purple-gold luxury' },
  { id: 'matrix',    name: 'Matrix',    emoji: '💊', desc: 'Green rain code' },
  { id: 'sunset',    name: 'Sunset',    emoji: '🌅', desc: 'Coral-orange warmth' },
  { id: 'midnight',  name: 'Midnight',  emoji: '🌙', desc: 'Deep navy starlight' },
  { id: 'champion',  name: 'Champion',  emoji: '🏆', desc: 'Gold metallic shine' },
];

// ── Separator characters ─────────────────────────────────────────────────────
export const SEPARATORS = {
  dot:     '·',
  ball:    '⚽',
  pipe:    '│',
  diamond: '◆',
  slash:   '//',
  none:    '',
};

// ── Speed → CSS duration (1% = 120s, 100% = 8s) ─────────────────────────────
function speedToDuration(speed) {
  const s = Math.max(1, Math.min(100, speed || 50));
  return `${Math.round(120 - (s / 100) * 112)}s`;
}

// ── Size → classes ───────────────────────────────────────────────────────────
const SIZE_CLASSES = {
  compact: { container: 'h-8',  text: 'text-[10px]', badge: 'text-[8px] px-1.5 py-0', avatar: 14, gap: 'gap-1.5 mr-6' },
  normal:  { container: 'h-10', text: 'text-sm',      badge: 'text-[9px] px-2 py-0.5', avatar: 18, gap: 'gap-2 mr-10' },
  large:   { container: 'h-12', text: 'text-base',    badge: 'text-[10px] px-2.5 py-1', avatar: 22, gap: 'gap-2.5 mr-12' },
};

// ── Theme-specific styles ────────────────────────────────────────────────────
function getThemeStyles(theme) {
  const styles = {
    classic:  { bg: 'bg-black/40 backdrop-blur-md border-b border-white/5',                                     gradient: 'from-[#0a0c10]', liveBadge: 'bg-red-500/10 text-red-400 border border-red-500/20', ftBadge: 'text-zinc-500', nameCls: 'text-foreground', liveScoreBg: 'rgba(239,68,68,0.15)', liveScoreColor: '#f87171', liveScoreBorder: 'rgba(239,68,68,0.25)', ftScoreBg: 'rgba(41,193,121,0.12)', ftScoreColor: '#29C179', ftScoreBorder: 'rgba(41,193,121,0.2)', announceBadge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    neon:     { bg: 'bg-black border-b border-green-500/20',                                                      gradient: 'from-black', liveBadge: 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.8)]', ftBadge: 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]', nameCls: 'text-white', liveScoreBg: 'transparent', liveScoreColor: '#f87171', liveScoreBorder: '#ef4444', ftScoreBg: 'transparent', ftScoreColor: '#60a5fa', ftScoreBorder: '#60a5fa', announceBadge: 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.8)]' },
    cyber:    { bg: 'bg-zinc-950 border-b-2 border-yellow-500/50',                                                gradient: 'from-zinc-950', liveBadge: 'bg-yellow-400 text-black font-mono', ftBadge: 'bg-zinc-800 text-zinc-400 font-mono border border-zinc-700/50', nameCls: 'text-zinc-300 font-mono', liveScoreBg: 'rgb(24,24,27)', liveScoreColor: '#fbbf24', liveScoreBorder: 'rgba(113,113,122,0.5)', ftScoreBg: 'rgb(24,24,27)', ftScoreColor: '#d4d4d8', ftScoreBorder: 'rgba(113,113,122,0.5)', announceBadge: 'bg-cyan-500 text-black font-mono' },
    stadium:  { bg: 'bg-gradient-to-r from-amber-950/90 to-orange-950/80 border-b border-amber-500/30',           gradient: 'from-amber-950', liveBadge: 'bg-red-600 text-white border border-red-500/50', ftBadge: 'text-amber-400/70', nameCls: 'text-amber-100', liveScoreBg: 'rgba(239,68,68,0.2)', liveScoreColor: '#fca5a5', liveScoreBorder: 'rgba(239,68,68,0.3)', ftScoreBg: 'rgba(245,158,11,0.15)', ftScoreColor: '#fbbf24', ftScoreBorder: 'rgba(245,158,11,0.3)', announceBadge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    retro:    { bg: 'bg-[#1a1a2e] border-b-2 border-[#e94560]/40',                                               gradient: 'from-[#1a1a2e]', liveBadge: 'bg-[#e94560] text-white font-mono tracking-widest', ftBadge: 'text-[#0f3460] bg-[#16213e] font-mono', nameCls: 'text-[#eaeaea] font-mono', liveScoreBg: '#533483', liveScoreColor: '#e94560', liveScoreBorder: '#e94560', ftScoreBg: '#16213e', ftScoreColor: '#0f3460', ftScoreBorder: '#0f3460', announceBadge: 'bg-[#533483] text-white font-mono' },
    glass:    { bg: 'bg-white/5 backdrop-blur-xl border-b border-white/10',                                       gradient: 'from-white/5', liveBadge: 'bg-red-500/20 text-red-300 backdrop-blur-sm border border-red-400/20', ftBadge: 'text-white/50 backdrop-blur-sm', nameCls: 'text-white/90', liveScoreBg: 'rgba(255,255,255,0.08)', liveScoreColor: '#fca5a5', liveScoreBorder: 'rgba(255,255,255,0.15)', ftScoreBg: 'rgba(255,255,255,0.06)', ftScoreColor: 'rgba(255,255,255,0.7)', ftScoreBorder: 'rgba(255,255,255,0.1)', announceBadge: 'bg-white/10 text-white/80 backdrop-blur-sm border border-white/10' },
    fire:     { bg: 'bg-gradient-to-r from-red-950/90 to-orange-950/80 border-b border-red-500/30',               gradient: 'from-red-950', liveBadge: 'bg-gradient-to-r from-red-500 to-orange-500 text-white', ftBadge: 'text-orange-400/70', nameCls: 'text-orange-100', liveScoreBg: 'rgba(239,68,68,0.25)', liveScoreColor: '#fbbf24', liveScoreBorder: 'rgba(249,115,22,0.4)', ftScoreBg: 'rgba(249,115,22,0.15)', ftScoreColor: '#fb923c', ftScoreBorder: 'rgba(249,115,22,0.3)', announceBadge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
    arctic:   { bg: 'bg-gradient-to-r from-sky-950/90 to-cyan-950/80 border-b border-cyan-400/20',                gradient: 'from-sky-950', liveBadge: 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30', ftBadge: 'text-sky-400/60', nameCls: 'text-sky-100', liveScoreBg: 'rgba(34,211,238,0.1)', liveScoreColor: '#67e8f9', liveScoreBorder: 'rgba(34,211,238,0.3)', ftScoreBg: 'rgba(56,189,248,0.1)', ftScoreColor: '#38bdf8', ftScoreBorder: 'rgba(56,189,248,0.2)', announceBadge: 'bg-sky-500/15 text-sky-300 border border-sky-400/25' },
    royal:    { bg: 'bg-gradient-to-r from-purple-950/90 to-violet-950/80 border-b border-amber-400/30',          gradient: 'from-purple-950', liveBadge: 'bg-gradient-to-r from-purple-500 to-amber-500 text-white', ftBadge: 'text-amber-400/70', nameCls: 'text-purple-100', liveScoreBg: 'rgba(168,85,247,0.2)', liveScoreColor: '#d8b4fe', liveScoreBorder: 'rgba(168,85,247,0.4)', ftScoreBg: 'rgba(245,158,11,0.12)', ftScoreColor: '#fbbf24', ftScoreBorder: 'rgba(245,158,11,0.25)', announceBadge: 'bg-purple-500/15 text-purple-300 border border-purple-400/25' },
    matrix:   { bg: 'bg-black border-b border-green-500/30',                                                      gradient: 'from-black', liveBadge: 'bg-green-500 text-black font-mono', ftBadge: 'text-green-600 font-mono', nameCls: 'text-green-400 font-mono', liveScoreBg: 'rgba(34,197,94,0.15)', liveScoreColor: '#4ade80', liveScoreBorder: 'rgba(34,197,94,0.4)', ftScoreBg: 'rgba(34,197,94,0.08)', ftScoreColor: '#22c55e', ftScoreBorder: 'rgba(34,197,94,0.2)', announceBadge: 'bg-green-500/15 text-green-400 font-mono border border-green-500/25' },
    sunset:   { bg: 'bg-gradient-to-r from-rose-950/90 to-amber-950/80 border-b border-rose-400/25',              gradient: 'from-rose-950', liveBadge: 'bg-gradient-to-r from-rose-500 to-amber-400 text-white', ftBadge: 'text-rose-400/60', nameCls: 'text-rose-100', liveScoreBg: 'rgba(244,63,94,0.15)', liveScoreColor: '#fb7185', liveScoreBorder: 'rgba(244,63,94,0.3)', ftScoreBg: 'rgba(251,146,60,0.12)', ftScoreColor: '#fb923c', ftScoreBorder: 'rgba(251,146,60,0.25)', announceBadge: 'bg-rose-500/15 text-rose-300 border border-rose-400/25' },
    midnight: { bg: 'bg-gradient-to-r from-slate-950 to-indigo-950 border-b border-indigo-400/15',                gradient: 'from-slate-950', liveBadge: 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30', ftBadge: 'text-indigo-400/50', nameCls: 'text-indigo-100', liveScoreBg: 'rgba(99,102,241,0.12)', liveScoreColor: '#a5b4fc', liveScoreBorder: 'rgba(99,102,241,0.3)', ftScoreBg: 'rgba(99,102,241,0.08)', ftScoreColor: '#818cf8', ftScoreBorder: 'rgba(99,102,241,0.2)', announceBadge: 'bg-indigo-500/15 text-indigo-300 border border-indigo-400/20' },
    champion: { bg: 'bg-gradient-to-r from-[#0a0a0a] to-[#1a1500] border-b-2 border-amber-400/40',               gradient: 'from-[#0a0a0a]', liveBadge: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black', ftBadge: 'text-amber-400/60', nameCls: 'text-amber-50', liveScoreBg: 'rgba(245,158,11,0.2)', liveScoreColor: '#fbbf24', liveScoreBorder: 'rgba(245,158,11,0.4)', ftScoreBg: 'rgba(245,158,11,0.1)', ftScoreColor: '#f59e0b', ftScoreBorder: 'rgba(245,158,11,0.25)', announceBadge: 'bg-amber-500/15 text-amber-300 border border-amber-400/30' },
  };
  return styles[theme] || styles.classic;
}

// ── Sub-components ───────────────────────────────────────────────────────────
function LiveBadge({ theme, sizeKey }) {
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  const isMono = ['cyber', 'matrix', 'retro'].includes(theme);
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${ts.liveBadge}`}>
      {!isMono && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {isMono ? '[LIVE]' : 'LIVE'}
    </div>
  );
}

function FTBadge({ theme, sizeKey }) {
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  const isMono = ['cyber', 'matrix', 'retro'].includes(theme);
  return (
    <div className={`flex items-center gap-1 font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${isMono ? '' : 'rounded-full'} ${ts.ftBadge}`}>
      {isMono ? '[FT]' : <><CheckCircle2 size={10} /> FT</>}
    </div>
  );
}

function ScoreBadge({ home, away, isLive, theme }) {
  const ts = getThemeStyles(theme);
  const style = isLive
    ? { background: ts.liveScoreBg, color: ts.liveScoreColor, border: `1px solid ${ts.liveScoreBorder}` }
    : { background: ts.ftScoreBg, color: ts.ftScoreColor, border: `1px solid ${ts.ftScoreBorder}` };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-black font-score tabular-nums shrink-0 rounded-full" style={style}>
      {home ?? 0} <span className="opacity-50 font-normal">-</span> {away ?? 0}
    </span>
  );
}

function SeparatorItem({ separator, theme }) {
  const char = SEPARATORS[separator];
  if (!char) return null;
  const ts = getThemeStyles(theme);
  return (
    <span className={`shrink-0 opacity-30 font-bold mx-1 ${ts.nameCls}`}>{char}</span>
  );
}

// ── Breaking News Badge ──────────────────────────────────────────────────────
function BreakingBadge({ sizeKey }) {
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 bg-red-600 text-white ${sz.badge}`}>
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      BREAKING
    </div>
  );
}

// ── Stats Badge ──────────────────────────────────────────────────────────────
function StatsBadge({ theme, sizeKey }) {
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${ts.announceBadge}`}>
      <TrendingUp size={10} /> STATS
    </div>
  );
}

// ── Streak Badge ─────────────────────────────────────────────────────────────
function StreakBadge({ type, sizeKey }) {
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  const isHot = type === 'win';
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${isHot ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-blue-500/15 text-blue-300 border border-blue-500/25'}`}>
      {isHot ? <Flame size={10} /> : <Zap size={10} />} {isHot ? 'STREAK' : 'ALERT'}
    </div>
  );
}

// ── Highlight Badge ──────────────────────────────────────────────────────────
function HighlightBadge({ theme, sizeKey }) {
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${ts.announceBadge}`}>
      <Trophy size={10} /> HIGHLIGHT
    </div>
  );
}

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

  if (!cfg.enabled && !previewMode) return null;

  const getPlayer = id => players.find(p => p.id === id);
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

  statsItems.forEach((text, i) => {
    items.push(
      <div key={`stat-${i}`} className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <StatsBadge theme={theme} sizeKey={sizeKey} />
        <span className={ts.nameCls}>{text}</span>
      </div>
    );
  });

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
  }, [cfg.showHighlights, matches, players]);

  highlightItems.forEach((text, i) => {
    items.push(
      <div key={`hl-${i}`} className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <HighlightBadge theme={theme} sizeKey={sizeKey} />
        <span className={ts.nameCls}>{text}</span>
      </div>
    );
  });

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

  streakItems.forEach((item, i) => {
    items.push(
      <div key={`streak-${i}`} className={`flex items-center shrink-0 ${sz.gap} ${sz.text} font-semibold`}>
        <StreakBadge type={item.type} sizeKey={sizeKey} />
        <span className={ts.nameCls}>{item.text}</span>
      </div>
    );
  });

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0 && !previewMode) return null;
  if (items.length === 0 && previewMode) {
    items.push(<div key="empty" className="text-sm font-mono text-muted-foreground ml-4">Ticker preview is empty...</div>);
  }

  // ── Add separators between items ──────────────────────────────────────────
  const separatedItems = [];
  items.forEach((item, i) => {
    separatedItems.push(item);
    if (i < items.length - 1 && cfg.separator !== 'none') {
      separatedItems.push(<SeparatorItem key={`sep-${i}`} separator={cfg.separator} theme={theme} />);
    }
  });

  const pauseClass = (cfg.pauseOnHover && !previewMode) ? 'hover:[animation-play-state:paused]' : '';

  let containerClass = `w-full overflow-hidden flex items-center ${sz.container} select-none z-40 relative `;
  containerClass += ts.bg;
  if (previewMode) containerClass += ' rounded-lg border-x border-t';

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
      <div className={containerClass}>
        <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r ${ts.gradient} to-transparent z-10 pointer-events-none`} />
        <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l ${ts.gradient} to-transparent z-10 pointer-events-none`} />
        
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
          {separatedItems}{separatedItems}{separatedItems}
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
