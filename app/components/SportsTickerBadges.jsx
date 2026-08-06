import React from 'react';
import { CheckCircle2, Zap, TrendingUp, Flame, Trophy } from 'lucide-react';

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
  { id: 'dormammuh', name: 'Dormammuh', emoji: '🌌', desc: 'Cosmic dark energy' },
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
export function speedToDuration(speed) {
  const s = Math.max(1, Math.min(100, speed || 50));
  return `${Math.round(120 - (s / 100) * 112)}s`;
}

// ── Size → classes ───────────────────────────────────────────────────────────
export const SIZE_CLASSES = {
  compact: { container: 'h-8',  text: 'text-[10px]', badge: 'text-[8px] px-1.5 py-0', avatar: 14, gap: 'gap-1.5 mr-6' },
  normal:  { container: 'h-10', text: 'text-sm',      badge: 'text-[9px] px-2 py-0.5', avatar: 18, gap: 'gap-2 mr-10' },
  large:   { container: 'h-12', text: 'text-base',    badge: 'text-[10px] px-2.5 py-1', avatar: 22, gap: 'gap-2.5 mr-12' },
};

// ── Theme-specific styles ────────────────────────────────────────────────────
export function getThemeStyles(theme) {
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
    dormammuh:{ bg: 'bg-gradient-to-r from-purple-950 via-fuchsia-950 to-red-950 border-b-2 border-fuchsia-500/40', gradient: 'from-purple-950', liveBadge: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-red-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.6)] font-bold', ftBadge: 'text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]', nameCls: 'text-white font-bold', liveScoreBg: 'rgba(217,70,239,0.25)', liveScoreColor: '#fff', liveScoreBorder: 'rgba(217,70,239,0.6)', ftScoreBg: 'rgba(217,70,239,0.1)', ftScoreColor: '#f0abfc', ftScoreBorder: 'rgba(217,70,239,0.3)', announceBadge: 'bg-gradient-to-r from-fuchsia-600 to-red-600 text-white shadow-[0_0_8px_rgba(225,29,72,0.6)]' },
  };
  return styles[theme] || styles.classic;
}

// ── Sub-components ───────────────────────────────────────────────────────────
export function LiveBadge({ theme, sizeKey }) {
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

export function FTBadge({ theme, sizeKey }) {
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  const isMono = ['cyber', 'matrix', 'retro'].includes(theme);
  return (
    <div className={`flex items-center gap-1 font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${isMono ? '' : 'rounded-full'} ${ts.ftBadge}`}>
      {isMono ? '[FT]' : <><CheckCircle2 size={10} /> FT</>}
    </div>
  );
}

export function ScoreBadge({ home, away, isLive, theme }) {
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

export function SeparatorItem({ separator, theme }) {
  const char = SEPARATORS[separator];
  if (!char) return null;
  const ts = getThemeStyles(theme);
  return (
    <span className={`shrink-0 opacity-30 font-bold mx-1 ${ts.nameCls}`}>{char}</span>
  );
}

// ── Breaking News Badge ──────────────────────────────────────────────────────
export function BreakingBadge({ sizeKey }) {
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
export function StatsBadge({ theme, sizeKey }) {
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${ts.announceBadge}`}>
      <TrendingUp size={10} /> STATS
    </div>
  );
}

// ── Streak Badge ─────────────────────────────────────────────────────────────
export function StreakBadge({ type, sizeKey }) {
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  const isHot = type === 'win';
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${isHot ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-blue-500/15 text-blue-300 border border-blue-500/25'}`}>
      {isHot ? <Flame size={10} /> : <Zap size={10} />} {isHot ? 'STREAK' : 'ALERT'}
    </div>
  );
}

// ── Highlight Badge ──────────────────────────────────────────────────────────
export function HighlightBadge({ theme, sizeKey }) {
  const ts = getThemeStyles(theme);
  const sz = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.normal;
  return (
    <div className={`ticker-badge-shine flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${sz.badge} ${ts.announceBadge}`}>
      <Trophy size={10} /> HIGHLIGHT
    </div>
  );
}
