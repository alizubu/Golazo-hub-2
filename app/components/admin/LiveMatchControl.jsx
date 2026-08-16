import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Minus, Play, Pause, Square, SkipForward, Check, X, ChevronDown,
  Timer, Calendar, Upload, Loader2, RotateCcw, Copy, ArrowLeftRight, ArrowLeft, Download, Clock,
  Wifi, RefreshCw, Radio, BarChart2, FileCheck, Target, Home, Star, CircleDot
} from "lucide-react";
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';
import { Btn, MagicCard, Avatar } from '@/app/components/shared/UI';
import { extractMatchStats } from '@/app/actions/extractStats';
import { motion, AnimatePresence } from 'framer-motion';
import { CLUBS } from '@/lib/data/clubs';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';

// ---------------------------------------------------------------------------
// Stat fields
// ---------------------------------------------------------------------------
const STAT_FIELDS = [
  { key: "possession", label: "BALL POSSESSION", format: "percent", icon: "⚽" },
  { key: "shots", label: "TOTAL SHOTS", format: "number", icon: "🥅" },
  { key: "shotsOnTarget", label: "SHOTS ON TARGET", format: "number", icon: "🎯" },
  { key: "fouls", label: "FOULS", format: "number", icon: "🚩" },
  { key: "offsides", label: "OFFSIDES", format: "number", icon: "🏳️" },
  { key: "corners", label: "CORNERS", format: "number", icon: "🏁" },
  { key: "freeKicks", label: "FREE KICKS", format: "number", icon: "👥" },
  { key: "passes", label: "PASSES", format: "number", icon: "🔗" },
  { key: "successfulPasses", label: "ACCURATE PASSES", format: "number", icon: "✅" },
  { key: "crosses", label: "CROSSES", format: "number", icon: "↪️" },
  { key: "interceptions", label: "INTERCEPTIONS", format: "number", icon: "✋" },
  { key: "tackles", label: "TACKLES", format: "number", icon: "🛡" },
  { key: "saves", label: "SAVES", format: "number", icon: "🧤" },
];

// ---------------------------------------------------------------------------
// Utility: get supporter club data
// ---------------------------------------------------------------------------
function getClubData(playerObj) {
  if (!playerObj?.favoriteClub) return null;
  return CLUBS.find(c => c.name === playerObj.favoriteClub) || null;
}

// ---------------------------------------------------------------------------
// Components — Premium Esports Gaming Design
// ---------------------------------------------------------------------------

function CardHeader({ title, status, onCopyFixture }) {
  const isLive = status.includes("LIVE");
  return (
    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0a0c14] to-[#111827] border-b border-white/[0.06] relative z-20">
      {/* Left: Red accent bar + Title */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
        <h1 className="font-heading text-lg sm:text-xl font-extrabold tracking-tight">
          <span className="text-rose-500">LIVE</span>{" "}
          <span className="text-white">MATCH CONTROL</span>
        </h1>
      </div>

      {/* Right: Status pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCopyFixture}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <Copy size={13} /> Copy
        </button>
        {isLive && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">LIVE</span>
          </div>
        )}
        <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {status.replace("LIVE • ", "").replace("LIVE", "").trim() || "1ST HALF"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ home, away, homeScore, awayScore, homeObj, awayObj }) {
  const homeClub = getClubData(homeObj);
  const awayClub = getClubData(awayObj);

  return (
    <div className="relative bg-gradient-to-b from-[#0a0c14] via-[#0d1117] to-[#0a0c14] px-4 sm:px-6 py-8 sm:py-10 border-b border-white/[0.04] overflow-hidden scanline-overlay">
      {/* Background light effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left green light streak */}
        <div className="absolute top-0 left-[15%] w-[30%] h-full bg-gradient-to-b from-emerald-500/[0.07] via-emerald-500/[0.03] to-transparent blur-[60px]" />
        {/* Right red light streak */}
        <div className="absolute top-0 right-[15%] w-[30%] h-full bg-gradient-to-b from-rose-500/[0.07] via-rose-500/[0.03] to-transparent blur-[60px]" />
        {/* Center convergence glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-radial from-white/[0.03] to-transparent rounded-full blur-[40px]" />
        {/* Diagonal red light streaks */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-rose-900/[0.08] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-emerald-900/[0.06] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Main Score Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Home Player */}
          <div className="flex flex-col items-center flex-1 gap-2 sm:gap-3">
            {/* Avatar with green ring */}
            <div className="relative">
              <div className="absolute -inset-1.5 bg-emerald-500/30 rounded-full blur-[10px] animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[2.5px] border-emerald-500/70 overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                <Avatar p={homeObj} size={80} className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            {/* Player name */}
            <div className="text-center">
              <h2 className="font-heading text-sm sm:text-lg font-black uppercase tracking-tight text-white leading-tight">{home}</h2>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Home size={10} className="text-emerald-400" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-400">HOME TEAM</span>
              </div>
            </div>
          </div>

          {/* Center Score */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Home Score Container */}
            <motion.div
              key={`h-${homeScore}`}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="score-container w-16 h-20 sm:w-24 sm:h-28 bg-gradient-to-b from-emerald-900/40 via-emerald-950/30 to-emerald-900/20 border border-emerald-500/30 flex items-center justify-center neon-glow-green relative"
            >
              <span className="font-score text-4xl sm:text-6xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                {homeScore}
              </span>
            </motion.div>

            {/* VS Badge */}
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-base sm:text-xl font-black text-slate-500 tracking-widest">VS</span>
            </div>

            {/* Away Score Container */}
            <motion.div
              key={`a-${awayScore}`}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="score-container w-16 h-20 sm:w-24 sm:h-28 bg-gradient-to-b from-rose-900/40 via-rose-950/30 to-rose-900/20 border border-rose-500/30 flex items-center justify-center neon-glow-red relative"
            >
              <span className="font-score text-4xl sm:text-6xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                {awayScore}
              </span>
            </motion.div>
          </div>

          {/* Away Player */}
          <div className="flex flex-col items-center flex-1 gap-2 sm:gap-3">
            {/* Avatar with red ring */}
            <div className="relative">
              <div className="absolute -inset-1.5 bg-rose-500/30 rounded-full blur-[10px] animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[2.5px] border-rose-500/70 overflow-hidden shadow-[0_0_20px_rgba(225,29,72,0.25)]">
                <Avatar p={awayObj} size={80} className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            {/* Player name */}
            <div className="text-center">
              <h2 className="font-heading text-sm sm:text-lg font-black uppercase tracking-tight text-white leading-tight">{away}</h2>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star size={10} className="text-rose-400" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-rose-400">AWAY TEAM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supporter Club Crests Row */}
        <div className="flex items-center justify-between mt-5 sm:mt-6 px-2 sm:px-8">
          {/* Home Club */}
          <div className="flex items-center gap-2">
            {homeClub ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={homeClub.crestPath} alt={homeClub.name} className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wide">{homeClub.name}</span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest">SUPPORTER</span>
                </div>
              </>
            ) : (
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">No Club</span>
            )}
          </div>

          {/* Center Match Status */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">MATCH STATUS</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
            </div>
          </div>

          {/* Away Club */}
          <div className="flex items-center gap-2">
            {awayClub ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wide">{awayClub.name}</span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-rose-400/70 uppercase tracking-widest">SUPPORTER</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={awayClub.crestPath} alt={awayClub.name} className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
              </>
            ) : (
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">No Club</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ phase }) {
  const order = ["live", "extra_time", "shootout", "stats", "done"];
  const steps = [
    { key: "live", label: "Match", icon: CircleDot },
    { key: "extra_time", label: "Extra Time", icon: Timer },
    { key: "shootout", label: "Penalties", icon: Target },
    { key: "stats", label: "Stats", icon: BarChart2 },
    { key: "done", label: "Published", icon: FileCheck },
  ];
  const currentIdx = order.indexOf(phase);

  return (
    <div className="w-full bg-[#0a0c14]/90 backdrop-blur-md border-b border-white/[0.04] px-3 sm:px-6 py-3 overflow-x-auto no-scrollbar relative z-10 snap-x snap-mandatory">
      <div className="flex items-center justify-between min-w-[420px] max-w-2xl mx-auto gap-1 sm:gap-2">
        {steps.map((s, i) => {
          const idx = order.indexOf(s.key);
          const active = idx === currentIdx;
          const done = idx < currentIdx;
          const StepIcon = s.icon;

          return (
            <div key={s.key} className="flex items-center gap-1 sm:gap-2 flex-1 snap-center">
              <div className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-3 rounded-lg font-sans text-[9px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 cursor-default ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/30 shadow-[0_2px_15px_rgba(34,197,94,0.2)]'
                  : done
                    ? 'bg-white/[0.03] text-emerald-400/70 font-bold border border-emerald-500/10'
                    : 'bg-white/[0.02] text-slate-500 font-bold border border-white/[0.04]'
              }`}>
                {done ? (
                  <Check size={13} className="text-emerald-400 shrink-0" />
                ) : (
                  <StepIcon size={13} className="shrink-0" />
                )}
                <span className="truncate hidden sm:inline">{s.label}</span>
                <span className="truncate sm:hidden">{s.label.split(' ')[0]}</span>
                {/* Active bottom glow line */}
                {active && (
                  <div className="absolute -bottom-[13px] left-1/4 right-1/4 h-[2px] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="w-1.5 sm:w-3 h-[2px] rounded-full flex-none overflow-hidden bg-white/[0.06]">
                  {done && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-emerald-500/60" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepperRow({ label, count, onInc, onDec, isMuted, accentColor = "emerald" }) {
  if (isMuted) return null;
  const isHome = accentColor === "emerald";
  return (
    <div className={`flex flex-col bg-[#0d1117] border rounded-xl p-4 sm:p-5 relative overflow-hidden ${
      isHome ? 'border-emerald-500/20' : 'border-rose-500/20'
    }`}>
      {/* Subtle top glow */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] ${isHome ? 'bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-500/40 to-transparent'}`} />

      <span className="font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-3 sm:mb-4 text-center">{label}</span>
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Minus Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onDec}
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 flex items-center justify-center text-rose-400 transition-all border border-rose-500/20 hover:border-rose-500/40 cursor-pointer shadow-[0_0_10px_rgba(225,29,72,0.1)]"
        >
          <Minus size={20} />
        </motion.button>

        {/* Score */}
        <div className="font-score text-5xl sm:text-6xl font-black tabular-nums text-white drop-shadow-md">
          {count}
        </div>

        {/* Plus Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onInc}
          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all border cursor-pointer ${
            isHome
              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
              : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/20 hover:border-rose-500/40 shadow-[0_0_10px_rgba(225,29,72,0.1)]'
          }`}
        >
          <Plus size={20} />
        </motion.button>
      </div>
    </div>
  );
}

function TeamStatCard({ side, data, bump, phase, accentColor = "emerald" }) {
  const isShootout = phase === 'shootout';
  return (
    <div className="flex flex-col gap-3 w-full">
      <StepperRow label="Goals" count={data.goals} onInc={() => bump(side, "goals", 1)} onDec={() => bump(side, "goals", -1)} isMuted={isShootout} accentColor={accentColor} />
      <StepperRow label="Penalties" count={data.penalties} onInc={() => bump(side, "penalties", 1)} onDec={() => bump(side, "penalties", -1)} isMuted={!isShootout} accentColor={accentColor} />
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = 'primary' }) {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] border border-primary/50",
    secondary: "bg-white/[0.04] backdrop-blur-md text-white hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] shadow-sm",
    destructive: "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] border border-rose-500/50",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative h-12 sm:h-14 w-full rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm sm:text-base transition-all overflow-hidden group cursor-pointer ${variants[variant]}`}
    >
      <div className="absolute inset-0 w-full h-full bg-white/0 group-hover:bg-white/[0.06] transition-colors" />
      {Icon && <Icon size={18} className="relative z-10" />}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

/* Status info card for the live control area */
function StatusInfoCard({ icon: Icon, label, value, subtext, variant = "default" }) {
  const colorMap = {
    default: "text-slate-400",
    live: "text-emerald-400",
    connected: "text-emerald-400",
    synced: "text-rose-400",
  };
  return (
    <div className="flex-1 flex items-center gap-3 bg-[#0d1117] border border-white/[0.06] rounded-xl px-3 sm:px-4 py-3 relative overflow-hidden">
      <div className={`shrink-0 ${colorMap[variant] || colorMap.default}`}>
        <Icon size={18} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</span>
        <span className={`text-xs sm:text-sm font-black uppercase tracking-wide ${colorMap[variant] || 'text-white'}`}>{value}</span>
        <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 uppercase tracking-wider">{subtext}</span>
      </div>
      {/* Mini football pitch icon for match status */}
      {variant === "live" && (
        <div className="ml-auto shrink-0 opacity-40">
          <svg width="36" height="24" viewBox="0 0 36 24" fill="none" className="text-emerald-400">
            <rect x="0.5" y="0.5" width="35" height="23" rx="2" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <line x1="18" y1="0" x2="18" y2="24" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="18" cy="12" r="4" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <rect x="0" y="6" width="6" height="12" rx="0" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <rect x="30" y="6" width="6" height="12" rx="0" stroke="currentColor" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
      )}
      {/* Signal bars for connection */}
      {variant === "connected" && (
        <div className="ml-auto shrink-0 flex items-end gap-[2px] opacity-60">
          <div className="w-[3px] h-[6px] bg-emerald-400 rounded-[1px]" />
          <div className="w-[3px] h-[10px] bg-emerald-400 rounded-[1px]" />
          <div className="w-[3px] h-[14px] bg-emerald-400 rounded-[1px]" />
          <div className="w-[3px] h-[18px] bg-emerald-400 rounded-[1px]" />
        </div>
      )}
      {/* Sync icon for last update */}
      {variant === "synced" && (
        <div className="ml-auto shrink-0 text-rose-400/50">
          <RefreshCw size={18} className="sync-spin" />
        </div>
      )}
    </div>
  );
}

/* Decorative footer bar */
function MatchFooter() {
  return (
    <div className="flex items-center justify-between px-5 sm:px-6 py-3 bg-gradient-to-r from-[#0a0c14] via-[#0d1117] to-[#0a0c14] border-t border-white/[0.04] relative overflow-hidden">
      {/* Decorative center trophy line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="flex items-center gap-1.5">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">FAIR PLAY</span>
        <span className="text-amber-500/50 text-[8px]">✦</span>
      </div>

      {/* Center trophies */}
      <div className="flex items-center gap-1 opacity-30">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-500">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
        </svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-500">
          <path d="M5 3h14c.6 0 1 .4 1 1v2c0 3.3-2.7 6-6 6h-.3c-.4 1.2-1.3 2.2-2.5 2.7V18h3v3H9.8v-3h3v-3.3c-1.2-.5-2.1-1.5-2.5-2.7H10c-3.3 0-6-2.7-6-6V4c0-.6.4-1 1-1z" fill="currentColor" />
        </svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-500">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-amber-500/50 text-[8px]">✦</span>
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">ENJOY THE GAME</span>
      </div>
    </div>
  );
}

function LiveControl({ state, setState, onFinish, onTogglePause, onUndoStart }) {
  const { home, away, paused } = state;
  const canUndo = home.goals === 0 && away.goals === 0;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Goal Control Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Home Team Card */}
        <div className="bg-[#0a0c14] border border-emerald-500/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="text-center font-heading font-bold text-xs sm:text-sm uppercase tracking-wider text-emerald-400 mb-3">{home.name}</div>
          <TeamStatCard side="home" data={home} bump={bump} phase="live" accentColor="emerald" />
        </div>
        {/* Away Team Card */}
        <div className="bg-[#0a0c14] border border-rose-500/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
          <div className="text-center font-heading font-bold text-xs sm:text-sm uppercase tracking-wider text-rose-400 mb-3">{away.name}</div>
          <TeamStatCard side="away" data={away} bump={bump} phase="live" accentColor="rose" />
        </div>
      </div>

      {/* Status Info Cards */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <StatusInfoCard icon={Radio} label="MATCH STATUS" value={paused ? "PAUSED" : "LIVE"} subtext={paused ? "Match Paused" : "1st Half"} variant="live" />
        <StatusInfoCard icon={Wifi} label="CONNECTION" value="STABLE" subtext="Good Connection" variant="connected" />
        <StatusInfoCard icon={Clock} label="LAST UPDATE" value="JUST NOW" subtext="Data Synchronized" variant="synced" />
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 bg-[#0a0c14]/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-white/[0.04] sm:border-0 z-50 flex flex-col sm:flex-row gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:shadow-none pb-safe">
        {canUndo && <ActionButton icon={RotateCcw} label="Undo Start" onClick={onUndoStart} variant="secondary" />}
        <ActionButton icon={paused ? Play : Pause} label={paused ? "Resume Match" : "Pause Match"} onClick={onTogglePause} variant="secondary" />
        <ActionButton icon={Square} label="Finish Match" onClick={onFinish} variant="destructive" />
      </div>
    </div>
  );
}

function ExtraTime({ state, setState, etHalf, setEtHalf, onDone }) {
  const { home, away } = state;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6 bg-amber-500/10 text-amber-400 w-fit mx-auto px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider border border-amber-500/20">
        <Timer size={18} className="animate-pulse" /> Extra Time — {etHalf === 1 ? "1st Half (15')" : "2nd Half (15')"}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-[#0a0c14] border border-emerald-500/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="text-center font-heading font-bold text-xs sm:text-sm uppercase tracking-wider text-emerald-400 mb-3">{home.name}</div>
          <TeamStatCard side="home" data={home} bump={bump} phase="extra_time" accentColor="emerald" />
        </div>
        <div className="bg-[#0a0c14] border border-rose-500/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
          <div className="text-center font-heading font-bold text-xs sm:text-sm uppercase tracking-wider text-rose-400 mb-3">{away.name}</div>
          <TeamStatCard side="away" data={away} bump={bump} phase="extra_time" accentColor="rose" />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 bg-[#0a0c14]/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-white/[0.04] sm:border-0 z-50 flex flex-col gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:shadow-none sm:max-w-md sm:mx-auto pb-safe">
        {etHalf === 1 ? (
          <ActionButton label="Start 2nd Half of Extra Time" onClick={() => setEtHalf(2)} variant="primary" />
        ) : (
          <ActionButton icon={Square} label="End Extra Time" onClick={onDone} variant="destructive" />
        )}
      </div>
    </div>
  );
}

const KickTrack = ({ list }) => (
  <div className="flex gap-2 flex-wrap justify-center mt-3">
    {Array.from({ length: Math.max(5, list.length) }).map((_, i) => {
      const k = list[i];
      if (!k) {
        return <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center text-xs text-slate-600 font-bold">{i + 1}</div>;
      }
      const scored = k.result === "scored";
      return (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm text-white ${scored ? "bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"}`}
        >
          {scored ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
        </motion.div>
      );
    })}
  </div>
);

function Shootout({ home, away, kicks, setKicks, onDecided }) {
  const totalTaken = kicks.length;
  const kicker = totalTaken % 2 === 0 ? "home" : "away";
  const homeKicks = kicks.filter((k) => k.side === "home");
  const awayKicks = kicks.filter((k) => k.side === "away");
  const homeScore = homeKicks.filter((k) => k.result === "scored").length;
  const awayScore = awayKicks.filter((k) => k.result === "scored").length;
  const round = Math.min(Math.floor(totalTaken / 2) + 1, 5);
  const inSuddenDeath = homeKicks.length >= 5 && awayKicks.length >= 5;

  const decided = useMemo(() => {
    if (inSuddenDeath) {
      if (homeKicks.length === awayKicks.length && homeKicks.length > 5 && homeScore !== awayScore) return homeScore > awayScore ? "home" : "away";
      return null;
    }
    const homeRemaining = 5 - homeKicks.length;
    const awayRemaining = 5 - awayKicks.length;
    if (homeScore > awayScore + awayRemaining) return "home";
    if (awayScore > homeScore + homeRemaining) return "away";
    if (homeKicks.length === 5 && awayKicks.length === 5 && homeScore !== awayScore) return homeScore > awayScore ? "home" : "away";
    return null;
  }, [homeKicks.length, awayKicks.length, homeScore, awayScore, inSuddenDeath]);

  const record = (result) => { if (!decided) setKicks((k) => [...k, { side: kicker, result }]); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-[#0d1117] border border-white/[0.06] rounded-xl p-4 shadow-sm gap-2 text-center sm:text-left">
        <span className="text-sm font-bold tracking-widest uppercase text-slate-500">{inSuddenDeath ? "Sudden death" : `Round ${round} of 5`}</span>
        {!decided && (
          <span className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-white">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            {kicker === "home" ? home.name : away.name} to kick
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className={`rounded-2xl p-5 bg-[#0d1117] border ${kicker === "home" && !decided ? 'border-emerald-500/40 ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/[0.06]'} transition-all`}>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
            <span className="font-heading font-extrabold tracking-tight text-white truncate text-lg">{home.name}</span>
            <span className="font-score text-4xl font-black tabular-nums text-emerald-400">{homeScore}</span>
          </div>
          <KickTrack list={homeKicks} />
        </div>
        <div className={`rounded-2xl p-5 bg-[#0d1117] border ${kicker === "away" && !decided ? 'border-emerald-500/40 ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/[0.06]'} transition-all`}>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
            <span className="font-heading font-extrabold tracking-tight text-white truncate text-lg">{away.name}</span>
            <span className="font-score text-4xl font-black tabular-nums text-emerald-400">{awayScore}</span>
          </div>
          <KickTrack list={awayKicks} />
        </div>
      </div>

      {!decided ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 bg-[#0a0c14]/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-white/[0.04] sm:border-0 z-50 grid grid-cols-2 gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:shadow-none sm:max-w-lg sm:mx-auto pb-safe">
          <button onClick={() => record("scored")} className="h-16 rounded-xl flex items-center justify-center gap-3 font-bold text-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-95 transition-all cursor-pointer">
            <Check size={24} strokeWidth={3} /> Scored
          </button>
          <button onClick={() => record("missed")} className="h-16 rounded-xl flex items-center justify-center gap-3 font-bold text-lg bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all cursor-pointer">
            <X size={24} strokeWidth={3} /> Missed
          </button>
        </div>
      ) : (
        <div className="text-center bg-[#0d1117] border border-white/[0.06] rounded-2xl p-6 sm:p-10 shadow-lg">
          <p className="text-lg sm:text-xl font-medium text-white mb-6">
            <span className="font-black">{decided === "home" ? home.name : away.name}</span> win the shootout {decided === "home" ? homeScore : awayScore}–{decided === "home" ? awayScore : homeScore}.
          </p>
          <ActionButton icon={SkipForward} label="Continue to Stats" onClick={() => onDecided(decided)} variant="primary" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image import
// ---------------------------------------------------------------------------
function ImageImport({ onApply }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG or PNG).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await extractMatchStats(formData);

      if (response.success) {
        const mappings = {
          possession: 'possession', shots: 'shots', shots_on_target: 'shotsOnTarget',
          fouls: 'fouls', offsides: 'offsides', corner_kicks: 'corners',
          free_kicks: 'freeKicks', passes: 'passes', successful_passes: 'successfulPasses',
          crosses: 'crosses', interceptions: 'interceptions', tackles: 'tackles', saves: 'saves'
        };

        const mappedStats = { home: {}, away: {} };
        for (const side of ['home', 'away']) {
          for (const [geminiKey, localKey] of Object.entries(mappings)) {
            const val = response.data[side][geminiKey];
            mappedStats[side][localKey] = (val && val !== "-") ? parseInt(val, 10) : "";
          }
        }
        onApply(mappedStats);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-white/[0.04] transition-colors cursor-pointer">
      <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={loading} />
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="text-emerald-400 animate-spin mb-4" />
          <p className="font-bold text-white">Analyzing image...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-3">
            <Upload size={20} className="text-slate-400" />
          </div>
          <p className="font-bold text-sm text-white">Auto-fill from screenshot</p>
          <p className="text-xs text-slate-500 mt-1">Tap to upload or drag image</p>
          {error && <p className="text-xs text-rose-400 mt-3 font-bold bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats entry  ← redesigned to match the pro design mockup
// ---------------------------------------------------------------------------
const ProStatRow = ({ f, stats, update }) => {
  const homeVal = Number(stats.home[f.key]) || 0;
  const awayVal = Number(stats.away[f.key]) || 0;
  
  const total = homeVal + awayVal;
  const homePercent = total > 0 ? (homeVal / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayVal / total) * 100 : 50;

  const isAccuratePasses = f.key === "successfulPasses";
  const isPercent = f.format === "percent";

  let homeAccuracyStr = "";
  let awayAccuracyStr = "";
  if (isAccuratePasses) {
    const homeTotalPasses = Number(stats.home.passes) || 0;
    const awayTotalPasses = Number(stats.away.passes) || 0;
    const hAcc = homeTotalPasses > 0 ? Math.round((homeVal / homeTotalPasses) * 100) : 0;
    const aAcc = awayTotalPasses > 0 ? Math.round((awayVal / awayTotalPasses) * 100) : 0;
    homeAccuracyStr = ` (${hAcc}%)`;
    awayAccuracyStr = ` (${aAcc}%)`;
  }

  const boxWidthClasses = isAccuratePasses ? "w-20 sm:w-[96px]" : "w-14 sm:w-[72px]";

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-b border-white/[0.04] last:border-0 group">
      {/* Home value */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-[10px] bg-[#0a0c14]/50 border border-emerald-500/40 shadow-[0_0_10px_rgba(34,197,94,0.05)] focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/40 transition-all ${boxWidthClasses} h-10 sm:h-12`}>
        <input
          type="number"
          inputMode="numeric"
          value={stats.home[f.key]}
          onChange={(e) => update("home", f.key, e.target.value)}
          className={`w-full h-full bg-transparent outline-none font-score font-bold text-sm sm:text-base tabular-nums text-emerald-400 ${isAccuratePasses || isPercent ? 'text-right pr-1' : 'text-center'}`}
        />
        {(isAccuratePasses || isPercent) && (
          <span className="font-score font-bold text-[9px] sm:text-[11px] tabular-nums text-emerald-400 pr-2 whitespace-nowrap">
            {isPercent ? '%' : homeAccuracyStr}
          </span>
        )}
      </div>

      {/* Center Area */}
      <div className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0">
        {/* Icons and Label */}
        <div className="flex items-center justify-between px-1">
          <span className="text-slate-400 text-sm sm:text-base shrink-0 opacity-70">{f.icon}</span>
          <span className="flex-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-slate-300 truncate px-2 font-sans">{f.label}</span>
          <span className="text-slate-400 text-sm sm:text-base shrink-0 opacity-70">{f.icon}</span>
        </div>
        
        {/* Dual-color Progress Bar */}
        <div className="flex items-center h-1.5 sm:h-2 w-full gap-1 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-l-full" style={{ width: `${homePercent}%` }} />
          <div className="h-full bg-rose-600 transition-all duration-500 ease-out rounded-r-full" style={{ width: `${awayPercent}%` }} />
        </div>
      </div>

      {/* Away value */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-[10px] bg-[#0a0c14]/50 border border-rose-500/40 shadow-[0_0_10px_rgba(225,29,72,0.05)] focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/40 transition-all ${boxWidthClasses} h-10 sm:h-12`}>
        <input
          type="number"
          inputMode="numeric"
          value={stats.away[f.key]}
          onChange={(e) => update("away", f.key, e.target.value)}
          className={`w-full h-full bg-transparent outline-none font-score font-bold text-sm sm:text-base tabular-nums text-rose-400 ${isAccuratePasses || isPercent ? 'text-right pr-1' : 'text-center'}`}
        />
        {(isAccuratePasses || isPercent) && (
          <span className="font-score font-bold text-[9px] sm:text-[11px] tabular-nums text-rose-400 pr-2 whitespace-nowrap">
            {isPercent ? '%' : awayAccuracyStr}
          </span>
        )}
      </div>
    </div>
  );
};

function StatsEntry({ stats, setStats, onSave, onSkip, busy, homeObj, awayObj, homeScore, awayScore }) {
  const update = (side, key, val) => {
    const num = val === "" ? "" : Math.max(0, Number(val));
    setStats((s) => ({ ...s, [side]: { ...s[side], [key]: num } }));
  };

  const handleImportApply = (data) => {
    setStats(prev => {
      const merged = { home: { ...prev.home }, away: { ...prev.away } };
      Object.keys(data.home || {}).forEach(k => merged.home[k] = data.home[k] ?? prev.home[k]);
      Object.keys(data.away || {}).forEach(k => merged.away[k] = data.away[k] ?? prev.away[k]);
      return merged;
    });
  };

  const handleSwapStats = () => {
    setStats(prev => ({ home: { ...prev.away }, away: { ...prev.home } }));
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c14] font-sans">
      {/* Premium Header */}
      <div className="sticky top-0 z-20 bg-[#0a0c14]/95 backdrop-blur-xl px-4 sm:px-8 pt-6 pb-6 border-b border-white/[0.04]">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-emerald-400">MATCH STATS</h2>
          <button onClick={handleSwapStats} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-white/[0.05] border border-white/[0.08] text-xs font-bold text-slate-300 uppercase tracking-widest transition-all cursor-pointer">
            <ArrowLeftRight size={14} /> SWAP SIDES
          </button>
        </div>

        {/* Player Header Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Home player */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/[0.1] overflow-hidden bg-[#0d1117]">
                <Avatar p={homeObj} size={64} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-black truncate text-white uppercase tracking-wide" style={{ fontFamily: "'Sora', sans-serif" }}>
                {homeObj?.name || 'Home'}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 truncate">{homeObj?.favoriteClub || ''}</span>
            </div>
          </div>

          {/* Center STATISTIC text */}
          <div className="shrink-0 px-2 sm:px-4 text-center">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400">STATISTIC</span>
          </div>

          {/* Away player */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 justify-end">
            <div className="flex flex-col min-w-0 items-end">
              <span className="text-sm sm:text-base font-black truncate text-right text-white uppercase tracking-wide" style={{ fontFamily: "'Sora', sans-serif" }}>
                {awayObj?.name || 'Away'}
              </span>
              <span className="text-[10px] sm:text-xs text-rose-500/70 truncate">{awayObj?.favoriteClub || ''}</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)] shrink-0" />
            <div className="relative shrink-0">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/[0.1] overflow-hidden bg-[#0d1117]">
                <Avatar p={awayObj} size={64} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-8 flex-1 overflow-y-auto pb-36 bg-[#0a0c14]">
        {/* Image Import (above stats) */}
        <div className="py-6">
          <ImageImport onApply={handleImportApply} />
        </div>

        {/* Stats Rows List */}
        <div className="flex flex-col">
          {STAT_FIELDS.map((f) => (
            <ProStatRow key={f.key} f={f} stats={stats} update={update} />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar - Centered Action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0c14]/95 backdrop-blur-xl border-t border-white/[0.05] px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* We keep both buttons but style them cleanly */}
        <button
          onClick={onSkip}
          disabled={busy}
          className="w-full sm:w-auto min-w-[200px] h-12 sm:h-14 flex items-center justify-center gap-2 rounded-xl bg-[#0d1117] hover:bg-white/[0.05] border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-[0.1em] transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.1)]"
        >
          <ArrowLeft size={16} /> BACK TO MATCH
        </button>
        <button
          onClick={onSave}
          disabled={busy}
          className="w-full sm:w-auto min-w-[200px] h-12 sm:h-14 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm uppercase tracking-[0.1em] transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(52,211,153,0.6)] active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
          FINISH MATCH
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Published
// ---------------------------------------------------------------------------
function StatRow({ label, value, percent }) {
  const [h, a] = value;
  const total = h + a;
  const homeWidth = total > 0 ? (h / total) * 100 : 50;
  const awayWidth = total > 0 ? (a / total) * 100 : 50;
  
  const homeWins = h > a;
  const awayWins = a > h;
  const isDraw = h === a;
  const bothZero = h === 0 && a === 0;

  const hTextColor = homeWins ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'text-slate-500';
  const aTextColor = awayWins ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'text-slate-500';
  
  const hBarColor = homeWins || (isDraw && !bothZero) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-[#0f2e22]'; 
  const aBarColor = awayWins || (isDraw && !bothZero) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-[#0f2e22]'; 

  return (
    <div className="flex flex-col gap-2 mb-6 last:mb-0 group">
      <div className="flex items-center justify-between px-1">
        <span className={`font-score text-base sm:text-lg font-black tabular-nums transition-colors w-12 text-left ${hTextColor}`}>{h}{percent && "%"}</span>
        <span className="flex-1 text-center font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-300">{label}</span>
        <span className={`font-score text-base sm:text-lg font-black tabular-nums transition-colors w-12 text-right ${aTextColor}`}>{a}{percent && "%"}</span>
      </div>
      <div className="flex items-center h-1.5 w-full gap-1 rounded-full overflow-hidden">
        {bothZero ? (
          <div className="w-full h-full bg-[#0f2e22]" />
        ) : (
          <>
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${homeWidth}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-l-full ${hBarColor}`} />
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${awayWidth}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-r-full ${aBarColor}`} />
          </>
        )}
      </div>
    </div>
  );
}

function Published({ state, stats, resultType, shootoutWinner, onClose }) {
  const [expanded, setExpanded] = useState(true);
  const { home, away } = state;
  const winner = home.goals > away.goals ? home.name : away.goals > home.goals ? away.name : shootoutWinner ? (shootoutWinner === "home" ? home.name : away.name) : null;
  const hasStats = STAT_FIELDS.some((f) => stats.home[f.key] !== "" || stats.away[f.key] !== "");

  const summaryMap = {
    normal_time: winner ? `${winner} win ${home.goals}–${away.goals}` : `Draw ${home.goals}-${away.goals}`,
    extra_time: winner ? `${winner} win ${home.goals}–${away.goals} after extra time` : `Draw ${home.goals}-${away.goals} after extra time`,
    penalties: `${winner} win on penalties, after a ${home.goals}–${away.goals} draw`,
  };
  const summary = summaryMap[resultType] || "Match Finished";
  const columns = [STAT_FIELDS.slice(0, Math.ceil(STAT_FIELDS.length / 2)), STAT_FIELDS.slice(Math.ceil(STAT_FIELDS.length / 2))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-[#0d1117] rounded-xl border border-white/[0.06] shadow-sm overflow-hidden mb-6">
        <button onClick={() => hasStats && setExpanded((o) => !o)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors cursor-pointer">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Result published</p>
            <p className="text-sm font-medium text-white">{summary}</p>
          </div>
          {hasStats && <ChevronDown size={20} className={`text-slate-500 transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`} />}
        </button>
        <AnimatePresence initial={false}>
          {hasStats && expanded && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 border-t border-white/[0.04] bg-[#0a0c14]">
                {columns.map((col, ci) => (
                  <div key={ci} className="flex flex-col">
                    {col.map((f) => <StatRow key={f.key} label={f.label} percent={f.percent} value={[Number(stats.home[f.key]) || 0, Number(stats.away[f.key]) || 0]} />)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ActionButton label="Close Match Control" onClick={onClose} variant="secondary" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
let scoreTimeoutId = null;

export default function LiveMatchControl({ matches, players, activeSeason, showToast }) {
  const [phase, setPhase] = useState("live");
  const [showDrawDecision, setShowDrawDecision] = useState(false);
  const [etHalf, setEtHalf] = useState(1);
  const [kicks, setKicks] = useState([]);
  const [shootoutWinner, setShootoutWinner] = useState(null);
  const [resultType, setResultType] = useState(null);

  const emptyStats = Object.fromEntries(STAT_FIELDS.map((f) => [f.key, ""]));
  const [stats, setStats] = useState({ home: { ...emptyStats }, away: { ...emptyStats } });

  const [saving, setSaving] = useState(false);
  const [finishedDataCache, setFinishedDataCache] = useState(null);

  const serverLiveMatch = matches.find(m => m.status === 'live');
  const [optLiveMatch, setOptLiveMatch] = useState(null);

  const isPostMatch = ['stats', 'done'].includes(phase);
  const liveMatch = isPostMatch ? (finishedDataCache?.match || optLiveMatch || serverLiveMatch) : (optLiveMatch || serverLiveMatch);
  const nextMatch = matches.find(m => m.status === 'scheduled' && m.seasonId === activeSeason?.id);
  const currentLiveMatchHash = `${liveMatch?.id}-${liveMatch?.homeScore}-${liveMatch?.awayScore}-${liveMatch?.liveState?.paused}`;

  const byId = Object.fromEntries((players || []).map((p) => [p.id, p]));
  const initMatch = optLiveMatch || serverLiveMatch;
  const hInit = initMatch ? byId[initMatch.homeId] : null;
  const aInit = initMatch ? byId[initMatch.awayId] : null;

  const [state, setState] = useState({
    home: { name: hInit?.name || "Home", avatarImage: hInit?.avatarImage || null, avatar: hInit?.avatar || null, goals: initMatch?.homeScore || 0, penalties: 0 },
    away: { name: aInit?.name || "Away", avatarImage: aInit?.avatarImage || null, avatar: aInit?.avatar || null, goals: initMatch?.awayScore || 0, penalties: 0 },
    paused: initMatch?.liveState?.paused || false,
  });

  const [isMutatingScore, setIsMutatingScore] = useState(false);
  const [prevLiveMatchHash, setPrevLiveMatchHash] = useState(currentLiveMatchHash);
  const [prevServerMatchId, setPrevServerMatchId] = useState(serverLiveMatch?.id);

  if (serverLiveMatch?.id !== prevServerMatchId) {
    setPrevServerMatchId(serverLiveMatch?.id);
    if (serverLiveMatch && optLiveMatch && serverLiveMatch.id === optLiveMatch.id) setOptLiveMatch(null);
  }

  if (currentLiveMatchHash !== prevLiveMatchHash) {
    setPrevLiveMatchHash(currentLiveMatchHash);
    if (liveMatch && !isMutatingScore && !isPostMatch) {
      const h = byId[liveMatch.homeId];
      const a = byId[liveMatch.awayId];
      setState(prev => ({
        ...prev,
        home: { ...prev.home, name: h?.name || "Home", avatarImage: h?.avatarImage || null, avatar: h?.avatar || null, goals: liveMatch.homeScore || 0 },
        away: { ...prev.away, name: a?.name || "Away", avatarImage: a?.avatarImage || null, avatar: a?.avatar || null, goals: liveMatch.awayScore || 0 },
        paused: liveMatch.liveState?.paused || false
      }));
    }
  }

  if (!activeSeason) return null;

  const startNextMatch = async () => {
    if (!nextMatch) return;
    setPhase("live"); setShowDrawDecision(false); setEtHalf(1); setKicks([]); setShootoutWinner(null); setResultType(null); setStats({ home: { ...emptyStats }, away: { ...emptyStats } }); setFinishedDataCache(null);
    const h = byId[nextMatch.homeId]; const a = byId[nextMatch.awayId];
    setState({ home: { name: h?.name || "Home", avatarImage: h?.avatarImage || null, avatar: h?.avatar || null, goals: 0, penalties: 0 }, away: { name: a?.name || "Away", avatarImage: a?.avatarImage || null, avatar: a?.avatar || null, goals: 0, penalties: 0 }, paused: false });
    const optLiveMatchData = { ...nextMatch, status: 'live', homeScore: 0, awayScore: 0, liveState: { phase: 'first', paused: false, clock: 0 } };
    setOptLiveMatch(optLiveMatchData);
    supabase.channel('league-events').send({ type: 'broadcast', event: 'match_update', payload: optLiveMatchData });
    const res = await updateMatchStatus(nextMatch.id, { status: 'live', liveState: { phase: 'first', paused: false, clock: 0 }, homeScore: 0, awayScore: 0 });
    if (res.error) { setOptLiveMatch(null); showToast(res.error); } else { showToast("Match Started!"); }
  };

  const handleSetState = (updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (liveMatch && !isPostMatch) {
        if (next.home.goals !== prev.home.goals || next.away.goals !== prev.away.goals) {
          const newHome = next.home.goals; const newAway = next.away.goals;
          setIsMutatingScore(true); clearTimeout(scoreTimeoutId); scoreTimeoutId = setTimeout(() => { setIsMutatingScore(false); }, 3000);
          const optMatch = { ...liveMatch, homeScore: newHome, awayScore: newAway };
          supabase.channel('league-events').send({ type: 'broadcast', event: 'match_update', payload: optMatch });
          updateMatchScore(liveMatch.id, newHome, newAway).then(res => { if (res?.error) showToast(res.error); });
        }
      }
      return next;
    });
  };

  const handleTogglePause = async () => {
    if (!liveMatch) return;
    const isPaused = !state.paused; handleSetState(s => ({ ...s, paused: isPaused }));
    const res = await updateMatchStatus(liveMatch.id, { ...liveMatch, liveState: { ...liveMatch.liveState, paused: isPaused } });
    if (res.error) showToast(res.error);
    supabase.channel('league-events').send({ type: 'broadcast', event: 'match_update', payload: { ...liveMatch, liveState: { ...liveMatch.liveState, paused: isPaused } } });
  };

  const handleUndoStart = async () => {
    if (!liveMatch) return;
    if (state.home.goals > 0 || state.away.goals > 0) { showToast("Cannot undo start after a goal is scored."); return; }
    const res = await updateMatchStatus(liveMatch.id, { status: 'scheduled', homeScore: null, awayScore: null, liveState: null });
    if (res.error) { showToast(res.error); } else { showToast("Match reverted to scheduled."); setOptLiveMatch(null); setPhase("live"); supabase.channel('league-events').send({ type: 'broadcast', event: 'match_update', payload: { ...liveMatch, status: 'scheduled' } }); }
  };

  const isLevel = () => state.home.goals === state.away.goals;
  const handleChooseDraw = () => { setShowDrawDecision(false); setResultType("normal_time"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); };
  const handleChooseExtraTime = () => { setShowDrawDecision(false); setEtHalf(1); setPhase("extra_time"); };
  const handleFinishFullTime = () => { if (!isLevel()) { setResultType("normal_time"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); return; } setShowDrawDecision(true); };
  const handleEndExtraTime = () => { if (!isLevel()) { setResultType("extra_time"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); } else setPhase("shootout"); };
  const handleShootoutDecided = (winner) => { setShootoutWinner(winner); setResultType("penalties"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); };

  const finalizeMatch = async (forceSkipStats = false) => {
    if (!liveMatch) return; setSaving(true);
    const finalStatsObj = {};
    Object.keys(stats.home).forEach(key => { finalStatsObj[key] = { a: forceSkipStats ? 0 : (Number(stats.home[key]) || 0), b: forceSkipStats ? 0 : (Number(stats.away[key]) || 0) }; });
    const penaltyHome = kicks.filter((k) => k.side === "home" && k.result === "scored").length;
    const penaltyAway = kicks.filter((k) => k.side === "away" && k.result === "scored").length;
    const wentToExtra = phase === "extra_time" || phase === "shootout" || resultType === "extra_time" || resultType === "penalties";

    const finalData = { homeScore: state.home.goals, awayScore: state.away.goals, stats: finalStatsObj, wentToExtra, penaltyHome: resultType === "penalties" ? penaltyHome : null, penaltyAway: resultType === "penalties" ? penaltyAway : null, penaltyWinner: shootoutWinner, resultType };
    const response = await fetch('/api/matches/' + liveMatch.id + '/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalData) });
    const data = await response.json(); setSaving(false);
    if (data.error) { showToast(data.error); } else { showToast("Match completed & stats saved!"); setPhase("done"); }
  };

  const handleCopyFixture = () => {
    const text = `${state.home.name} vs ${state.away.name} (Only full fixtures, which player play with which player only)`;
    navigator.clipboard.writeText(`${state.home.name} vs ${state.away.name}`);
    showToast("Fixture copied to clipboard!");
  };

  const headerFor = () => {
    if (phase === "live") return { title: "Live Match Control", status: state.paused ? "PAUSED" : "LIVE • 1ST HALF" };
    if (phase === "extra_time") return { title: "Extra Time", status: `ET • HALF ${etHalf}` };
    if (phase === "shootout") return { title: "Penalty Shootout", status: "SHOOTOUT" };
    if (phase === "stats") return { title: "Match Statistics", status: "FULL TIME" };
    return { title: "Match Result", status: "PUBLISHED" };
  };

  // Pass player objects for supporter clubs
  const homePlayerObj = byId[liveMatch?.homeId || finishedDataCache?.match?.homeId] || state.home;
  const awayPlayerObj = byId[liveMatch?.awayId || finishedDataCache?.match?.awayId] || state.away;

  if (!liveMatch && !isPostMatch) {
    return (
      <div className="relative w-full mb-8 mt-2">
        <div className="p-8 flex flex-col items-center justify-center gap-4 bg-[#0a0c14] border border-dashed border-white/[0.08] rounded-2xl">
          <div className="p-4 rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-500">
            <Calendar size={32} />
          </div>
          <div className="font-bold text-sm tracking-widest uppercase text-slate-500 text-center">No Live Match In Progress</div>
          {nextMatch ? <ActionButton label="Start Next Match" onClick={startNextMatch} variant="primary" /> : <div className="text-xs text-slate-600">All scheduled matches are completed.</div>}
        </div>
      </div>
    );
  }

  const h = headerFor();

  return (
    <div className="relative w-full mb-8 font-sans group mt-2">
      {/* Animated Glowing Gradient Border */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-rose-500 rounded-2xl sm:rounded-[24px] opacity-20 group-hover:opacity-40 blur-md transition-opacity duration-700 animate-pulse" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-rose-500/30 rounded-2xl sm:rounded-[24px] opacity-40 z-0" />

      <div className="relative z-10 w-full bg-[#0a0c14] rounded-2xl sm:rounded-[23px] overflow-hidden border border-white/[0.06] shadow-2xl">
        <CardHeader title={h.title} status={h.status} onCopyFixture={handleCopyFixture} />

        <ScoreRow home={state.home.name} away={state.away.name} homeScore={state.home.goals} awayScore={state.away.goals} homeObj={homePlayerObj} awayObj={awayPlayerObj} />
        <StepIndicator phase={phase} />

        <main className="relative bg-[#080a10] min-h-[400px]">
          {/* Subtle background glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg max-h-[32rem] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${["extra_time", "shootout"].includes(phase) ? 'bg-gradient-to-br from-amber-500/10 to-rose-500/10 animate-pulse' : 'bg-emerald-500/[0.03]'}`} />

          {showDrawDecision && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a0c14]/90 backdrop-blur-sm rounded-b-2xl sm:rounded-b-3xl">
              <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl p-6 sm:p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-2">Match is Level!</h2>
                <p className="text-sm font-medium text-slate-400 mb-6">How would you like to resolve this match?</p>
                <div className="flex flex-col gap-3 w-full">
                  <ActionButton label="Finish as Draw" onClick={handleChooseDraw} variant="secondary" />
                  <ActionButton label="Go to Extra Time" onClick={handleChooseExtraTime} variant="primary" />
                </div>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {phase === "live" && <LiveControl state={state} setState={handleSetState} onTogglePause={handleTogglePause} onFinish={handleFinishFullTime} onUndoStart={handleUndoStart} />}
              {phase === "extra_time" && <ExtraTime state={state} setState={handleSetState} etHalf={etHalf} setEtHalf={setEtHalf} onDone={handleEndExtraTime} />}
              {phase === "shootout" && <Shootout home={state.home} away={state.away} kicks={kicks} setKicks={setKicks} onDecided={handleShootoutDecided} />}
              {phase === "stats" && <StatsEntry stats={stats} setStats={setStats} busy={saving} onSave={() => finalizeMatch(false)} onSkip={() => finalizeMatch(true)} homeObj={byId[liveMatch?.homeId || finishedDataCache?.match?.homeId]} awayObj={byId[liveMatch?.awayId || finishedDataCache?.match?.awayId]} homeScore={state.home.goals} awayScore={state.away.goals} />}
              {phase === "done" && <Published state={state} stats={stats} resultType={resultType} shootoutWinner={shootoutWinner} onClose={() => { setPhase("live"); setOptLiveMatch(null); setFinishedDataCache(null); }} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Back to Match button */}
        {!["live", "done"].includes(phase) && (
          <div className="px-6 pb-4 pt-2 flex justify-center bg-[#080a10] relative z-10">
            <button onClick={() => { setPhase("live"); setKicks([]); setShootoutWinner(null); setResultType(null); }} className="text-xs font-bold tracking-wider uppercase text-slate-500 hover:text-white transition-colors py-2 px-4 rounded-lg bg-white/[0.03] border border-white/[0.06] shadow-sm cursor-pointer hover:bg-white/[0.06]">← Back to Match</button>
          </div>
        )}

        {/* Decorative Footer */}
        <MatchFooter />
      </div>
    </div>
  );
}
