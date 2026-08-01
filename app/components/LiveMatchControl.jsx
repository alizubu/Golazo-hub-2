import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Minus, Play, Pause, Square, SkipForward, Check, X, ChevronDown,
  Timer, Calendar, Upload, Loader2, ImageOff, ArrowLeftRight
} from "lucide-react";
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';
import { Btn, MagicCard } from './UI';
import Tesseract from 'tesseract.js';
import { MatchStatsPreview } from './AdminConsole';

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
  const tones = { rose: "bg-claret-dim/20 text-claret", amber: "bg-amber-950 text-amber-400", emerald: "bg-pitch/20 text-pitch-bright" };
  const dotTones = { rose: "bg-claret", amber: "bg-amber-500", emerald: "bg-pitch-bright" };
  return (
    <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-pitch/20 text-pitch-bright">
          <Play size={15} className="fill-pitch-bright" />
        </div>
        <h1 className="text-base sm:text-[17px] font-bold text-zinc-50">{title}</h1>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${tones[tone]}`}>
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotTones[tone]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotTones[tone]}`} />
        </span>
        {status}
      </div>
    </div>
  );
}

function ScoreRow({ home, away, homeScore, awayScore }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 pb-8 pt-4">
      <div className="absolute top-0 left-0 w-1/3 h-full bg-pitch/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-claret/5 blur-[100px] pointer-events-none" />
      
      <div className="relative flex items-center justify-center gap-4 sm:gap-12 px-5 sm:px-8">
        <div className="flex flex-col items-center gap-3 flex-1 max-w-[12rem]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl bg-zinc-900 text-zinc-50 border border-pitch/30 shadow-[0_0_20px_rgba(41,193,121,0.15)]">
            {initials(home)}
          </div>
          <span className="text-sm sm:text-base font-bold text-zinc-50 text-center line-clamp-2">{home}</span>
        </div>
        
        <div className="flex items-center gap-4 text-5xl sm:text-7xl font-black tabular-nums tracking-tighter text-zinc-50">
          <span className="text-pitch-bright">{homeScore}</span>
          <span className="text-zinc-800 font-medium pb-2 sm:pb-3">-</span>
          <span className="text-claret">{awayScore}</span>
        </div>
        
        <div className="flex flex-col items-center gap-3 flex-1 max-w-[12rem]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl bg-zinc-900 text-zinc-50 border border-claret/30 shadow-[0_0_20px_rgba(178,58,72,0.15)]">
            {initials(away)}
          </div>
          <span className="text-sm sm:text-base font-bold text-zinc-50 text-center line-clamp-2">{away}</span>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ phase, needsShootout }) {
  const order = ["live", "extra_time", "shootout", "stats", "done"];
  const steps = [
    { key: "live", label: "Match" },
    ...(needsShootout ? [{ key: "extra_time", label: "Extra Time" }] : []),
    ...(needsShootout ? [{ key: "shootout", label: "Penalties" }] : []),
    { key: "stats", label: "Stats" },
    { key: "done", label: "Published" },
  ];
  const currentIdx = order.indexOf(phase);
  return (
    <div className="flex items-center justify-center gap-2 px-5 sm:px-6 py-4 overflow-x-auto no-scrollbar">
      {steps.map((s, i) => {
        const idx = order.indexOf(s.key);
        const active = idx === currentIdx;
        const done = idx < currentIdx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${active || done ? "bg-pitch-bright" : "bg-zinc-800"}`} />
              <span className={`text-[11px] tracking-wide uppercase whitespace-nowrap ${active ? "text-zinc-50 font-bold" : "text-zinc-500 font-medium"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-4 sm:w-8 shrink-0 h-px bg-zinc-800" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepper control + team card
// ---------------------------------------------------------------------------
function StepperRow({ label, count, accent, onInc, onDec }) {
  const accents = {
    pitch: { count: "text-pitch-bright", btn: "bg-pitch-bright/10 hover:bg-pitch-bright/20 text-pitch-bright border-pitch-bright/20" },
    blue: { count: "text-blue-400", btn: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20" },
  };
  const a = accents[accent];
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-900/50 border border-zinc-800/50 px-4 py-3">
      <div className="flex items-center gap-2.5 text-zinc-300">
        <span className={`w-1.5 h-1.5 rounded-full ${accent === "pitch" ? "bg-pitch-bright" : "bg-blue-500"}`} />
        <span className="text-sm font-semibold tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onDec} className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors active:scale-95"><Minus size={16} /></button>
        <span className={`w-6 text-center font-black tabular-nums text-xl ${a.count}`}>{count}</span>
        <button onClick={onInc} className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors active:scale-95 ${a.btn}`}><Plus size={16} /></button>
      </div>
    </div>
  );
}

function TeamStatCard({ team, accent, side, data, bump }) {
  const accentText = accent === "pitch" ? "text-pitch-bright" : "text-claret";
  const accentBar = accent === "pitch" ? "bg-pitch-bright" : "bg-claret";
  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-5 shadow-inner">
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className={`w-1.5 h-1.5 rounded-full ${accentBar}`} />
        <span className={`text-sm font-bold uppercase tracking-widest truncate ${accentText}`}>{team}</span>
      </div>
      <div className="space-y-3 max-w-sm mx-auto">
        <StepperRow label="Goal" count={data.goals} accent="pitch" onInc={() => bump(side, "goals", 1)} onDec={() => bump(side, "goals", -1)} />
        <StepperRow label="Penalty" count={data.penalties} accent="blue" onInc={() => bump(side, "penalties", 1)} onDec={() => bump(side, "penalties", -1)} />
      </div>
    </div>
  );
}

function LiveControl({ state, setState, onFinish, onTogglePause }) {
  const { home, away, paused } = state;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="px-5 sm:px-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <TeamStatCard team={home.name} accent="pitch" side="home" data={home} bump={bump} />
        <TeamStatCard team={away.name} accent="rose" side="away" data={away} bump={bump} />
      </div>
      <div className="flex justify-center mb-6">
        <p className="text-[11px] text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800/50 text-center">
          * A scored penalty also counts as a goal — add both if the kick beats the keeper.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
        <button onClick={onTogglePause}
          className="h-14 sm:w-48 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-50 border border-zinc-700 transition-colors active:scale-[0.98]">
          {paused ? <Play size={16} /> : <Pause size={16} />}{paused ? "Resume Match" : "Pause Match"}
        </button>
        <button onClick={onFinish}
          className="h-14 sm:w-48 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-claret-dim/20 hover:bg-claret-dim text-claret border border-claret-dim/30 transition-colors active:scale-[0.98]">
          <Square size={14} className="fill-claret" />Finish Match
        </button>
      </div>
    </div>
  );
}

function ExtraTime({ state, setState, etHalf, setEtHalf, onDone }) {
  const { home, away } = state;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="px-5 sm:px-8 pb-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Timer size={16} className="text-amber-400 animate-pulse" />
        <span className="text-sm font-bold text-amber-400 tracking-wide uppercase">Extra Time — {etHalf === 1 ? "1st Half (15')" : "2nd Half (15')"}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <TeamStatCard team={home.name} accent="pitch" side="home" data={home} bump={bump} />
        <TeamStatCard team={away.name} accent="rose" side="away" data={away} bump={bump} />
      </div>
      <div className="flex justify-center">
        {etHalf === 1 ? (
          <button onClick={() => setEtHalf(2)}
            className="h-14 w-full sm:w-64 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/50 transition-colors active:scale-[0.98]">
            Start 2nd Half of Extra Time
          </button>
        ) : (
          <button onClick={onDone}
            className="h-14 w-full sm:w-64 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-claret-dim/20 hover:bg-claret-dim text-claret border border-claret-dim/30 transition-colors active:scale-[0.98]">
            <Square size={14} className="fill-claret" />End Extra Time
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
          <div key={i} className="w-7 h-7 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-[10px] text-zinc-700 font-bold">
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
        <span className="text-xs font-semibold text-zinc-50">{inSuddenDeath ? "Sudden death" : `Round ${round} of 5`}</span>
        {!decided && <span className={`text-xs font-semibold ${kicker === "home" ? "text-pitch-bright" : "text-claret"}`}>{kicker === "home" ? home.name : away.name} to kick</span>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-3 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-50 truncate">{home.name}</span>
            <span className="text-lg font-extrabold tabular-nums text-pitch-bright">{homeScore}</span>
          </div>
          <KickTrack list={homeKicks} />
        </div>
        <div className="rounded-xl p-3 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-50 truncate">{away.name}</span>
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
          <p className="text-sm mb-4 text-zinc-50">
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

    setLoading(true);
    setError(null);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Run Tesseract entirely on the client
      const { data: { text } } = await Tesseract.recognize(base64, 'eng');
      
      const stats = { home: {}, away: {} };
      const lines = text.split('\n').map(l => l.trim().toLowerCase()).filter(Boolean);

      const mappings = {
        'possession': 'possession',
        'shots on target': 'shotsOnTarget',
        'shots': 'shots',
        'fouls': 'fouls',
        'offsides': 'offsides',
        'corners': 'corners',
        'free kicks': 'freeKicks',
        'passes': 'passes',
        'successful passes': 'successfulPasses',
        'crosses': 'crosses',
        'interceptions': 'interceptions',
        'tackles': 'tackles',
        'saves': 'saves'
      };

      Object.values(mappings).forEach(key => {
        stats.home[key] = 0;
        stats.away[key] = 0;
      });

      for (const line of lines) {
        for (const [key, jsonKey] of Object.entries(mappings)) {
          if (line.includes(key)) {
            const match = line.match(/^(\d+)%?\s+.*\s+(\d+)%?$/);
            if (match) {
              stats.home[jsonKey] = parseInt(match[1], 10);
              stats.away[jsonKey] = parseInt(match[2], 10);
            } else {
              const numbers = line.match(/\b(\d+)\b/g);
              if (numbers && numbers.length >= 2) {
                stats.home[jsonKey] = parseInt(numbers[0], 10);
                stats.away[jsonKey] = parseInt(numbers[numbers.length - 1], 10);
              }
            }
            break; 
          }
        }
      }

      onApply(stats);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-pitch-bright/50 transition-colors">
      <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={loading} />
      {loading ? (
        <>
          <Loader2 size={24} className="text-pitch-bright animate-spin mb-3" />
          <p className="text-sm font-bold text-zinc-300">Analyzing image...</p>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Extracting stats via Tesseract OCR (this takes a few seconds)</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-pitch/20 transition-colors">
            <Upload size={20} className="text-zinc-400 group-hover:text-pitch-bright transition-colors" />
          </div>
          <p className="text-sm font-bold text-zinc-300">Auto-fill from screenshot</p>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Tap or drag a scoreboard image here</p>
          {error && <p className="text-xs text-claret mt-3 font-bold flex items-center gap-1 bg-claret-dim/20 px-3 py-1.5 rounded-full"><X size={12}/> {error}</p>}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats entry
// ---------------------------------------------------------------------------
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

  const Row = ({ f, i }) => (
    <div key={f.key} className={`grid grid-cols-[3.5rem_1fr_3.5rem] sm:grid-cols-[4rem_1fr_4rem] items-center gap-3 px-4 py-3 ${i % 2 === 0 ? "bg-zinc-950" : "bg-transparent"} ${i !== 0 ? "border-t border-zinc-800" : ""}`}>
      <input type="number" inputMode="numeric" value={stats.home[f.key]} onChange={(e) => update("home", f.key, e.target.value)}
        className="h-10 rounded-lg text-center text-sm font-bold tabular-nums outline-none bg-zinc-900 border border-zinc-700 text-pitch-bright focus:border-pitch-bright focus:bg-pitch/10 transition-colors" />
      <span className="text-[11px] sm:text-xs text-center text-zinc-400 uppercase tracking-widest font-bold truncate">{f.label}{f.percent ? " (%)" : ""}</span>
      <input type="number" inputMode="numeric" value={stats.away[f.key]} onChange={(e) => update("away", f.key, e.target.value)}
        className="h-10 rounded-lg text-center text-sm font-bold tabular-nums outline-none bg-zinc-900 border border-zinc-700 text-claret focus:border-claret focus:bg-claret-dim/20 transition-colors" />
    </div>
  );

  const handleSwapStats = () => {
    setStats(prev => {
      const swapped = { home: { ...prev.away }, away: { ...prev.home } };
      return swapped;
    });
  };

  return (
    <div className="px-5 sm:px-6 pb-6">
      <ImageImport onApply={handleImportApply} />

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-zinc-800"></div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Or enter manually</p>
        <button onClick={handleSwapStats} title="Swap Home and Away Stats" className="p-1 text-zinc-500 hover:text-pitch-bright hover:bg-pitch/10 rounded transition-colors" type="button">
          <ArrowLeftRight size={14} />
        </button>
        <div className="flex-1 h-px bg-zinc-800"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-0 mb-6">
        {columns.map((col, ci) => (
          <div key={ci} className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 mb-4 xl:mb-0 shadow-lg shadow-black/20">
            {col.map((f, i) => <Row key={f.key} f={f} i={i} />)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button disabled={busy} onClick={onSkip} className="h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors active:scale-[0.98] disabled:opacity-50">
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
        {percent ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pitch/20 text-pitch-bright">{h}%</span> : <span className={`text-sm font-bold tabular-nums ${homeWins ? "text-zinc-50" : "text-zinc-500"}`}>{h}</span>}
        <span className="text-[13px] font-medium text-zinc-500">{label}</span>
        {percent ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-claret-dim/20 text-claret">{a}%</span> : <span className={`text-sm font-bold tabular-nums ${awayWins ? "text-zinc-50" : "text-zinc-500"}`}>{a}</span>}
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-zinc-800">
        {total === 0 ? <div className="w-full h-full bg-zinc-800" /> : (
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
          <p className="text-[11px] text-zinc-500 mt-0.5">{summary}</p>
        </div>
        {hasStats && <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`} />}
      </button>
      {hasStats && (
        <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 rounded-xl p-4 mt-2 bg-zinc-950 border border-zinc-800">
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
        <button onClick={onClose} className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors active:scale-[0.98]">
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

  // 2. Sync server catch-up for match data during render
  const currentLiveMatchHash = `${liveMatch?.id}-${liveMatch?.homeScore}-${liveMatch?.awayScore}-${liveMatch?.liveState?.paused}`;
  const [prevLiveMatchHash, setPrevLiveMatchHash] = useState(currentLiveMatchHash);

  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const initMatch = optLiveMatch || serverLiveMatch;
  const hInit = initMatch ? byId[initMatch.homeId] : null;
  const aInit = initMatch ? byId[initMatch.awayId] : null;

  const [state, setState] = useState({
    home: { name: hInit?.name || "Home", goals: initMatch?.homeScore || 0, penalties: 0 },
    away: { name: aInit?.name || "Away", goals: initMatch?.awayScore || 0, penalties: 0 },
    paused: initMatch?.liveState?.paused || false,
  });

  const [isMutatingScore, setIsMutatingScore] = useState(false);

  // 1. Sync server catch-up for Start Match during render (React recommended pattern)
  const [prevServerMatchId, setPrevServerMatchId] = useState(serverLiveMatch?.id);
  if (serverLiveMatch?.id !== prevServerMatchId) {
    setPrevServerMatchId(serverLiveMatch?.id);
    if (serverLiveMatch && optLiveMatch && serverLiveMatch.id === optLiveMatch.id) {
       setOptLiveMatch(null);
    }
  }

  if (currentLiveMatchHash !== prevLiveMatchHash) {
    setPrevLiveMatchHash(currentLiveMatchHash);
    if (liveMatch && !isMutatingScore && !isPostMatch) {
      const h = byId[liveMatch.homeId];
      const a = byId[liveMatch.awayId];
      
      setState(prev => ({
        ...prev,
        home: { ...prev.home, name: h?.name || "Home", goals: liveMatch.homeScore || 0 },
        away: { ...prev.away, name: a?.name || "Away", goals: liveMatch.awayScore || 0 },
        paused: liveMatch.liveState?.paused || false
      }));
    }
  }

  const startNextMatch = async () => {
    if (!nextMatch) return;
    
    // Reset control state
    setPhase("live");
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
      home: { name: h?.name || "Home", goals: 0, penalties: 0 },
      away: { name: a?.name || "Away", goals: 0, penalties: 0 },
      paused: false,
    });
    
    setOptLiveMatch({
      ...nextMatch,
      status: 'live',
      homeScore: 0,
      awayScore: 0,
      liveState: { phase: 'first', paused: false, clock: 0 }
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
          supabase.channel('matches-page').send({ type: 'broadcast', event: 'match_update', payload: optMatch });
          
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
    
    supabase.channel('matches-page').send({
      type: 'broadcast',
      event: 'match_update',
      payload: { ...liveMatch, liveState: { ...liveMatch.liveState, paused: isPaused } }
    });
  };

  const isLevel = () => state.home.goals === state.away.goals;

  const handleFinishFullTime = () => {
    if (!isLevel()) { setResultType("normal_time"); setPhase("stats"); setFinishedDataCache({ match: liveMatch }); return; }
    setEtHalf(1);
    setPhase("extra_time");
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

  const needsShootoutStep = phase === "extra_time" || phase === "shootout" || resultType === "extra_time" || resultType === "penalties" || (phase === "live" && isLevel());

  const headerFor = () => {
    if (phase === "live") return { title: "Live Match Control", status: state.paused ? "PAUSED" : "LIVE • 1ST HALF", tone: "rose" };
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
    <div className="w-full bg-zinc-900 mb-6 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans">
      <CardHeader title={h.title} status={h.status} tone={h.tone} />
      
      <ScoreRow home={state.home.name} away={state.away.name} homeScore={state.home.goals} awayScore={state.away.goals} />
      
      <div className="border-b border-zinc-800/50 bg-zinc-950/30">
        <StepIndicator phase={phase} needsShootout={needsShootoutStep} />
      </div>

      <main className="pt-6 sm:pt-8">
        {phase === "live" && <LiveControl state={state} setState={handleSetState} onTogglePause={handleTogglePause} onFinish={handleFinishFullTime} />}
        {phase === "extra_time" && <ExtraTime state={state} setState={handleSetState} etHalf={etHalf} setEtHalf={setEtHalf} onDone={handleEndExtraTime} />}
        {phase === "shootout" && <Shootout home={state.home} away={state.away} kicks={kicks} setKicks={setKicks} onDecided={handleShootoutDecided} />}
        {phase === "stats" && <StatsEntry stats={stats} setStats={setStats} busy={saving} onSave={() => finalizeMatch(false)} onSkip={() => finalizeMatch(true)} />}
        {phase === "done" && <Published state={state} stats={stats} resultType={resultType} shootoutWinner={shootoutWinner} onClose={() => setPhase("live")} />}
      </main>

      {!["live", "done"].includes(phase) && (
        <div className="px-5 sm:px-8 pb-5 flex justify-center">
          <button onClick={() => { setPhase("live"); setKicks([]); setShootoutWinner(null); setResultType(null); }} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">← Back to match control</button>
        </div>
      )}
    </div>
  );
}
