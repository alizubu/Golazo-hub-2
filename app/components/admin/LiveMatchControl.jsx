import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Minus, Play, Pause, Square, SkipForward, Check, X, ChevronDown,
  Timer, Calendar, Upload, Loader2, RotateCcw, Copy, ArrowLeftRight
} from "lucide-react";
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';
import { Btn, MagicCard, Avatar } from '@/app/components/shared/UI';
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

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CardHeader({ title, status, onCopyFixture }) {
  const isLive = status.includes("LIVE");
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border bg-card relative z-20">
      <div className="flex items-center justify-between w-full sm:w-auto mb-3 sm:mb-0">
        <h1 className="font-heading text-lg font-extrabold text-foreground tracking-tight">{title}</h1>
        <div className="sm:hidden flex items-center px-2 py-1 rounded bg-secondary font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1.5" />}
          {status}
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button 
          onClick={onCopyFixture}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-colors border border-border shadow-sm active:scale-95"
        >
          <Copy size={16} /> Copy Fixture
        </button>
        <div className="hidden sm:flex relative items-center justify-center p-[1px] rounded-lg overflow-hidden">
          {isLive && <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(52,211,153,0.8),transparent)] animate-spin-around" />}
          <div className="relative z-10 px-3 py-2.5 rounded-[7px] bg-secondary font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/50 flex items-center gap-1.5">
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ home, away, homeScore, awayScore, homeObj, awayObj }) {
  return (
    <div className="bg-background/50 backdrop-blur-md px-4 py-8 border-b border-border/50 shadow-sm z-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-2xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex flex-col items-center flex-1 gap-3">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
             <Avatar p={homeObj} size={64} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-border shadow-lg bg-card object-cover relative z-10" />
          </div>
          <span className="font-heading text-sm sm:text-lg font-extrabold text-center tracking-tight leading-tight truncate w-full px-1">{home}</span>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-10 flex-[1.5]">
          <motion.div key={homeScore} initial={{ scale: 1.5, opacity: 0, filter: "brightness(2)" }} animate={{ scale: 1, opacity: 1, filter: "brightness(1)" }} className="font-score text-6xl sm:text-7xl font-black tabular-nums tracking-tighter text-pitch-bright drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] relative">
            {homeScore}
          </motion.div>
          <div className="text-2xl sm:text-4xl font-black text-muted-foreground/30">-</div>
          <motion.div key={awayScore} initial={{ scale: 1.5, opacity: 0, filter: "brightness(2)" }} animate={{ scale: 1, opacity: 1, filter: "brightness(1)" }} className="font-score text-6xl sm:text-7xl font-black tabular-nums tracking-tighter text-claret drop-shadow-[0_0_15px_rgba(225,29,72,0.4)] relative">
            {awayScore}
          </motion.div>
        </div>
        <div className="flex flex-col items-center flex-1 gap-3">
          <div className="relative">
             <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full animate-pulse" />
             <Avatar p={awayObj} size={64} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-border shadow-lg bg-card object-cover relative z-10" />
          </div>
          <span className="font-heading text-sm sm:text-lg font-extrabold text-center tracking-tight leading-tight truncate w-full px-1">{away}</span>
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
    <div className="w-full bg-card/50 backdrop-blur-md border-b border-border/50 px-4 py-4 overflow-x-auto no-scrollbar relative z-10 snap-x snap-mandatory">
      <div className="flex items-center justify-between min-w-[400px] max-w-2xl mx-auto gap-2 px-2">
        {steps.map((s, i) => {
          const idx = order.indexOf(s.key);
          const active = idx === currentIdx;
          const done = idx < currentIdx;
          
          let stateClass = "bg-secondary/50 text-muted-foreground border-transparent";
          if (active) stateClass = "bg-primary text-primary-foreground border-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] font-black scale-105 transform transition-all";
          else if (done) stateClass = "bg-primary/20 text-primary border-primary/30 font-bold";

          return (
            <div key={s.key} className="flex items-center gap-2 flex-1 snap-center">
              <div className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border font-sans text-[10px] uppercase tracking-widest transition-all duration-300 ${stateClass}`}>
                {done && <Check size={14} className="text-primary" />}
                <span className="truncate">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-2 sm:w-4 h-1 rounded-full flex-none overflow-hidden bg-secondary">
                  {done && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-primary" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepperRow({ label, count, onInc, onDec, isMuted }) {
  if (isMuted) return null;
  return (
    <div className="flex flex-col bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center relative z-10">{label}</span>
      <div className="flex items-center justify-between gap-4 relative z-10">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onDec} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-foreground transition-all shadow-sm border border-border/50 hover:border-border active:scale-95"><Minus size={24} /></motion.button>
        <div className="font-score text-6xl sm:text-7xl font-black tabular-nums tracking-tighter drop-shadow-md">{count}</div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onInc} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center text-background transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] border border-white/10 active:scale-95"><Plus size={24} /></motion.button>
      </div>
    </div>
  );
}

function TeamStatCard({ side, data, bump, phase }) {
  const isShootout = phase === 'shootout';
  return (
    <div className="flex flex-col gap-4 w-full">
      <StepperRow label="Goals" count={data.goals} onInc={() => bump(side, "goals", 1)} onDec={() => bump(side, "goals", -1)} isMuted={isShootout} />
      <StepperRow label="Penalties" count={data.penalties} onInc={() => bump(side, "penalties", 1)} onDec={() => bump(side, "penalties", -1)} isMuted={!isShootout} />
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = 'primary' }) {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] border border-primary/50",
    secondary: "bg-secondary/50 backdrop-blur-md text-foreground hover:bg-secondary/80 border border-border/50 hover:border-primary/50 shadow-sm",
    destructive: "bg-gradient-to-r from-destructive to-rose-500 text-destructive-foreground shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] border border-destructive/50",
  };
  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative h-14 w-full rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm sm:text-base transition-all overflow-hidden group ${variants[variant]}`}
    >
      <div className="absolute inset-0 w-full h-full bg-white/0 group-hover:bg-white/10 transition-colors" />
      {Icon && <Icon size={20} className="relative z-10" />}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

function LiveControl({ state, setState, onFinish, onTogglePause, onUndoStart }) {
  const { home, away, paused } = state;
  const canUndo = home.goals === 0 && away.goals === 0;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8">
        <div className="flex flex-col gap-2">
          <div className="text-center font-bold text-sm uppercase tracking-wider text-muted-foreground">{home.name}</div>
          <TeamStatCard side="home" data={home} bump={bump} phase="live" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-center font-bold text-sm uppercase tracking-wider text-muted-foreground">{away.name}</div>
          <TeamStatCard side="away" data={away} bump={bump} phase="live" />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 bg-background/80 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-border/50 sm:border-0 z-50 flex flex-col sm:flex-row gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-none pb-safe">
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
      <div className="flex items-center justify-center gap-2 mb-6 bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mx-auto px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider">
        <Timer size={18} className="animate-pulse" /> Extra Time — {etHalf === 1 ? "1st Half (15')" : "2nd Half (15')"}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8">
        <div className="flex flex-col gap-2">
          <div className="text-center font-bold text-sm uppercase tracking-wider text-muted-foreground">{home.name}</div>
          <TeamStatCard side="home" data={home} bump={bump} phase="extra_time" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-center font-bold text-sm uppercase tracking-wider text-muted-foreground">{away.name}</div>
          <TeamStatCard side="away" data={away} bump={bump} phase="extra_time" />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 bg-background/80 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-border/50 sm:border-0 z-50 flex flex-col gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-none sm:max-w-md sm:mx-auto pb-safe">
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
        return <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-border bg-secondary flex items-center justify-center text-xs text-muted-foreground font-bold">{i + 1}</div>;
      }
      const scored = k.result === "scored";
      return (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm text-white ${scored ? "bg-emerald-500" : "bg-red-500"}`}
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
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-card border border-border rounded-xl p-4 shadow-sm gap-2 text-center sm:text-left">
        <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">{inSuddenDeath ? "Sudden death" : `Round ${round} of 5`}</span>
        {!decided && (
          <span className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-primary" />
            {kicker === "home" ? home.name : away.name} to kick
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className={`rounded-2xl p-5 bg-card border ${kicker === "home" && !decided ? 'border-primary ring-2 ring-primary/20' : 'border-border'} shadow-sm transition-all`}>
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <span className="font-heading font-extrabold tracking-tight text-foreground truncate text-lg">{home.name}</span>
            <span className="font-score text-4xl font-black tabular-nums text-primary">{homeScore}</span>
          </div>
          <KickTrack list={homeKicks} />
        </div>
        <div className={`rounded-2xl p-5 bg-card border ${kicker === "away" && !decided ? 'border-primary ring-2 ring-primary/20' : 'border-border'} shadow-sm transition-all`}>
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <span className="font-heading font-extrabold tracking-tight text-foreground truncate text-lg">{away.name}</span>
            <span className="font-score text-4xl font-black tabular-nums text-primary">{awayScore}</span>
          </div>
          <KickTrack list={awayKicks} />
        </div>
      </div>

      {!decided ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 bg-background/80 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-border/50 sm:border-0 z-50 grid grid-cols-2 gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-none sm:max-w-lg sm:mx-auto pb-safe">
          <button onClick={() => record("scored")} className="h-16 rounded-xl flex items-center justify-center gap-3 font-bold text-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95 transition-all">
            <Check size={24} strokeWidth={3} /> Scored
          </button>
          <button onClick={() => record("missed")} className="h-16 rounded-xl flex items-center justify-center gap-3 font-bold text-lg bg-red-500 hover:bg-red-600 text-white shadow-md active:scale-95 transition-all">
            <X size={24} strokeWidth={3} /> Missed
          </button>
        </div>
      ) : (
        <div className="text-center bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-lg">
          <p className="text-lg sm:text-xl font-medium mb-6">
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
    <div className="mb-6 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-secondary/50 transition-colors cursor-pointer">
      <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={loading} />
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="text-primary animate-spin mb-4" />
          <p className="font-bold text-foreground">Analyzing image...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Upload size={20} className="text-foreground" />
          </div>
          <p className="font-bold text-sm text-foreground">Auto-fill from screenshot</p>
          <p className="text-xs text-muted-foreground mt-1">Tap to upload or drag image</p>
          {error && <p className="text-xs text-destructive mt-3 font-bold bg-destructive/10 px-3 py-1.5 rounded-full">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats entry
// ---------------------------------------------------------------------------
const StatsRow = ({ f, stats, update }) => (
  <div className="flex items-center justify-between gap-3 p-3 sm:p-4 hover:bg-secondary/40 transition-colors border-b border-border/40 last:border-0 group">
    <input type="number" inputMode="numeric" value={stats.home[f.key]} onChange={(e) => update("home", f.key, e.target.value)}
      className="font-score w-16 h-12 rounded-xl text-center font-black text-lg tabular-nums bg-background/50 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner hover:border-primary/50 focus:bg-background" />
    <span className="font-sans text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest flex-1 truncate group-hover:text-foreground transition-colors">{f.label}{f.percent ? " (%)" : ""}</span>
    <input type="number" inputMode="numeric" value={stats.away[f.key]} onChange={(e) => update("away", f.key, e.target.value)}
      className="font-score w-16 h-12 rounded-xl text-center font-black text-lg tabular-nums bg-background/50 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner hover:border-primary/50 focus:bg-background" />
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

  const handleSwapStats = () => {
    setStats(prev => ({ home: { ...prev.away }, away: { ...prev.home } }));
  };

  const half = Math.ceil(STAT_FIELDS.length / 2);
  const columns = [STAT_FIELDS.slice(0, half), STAT_FIELDS.slice(half)];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <ImageImport onApply={handleImportApply} />

      <div className="flex items-center justify-between mb-4 bg-card p-3 sm:p-4 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-sm uppercase tracking-wider">Match Stats</h3>
        <button onClick={handleSwapStats} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase bg-secondary hover:bg-secondary/80 rounded-md transition-colors border border-border">
          <ArrowLeftRight size={14} /> Swap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {columns.map((col, ci) => (
          <div key={ci} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {col.map((f) => <StatsRow key={f.key} f={f} stats={stats} update={update} />)}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <ActionButton icon={SkipForward} label="Skip Stats" onClick={onSkip} variant="secondary" />
        <ActionButton icon={Check} label="Save & Publish" onClick={onSave} variant="primary" />
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
  return (
    <div className="flex flex-col gap-2 mb-5 last:mb-0 group">
      <div className="flex items-center justify-between">
        <span className={`font-score text-base sm:text-lg font-black tabular-nums transition-colors ${homeWins ? 'text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-muted-foreground'}`}>{h}{percent && "%"}</span>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
        <span className={`font-score text-base sm:text-lg font-black tabular-nums transition-colors ${awayWins ? 'text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-muted-foreground'}`}>{a}{percent && "%"}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden flex shadow-inner relative border border-border/30">
        {total > 0 ? (
          <>
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${homeWidth}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full relative ${homeWins || (!homeWins && !awayWins) ? 'bg-gradient-to-r from-primary/60 to-primary' : 'bg-primary/30'}`}>
              {(homeWins || (!homeWins && !awayWins)) && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] h-full animate-shimmer" />}
            </motion.div>
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${100 - homeWidth}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full relative ${awayWins || (!homeWins && !awayWins) ? 'bg-gradient-to-l from-primary/60 to-primary' : 'bg-primary/30'}`}>
              {(awayWins || (!homeWins && !awayWins)) && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] h-full animate-shimmer" />}
            </motion.div>
          </>
        ) : (
          <div className="w-full h-full bg-secondary/50" />
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
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-6">
        <button onClick={() => hasStats && setExpanded((o) => !o)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Result published</p>
            <p className="text-sm font-medium">{summary}</p>
          </div>
          {hasStats && <ChevronDown size={20} className={`text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`} />}
        </button>
        <AnimatePresence initial={false}>
          {hasStats && expanded && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 border-t border-border bg-background">
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

  if (!liveMatch && !isPostMatch) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 bg-background border border-dashed border-border rounded-2xl mb-6">
        <div className="p-4 rounded-full bg-secondary text-muted-foreground"><Calendar size={32} /></div>
        <div className="font-bold text-sm tracking-widest uppercase text-muted-foreground text-center">No Live Match In Progress</div>
        {nextMatch ? <ActionButton label="Start Next Match" onClick={startNextMatch} variant="primary" /> : <div className="text-xs text-muted-foreground">All scheduled matches are completed.</div>}
      </div>
    );
  }

  const h = headerFor();

  return (
    <div className="relative w-full mb-8 font-sans group mt-2">
      {/* Animated Glowing Gradient Border */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-purple-500 to-emerald-500 rounded-2xl sm:rounded-[24px] opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-700 animate-pulse" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-purple-500 to-emerald-500 rounded-2xl sm:rounded-[24px] opacity-40 z-0" />
      
      <div className="relative z-10 w-full bg-background/95 backdrop-blur-xl rounded-2xl sm:rounded-[23px] overflow-hidden border border-background shadow-2xl">
        <CardHeader title={h.title} status={h.status} onCopyFixture={handleCopyFixture} />
        
        <ScoreRow home={state.home.name} away={state.away.name} homeScore={state.home.goals} awayScore={state.away.goals} homeObj={state.home} awayObj={state.away} />
        <StepIndicator phase={phase} />

        <main className="relative bg-secondary/5 min-h-[400px]">
          {/* Subtle Glowing Gradient Background inside main */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg max-h-[32rem] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${["extra_time", "shootout"].includes(phase) ? 'bg-brand-gradient animate-gradient opacity-20' : 'bg-primary/5'}`} />
        {showDrawDecision && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm rounded-b-2xl sm:rounded-b-3xl">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
              <h2 className="text-2xl font-black text-foreground mb-2">Match is Level!</h2>
              <p className="text-sm font-medium text-muted-foreground mb-6">How would you like to resolve this match?</p>
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
            {phase === "stats" && <StatsEntry stats={stats} setStats={setStats} busy={saving} onSave={() => finalizeMatch(false)} onSkip={() => finalizeMatch(true)} />}
            {phase === "done" && <Published state={state} stats={stats} resultType={resultType} shootoutWinner={shootoutWinner} onClose={() => { setPhase("live"); setOptLiveMatch(null); setFinishedDataCache(null); }} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {!["live", "done"].includes(phase) && (
        <div className="px-6 pb-6 pt-2 flex justify-center bg-secondary/5 relative z-10">
          <button onClick={() => { setPhase("live"); setKicks([]); setShootoutWinner(null); setResultType(null); }} className="text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg bg-background border border-border shadow-sm">← Back to Match</button>
        </div>
      )}
      </div>
    </div>
  );
}
