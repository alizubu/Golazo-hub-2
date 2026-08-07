import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Minus, Play, Pause, Square, SkipForward, Check, X, ChevronDown,
  Timer, Calendar, Upload, Loader2, ImageOff, ArrowLeftRight, RotateCcw
} from "lucide-react";
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';
import { Btn, MagicCard, Avatar } from './UI';
import { MatchStatsPreview } from './AdminConsole';
import { extractMatchStats } from '../actions/extractStats';
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
  const tones = { rose: "bg-claret-dim/20 text-claret border-claret/30", amber: "bg-amber-950 text-amber-400 border-amber-500/30", emerald: "bg-pitch/20 text-pitch-bright border-pitch/30", paused: "bg-secondary dark:bg-zinc-900/80 text-amber-500 border-border dark:border-zinc-700" };
  const dotTones = { rose: "bg-claret shadow-[0_0_8px_rgba(178,58,72,0.8)]", amber: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]", emerald: "bg-pitch-bright shadow-[0_0_8px_rgba(41,193,121,0.8)]", paused: "bg-amber-500" };
  const isLive = tone === "rose" && status.includes("LIVE");
  
  return (
    <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-pitch/20 text-pitch-bright">
          <Play size={15} className="fill-pitch-bright" />
        </div>
        <h1 className="text-base sm:text-[17px] font-bold text-foreground dark:text-zinc-50">{title}</h1>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border ${tones[tone]}`}>
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
      initial={{ scale: 1.5, opacity: 0, filter: 'brightness(2)' }}
      animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
      className={`${colorClass}`}
    >
      {score}
    </motion.div>
  );
}

function ScoreRow({ home, away, homeScore, awayScore, homeObj, awayObj, paused, isLive }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 pb-5 pt-2">
      <div className="absolute top-0 left-0 w-1/3 h-full bg-pitch/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-claret/5 blur-[100px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center px-4 sm:px-6">
        <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-lg mx-auto">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-lg sm:text-2xl bg-secondary dark:bg-zinc-900 text-foreground dark:text-zinc-50 border-[3px] border-pitch shadow-[0_0_20px_rgba(41,193,121,0.4)] overflow-hidden">
              <Avatar p={homeObj} size={64} className="w-full h-full" />
            </div>
            <span className="text-sm sm:text-base font-bold text-foreground dark:text-zinc-50 text-center leading-tight bg-transparent selection:bg-pitch/30">{home}</span>
          </div>
          
          {/* Score */}
          <div className="flex flex-col items-center justify-center min-w-[120px] sm:min-w-[160px]">
            <div className="flex items-center justify-center w-full text-5xl sm:text-7xl font-black font-score tabular-nums tracking-tighter text-foreground dark:text-zinc-50 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <div className="flex-1 flex justify-end pr-3 sm:pr-5"><ScoreNumber score={homeScore} colorClass="text-pitch-bright" /></div>
              <span className="text-foreground dark:text-zinc-800 font-medium pb-1 sm:pb-3 text-4xl sm:text-6xl flex-none">-</span>
              <div className="flex-1 flex justify-start pl-3 sm:pl-5"><ScoreNumber score={awayScore} colorClass="text-claret" /></div>
            </div>
          </div>
          
          {/* Away */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-lg sm:text-2xl bg-secondary dark:bg-zinc-900 text-foreground dark:text-zinc-50 border-[3px] border-claret shadow-[0_0_20px_rgba(178,58,72,0.4)] overflow-hidden">
              <Avatar p={awayObj} size={64} className="w-full h-full" />
            </div>
            <span className="text-sm sm:text-base font-bold text-foreground dark:text-zinc-50 text-center leading-tight bg-transparent selection:bg-claret/30">{away}</span>
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
    <div className="w-full max-w-2xl mx-auto px-4 py-3 sm:py-4">
      <div className="flex sm:hidden flex-col items-center justify-center gap-1 mb-2">
        <span className="text-[10px] font-bold text-pitch-bright uppercase tracking-widest">Phase {currentIdx + 1} of {steps.length}</span>
        <span className="text-xs font-black text-foreground dark:text-zinc-50">{steps.find(s => s.key === phase)?.label}</span>
      </div>
      <div className="hidden sm:flex items-center justify-between w-full relative">
        {steps.map((s, i) => {
          const idx = order.indexOf(s.key);
          const active = idx === currentIdx;
          const done = idx < currentIdx;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1 relative z-10 w-12">
                <div className={`w-3 h-3 rounded-full border-[1.5px] transition-all duration-300 flex items-center justify-center ${active ? "bg-pitch border-pitch-bright shadow-[0_0_10px_rgba(41,193,121,0.6)] scale-110" : done ? "bg-pitch-bright border-pitch-bright" : "bg-secondary dark:bg-zinc-900 border-border dark:border-zinc-700"}`}>
                   {done && <Check size={8} className="text-foreground dark:text-zinc-950 font-bold" />}
                </div>
                <span className={`text-[9px] sm:text-[10px] tracking-wider uppercase text-center absolute top-5 transition-colors whitespace-nowrap ${active ? "text-foreground dark:text-zinc-50 font-bold" : done ? "text-muted-foreground font-medium" : "text-muted-foreground font-medium"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-1 bg-secondary dark:bg-zinc-800 relative rounded-full overflow-hidden">
                  <div className={`absolute left-0 top-0 h-full bg-pitch-bright transition-all duration-500 ease-out`} style={{ width: done ? '100%' : '0%' }} />
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
      btn: "bg-pitch-bright/10 hover:bg-pitch-bright/20 text-pitch-bright border-pitch-bright/30 shadow-[0_0_15px_rgba(41,193,121,0.15)]",
      bg: "bg-pitch-bright/5 border-pitch-bright/20",
      dot: "bg-pitch-bright"
    },
    blue: { 
      text: "text-blue-400", 
      btn: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
      bg: "bg-blue-500/5 border-blue-500/20",
      dot: "bg-blue-500"
    },
    rose: {
      text: "text-claret", 
      btn: "bg-claret-dim/20 hover:bg-claret-dim/40 text-claret border-claret-dim/50 shadow-[0_0_15px_rgba(178,58,72,0.15)]",
      bg: "bg-claret/5 border-claret/20",
      dot: "bg-claret"
    }
  };
  const a = accents[accent];
  
  if (isMuted) {
    return (
      <div className={`flex flex-col gap-1.5 rounded-xl bg-background/50 border border-border dark:border-zinc-800/50 p-2 transition-all duration-300 opacity-60 hover:opacity-100`}>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center justify-center gap-2 px-1">
          <button onClick={onDec} className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center bg-secondary dark:bg-zinc-900 border border-border dark:border-zinc-800 text-muted-foreground transition-all active:scale-90"><Minus size={14} /></button>
          <div className="w-10 text-center font-black tabular-nums text-2xl text-muted-foreground">{count}</div>
          <button onClick={onInc} className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center bg-secondary dark:bg-zinc-900 border border-border dark:border-zinc-800 text-muted-foreground transition-all active:scale-90"><Plus size={14} /></button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col gap-1.5 rounded-xl ${a.bg} border p-2 backdrop-blur-md transition-all duration-300 shadow-md`}>
      <div className="flex items-center justify-center gap-1.5">
        <span className={`w-1 h-1 rounded-full ${a.dot} animate-pulse`} />
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 px-1">
        <button onClick={onDec} className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center bg-secondary dark:bg-zinc-900/80 hover:bg-secondary dark:bg-zinc-800 border border-border dark:border-zinc-700/50 text-muted-foreground transition-all active:scale-90 shadow-sm backdrop-blur-sm"><Minus size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
        <div className={`flex-1 text-center font-black tabular-nums text-3xl sm:text-4xl tracking-tighter drop-shadow-sm ${a.text}`}>{count}</div>
        <button onClick={onInc} className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-sm backdrop-blur-sm ${a.btn}`}><Plus size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
      </div>
    </div>
  );
}

function TeamStatCard({ accent, side, data, bump, phase }) {
  const isShootout = phase === 'shootout';
  return (
    <div className="flex flex-col gap-3 w-full">
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
    <div className="px-4 sm:px-6 pb-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 max-w-3xl mx-auto">
        <TeamStatCard accent="pitch" side="home" data={home} bump={bump} phase="live" />
        <TeamStatCard accent="rose" side="away" data={away} bump={bump} phase="live" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto items-center">
        {canUndo && (
          <button onClick={onUndoStart}
            className="h-10 sm:h-11 w-full sm:w-auto px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors active:scale-95 shadow-md bg-secondary dark:bg-zinc-800 hover:bg-zinc-700 text-muted-foreground hover:text-foreground dark:text-zinc-50 border border-border dark:border-zinc-700">
            <RotateCcw size={16} />Undo Start
          </button>
        )}
        <button onClick={onTogglePause}
          className={`h-10 sm:h-11 w-full sm:w-48 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors active:scale-95 shadow-md ${
            paused 
            ? "bg-pitch-bright/10 hover:bg-pitch-bright/20 text-pitch-bright border border-pitch-bright/30" 
            : "bg-secondary dark:bg-zinc-800 hover:bg-zinc-700 text-foreground dark:text-zinc-50 border border-border dark:border-zinc-700"
          }`}>
          {paused ? <Play size={16} className="fill-pitch-bright" /> : <Pause size={16} className="fill-zinc-50" />}
          {paused ? "Resume Match" : "Pause Match"}
        </button>
        <button onClick={onFinish}
          className="h-12 sm:h-14 w-full sm:w-64 rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-colors active:scale-95 shadow-md shadow-destructive/10">
          <Square size={16} className="fill-destructive" />Finish Match
        </button>
      </div>
    </div>
  );
}

function ExtraTime({ state, setState, etHalf, setEtHalf, onDone }) {
  const { home, away } = state;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="px-4 sm:px-8 pb-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Timer size={16} className="text-amber-400 animate-pulse" />
        <span className="text-sm font-bold text-amber-400 tracking-wide uppercase">Extra Time — {etHalf === 1 ? "1st Half (15')" : "2nd Half (15')"}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-8 mb-8 max-w-4xl mx-auto">
        <TeamStatCard accent="pitch" side="home" data={home} bump={bump} phase="extra_time" />
        <TeamStatCard accent="rose" side="away" data={away} bump={bump} phase="extra_time" />
      </div>
      <div className="flex justify-center max-w-xl mx-auto">
        {etHalf === 1 ? (
          <button onClick={() => setEtHalf(2)}
            className="h-12 w-full rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/50 transition-colors active:scale-95 shadow-md">
            Start 2nd Half of Extra Time
          </button>
        ) : (
          <button onClick={onDone}
            className="h-12 w-full rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-colors active:scale-95 shadow-md shadow-destructive/10">
            <Square size={16} className="fill-destructive" />End Extra Time
          </button>
        )}
      </div>
    </div>
  );
}

const KickTrack = ({ list }) => (
  <div className="flex gap-1.5 flex-wrap">
    {Array.from({ length: Math.max(5, list.length) }).map((_, i) => {
      const k = list[i];
      if (!k) {
        return (
          <div key={i} className="w-7 h-7 rounded-full border border-dashed border-border dark:border-zinc-700 flex items-center justify-center text-[10px] text-zinc-700 font-bold">
            {i + 1}
          </div>
        );
      }
      const scored = k.result === "scored";
      return (
        <div
          key={i}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm leading-none ${scored ? "bg-pitch-bright" : "bg-claret"}`}
          title={scored ? "Scored" : "Missed"}
        >
          {scored ? "⚽" : "❌"}
        </div>
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
    <div className="px-5 sm:px-6 pb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-foreground dark:text-zinc-50">{inSuddenDeath ? "Sudden death" : `Round ${round} of 5`}</span>
        {!decided && <span className={`text-xs font-semibold ${kicker === "home" ? "text-pitch-bright" : "text-claret"}`}>{kicker === "home" ? home.name : away.name} to kick</span>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-3 bg-background border border-border dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground dark:text-zinc-50 truncate">{home.name}</span>
            <span className="text-lg font-extrabold tabular-nums text-pitch-bright">{homeScore}</span>
          </div>
          <KickTrack list={homeKicks} />
        </div>
        <div className="rounded-xl p-3 bg-background border border-border dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground dark:text-zinc-50 truncate">{away.name}</span>
            <span className="text-lg font-extrabold tabular-nums text-claret">{awayScore}</span>
          </div>
          <KickTrack list={awayKicks} />
        </div>
      </div>
      {!decided ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => record("scored")} className="h-14 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-pitch/20 hover:bg-pitch text-pitch-bright border border-pitch/30 transition-colors active:scale-[0.98]"><Check size={16} /> Scored</button>
          <button onClick={() => record("missed")} className="h-14 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-claret-dim/20 hover:bg-claret-dim text-claret border border-claret-dim/30 transition-colors active:scale-[0.98]"><X size={16} /> Missed</button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm mb-4 text-foreground dark:text-zinc-50">
            <span className={`font-bold ${decided === "home" ? "text-pitch-bright" : "text-claret"}`}>{decided === "home" ? home.name : away.name}</span> win the shootout {decided === "home" ? homeScore : awayScore}–{decided === "home" ? awayScore : homeScore}.
          </p>
          <button onClick={() => onDecided(decided)} className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-pitch-bright hover:bg-emerald-400 text-stadium-base transition-colors active:scale-[0.98]">Continue <SkipForward size={15} /></button>
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
    <div className="mb-6 rounded-xl border border-dashed border-border dark:border-zinc-700 bg-secondary dark:bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-pitch-bright/50 transition-colors">
      <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={loading} />
      {loading ? (
        <>
          <Loader2 size={24} className="text-pitch-bright animate-spin mb-3" />
          <p className="text-sm font-bold text-muted-foreground">Analyzing image...</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Extracting stats with AI (this takes a few seconds)</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-secondary dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-pitch/20 transition-colors">
            <Upload size={20} className="text-muted-foreground group-hover:text-pitch-bright transition-colors" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">Auto-fill from screenshot</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Tap or drag a scoreboard image here</p>
          {error && <p className="text-xs text-claret mt-3 font-bold flex items-center gap-1 bg-claret-dim/20 px-3 py-1.5 rounded-full"><X size={12}/> {error}</p>}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats entry
// ---------------------------------------------------------------------------
const StatsRow = ({ f, i, stats, update }) => (
  <div className={`grid grid-cols-[3.5rem_1fr_3.5rem] sm:grid-cols-[4rem_1fr_4rem] items-center gap-3 px-4 py-3 ${i % 2 === 0 ? "bg-background" : "bg-transparent"} ${i !== 0 ? "border-t border-border dark:border-zinc-800" : ""}`}>
    <input type="number" inputMode="numeric" value={stats.home[f.key]} onChange={(e) => update("home", f.key, e.target.value)}
      className="h-10 rounded-lg text-center text-sm font-bold tabular-nums outline-none bg-secondary dark:bg-zinc-900 border border-border dark:border-zinc-700 text-pitch-bright focus:border-pitch-bright focus:bg-pitch/10 transition-colors" />
    <span className="text-[11px] sm:text-xs text-center text-muted-foreground uppercase tracking-widest font-bold truncate">{f.label}{f.percent ? " (%)" : ""}</span>
    <input type="number" inputMode="numeric" value={stats.away[f.key]} onChange={(e) => update("away", f.key, e.target.value)}
      className="h-10 rounded-lg text-center text-sm font-bold tabular-nums outline-none bg-secondary dark:bg-zinc-900 border border-border dark:border-zinc-700 text-claret focus:border-claret focus:bg-claret-dim/20 transition-colors" />
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
    <div className="px-5 sm:px-6 pb-6">
      <ImageImport onApply={handleImportApply} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 bg-secondary dark:bg-zinc-900/50 p-4 rounded-xl border border-border dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Match Stats</h3>
        <button 
          onClick={handleSwapStats} 
          title="Swap Home and Away Stats" 
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-pitch-bright bg-pitch/10 hover:bg-pitch/20 border border-pitch/30 rounded-lg transition-all active:scale-95 shadow-lg shadow-pitch/5" 
          type="button"
        >
          <ArrowLeftRight size={16} /> Swap Home & Away
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-0 mb-6">
        {columns.map((col, ci) => (
          <div key={ci} className="rounded-2xl overflow-hidden border border-border dark:border-zinc-800 bg-background mb-4 xl:mb-0 shadow-lg shadow-black/20">
            {col.map((f, i) => <StatsRow key={f.key} f={f} i={i} stats={stats} update={update} />)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button disabled={busy} onClick={onSkip} className="h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-secondary dark:bg-zinc-800 hover:bg-zinc-700 text-muted-foreground border border-border dark:border-zinc-700 transition-colors active:scale-[0.98] disabled:opacity-50">
          <SkipForward size={16} /> Skip Stats
        </button>
        <button disabled={busy} onClick={onSave} className="h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-pitch-bright hover:bg-pitch text-stadium-base transition-colors active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-pitch-bright/20">
          <Check size={18} /> Save & Publish
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
  const homeColorClass = homeWins || (!homeWins && !awayWins) ? "bg-pitch-bright" : "bg-pitch";
  const awayColorClass = awayWins || (!homeWins && !awayWins) ? "bg-claret" : "bg-claret-dim";
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        {percent ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pitch/20 text-pitch-bright">{h}%</span> : <span className={`text-sm font-bold tabular-nums ${homeWins ? "text-foreground dark:text-zinc-50" : "text-muted-foreground"}`}>{h}</span>}
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        {percent ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-claret-dim/20 text-claret">{a}%</span> : <span className={`text-sm font-bold tabular-nums ${awayWins ? "text-foreground dark:text-zinc-50" : "text-muted-foreground"}`}>{a}</span>}
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-secondary dark:bg-zinc-800">
        {total === 0 ? <div className="w-full h-full bg-secondary dark:bg-zinc-800" /> : (
          <>
            <div className={`h-full rounded-full ${homeColorClass}`} style={{ width: `${homeWidth}%` }} />
            <div className={`h-full rounded-full ${awayColorClass}`} style={{ width: `${100 - homeWidth}%` }} />
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
    <div className="px-5 sm:px-6 pb-6">
      <button onClick={() => hasStats && setExpanded((o) => !o)} className="w-full flex items-center justify-between mb-2">
        <div className="text-left">
          <p className="text-xs font-semibold text-pitch-bright">Result published</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{summary}</p>
        </div>
        {hasStats && <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`} />}
      </button>
      {hasStats && (
        <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 rounded-xl p-4 mt-2 bg-background border border-border dark:border-zinc-800">
              {columns.map((col, ci) => (
                <div key={ci}>
                  {col.map((f) => <StatRow key={f.key} label={f.label} percent={f.percent} value={[Number(stats.home[f.key]) || 0, Number(stats.away[f.key]) || 0]} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="mt-5">
        <button onClick={onClose} className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-secondary dark:bg-zinc-800 hover:bg-zinc-700 text-muted-foreground border border-border dark:border-zinc-700 transition-colors active:scale-[0.98]">
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
      <MagicCard className="p-8 flex flex-col items-center justify-center gap-4 border-dashed border-border/50 bg-secondary/10 mb-6">
        <div className="p-4 rounded-full bg-secondary text-muted-foreground opacity-50 mb-2">
          <Calendar size={32} />
        </div>
        <div className="text-muted-foreground font-bold text-sm tracking-wide uppercase">No Live Match In Progress</div>
        {nextMatch ? (
          <Btn onClick={startNextMatch} className="mt-2 bg-pitch text-pitch-foreground hover:bg-pitch-bright">
            Start Next Match
          </Btn>
        ) : (
          <div className="text-xs text-muted-foreground">All scheduled matches are completed.</div>
        )}
      </MagicCard>
    );
  }

  const h = headerFor();

  return (
    <div className="w-full bg-card mb-6 rounded-2xl border border-border/60 shadow-lg overflow-hidden font-sans">
      <CardHeader title={h.title} status={h.status} tone={h.tone} />
      
      <ScoreRow home={state.home.name} away={state.away.name} homeScore={state.home.goals} awayScore={state.away.goals} homeObj={state.home} awayObj={state.away} paused={state.paused} isLive={phase === "live" || phase === "extra_time"} />
      
      <div className="border-b border-border dark:border-zinc-800/50 bg-background/30">
        <StepIndicator phase={phase} />
      </div>

      <main className="pt-6 sm:pt-8 relative min-h-[300px]">
        {showDrawDecision && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm rounded-b-2xl">
            <div className="bg-secondary dark:bg-zinc-900 border border-border dark:border-zinc-700 rounded-xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
              <h2 className="text-xl font-bold text-foreground dark:text-zinc-50 mb-2">Match is Level!</h2>
              <p className="text-sm text-muted-foreground mb-6">How would you like to resolve this match?</p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={handleChooseDraw} className="h-12 w-full rounded-xl flex items-center justify-center gap-2 font-bold bg-secondary dark:bg-zinc-800 hover:bg-zinc-700 text-foreground dark:text-zinc-50 border border-border dark:border-zinc-700 transition-colors">Finish as Draw</button>
                <button onClick={handleChooseExtraTime} className="h-12 w-full rounded-xl flex items-center justify-center gap-2 font-bold bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/50 transition-colors">Go to Extra Time</button>
              </div>
            </div>
          </div>
        )}
        {phase === "live" && <LiveControl state={state} setState={handleSetState} onTogglePause={handleTogglePause} onFinish={handleFinishFullTime} onUndoStart={handleUndoStart} />}
        {phase === "extra_time" && <ExtraTime state={state} setState={handleSetState} etHalf={etHalf} setEtHalf={setEtHalf} onDone={handleEndExtraTime} />}
        {phase === "shootout" && <Shootout home={state.home} away={state.away} kicks={kicks} setKicks={setKicks} onDecided={handleShootoutDecided} />}
        {phase === "stats" && <StatsEntry stats={stats} setStats={setStats} busy={saving} onSave={() => finalizeMatch(false)} onSkip={() => finalizeMatch(true)} />}
        {phase === "done" && <Published state={state} stats={stats} resultType={resultType} shootoutWinner={shootoutWinner} onClose={() => { setPhase("live"); setOptLiveMatch(null); setFinishedDataCache(null); }} />}
      </main>

      {!["live", "done"].includes(phase) && (
        <div className="px-5 sm:px-8 pb-5 flex justify-center">
          <button onClick={() => { setPhase("live"); setKicks([]); setShootoutWinner(null); setResultType(null); }} className="text-xs font-medium text-muted-foreground hover:text-muted-foreground transition-colors">← Back to match control</button>
        </div>
      )}
    </div>
  );
}
