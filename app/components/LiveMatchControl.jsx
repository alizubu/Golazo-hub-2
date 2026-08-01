import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Minus, Play, Pause, Square, SkipForward, Check, X, ChevronDown,
  Timer, Calendar
} from "lucide-react";
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';
import { Btn, MagicCard } from './UI';

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
  const tones = { rose: "bg-rose-950 text-rose-400", amber: "bg-amber-950 text-amber-400", emerald: "bg-emerald-950 text-emerald-400" };
  const dotTones = { rose: "bg-rose-500", amber: "bg-amber-500", emerald: "bg-emerald-500" };
  return (
    <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-950 text-emerald-400">
          <Play size={15} className="fill-emerald-400" />
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

function ScoreRow({ home, away, homeScore, awayScore, compact }) {
  return (
    <div className={`flex items-center justify-center gap-6 sm:gap-8 px-5 sm:px-6 ${compact ? "pb-5" : "pb-6"}`}>
      <div className="flex flex-col items-center gap-2">
        <div className={`${compact ? "w-12 h-12" : "w-14 h-14 sm:w-16 sm:h-16"} rounded-full flex items-center justify-center font-bold bg-zinc-800 text-zinc-50 border-2 border-emerald-500`}>
          {initials(home)}
        </div>
        <span className="text-sm font-bold text-zinc-50 text-center max-w-[7rem] truncate">{home}</span>
      </div>
      <div className={`flex items-center gap-3 ${compact ? "text-2xl" : "text-3xl sm:text-4xl"} font-extrabold tabular-nums text-zinc-50`}>
        <span>{homeScore}</span>
        <span className="text-zinc-600">–</span>
        <span>{awayScore}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className={`${compact ? "w-12 h-12" : "w-14 h-14 sm:w-16 sm:h-16"} rounded-full flex items-center justify-center font-bold bg-zinc-800 text-zinc-50 border-2 border-rose-500`}>
          {initials(away)}
        </div>
        <span className="text-sm font-bold text-zinc-50 text-center max-w-[7rem] truncate">{away}</span>
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
    <div className="flex flex-wrap items-center gap-2 px-5 sm:px-6 pb-5">
      {steps.map((s, i) => {
        const idx = order.indexOf(s.key);
        const active = idx === currentIdx;
        const done = idx < currentIdx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${active || done ? "bg-emerald-500" : "bg-zinc-800"}`} />
              <span className={`text-[11px] tracking-wide uppercase whitespace-nowrap ${active ? "text-zinc-50 font-bold" : "text-zinc-500 font-medium"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-4 sm:w-6 h-px bg-zinc-800" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Vertical variant of the step indicator, used in the web sidebar.
function StepIndicatorVertical({ phase, needsShootout }) {
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
    <div className="flex flex-col gap-3">
      {steps.map((s) => {
        const idx = order.indexOf(s.key);
        const active = idx === currentIdx;
        const done = idx < currentIdx;
        return (
          <div key={s.key} className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full shrink-0 ${active || done ? "bg-emerald-500" : "bg-zinc-800"}`} />
            <span className={`text-xs uppercase tracking-wide ${active ? "text-zinc-50 font-bold" : "text-zinc-500 font-medium"}`}>{s.label}</span>
          </div>
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
    emerald: { count: "text-emerald-400", btn: "bg-emerald-500 hover:bg-emerald-400 text-emerald-950" },
    blue: { count: "text-blue-400", btn: "bg-blue-500 hover:bg-blue-400 text-blue-950" },
  };
  const a = accents[accent];
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5">
      <div className="flex items-center gap-2 text-zinc-300">
        <span className={`w-1.5 h-1.5 rounded-full ${accent === "emerald" ? "bg-emerald-500" : "bg-blue-500"}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onDec} className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors active:scale-95"><Minus size={15} /></button>
        <span className={`w-5 text-center font-bold tabular-nums text-base ${a.count}`}>{count}</span>
        <button onClick={onInc} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95 ${a.btn}`}><Plus size={15} /></button>
      </div>
    </div>
  );
}

function TeamStatCard({ team, accent, side, data, bump }) {
  const accentText = accent === "emerald" ? "text-emerald-400" : "text-rose-400";
  const accentBar = accent === "emerald" ? "bg-emerald-500" : "bg-rose-500";
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-3.5">
        <span className={`w-1 h-4 rounded-full ${accentBar}`} />
        <span className={`text-xs font-bold uppercase tracking-wide truncate ${accentText}`}>{team}</span>
      </div>
      <div className="space-y-2">
        <StepperRow label="Goal" count={data.goals} accent="emerald" onInc={() => bump(side, "goals", 1)} onDec={() => bump(side, "goals", -1)} />
        <StepperRow label="Penalty" count={data.penalties} accent="blue" onInc={() => bump(side, "penalties", 1)} onDec={() => bump(side, "penalties", -1)} />
      </div>
    </div>
  );
}

function LiveControl({ state, setState, onFinish, onTogglePause }) {
  const { home, away, paused } = state;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="px-5 sm:px-6 pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <TeamStatCard team={home.name} accent="emerald" side="home" data={home} bump={bump} />
        <TeamStatCard team={away.name} accent="rose" side="away" data={away} bump={bump} />
      </div>
      <p className="text-[11px] text-center text-zinc-500 mb-5">A scored penalty also counts as a goal — add both if the kick beats the keeper.</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onTogglePause}
          className="h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-50 border border-zinc-700 transition-colors active:scale-[0.98]">
          {paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "Resume Match" : "Pause Match"}
        </button>
        <button onClick={onFinish}
          className="h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 transition-colors active:scale-[0.98]">
          <Square size={13} className="fill-rose-400" />Finish Match
        </button>
      </div>
    </div>
  );
}

function ExtraTime({ state, setState, etHalf, setEtHalf, onDone }) {
  const { home, away } = state;
  const bump = (side, field, delta) => setState((s) => ({ ...s, [side]: { ...s[side], [field]: Math.max(0, s[side][field] + delta) } }));
  return (
    <div className="px-5 sm:px-6 pb-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Timer size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-amber-400">Extra Time — {etHalf === 1 ? "1st Half (15')" : "2nd Half (15')"}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <TeamStatCard team={home.name} accent="emerald" side="home" data={home} bump={bump} />
        <TeamStatCard team={away.name} accent="rose" side="away" data={away} bump={bump} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {etHalf === 1 ? (
          <button onClick={() => setEtHalf(2)}
            className="col-span-2 h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-800 transition-colors active:scale-[0.98]">
            Start 2nd Half of Extra Time
          </button>
        ) : (
          <button onClick={onDone}
            className="col-span-2 h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 transition-colors active:scale-[0.98]">
            <Square size={13} className="fill-rose-400" />End Extra Time
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
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm leading-none ${scored ? "bg-emerald-500" : "bg-rose-500"}`}
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
        {!decided && <span className={`text-xs font-semibold ${kicker === "home" ? "text-emerald-400" : "text-rose-400"}`}>{kicker === "home" ? home.name : away.name} to kick</span>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-3 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-50 truncate">{home.name}</span>
            <span className="text-lg font-extrabold tabular-nums text-emerald-400">{homeScore}</span>
          </div>
          <KickTrack list={homeKicks} />
        </div>
        <div className="rounded-xl p-3 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-50 truncate">{away.name}</span>
            <span className="text-lg font-extrabold tabular-nums text-rose-400">{awayScore}</span>
          </div>
          <KickTrack list={awayKicks} />
        </div>
      </div>
      {!decided ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => record("scored")} className="h-14 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors active:scale-[0.98]"><Check size={16} /> Scored</button>
          <button onClick={() => record("missed")} className="h-14 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 transition-colors active:scale-[0.98]"><X size={16} /> Missed</button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm mb-4 text-zinc-50">
            <span className={`font-bold ${decided === "home" ? "text-emerald-400" : "text-rose-400"}`}>{decided === "home" ? home.name : away.name}</span> win the shootout {decided === "home" ? homeScore : awayScore}–{decided === "home" ? awayScore : homeScore}.
          </p>
          <button onClick={() => onDecided(decided)} className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition-colors active:scale-[0.98]">Continue <SkipForward size={15} /></button>
        </div>
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

  const half = Math.ceil(STAT_FIELDS.length / 2);
  const columns = [STAT_FIELDS.slice(0, half), STAT_FIELDS.slice(half)];

  const Row = ({ f, i }) => (
    <div key={f.key} className={`grid grid-cols-[56px_1fr_56px] items-center gap-2 px-3 py-2.5 ${i % 2 === 0 ? "bg-zinc-950" : "bg-transparent"} ${i !== 0 ? "border-t border-zinc-800" : ""}`}>
      <input type="number" inputMode="numeric" value={stats.home[f.key]} onChange={(e) => update("home", f.key, e.target.value)}
        className="h-8 rounded-md text-center text-sm font-semibold tabular-nums outline-none bg-zinc-800 border border-zinc-700 text-emerald-400 focus:border-emerald-600" />
      <span className="text-[11px] text-center text-zinc-500 truncate">{f.label}{f.percent ? " (%)" : ""}</span>
      <input type="number" inputMode="numeric" value={stats.away[f.key]} onChange={(e) => update("away", f.key, e.target.value)}
        className="h-8 rounded-md text-center text-sm font-semibold tabular-nums outline-none bg-zinc-800 border border-zinc-700 text-rose-400 focus:border-rose-600" />
    </div>
  );

  return (
    <div className="px-5 sm:px-6 pb-6">
      <p className="text-xs text-zinc-500 mb-4">Enter the stats from the match, or skip and publish the result now.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {columns.map((col, ci) => (
          <div key={ci} className="rounded-xl overflow-hidden border border-zinc-800">
            {col.map((f, i) => <Row key={f.key} f={f} i={i} />)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button disabled={busy} onClick={onSkip} className="h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 transition-colors active:scale-[0.98] disabled:opacity-50"><SkipForward size={15} /> Skip</button>
        <button disabled={busy} onClick={onSave} className="h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition-colors active:scale-[0.98] disabled:opacity-50">
          <Check size={15} /> Save & Publish
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
  const homeColorClass = homeWins || (!homeWins && !awayWins) ? "bg-emerald-500" : "bg-emerald-900";
  const awayColorClass = awayWins || (!homeWins && !awayWins) ? "bg-rose-500" : "bg-rose-900";
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        {percent ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400">{h}%</span> : <span className={`text-sm font-bold tabular-nums ${homeWins ? "text-zinc-50" : "text-zinc-500"}`}>{h}</span>}
        <span className="text-[13px] font-medium text-zinc-500">{label}</span>
        {percent ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400">{a}%</span> : <span className={`text-sm font-bold tabular-nums ${awayWins ? "text-zinc-50" : "text-zinc-500"}`}>{a}</span>}
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
          <p className="text-xs font-semibold text-emerald-400">Result published</p>
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

  const [state, setState] = useState({
    home: { name: "Home", goals: 0, penalties: 0 },
    away: { name: "Away", goals: 0, penalties: 0 },
    paused: false,
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

  // 2. Sync server catch-up for match data during render
  const currentLiveMatchHash = `${liveMatch?.id}-${liveMatch?.homeScore}-${liveMatch?.awayScore}-${liveMatch?.liveState?.paused}`;
  const [prevLiveMatchHash, setPrevLiveMatchHash] = useState(currentLiveMatchHash);

  if (currentLiveMatchHash !== prevLiveMatchHash) {
    setPrevLiveMatchHash(currentLiveMatchHash);
    if (liveMatch && !isMutatingScore && !isPostMatch) {
      const byId = Object.fromEntries(players.map((p) => [p.id, p]));
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
    <div className="w-full bg-[#0f1117] mb-6 rounded-2xl border border-border shadow-xl shadow-black/20 overflow-hidden font-sans">
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:items-start h-full">
        {/* Sidebar on web / top card on mobile */}
        <aside className="border-b lg:border-b-0 lg:border-r border-zinc-800/50 bg-zinc-900/50 h-full">
          <CardHeader title={h.title} status={h.status} tone={h.tone} />
          <ScoreRow home={state.home.name} away={state.away.name} homeScore={state.home.goals} awayScore={state.away.goals} compact />
          <div className="hidden lg:block px-5 sm:px-6 pb-6">
            <StepIndicatorVertical phase={phase} needsShootout={needsShootoutStep} />
          </div>
        </aside>

        {/* Main panel */}
        <main className="bg-zinc-900">
          <div className="lg:hidden">
            <StepIndicator phase={phase} needsShootout={needsShootoutStep} />
          </div>
          <div className="pt-5 lg:pt-6">
            {phase === "live" && <LiveControl state={state} setState={handleSetState} onTogglePause={handleTogglePause} onFinish={handleFinishFullTime} />}
            {phase === "extra_time" && <ExtraTime state={state} setState={handleSetState} etHalf={etHalf} setEtHalf={setEtHalf} onDone={handleEndExtraTime} />}
            {phase === "shootout" && <Shootout home={state.home} away={state.away} kicks={kicks} setKicks={setKicks} onDecided={handleShootoutDecided} />}
            {phase === "stats" && <StatsEntry stats={stats} setStats={setStats} busy={saving} onSave={() => finalizeMatch(false)} onSkip={() => finalizeMatch(true)} />}
            {phase === "done" && <Published state={state} stats={stats} resultType={resultType} shootoutWinner={shootoutWinner} onClose={() => setPhase("live")} />}
          </div>

          {!["live", "done"].includes(phase) && (
            <div className="px-5 sm:px-6 pb-5">
              <button onClick={() => { setPhase("live"); setKicks([]); setShootoutWinner(null); setResultType(null); }} className="text-[11px] text-zinc-500 hover:text-zinc-300">← Back to match control</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
