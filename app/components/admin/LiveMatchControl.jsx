import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Minus, Play, Pause, Square, SkipForward, Check, X, ChevronDown,
  Timer, Calendar, Upload, Loader2, ImageOff, ArrowLeftRight, RotateCcw
} from "lucide-react";
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';
import { Btn, MagicCard, Avatar } from '@/app/components/shared/UI';
import { MatchStatsPreview } from '@/app/components/admin/AdminConsole';
import { extractMatchStats } from '@/app/actions/extractStats';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Stat fields
// ---------------------------------------------------------------------------
const STAT_FIELDS = [
  { key: "possession", label: "Possession", percent: true },
  { key: "shots", label: "Shots" },
  { key: "shotsOnTarget", label: "Shots on Target" },
  { key: "fouls", label: "Fouls" },
  { key: "offsides", label: "Offsides" },
  { key: "corners", label: "Corner kicks" },
  { key: "freeKicks", label: "Free kicks" },
  { key: "passes", label: "Passes" },
  { key: "successfulPasses", label: "Successful Passes" },
  { key: "crosses", label: "Crosses" },
  { key: "interceptions", label: "Interceptions" },
  { key: "tackles", label: "Tackles" },
  { key: "saves", label: "Saves" },
];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// ---------------------------------------------------------------------------
// Card chrome
// ---------------------------------------------------------------------------
function CardHeader({ title, status, tone }) {
  const tones = { 
    rose: "bg-claret-dim/10 text-claret border-claret/20 shadow-[inset_0_0_10px_rgba(178,58,72,0.1)]", 
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]", 
    emerald: "bg-pitch/10 text-pitch-bright border-pitch/20 shadow-[inset_0_0_10px_rgba(41,193,121,0.1)]", 
    paused: "bg-zinc-900/80 text-amber-500 border-zinc-700 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]" 
  };
  const dotTones = { 
    rose: "bg-claret shadow-[0_0_8px_rgba(178,58,72,0.8)]", 
    amber: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]", 
    emerald: "bg-pitch-bright shadow-[0_0_8px_rgba(41,193,121,0.8)]", 
    paused: "bg-amber-500" 
  };
  const isLive = tone === "rose" && status.includes("LIVE");
  
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50 bg-card/50 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-pitch/20 to-pitch/5 border border-pitch/20 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
          <Play size={15} className="fill-pitch-bright text-pitch-bright drop-shadow-[0_0_5px_rgba(41,193,121,0.5)]" />
        </div>
        <h1 className="text-[17px] font-bold text-foreground tracking-tight">{title}</h1>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border backdrop-blur-md transition-all duration-300 ${tones[tone]}`}>
        <span className="relative flex h-2 w-2">
          {isLive && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotTones[tone].split(' ')[0]}`} />}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotTones[tone]}`} />
        </span>
        {status}
      </div>
    </div>
  );
}

function ScoreNumber({ score, colorClass }) {
  return (
    <motion.div
      key={score}
      initial={{ scale: 1.4, opacity: 0, y: -10, filter: 'brightness(2)' }}
      animate={{ scale: 1, opacity: 1, y: 0, filter: 'brightness(1)' }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`${colorClass}`}
    >
      {score}
    </motion.div>
  );
}

function ScoreRow({ home, away, homeScore, awayScore, homeObj, awayObj, paused, isLive }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 pb-6 pt-4 border-b border-white/5">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-pitch/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-claret/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      
      <div className="relative flex flex-col items-center px-6">
        <div className="flex items-center justify-center gap-6 sm:gap-10 w-full max-w-2xl mx-auto">
          {/* Home */}
          <div className="flex flex-col items-center gap-3 flex-1 group">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-zinc-900 text-zinc-50 border-[3px] border-pitch shadow-[0_0_25px_rgba(41,193,121,0.3)] group-hover:shadow-[0_0_35px_rgba(41,193,121,0.5)] group-hover:scale-105 transition-all duration-300 overflow-hidden z-10">
              <Avatar p={homeObj} size={80} className="w-full h-full object-cover" />
              <div className="absolute inset-0 rounded-full ring-inset ring-2 ring-white/10 pointer-events-none" />
            </div>
            <span className="text-sm sm:text-base font-bold text-zinc-50 text-center leading-tight tracking-wide drop-shadow-md">{home}</span>
          </div>
          
          {/* Score */}
          <div className="flex flex-col items-center justify-center min-w-[140px] sm:min-w-[180px] z-10">
            <div className="flex items-center justify-center w-full text-5xl sm:text-7xl font-black font-score tabular-nums tracking-tighter text-zinc-50 drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)] bg-clip-text">
              <div className="flex-1 flex justify-end pr-4 sm:pr-6"><ScoreNumber score={homeScore} colorClass="text-pitch-bright drop-shadow-[0_0_15px_rgba(41,193,121,0.4)]" /></div>
              <span className="text-zinc-600 font-medium pb-1 sm:pb-3 text-4xl sm:text-6xl flex-none">-</span>
              <div className="flex-1 flex justify-start pl-4 sm:pl-6"><ScoreNumber score={awayScore} colorClass="text-claret drop-shadow-[0_0_15px_rgba(178,58,72,0.4)]" /></div>
            </div>
          </div>
          
          {/* Away */}
          <div className="flex flex-col items-center gap-3 flex-1 group">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-zinc-900 text-zinc-50 border-[3px] border-claret shadow-[0_0_25px_rgba(178,58,72,0.3)] group-hover:shadow-[0_0_35px_rgba(178,58,72,0.5)] group-hover:scale-105 transition-all duration-300 overflow-hidden z-10">
              <Avatar p={awayObj} size={80} className="w-full h-full object-cover" />
              <div className="absolute inset-0 rounded-full ring-inset ring-2 ring-white/10 pointer-events-none" />
            </div>
            <span className="text-sm sm:text-base font-bold text-zinc-50 text-center leading-tight tracking-wide drop-shadow-md">{away}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ phase }) {
  const order = ["live", "extra_time", "shootout", "stats", "done"];
  const steps = [
    { key: "live", label: "Match" },
    { key: "extra_time", label: "Extra Time" },
    { key: "shootout", label: "Penalties" },
    { key: "stats", label: "Stats" },
    { key: "done", label: "Published" },
  ];
  const currentIdx = order.indexOf(phase);
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-4">
      <div className="flex sm:hidden flex-col items-center justify-center gap-1 mb-2">
        <span className="text-[10px] font-bold text-pitch-bright uppercase tracking-widest">Phase {currentIdx + 1} of {steps.length}</span>
        <span className="text-xs font-black text-foreground">{steps.find(s => s.key === phase)?.label}</span>
      </div>
      <div className="hidden sm:flex items-center justify-between w-full relative">
        {steps.map((s, i) => {
          const idx = order.indexOf(s.key);
          const active = idx === currentIdx;
          const done = idx < currentIdx;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1.5 relative z-10 w-14">
                <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] transition-all duration-500 ease-out flex items-center justify-center ${active ? "bg-pitch border-pitch-bright shadow-[0_0_12px_rgba(41,193,121,0.8)] scale-125 ring-4 ring-pitch/20" : done ? "bg-pitch-bright border-pitch-bright" : "bg-zinc-800 border-zinc-700"}`}>
                   {done && <Check size={8} className="text-zinc-950 font-bold" />}
                </div>
                <span className={`text-[10px] tracking-widest uppercase text-center absolute top-6 transition-all duration-300 whitespace-nowrap ${active ? "text-foreground font-bold drop-shadow-md" : done ? "text-muted-foreground font-medium" : "text-muted-foreground/50 font-medium"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-zinc-800/50 relative rounded-full overflow-hidden shadow-inner">
                  <div className={`absolute left-0 top-0 h-full bg-gradient-to-r from-pitch to-pitch-bright transition-all duration-700 ease-out`} style={{ width: done ? '100%' : '0%' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepper control + team card
// ---------------------------------------------------------------------------
function StepperRow({ label, count, accent, onInc, onDec, isMuted }) {
  const accents = {
    pitch: { 
      text: "text-pitch-bright", 
      btn: "bg-pitch-bright/10 hover:bg-pitch-bright/20 text-pitch-bright border-pitch-bright/30 shadow-[0_4px_10px_rgba(41,193,121,0.15)]",
      bg: "bg-pitch/5 border-pitch/20",
      dot: "bg-pitch-bright shadow-[0_0_5px_rgba(41,193,121,0.8)]"
    },
    blue: { 
      text: "text-blue-400", 
      btn: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_4px_10px_rgba(59,130,246,0.15)]",
      bg: "bg-blue-500/5 border-blue-500/20",
      dot: "bg-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.8)]"
    },
    rose: {
      text: "text-claret", 
      btn: "bg-claret/10 hover:bg-claret/20 text-claret border-claret/30 shadow-[0_4px_10px_rgba(178,58,72,0.15)]",
      bg: "bg-claret/5 border-claret/20",
      dot: "bg-claret shadow-[0_0_5px_rgba(178,58,72,0.8)]"
    }
  };
  const a = accents[accent];
  
  if (isMuted) {
    return (
      <div className={`flex flex-col gap-2 rounded-2xl bg-card/30 border border-border/30 p-3 transition-all duration-300 opacity-50 hover:opacity-80 backdrop-blur-sm`}>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center justify-center gap-3 px-2">
          <button onClick={onDec} className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-muted-foreground transition-all active:scale-95"><Minus size={16} /></button>
          <div className="flex-1 text-center font-black tabular-nums text-2xl text-muted-foreground/80">{count}</div>
          <button onClick={onInc} className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-muted-foreground transition-all active:scale-95"><Plus size={16} /></button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col gap-2 rounded-2xl ${a.bg} border p-3 backdrop-blur-xl transition-all duration-300 shadow-lg group`}>
      <div className="flex items-center justify-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${a.dot} animate-pulse`} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      </div>
      <div className="flex items-center justify-center gap-3 px-2">
        <button onClick={onDec} className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/50 text-muted-foreground hover:text-foreground transition-all active:scale-90 shadow-inner backdrop-blur-sm"><Minus size={20} /></button>
        <div className={`flex-1 text-center font-black tabular-nums text-4xl sm:text-5xl tracking-tighter drop-shadow-md ${a.text}`}>{count}</div>
        <button onClick={onInc} className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-[inset_0_2px_5px_rgba(255,255,255,0.1)] backdrop-blur-md ${a.btn}`}><Plus size={20} /></button>
      </div>
    </div>
  );
}

function TeamStatCard({ accent, side, data, bump, phase }) {
  const isShootout = phase === 'shootout';
  return (
    <div className="flex flex-col gap-4 w-full">
      <StepperRow label="Goals" count={data.goals} accent={accent} onInc={() => bump(side, "goals", 1)} onDec={() => bump(side, "goals", -1)} isMuted={isShootout} />
      <StepperRow label="Penalties" count={data.penalties} accent="blue" onInc={() => bump(side, "penalties", 1)} onDec={() => bump(side, "penalties", -1)} isMuted={!isShootout} />
    </div>
  );
}

function LiveControl({ state, setState, onFinish, onTogglePause, onUndoStart }) {
  const { home, away, paused } = state;
  const canUndo = home.goals === 0 && away.goals === 0;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="px-6 pb-8">
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8 max-w-3xl mx-auto">
        <TeamStatCard accent="pitch" side="home" data={home} bump={bump} phase="live" />
        <TeamStatCard accent="rose" side="away" data={away} bump={bump} phase="live" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto items-center">
        {canUndo && (
          <button onClick={onUndoStart}
            className="h-12 sm:h-14 w-full sm:w-auto px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 active:scale-95 shadow-md bg-zinc-900/50 hover:bg-zinc-800 text-muted-foreground hover:text-foreground border border-zinc-700/50 backdrop-blur-md">
            <RotateCcw size={18} />Undo Start
          </button>
        )}
        <button onClick={onTogglePause}
          className={`h-12 sm:h-14 w-full sm:w-56 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg backdrop-blur-md ${
            paused 
            ? "bg-pitch-bright/10 hover:bg-pitch-bright/20 text-pitch-bright border border-pitch-bright/30 shadow-[inset_0_2px_10px_rgba(41,193,121,0.1)]" 
            : "bg-zinc-800 hover:bg-zinc-700 text-foreground border border-zinc-600 shadow-inner"
          }`}>
          {paused ? <Play size={18} className="fill-pitch-bright" /> : <Pause size={18} className="fill-zinc-50" />}
          {paused ? "Resume Match" : "Pause Match"}
        </button>
        <button onClick={onFinish}
          className="h-12 sm:h-14 w-full sm:w-64 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-all duration-200 active:scale-95 shadow-[0_4px_15px_rgba(220,38,38,0.15)] backdrop-blur-md">
          <Square size={18} className="fill-destructive" />Finish Match
        </button>
      </div>
    </div>
  );
}

function ExtraTime({ state, setState, etHalf, setEtHalf, onDone }) {
  const { home, away } = state;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="px-6 pb-8">
      <div className="flex items-center justify-center gap-2 mb-8 bg-amber-500/10 w-fit mx-auto px-4 py-2 rounded-full border border-amber-500/20 backdrop-blur-md shadow-lg shadow-amber-500/5">
        <Timer size={18} className="text-amber-500 animate-pulse" />
        <span className="text-sm font-bold text-amber-500 tracking-wider uppercase">Extra Time — {etHalf === 1 ? "1st Half (15')" : "2nd Half (15')"}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8 max-w-3xl mx-auto">
        <TeamStatCard accent="pitch" side="home" data={home} bump={bump} phase="extra_time" />
        <TeamStatCard accent="rose" side="away" data={away} bump={bump} phase="extra_time" />
      </div>
      <div className="flex justify-center max-w-xl mx-auto">
        {etHalf === 1 ? (
          <button onClick={() => setEtHalf(2)}
            className="h-14 w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-all duration-200 active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.15)] backdrop-blur-md">
            Start 2nd Half of Extra Time
          </button>
        ) : (
          <button onClick={onDone}
            className="h-14 w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-all duration-200 active:scale-95 shadow-[0_4px_15px_rgba(220,38,38,0.15)] backdrop-blur-md">
            <Square size={18} className="fill-destructive" />End Extra Time
          </button>
        )}
      </div>
    </div>
  );
}

const KickTrack = ({ list }) => (
  <div className="flex gap-2 flex-wrap justify-center">
    {Array.from({ length: Math.max(5, list.length) }).map((_, i) => {
      const k = list[i];
      if (!k) {
        return (
          <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-700/50 bg-zinc-900/30 flex items-center justify-center text-xs text-zinc-600 font-bold shadow-inner">
            {i + 1}
          </div>
        );
      }
      const scored = k.result === "scored";
      return (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm leading-none shadow-lg ${scored ? "bg-pitch-bright border border-pitch-bright/50 shadow-[0_0_10px_rgba(41,193,121,0.5)]" : "bg-zinc-800 border border-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-claret"}`}
          title={scored ? "Scored" : "Missed"}
        >
          {scored ? "⚽" : "❌"}
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
    <div className="px-6 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 bg-card border border-border/50 rounded-xl p-3 shadow-sm backdrop-blur-md">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{inSuddenDeath ? "Sudden death" : `Round ${round} of 5`}</span>
        {!decided && (
          <span className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${kicker === "home" ? "text-pitch-bright" : "text-claret"}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${kicker === "home" ? "bg-pitch-bright" : "bg-claret"}`} />
            {kicker === "home" ? home.name : away.name} to kick
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl p-4 sm:p-5 bg-card/80 border border-border/50 backdrop-blur-xl shadow-lg relative overflow-hidden">
          {kicker === "home" && !decided && <div className="absolute inset-0 bg-pitch/5 border-2 border-pitch-bright/30 rounded-2xl pointer-events-none" />}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
            <span className="text-sm font-bold text-foreground truncate">{home.name}</span>
            <span className="text-2xl font-black tabular-nums text-pitch-bright drop-shadow-md">{homeScore}</span>
          </div>
          <KickTrack list={homeKicks} />
        </div>
        <div className="rounded-2xl p-4 sm:p-5 bg-card/80 border border-border/50 backdrop-blur-xl shadow-lg relative overflow-hidden">
          {kicker === "away" && !decided && <div className="absolute inset-0 bg-claret/5 border-2 border-claret/30 rounded-2xl pointer-events-none" />}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
            <span className="text-sm font-bold text-foreground truncate">{away.name}</span>
            <span className="text-2xl font-black tabular-nums text-claret drop-shadow-md">{awayScore}</span>
          </div>
          <KickTrack list={awayKicks} />
        </div>
      </div>
      {!decided ? (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => record("scored")} className="h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-base bg-pitch/20 hover:bg-pitch/30 text-pitch-bright border border-pitch/30 transition-all duration-200 active:scale-95 shadow-[0_4px_20px_rgba(41,193,121,0.15)] backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-pitch-bright/20 flex items-center justify-center"><Check size={18} className="text-pitch-bright" /></div> Scored
          </button>
          <button onClick={() => record("missed")} className="h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-base bg-claret/10 hover:bg-claret/20 text-claret border border-claret/30 transition-all duration-200 active:scale-95 shadow-[0_4px_20px_rgba(178,58,72,0.15)] backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-claret/20 flex items-center justify-center"><X size={18} className="text-claret" /></div> Missed
          </button>
        </div>
      ) : (
        <div className="text-center bg-card/80 border border-border/50 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <p className="text-base sm:text-lg mb-6 text-foreground">
            <span className={`font-black tracking-wide ${decided === "home" ? "text-pitch-bright" : "text-claret"}`}>{decided === "home" ? home.name : away.name}</span> win the shootout {decided === "home" ? homeScore : awayScore}–{decided === "home" ? awayScore : homeScore}.
          </p>
          <button onClick={() => onDecided(decided)} className="w-full sm:w-auto px-10 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-base bg-pitch-bright hover:bg-emerald-400 text-stadium-base transition-all duration-200 active:scale-95 shadow-[0_4px_20px_rgba(41,193,121,0.3)] mx-auto">Continue <SkipForward size={18} /></button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image import (uses local proxy endpoint to Gemini API)
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
          possession: 'possession',
          shots: 'shots',
          shots_on_target: 'shotsOnTarget',
          fouls: 'fouls',
          offsides: 'offsides',
          corner_kicks: 'corners',
          free_kicks: 'freeKicks',
          passes: 'passes',
          successful_passes: 'successfulPasses',
          crosses: 'crosses',
          interceptions: 'interceptions',
          tackles: 'tackles',
          saves: 'saves'
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
    <div className="mb-6 rounded-2xl border-2 border-dashed border-border/50 bg-card/30 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-pitch-bright/50 hover:bg-card/50 transition-all duration-300 backdrop-blur-md cursor-pointer shadow-sm">
      <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={loading} />
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="text-pitch-bright animate-spin mb-4 drop-shadow-md" />
          <p className="text-sm font-bold text-foreground">Analyzing image...</p>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">Extracting stats with AI (this takes a few seconds)</p>
        </div>
      ) : (
        <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
          <div className="w-14 h-14 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:bg-pitch/20 group-hover:border-pitch/30 group-hover:shadow-[0_0_15px_rgba(41,193,121,0.2)] transition-all duration-300">
            <Upload size={24} className="text-muted-foreground group-hover:text-pitch-bright transition-colors" />
          </div>
          <p className="text-sm font-bold text-foreground">Auto-fill from screenshot</p>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">Tap or drag a scoreboard image here</p>
          {error && <p className="text-xs text-claret mt-4 font-bold flex items-center gap-1.5 bg-claret/10 border border-claret/20 px-4 py-2 rounded-full shadow-sm"><X size={14}/> {error}</p>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats entry
// ---------------------------------------------------------------------------
const StatsRow = ({ f, i, stats, update }) => (
  <div className={`grid grid-cols-[3.5rem_1fr_3.5rem] sm:grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3 px-4 py-3 sm:py-3.5 group hover:bg-white/[0.02] transition-colors ${i !== 0 ? "border-t border-border/30" : ""}`}>
    <input type="number" inputMode="numeric" value={stats.home[f.key]} onChange={(e) => update("home", f.key, e.target.value)}
      className="h-10 sm:h-11 rounded-xl text-center text-sm font-black tabular-nums outline-none bg-zinc-900/50 border border-zinc-700/50 text-pitch-bright focus:border-pitch-bright focus:bg-pitch/10 focus:ring-2 focus:ring-pitch/20 transition-all shadow-inner" />
    <span className="text-[11px] sm:text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest font-bold truncate">{f.label}{f.percent ? " (%)" : ""}</span>
    <input type="number" inputMode="numeric" value={stats.away[f.key]} onChange={(e) => update("away", f.key, e.target.value)}
      className="h-10 sm:h-11 rounded-xl text-center text-sm font-black tabular-nums outline-none bg-zinc-900/50 border border-zinc-700/50 text-claret focus:border-claret focus:bg-claret/10 focus:ring-2 focus:ring-claret/20 transition-all shadow-inner" />
  </div>
);

function StatsEntry({ stats, setStats, onSave, onSkip, busy }) {
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

  const half = Math.ceil(STAT_FIELDS.length / 2);
  const columns = [STAT_FIELDS.slice(0, half), STAT_FIELDS.slice(half)];

  const handleSwapStats = () => {
    setStats(prev => {
      const swapped = { home: { ...prev.away }, away: { ...prev.home } };
      return swapped;
    });
  };

  return (
    <div className="px-6 pb-8 max-w-5xl mx-auto">
      <ImageImport onApply={handleImportApply} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-card/60 backdrop-blur-md p-4 sm:px-6 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-pitch-bright rounded-full shadow-[0_0_8px_rgba(41,193,121,0.6)]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Match Stats</h3>
        </div>
        <button 
          onClick={handleSwapStats} 
          title="Swap Home and Away Stats" 
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-pitch-bright bg-pitch/10 hover:bg-pitch/20 border border-pitch/30 rounded-xl transition-all active:scale-95 shadow-sm" 
          type="button"
        >
          <ArrowLeftRight size={16} /> Swap Stats
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {columns.map((col, ci) => (
          <div key={ci} className="rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg flex flex-col">
            {col.map((f, i) => <StatsRow key={f.key} f={f} i={i} stats={stats} update={update} />)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button disabled={busy} onClick={onSkip} className="h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-zinc-900/50 hover:bg-zinc-800 text-muted-foreground hover:text-foreground border border-zinc-700/50 transition-all active:scale-95 disabled:opacity-50 backdrop-blur-md">
          <SkipForward size={18} /> Skip Stats
        </button>
        <button disabled={busy} onClick={onSave} className="h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-pitch-bright hover:bg-emerald-400 text-stadium-base transition-all active:scale-95 disabled:opacity-50 shadow-[0_4px_20px_rgba(41,193,121,0.3)] backdrop-blur-md">
          <Check size={20} /> Save & Publish
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
  const homeWins = h > a;
  const awayWins = a > h;
  const homeColorClass = homeWins || (!homeWins && !awayWins) ? "bg-pitch-bright shadow-[0_0_10px_rgba(41,193,121,0.5)]" : "bg-pitch";
  const awayColorClass = awayWins || (!homeWins && !awayWins) ? "bg-claret shadow-[0_0_10px_rgba(178,58,72,0.5)]" : "bg-claret/50";
  return (
    <div className="mb-5 last:mb-0 group">
      <div className="flex items-center justify-between mb-2">
        {percent ? <span className="text-[11px] font-black px-2.5 py-1 rounded-md bg-pitch/10 border border-pitch/20 text-pitch-bright tabular-nums">{h}%</span> : <span className={`text-sm font-black tabular-nums transition-colors ${homeWins ? "text-foreground drop-shadow-sm" : "text-muted-foreground"}`}>{h}</span>}
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground/80 transition-colors">{label}</span>
        {percent ? <span className="text-[11px] font-black px-2.5 py-1 rounded-md bg-claret/10 border border-claret/20 text-claret tabular-nums">{a}%</span> : <span className={`text-sm font-black tabular-nums transition-colors ${awayWins ? "text-foreground drop-shadow-sm" : "text-muted-foreground"}`}>{a}</span>}
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden flex bg-zinc-800/50 shadow-inner">
        {total === 0 ? <div className="w-full h-full bg-zinc-800/50" /> : (
          <>
            <div className={`h-full transition-all duration-1000 ease-out ${homeColorClass}`} style={{ width: `${homeWidth}%` }} />
            <div className={`h-full transition-all duration-1000 ease-out ${awayColorClass}`} style={{ width: `${100 - homeWidth}%` }} />
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

  const half = Math.ceil(STAT_FIELDS.length / 2);
  const columns = [STAT_FIELDS.slice(0, half), STAT_FIELDS.slice(half)];

  return (
    <div className="px-6 pb-8 max-w-4xl mx-auto">
      <button onClick={() => hasStats && setExpanded((o) => !o)} className="w-full flex items-center justify-between mb-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
        <div className="text-left flex items-center gap-3">
          <div className="w-1.5 h-8 bg-pitch-bright rounded-full shadow-[0_0_8px_rgba(41,193,121,0.6)]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pitch-bright mb-1">Result published</p>
            <p className="text-sm text-foreground font-medium">{summary}</p>
          </div>
        </div>
        {hasStats && <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 group-hover:border-zinc-600 transition-colors"><ChevronDown size={18} className={`text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`} /></div>}
      </button>
      {hasStats && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6 rounded-2xl p-6 sm:p-8 mt-2 bg-card/60 backdrop-blur-md border border-border/50 shadow-lg">
                {columns.map((col, ci) => (
                  <div key={ci} className="flex flex-col">
                    {col.map((f) => <StatRow key={f.key} label={f.label} percent={f.percent} value={[Number(stats.home[f.key]) || 0, Number(stats.away[f.key]) || 0]} />)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <div className="mt-8 flex justify-center">
        <button onClick={onClose} className="w-full sm:w-auto sm:px-12 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-zinc-900/50 hover:bg-zinc-800 text-foreground border border-zinc-700/50 transition-all active:scale-95 backdrop-blur-md shadow-sm">
           Close Match Control
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell integration
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
  
  // Find currently live match
  const serverLiveMatch = matches.find(m => m.status === 'live');
  const [optLiveMatch, setOptLiveMatch] = useState(null);
  
  // We'll keep the liveMatch around if we're in 'stats' or 'done' phase so the UI doesn't disappear
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

  // Sync server catch-up & match data without cascading useEffect renders
  const [prevLiveMatchHash, setPrevLiveMatchHash] = useState(currentLiveMatchHash);
  const [prevServerMatchId, setPrevServerMatchId] = useState(serverLiveMatch?.id);

  // 1. Reset optimistic match when server catches up
  if (serverLiveMatch?.id !== prevServerMatchId) {
    setPrevServerMatchId(serverLiveMatch?.id);
    if (serverLiveMatch && optLiveMatch && serverLiveMatch.id === optLiveMatch.id) {
      setOptLiveMatch(null);
    }
  }

  // 2. Adjust local match control state when live match data updates from server/broadcast
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

  // Guard: must be AFTER all hooks to satisfy React Rules of Hooks
  if (!activeSeason) return null;

  const startNextMatch = async () => {
    if (!nextMatch) return;
    
    // Reset control state
    setPhase("live");
    setShowDrawDecision(false);
    setEtHalf(1);
    setKicks([]);
    setShootoutWinner(null);
    setResultType(null);
    setStats({ home: { ...emptyStats }, away: { ...emptyStats } });
    setFinishedDataCache(null);
    
    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    const h = byId[nextMatch.homeId];
    const a = byId[nextMatch.awayId];

    setState({
      home: { name: h?.name || "Home", avatarImage: h?.avatarImage || null, avatar: h?.avatar || null, goals: 0, penalties: 0 },
      away: { name: a?.name || "Away", avatarImage: a?.avatarImage || null, avatar: a?.avatar || null, goals: 0, penalties: 0 },
      paused: false,
    });
    
    const optLiveMatchData = {
      ...nextMatch,
      status: 'live',
      homeScore: 0,
      awayScore: 0,
      liveState: { phase: 'first', paused: false, clock: 0 }
    };

    setOptLiveMatch(optLiveMatchData);

    supabase.channel('league-events').send({
      type: 'broadcast',
      event: 'match_update',
      payload: optLiveMatchData
    });

    const res = await updateMatchStatus(nextMatch.id, { 
      status: 'live', 
      liveState: { phase: 'first', paused: false, clock: 0 },
      homeScore: 0,
      awayScore: 0
    });
    
    if (res.error) {
      setOptLiveMatch(null);
      showToast(res.error);
    } else {
      showToast("Match Started!");
    }
  };

  const handleSetState = (updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      
      // If goals changed, sync with server
      if (liveMatch && !isPostMatch) {
        if (next.home.goals !== prev.home.goals || next.away.goals !== prev.away.goals) {
          const newHome = next.home.goals;
          const newAway = next.away.goals;
          
          setIsMutatingScore(true);
          clearTimeout(scoreTimeoutId);
          scoreTimeoutId = setTimeout(() => { setIsMutatingScore(false); }, 3000);
          
          const optMatch = { ...liveMatch, homeScore: newHome, awayScore: newAway };
          supabase.channel('league-events').send({ type: 'broadcast', event: 'match_update', payload: optMatch });
          
          updateMatchScore(liveMatch.id, newHome, newAway).then(res => {
            if (res?.error) showToast(res.error);
          });
        }
      }
      return next;
    });
  };

  const handleTogglePause = async () => {
    if (!liveMatch) return;
    const isPaused = !state.paused;
    handleSetState(s => ({ ...s, paused: isPaused }));
    
    const res = await updateMatchStatus(liveMatch.id, {
      ...liveMatch,
      liveState: { ...liveMatch.liveState, paused: isPaused }
    });
    if (res.error) showToast(res.error);
    
    supabase.channel('league-events').send({
      type: 'broadcast',
      event: 'match_update',
      payload: { ...liveMatch, liveState: { ...liveMatch.liveState, paused: isPaused } }
    });
  };

  const isLevel = () => state.home.goals === state.away.goals;

  const handleChooseDraw = () => {
    setShowDrawDecision(false);
    setResultType("normal_time");
    setPhase("stats");
    setFinishedDataCache({ match: liveMatch });
  };
  
  const handleChooseExtraTime = () => {
    setShowDrawDecision(false);
    setEtHalf(1);
    setPhase("extra_time");
  };

  const handleFinishFullTime = () => {
    if (!isLevel()) { setResultType("normal_time"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); return; }
    setShowDrawDecision(true);
  };
  
  const handleUndoStart = async () => {
    if (!liveMatch) return;
    if (state.home.goals > 0 || state.away.goals > 0) {
       showToast("Cannot undo start after a goal is scored.");
       return;
    }
    const res = await updateMatchStatus(liveMatch.id, { 
      status: 'scheduled', 
      homeScore: null,
      awayScore: null,
      liveState: null
    });
    if (res.error) {
      showToast(res.error);
    } else {
      showToast("Match reverted to scheduled.");
      setOptLiveMatch(null);
      setPhase("live");
      supabase.channel('league-events').send({
        type: 'broadcast',
        event: 'match_update',
        payload: { ...liveMatch, status: 'scheduled' }
      });
    }
  };
  
  const handleEndExtraTime = () => {
    if (!isLevel()) { setResultType("extra_time"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); }
    else setPhase("shootout");
  };
  
  const handleShootoutDecided = (winner) => { setShootoutWinner(winner); setResultType("penalties"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); };

  const finalizeMatch = async (forceSkipStats = false) => {
    if (!liveMatch) return;
    setSaving(true);
    
    const finalStatsObj = {};
    Object.keys(stats.home).forEach(key => {
      finalStatsObj[key] = { 
        a: forceSkipStats ? 0 : (Number(stats.home[key]) || 0), 
        b: forceSkipStats ? 0 : (Number(stats.away[key]) || 0) 
      };
    });

    const homeKicks = kicks.filter((k) => k.side === "home");
    const awayKicks = kicks.filter((k) => k.side === "away");
    const penaltyHome = homeKicks.filter((k) => k.result === "scored").length;
    const penaltyAway = awayKicks.filter((k) => k.result === "scored").length;

    const wentToExtra = phase === "extra_time" || phase === "shootout" || resultType === "extra_time" || resultType === "penalties";

    const finalData = {
      homeScore: state.home.goals,
      awayScore: state.away.goals,
      stats: finalStatsObj,
      wentToExtra,
      penaltyHome: resultType === "penalties" ? penaltyHome : null,
      penaltyAway: resultType === "penalties" ? penaltyAway : null,
      penaltyWinner: shootoutWinner,
      resultType
    };

    const response = await fetch('/api/matches/' + liveMatch.id + '/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData)
    });
    
    const data = await response.json();
    setSaving(false);
    
    if (data.error) {
      showToast(data.error);
    } else {
      showToast("Match completed & stats saved!");
      setPhase("done");
    }
  };

  const headerFor = () => {
    if (phase === "live") return { title: "Live Match Control", status: state.paused ? "PAUSED" : "LIVE • 1ST HALF", tone: state.paused ? "paused" : "rose" };
    if (phase === "extra_time") return { title: "Extra Time", status: `ET • HALF ${etHalf}`, tone: "amber" };
    if (phase === "shootout") return { title: "Penalty Shootout", status: "SHOOTOUT", tone: "amber" };
    if (phase === "stats") return { title: "Match Statistics", status: "FULL TIME", tone: "emerald" };
    return { title: "Match Result", status: "PUBLISHED", tone: "emerald" };
  };

  if (!liveMatch && !isPostMatch) {
    return (
      <MagicCard className="p-10 flex flex-col items-center justify-center gap-5 border-dashed border-border/50 bg-card/30 backdrop-blur-md mb-6 shadow-sm">
        <div className="p-5 rounded-full bg-zinc-900/50 border border-zinc-800/50 text-muted-foreground mb-2 shadow-inner">
          <Calendar size={36} />
        </div>
        <div className="text-muted-foreground font-black text-sm tracking-widest uppercase">No Live Match In Progress</div>
        {nextMatch ? (
          <Btn onClick={startNextMatch} className="mt-4 px-8 h-12 bg-pitch hover:bg-pitch-bright text-pitch-foreground rounded-xl shadow-[0_4px_15px_rgba(41,193,121,0.2)] transition-all">
            Start Next Match
          </Btn>
        ) : (
          <div className="text-xs text-muted-foreground/80 font-medium">All scheduled matches are completed.</div>
        )}
      </MagicCard>
    );
  }

  const h = headerFor();

  return (
    <div className="w-full bg-card/80 backdrop-blur-2xl mb-8 rounded-[2rem] border border-border/60 shadow-2xl overflow-hidden font-sans ring-1 ring-white/5">
      <CardHeader title={h.title} status={h.status} tone={h.tone} />
      
      <ScoreRow home={state.home.name} away={state.away.name} homeScore={state.home.goals} awayScore={state.away.goals} homeObj={state.home} awayObj={state.away} paused={state.paused} isLive={phase === "live" || phase === "extra_time"} />
      
      <div className="bg-background/50 border-b border-border/50 backdrop-blur-md shadow-inner">
        <StepIndicator phase={phase} />
      </div>

      <main className="pt-8 relative min-h-[400px]">
        {showDrawDecision && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md rounded-b-[2rem]">
            <div className="bg-card border border-border/60 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6 shadow-inner">
                 <ArrowLeftRight size={24} className="text-zinc-400" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Match is Level!</h2>
              <p className="text-sm font-medium text-muted-foreground mb-8">How would you like to resolve this match?</p>
              <div className="flex flex-col gap-4 w-full">
                <button onClick={handleChooseDraw} className="h-14 w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-zinc-900/50 hover:bg-zinc-800 text-foreground border border-zinc-700/50 transition-all active:scale-95 shadow-sm">Finish as Draw</button>
                <button onClick={handleChooseExtraTime} className="h-14 w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-all active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.15)]">Go to Extra Time</button>
              </div>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {phase === "live" && <LiveControl state={state} setState={handleSetState} onTogglePause={handleTogglePause} onFinish={handleFinishFullTime} onUndoStart={handleUndoStart} />}
            {phase === "extra_time" && <ExtraTime state={state} setState={handleSetState} etHalf={etHalf} setEtHalf={setEtHalf} onDone={handleEndExtraTime} />}
            {phase === "shootout" && <Shootout home={state.home} away={state.away} kicks={kicks} setKicks={setKicks} onDecided={handleShootoutDecided} />}
            {phase === "stats" && <StatsEntry stats={stats} setStats={setStats} busy={saving} onSave={() => finalizeMatch(false)} onSkip={() => finalizeMatch(true)} />}
            {phase === "done" && <Published state={state} stats={stats} resultType={resultType} shootoutWinner={shootoutWinner} onClose={() => { setPhase("live"); setOptLiveMatch(null); setFinishedDataCache(null); }} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {!["live", "done"].includes(phase) && (
        <div className="px-6 pb-6 flex justify-center">
          <button onClick={() => { setPhase("live"); setKicks([]); setShootoutWinner(null); setResultType(null); }} className="text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-white/5">← Back to Match</button>
        </div>
      )}
    </div>
  );
}
