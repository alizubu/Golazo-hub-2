import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy, Medal, Shield, User, Users, Calendar, TrendingUp, Bell,
  LogOut, Plus, Edit2, Trash2, Check, X, Settings, Award, Target,
  Radio, ChevronRight, Lock, Home, ListOrdered, Swords, Archive,
  Play, Clock, Crown, Pause, PlayCircle, KeyRound, Mail, UserPlus,
  Minus, Goal, Zap, ShieldAlert, Camera, AlertTriangle, UserCircle2
} from "lucide-react";

/* ---------------------------------- THEME ---------------------------------- */
const C = {
  bg: "#0B0F14", bg2: "#080B0F",
  surface: "#141B22", surface2: "#1B242D", surface3: "#212B35",
  border: "#26323D", borderLight: "#33414D",
  pitch: "#1F8A5C", pitchBright: "#29C179",
  gold: "#D9A93B", goldDim: "#8A6E2B",
  claret: "#B23A48", claretDim: "#7A2933",
  text: "#EDEFEF", textDim: "#9AA5AF", textFaint: "#5B6672",
};
const FONT_DISPLAY = "'Oswald', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

function useGoogleFonts() {
  useEffect(() => {
    const id = "ef-league-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ---------------------------------- GLOBAL STYLE / ANIMATIONS ---------------------------------- */
function GlobalStyle() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      @keyframes fadeUp { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
      .fade-up { animation: fadeUp .38s cubic-bezier(.2,.8,.2,1) both; }
      @keyframes popIn { 0%{transform:scale(.4); opacity:0;} 55%{transform:scale(1.3);} 100%{transform:scale(1); opacity:1;} }
      .score-pop { display:inline-block; animation: popIn .45s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes pulseDot { 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.35; transform:scale(.8);} }
      .live-dot { display:inline-block; width:7px; height:7px; border-radius:999px; background:${C.claret}; animation: pulseDot 1.1s ease-in-out infinite; }
      @keyframes ringPulse { 0%{box-shadow:0 0 0 0 ${C.claret}55;} 70%{box-shadow:0 0 0 10px ${C.claret}00;} 100%{box-shadow:0 0 0 0 ${C.claret}00;} }
      .live-ring { animation: ringPulse 1.8s ease-out infinite; }
      @keyframes slideDownToast { from{opacity:0; transform:translateY(-12px) scale(.97);} to{opacity:1; transform:translateY(0) scale(1);} }
      .toast-anim { animation: slideDownToast .32s cubic-bezier(.2,.8,.2,1) both; }
      @keyframes tickerScroll { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
      .ticker-track { animation: tickerScroll 28s linear infinite; }
      @keyframes spinSlow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
      .spin-slow { animation: spinSlow 2.2s linear infinite; }
      @keyframes kickIn { 0%{transform:scale(0) rotate(-20deg); opacity:0;} 100%{transform:scale(1) rotate(0); opacity:1;} }
      .kick-in { animation: kickIn .3s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes shimmerSweep { 0%{background-position:-300px 0;} 100%{background-position:300px 0;} }
      @keyframes borderGlow {
        0% { box-shadow: 0 0 0 0 ${C.gold}00; border-color: ${C.claret}77; }
        25% { box-shadow: 0 0 28px 6px ${C.gold}aa; border-color: ${C.gold}; }
        100% { box-shadow: 0 0 0 0 ${C.gold}00; border-color: ${C.claret}77; }
      }
      .goal-flash { animation: borderGlow 1.1s ease-out; }
      @keyframes avatarPop { 0%{transform:scale(.7); opacity:0;} 100%{transform:scale(1); opacity:1;} }
      .avatar-pop { animation: avatarPop .3s ease both; }
      .btn-hover:hover { filter: brightness(1.12); transform: translateY(-1px); }
      .btn-hover:active { transform: scale(.95); }
      .card-hover:hover { border-color: ${C.borderLight}; transform: translateY(-2px); }
      .transition-all-fast { transition: all .18s ease; }
      @keyframes modalIn { from{opacity:0; transform:scale(.94) translateY(6px);} to{opacity:1; transform:scale(1) translateY(0);} }
      .modal-in { animation: modalIn .3s cubic-bezier(.2,.8,.2,1) both; }
      .emoji-btn { transition: transform .15s ease, background .15s ease; }
      .emoji-btn:hover { transform: scale(1.18); }
      .nav-btn { transition: all .18s ease; }
      .nav-btn:active { transform: scale(.94); }
      @keyframes avatarGlow { 0%,100%{ box-shadow: 0 0 0 0 ${C.pitch}55; } 50%{ box-shadow: 0 0 0 8px ${C.pitch}00; } }
      .avatar-glow { animation: avatarGlow 2.4s ease-in-out infinite; border-radius: 9999px; }
      @media (prefers-reduced-motion: reduce) {
        .fade-up, .score-pop, .live-dot, .live-ring, .toast-anim, .ticker-track, .spin-slow, .kick-in, .goal-flash, .avatar-pop { animation: none !important; }
      }
    `}</style>
  );
}

/* ---------------------------------- STORAGE ---------------------------------- */
async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, true);
    if (res && res.value != null) return JSON.parse(res.value);
    return fallback;
  } catch (e) { return fallback; }
}
async function saveKey(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); }
  catch (e) { console.error("storage save failed", key, e); }
}

/* ---------------------------------- UTIL ---------------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const now = () => new Date().toISOString();
const fmtDate = (iso) => {
  if (!iso) return "TBD";
  const d = new Date(iso);
  if (isNaN(d)) return "TBD";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
async function sha256(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const randomSalt = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const AVATARS = ["🦁","🐯","🦅","🐺","🦈","🐉","🦊","🐻","🦂","🐍","🦍","🐗","🦌","🐘","🦏","🐢"];
const FLAGS = [
  { emoji: "🏴", label: "None" }, { emoji: "🇧🇷", label: "Brazil" }, { emoji: "🇦🇷", label: "Argentina" },
  { emoji: "🇫🇷", label: "France" }, { emoji: "🇩🇪", label: "Germany" }, { emoji: "🇮🇹", label: "Italy" },
  { emoji: "🇪🇸", label: "Spain" }, { emoji: "🇵🇹", label: "Portugal" }, { emoji: "🇬🇧", label: "England" },
  { emoji: "🇳🇱", label: "Netherlands" }, { emoji: "🇧🇩", label: "Bangladesh" }, { emoji: "🇮🇳", label: "India" },
  { emoji: "🇺🇸", label: "USA" }, { emoji: "🇯🇵", label: "Japan" }, { emoji: "🇧🇪", label: "Belgium" }, { emoji: "🇭🇷", label: "Croatia" },
];
const LOGOS = [
  { emoji: "⚡", label: "Thunder" }, { emoji: "🔥", label: "Inferno" }, { emoji: "⭐", label: "Star" },
  { emoji: "🛡️", label: "Ironwall" }, { emoji: "🗡️", label: "Blade" }, { emoji: "👑", label: "Crown" },
  { emoji: "💀", label: "Reaper" }, { emoji: "🐎", label: "Mustang" }, { emoji: "🌀", label: "Vortex" },
  { emoji: "🔱", label: "Trident" }, { emoji: "🎯", label: "Bullseye" }, { emoji: "🧨", label: "Dynamite" },
];

/* ---------------------------------- AVATAR HELPERS ---------------------------------- */
function resizeImageFile(file, maxSize = 240, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h = Math.round(h * (maxSize / w)); w = maxSize; } }
        else { if (h > maxSize) { w = Math.round(w * (maxSize / h)); h = maxSize; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Avatar({ p, size = 40, ring, glow }) {
  const common = { width: size, height: size, borderRadius: "9999px", flexShrink: 0 };
  const cls = `avatar-pop ${glow ? "avatar-glow" : ""}`;
  if (p?.avatarImage) {
    return <img src={p.avatarImage} alt={p.name} className={cls} style={{ ...common, objectFit: "cover", border: ring ? `2px solid ${ring}` : `1px solid ${C.border}` }} />;
  }
  if (p?.avatar) {
    return (
      <div className={cls} style={{ ...common, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, background: C.surface2, border: ring ? `2px solid ${ring}` : `1px solid ${C.border}` }}>
        {p.avatar}
      </div>
    );
  }
  return (
    <div className={cls} style={{ ...common, display: "flex", alignItems: "center", justifyContent: "center", background: C.surface2, border: ring ? `2px solid ${ring}` : `1px solid ${C.border}` }}>
      <UserCircle2 size={size * 0.6} color={C.textFaint} />
    </div>
  );
}

/* ---------------------------------- MATCH ENGINE CONSTANTS ---------------------------------- */
const FIRST_REAL_SEC = 8 * 60;      // 8 real minutes
const FIRST_DISPLAY_MIN = 90;
const EXTRA_REAL_SEC = 2 * 60;      // 2 real minutes
const EXTRA_DISPLAY_MIN = 30;       // shown as 90 -> 120

function matchWinnerId(m) {
  if (!m || m.status !== "completed") return null;
  if (m.homeScore > m.awayScore) return m.homeId;
  if (m.awayScore > m.homeScore) return m.awayId;
  if (m.penaltyResult?.winner) return m.penaltyResult.winner === "home" ? m.homeId : m.awayId;
  return null;
}
function matchLoserId(m) {
  const w = matchWinnerId(m);
  if (!w) return null;
  return w === m.homeId ? m.awayId : m.homeId;
}
function resultBadgeLabel(m) {
  if (m.status !== "completed") return null;
  if (m.penaltyResult) return "PENS";
  if (m.liveState?.phase === "extra" || (m.wentToExtra)) return "AET";
  return "FT";
}

function getClockState(liveState) {
  if (!liveState) return null;
  const { phase, phaseStartedAt, paused, pauseStartedAt, totalPausedMs } = liveState;
  if (phase === "penalties") return { phase, label: "PENALTIES", ended: false };
  if (phase === "done") return { phase, label: "FT", ended: true };
  const startMs = new Date(phaseStartedAt).getTime();
  const pausedExtra = paused && pauseStartedAt ? Date.now() - new Date(pauseStartedAt).getTime() : 0;
  const elapsedMs = Math.max(0, Date.now() - startMs - (totalPausedMs || 0) - pausedExtra);
  const elapsedSec = elapsedMs / 1000;
  if (phase === "first") {
    const capped = Math.min(elapsedSec, FIRST_REAL_SEC);
    const dispMin = (capped / FIRST_REAL_SEC) * FIRST_DISPLAY_MIN;
    return { phase, minute: Math.floor(dispMin), second: Math.floor((dispMin % 1) * 60), ended: elapsedSec >= FIRST_REAL_SEC, label: `${Math.floor(dispMin)}'` };
  }
  if (phase === "extra") {
    const capped = Math.min(elapsedSec, EXTRA_REAL_SEC);
    const dispMin = FIRST_DISPLAY_MIN + (capped / EXTRA_REAL_SEC) * EXTRA_DISPLAY_MIN;
    return { phase, minute: Math.floor(dispMin), second: Math.floor((dispMin % 1) * 60), ended: elapsedSec >= EXTRA_REAL_SEC, label: `${Math.floor(dispMin)}'` };
  }
  return null;
}

function checkPenaltyDecided(kicks) {
  const homeKicks = kicks.filter((k) => k.team === "home");
  const awayKicks = kicks.filter((k) => k.team === "away");
  const homeScore = homeKicks.filter((k) => k.scored).length;
  const awayScore = awayKicks.filter((k) => k.scored).length;
  const round = Math.max(homeKicks.length, awayKicks.length);
  if (round <= 5) {
    const homeRemaining = 5 - homeKicks.length;
    const awayRemaining = 5 - awayKicks.length;
    if (homeScore > awayScore + awayRemaining) return { decided: true, winner: "home", homeScore, awayScore };
    if (awayScore > homeScore + homeRemaining) return { decided: true, winner: "away", homeScore, awayScore };
    if (homeKicks.length === 5 && awayKicks.length === 5 && homeScore !== awayScore)
      return { decided: true, winner: homeScore > awayScore ? "home" : "away", homeScore, awayScore };
    return { decided: false, homeScore, awayScore };
  }
  if (homeKicks.length === awayKicks.length && homeScore !== awayScore)
    return { decided: true, winner: homeScore > awayScore ? "home" : "away", homeScore, awayScore };
  return { decided: false, homeScore, awayScore };
}

function useTicker(active) {
  const [, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setT((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
}

function useGoalFlash(total) {
  const prevRef = useRef(total);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (total > prevRef.current) {
      setFlash(false);
      requestAnimationFrame(() => setFlash(true));
      const t = setTimeout(() => setFlash(false), 1100);
      prevRef.current = total;
      return () => clearTimeout(t);
    }
    prevRef.current = total;
  }, [total]);
  return flash;
}

/* ---------------------------------- STANDINGS / STATS ---------------------------------- */
function computeStandings(matches, players, tournamentId) {
  const table = {};
  players.forEach((p) => {
    table[p.id] = { id: p.id, name: p.name, avatar: p.avatar, teamName: p.teamName, teamLogo: p.teamLogo,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });
  matches
    .filter((m) => m.tournamentId === tournamentId && m.round === "league" && m.status === "completed")
    .forEach((m) => {
      const h = table[m.homeId], a = table[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) { h.won++; a.lost++; h.pts += 3; }
      else if (m.homeScore < m.awayScore) { a.won++; h.lost++; a.pts += 3; }
      else { h.drawn++; a.drawn++; h.pts += 1; a.pts += 1; }
    });
  Object.values(table).forEach((t) => (t.gd = t.gf - t.ga));
  return Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
}
function topScorers(matches, players, tournamentId) {
  const goals = {};
  players.forEach((p) => (goals[p.id] = 0));
  matches.filter((m) => m.tournamentId === tournamentId && m.status === "completed").forEach((m) => {
    if (goals[m.homeId] != null) goals[m.homeId] += m.homeScore;
    if (goals[m.awayId] != null) goals[m.awayId] += m.awayScore;
  });
  return players.map((p) => ({ ...p, goals: goals[p.id] || 0 })).sort((a, b) => b.goals - a.goals);
}
function generatePlayoffMatches(tournamentId, standings) {
  const top4 = standings.slice(0, 4);
  if (top4.length < 4) return [];
  const [r1, r2, r3, r4] = top4;
  return [
    { id: uid(), tournamentId, round: "semiA", homeId: r1.id, awayId: r2.id, homeScore: null, awayScore: null,
      status: "scheduled", scheduledAt: "", label: "Top Match (1 vs 2)", liveState: null, decisive: true },
    { id: uid(), tournamentId, round: "semiB", homeId: r3.id, awayId: r4.id, homeScore: null, awayScore: null,
      status: "scheduled", scheduledAt: "", label: "Bottom Match (3 vs 4)", liveState: null, decisive: true },
  ];
}

/* ---------------------------------- UI PRIMITIVES ---------------------------------- */
const Card = ({ children, style, className = "", ...rest }) => (
  <div className={`rounded-2xl transition-all-fast ${className}`} style={{ background: C.surface, border: `1px solid ${C.border}`, ...style }} {...rest}>
    {children}
  </div>
);
const Btn = ({ children, variant = "primary", className = "", style, disabled, ...rest }) => {
  const variants = {
    primary: { background: C.pitch, color: "#fff", border: `1px solid ${C.pitch}` },
    gold: { background: C.gold, color: "#171207", border: `1px solid ${C.gold}` },
    claret: { background: C.claret, color: "#fff", border: `1px solid ${C.claret}` },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.claret, border: `1px solid ${C.claretDim}` },
  };
  return (
    <button disabled={disabled} className={`btn-hover px-4 py-2 rounded-lg text-sm font-semibold transition-all-fast active:scale-95 flex items-center justify-center gap-2 ${disabled ? "opacity-40" : ""} ${className}`}
      style={{ fontFamily: FONT_BODY, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
};
const Input = (props) => (
  <input {...props} className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all-fast ${props.className || ""}`}
    style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text, fontFamily: FONT_BODY, ...props.style }} />
);
const Select = (props) => (
  <select {...props} className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${props.className || ""}`}
    style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text, fontFamily: FONT_BODY, ...props.style }} />
);
const Label = ({ children }) => (
  <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: C.textFaint, fontFamily: FONT_BODY, fontWeight: 600 }}>{children}</div>
);
const Badge = ({ children, color = C.pitch, bg, pulse }) => (
  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide inline-flex items-center gap-1" style={{ color, background: bg || `${color}22`, fontFamily: FONT_BODY }}>
    {pulse && <span className="live-dot" style={{ background: color }} />}
    {children}
  </span>
);
const PlayerChip = ({ p, size = 8 }) => (
  <div className="flex items-center gap-2 min-w-0">
    <Avatar p={p} size={Math.max(18, size)} />
    <span className="truncate" style={{ fontFamily: FONT_BODY, fontWeight: 600 }}>{p?.name || "TBD"}</span>
    <span className="opacity-60 text-xs">{p?.teamLogo}</span>
  </div>
);
const EmojiPicker = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5 p-2 rounded-lg" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
    {options.map((e) => (
      <button type="button" key={e} onClick={() => onChange(e)} className="emoji-btn w-8 h-8 rounded-lg flex items-center justify-center text-lg"
        style={{ background: value === e ? `${C.pitch}44` : "transparent", border: value === e ? `1px solid ${C.pitch}` : "1px solid transparent" }}>
        {e}
      </button>
    ))}
  </div>
);
const LabeledPicker = ({ options, value, onChange }) => (
  <div className="grid grid-cols-4 gap-1.5 p-2 rounded-lg" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
    {options.map((o) => (
      <button type="button" key={o.emoji + o.label} onClick={() => onChange(o.emoji)} className="emoji-btn flex flex-col items-center gap-0.5 py-1.5 rounded-lg"
        style={{ background: value === o.emoji ? `${C.pitch}33` : "transparent", border: value === o.emoji ? `1px solid ${C.pitch}` : "1px solid transparent" }}>
        <span className="text-lg leading-none">{o.emoji}</span>
        <span className="text-[9px] truncate w-full text-center" style={{ color: C.textFaint }}>{o.label}</span>
      </button>
    ))}
  </div>
);
function EmptyState({ text }) { return <div className="text-sm text-center py-6" style={{ color: C.textFaint }}>{text}</div>; }
function SectionTitle({ icon: Icon, children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon size={18} color={C.pitchBright} />
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, letterSpacing: 0.5 }}>{children}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------------------------------- TICKER ---------------------------------- */
function ResultsTicker({ matches, players }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const recent = matches.filter((m) => m.status === "completed").sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)).slice(0, 12);
  if (recent.length === 0) {
    return <div className="w-full py-2 px-4 text-xs" style={{ background: C.bg2, color: C.textFaint, fontFamily: FONT_MONO }}>NO RESULTS YET — MATCHDAY TICKER WILL LIGHT UP HERE</div>;
  }
  const items = recent.map((m) => {
    const h = byId[m.homeId], a = byId[m.awayId];
    const pens = m.penaltyResult ? ` (${m.penaltyResult.home}-${m.penaltyResult.away} pens)` : "";
    return `${h?.name || "?"} ${m.homeScore}-${m.awayScore} ${a?.name || "?"}${pens}`;
  });
  const loop = [...items, ...items];
  return (
    <div className="w-full overflow-hidden relative" style={{ background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center">
        <div className="px-3 py-2 shrink-0 text-[11px] font-bold tracking-widest flex items-center gap-1" style={{ background: C.pitch, color: "#fff", fontFamily: FONT_DISPLAY }}>
          <Radio size={12} /> RESULTS
        </div>
        <div className="ticker-track flex items-center gap-8 py-2 px-6 whitespace-nowrap">
          {loop.map((t, i) => <span key={i} className="text-sm" style={{ color: C.pitchBright, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- LIVE MATCH BANNER (viewer-facing) ---------------------------------- */
function LiveScoreboard({ m, players, compact }) {
  useTicker(m.status === "live");
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  const clock = getClockState(m.liveState);
  const flash = useGoalFlash((m.homeScore || 0) + (m.awayScore || 0));
  return (
    <div className={`rounded-2xl p-4 relative overflow-hidden transition-all-fast ${flash ? "goal-flash" : ""}`} style={{ background: `linear-gradient(135deg, ${C.surface3}, ${C.surface})`, border: `1px solid ${C.claret}55` }}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge color={C.claret} pulse>LIVE</Badge>
        {clock && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ fontFamily: FONT_MONO, background: C.bg2, color: C.pitchBright }}>
            {clock.phase === "penalties" ? "PENALTIES" : clock.label}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <Avatar p={h} size={48} />
          <span className="text-sm font-semibold truncate text-center">{h?.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 px-2">
          <span key={`h-${m.homeScore}`} className="score-pop text-4xl font-bold" style={{ fontFamily: FONT_MONO, color: C.text }}>{m.homeScore ?? 0}</span>
          <span className="text-2xl opacity-40" style={{ fontFamily: FONT_MONO }}>-</span>
          <span key={`a-${m.awayScore}`} className="score-pop text-4xl font-bold" style={{ fontFamily: FONT_MONO, color: C.text }}>{m.awayScore ?? 0}</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <Avatar p={a} size={48} />
          <span className="text-sm font-semibold truncate text-center">{a?.name}</span>
        </div>
      </div>
      {m.liveState?.phase === "penalties" && m.liveState.penalties && (
        <PenaltyStrip penalties={m.liveState.penalties} />
      )}
    </div>
  );
}

function PenaltyStrip({ penalties }) {
  const home = penalties.kicks.filter((k) => k.team === "home");
  const away = penalties.kicks.filter((k) => k.team === "away");
  const Row = ({ kicks }) => (
    <div className="flex gap-1.5 justify-center">
      {kicks.map((k, i) => (
        <span key={i} className="kick-in w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: k.scored ? `${C.pitchBright}33` : `${C.claret}33`, color: k.scored ? C.pitchBright : C.claret, border: `1px solid ${k.scored ? C.pitchBright : C.claret}` }}>
          {k.scored ? "●" : "✕"}
        </span>
      ))}
    </div>
  );
  return (
    <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${C.border}` }}>
      <Row kicks={home} /><Row kicks={away} />
    </div>
  );
}

/* ---------------------------------- MATCH CARD ---------------------------------- */
function MatchCard({ m, players }) {
  useTicker(m.status === "live");
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  const clock = m.status === "live" ? getClockState(m.liveState) : null;
  const flash = useGoalFlash((m.homeScore || 0) + (m.awayScore || 0));
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all-fast ${m.status === "live" && flash ? "goal-flash" : ""}`} style={{ background: C.surface2, border: `1px solid ${m.status === "live" ? C.claret + "77" : C.border}` }}>
      <div className="flex-1 min-w-0"><PlayerChip p={h} size={18} /></div>
      <div className="px-3 text-center shrink-0">
        {m.status === "completed" ? (
          <div>
            <div className="font-bold text-lg" style={{ fontFamily: FONT_MONO, color: C.pitchBright }}>{m.homeScore} – {m.awayScore}</div>
            <div className="flex items-center gap-1 justify-center mt-0.5">
              <span className="text-[9px]" style={{ color: C.textFaint }}>{resultBadgeLabel(m)}</span>
              {m.penaltyResult && <span className="text-[9px]" style={{ color: C.textFaint }}>({m.penaltyResult.home}-{m.penaltyResult.away} pens)</span>}
            </div>
          </div>
        ) : m.status === "live" ? (
          <div>
            <Badge color={C.claret} pulse>LIVE</Badge>
            <div className="font-bold text-lg mt-1" style={{ fontFamily: FONT_MONO, color: C.text }}>
              <span key={`h-${m.homeScore}`} className="score-pop">{m.homeScore ?? 0}</span> – <span key={`a-${m.awayScore}`} className="score-pop">{m.awayScore ?? 0}</span>
            </div>
            <div className="text-[10px]" style={{ fontFamily: FONT_MONO, color: C.pitchBright }}>{clock?.phase === "penalties" ? "PENS" : clock?.label}</div>
          </div>
        ) : (
          <div className="text-xs" style={{ color: C.textFaint, fontFamily: FONT_MONO }}>{fmtDate(m.scheduledAt)}</div>
        )}
        {m.label && <div className="text-[10px] mt-1 uppercase tracking-wide" style={{ color: C.textFaint }}>{m.label}</div>}
      </div>
      <div className="flex-1 min-w-0 flex justify-end"><PlayerChip p={a} size={18} /></div>
    </div>
  );
}

/* ---------------------------------- MAIN APP ---------------------------------- */
export default function App() {
  useGoogleFonts();
  const [loading, setLoading] = useState(true);
  const [adminConfig, setAdminConfig] = useState(null);
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const [ac, pl, tr, ma, no] = await Promise.all([
        loadKey("admin-config", null), loadKey("players", []), loadKey("tournaments", []),
        loadKey("matches", []), loadKey("notifications", []),
      ]);
      setAdminConfig(ac); setPlayers(pl); setTournaments(tr); setMatches(ma); setNotifications(no);
      setLoading(false);
    })();
  }, []);

  // real-time-ish sync: poll matches frequently, everything else less often
  useEffect(() => {
    const fast = setInterval(async () => {
      if (document.hidden) return;
      setMatches(await loadKey("matches", []));
    }, 3500);
    const slow = setInterval(async () => {
      if (document.hidden) return;
      const [pl, tr, no] = await Promise.all([loadKey("players", []), loadKey("tournaments", []), loadKey("notifications", [])]);
      setPlayers(pl); setTournaments(tr); setNotifications(no);
    }, 15000);
    return () => { clearInterval(fast); clearInterval(slow); };
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const persistPlayers = async (next) => { setPlayers(next); await saveKey("players", next); };
  const persistTournaments = async (next) => { setTournaments(next); await saveKey("tournaments", next); };
  const persistMatches = async (next) => { setMatches(next); await saveKey("matches", next); };
  const persistNotifications = async (next) => { setNotifications(next); await saveKey("notifications", next); };
  const persistAdminConfig = async (next) => { setAdminConfig(next); await saveKey("admin-config", next); };
  const pushNotification = async (text, type = "info") => {
    const next = [{ id: uid(), text, type, createdAt: now() }, ...notifications].slice(0, 50);
    await persistNotifications(next);
  };

  const activeTournament = tournaments.find((t) => t.status === "active") || null;
  const history = tournaments.filter((t) => t.status === "completed").sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.text }}>
        <GlobalStyle />
        <div className="flex items-center gap-2" style={{ fontFamily: FONT_DISPLAY }}><Trophy className="spin-slow" /> LOADING LEAGUE DATA…</div>
      </div>
    );
  }
  if (!adminConfig) {
    return (<><GlobalStyle /><SetupScreen onDone={async (pwd) => { await persistAdminConfig({ password: pwd }); showToast("Admin account created"); }} /></>);
  }
  if (!session) {
    return (
      <>
        <GlobalStyle />
        <AuthGate
          players={players} adminConfig={adminConfig} persistPlayers={persistPlayers} showToast={showToast}
          onPlayerLogin={(p) => { setSession({ type: "player", playerId: p.id }); setTab("dashboard"); }}
          onAdminLogin={() => { setSession({ type: "admin" }); setTab("admin"); }}
        />
      </>
    );
  }

  const me = session.type === "player" ? players.find((p) => p.id === session.playerId) : null;
  const ctx = { players, tournaments, matches, notifications, activeTournament, history, persistPlayers, persistTournaments, persistMatches, persistNotifications, pushNotification, showToast, adminConfig, persistAdminConfig };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text, fontFamily: FONT_BODY }}>
      <GlobalStyle />
      {toast && <div className="toast-anim fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold" style={{ background: C.pitch, color: "#fff" }}>{toast}</div>}
      <ResultsTicker matches={matches} players={players} />
      <TopBar session={session} me={me} onLogout={() => { setSession(null); setTab("dashboard"); }} />
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pb-24">
        <NavTabs session={session} tab={tab} setTab={setTab} />
        <div className="mt-4">
          {session.type === "admin" ? <AdminConsole {...ctx} tab={tab} /> : <PlayerViews {...ctx} me={me} tab={tab} setTab={setTab} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- SETUP ---------------------------------- */
function SetupScreen({ onDone }) {
  const [pwd, setPwd] = useState(""); const [pwd2, setPwd2] = useState(""); const [err, setErr] = useState("");
  useGoogleFonts();
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg, color: C.text, fontFamily: FONT_BODY }}>
      <Card className="fade-up w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-1"><Trophy color={C.gold} /><h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, letterSpacing: 0.5 }}>LEAGUE SETUP</h1></div>
        <p className="text-sm mb-4" style={{ color: C.textDim }}>First time here. Set an admin password — kept completely separate from player accounts.</p>
        <Label>Admin password</Label>
        <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Choose a password" />
        <div className="h-2" />
        <Label>Confirm password</Label>
        <Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder="Repeat password" />
        {err && <div className="text-xs mt-2" style={{ color: C.claret }}>{err}</div>}
        <Btn className="w-full mt-4" onClick={() => {
          if (pwd.length < 4) return setErr("Use at least 4 characters.");
          if (pwd !== pwd2) return setErr("Passwords don't match.");
          onDone(pwd);
        }}><Shield size={16} /> Create admin account</Btn>
      </Card>
    </div>
  );
}

/* ---------------------------------- AUTH GATE (Sign in / Sign up / Admin) ---------------------------------- */
function AuthGate({ players, adminConfig, persistPlayers, showToast, onPlayerLogin, onAdminLogin }) {
  const [mode, setMode] = useState("signin"); // signin | signup | admin
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: C.bg, color: C.text, fontFamily: FONT_BODY }}>
      <div className="w-full max-w-sm fade-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, letterSpacing: 1 }}>FRIENDS eLEAGUE</h1>
          <p className="text-sm" style={{ color: C.textDim }}>Matchday central for the crew</p>
        </div>

        {mode !== "admin" && (
          <Card className="p-1.5 flex mb-4">
            <button onClick={() => setMode("signin")} className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all-fast" style={{ background: mode === "signin" ? C.pitch : "transparent", color: mode === "signin" ? "#fff" : C.textDim }}>Sign in</button>
            <button onClick={() => setMode("signup")} className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all-fast" style={{ background: mode === "signup" ? C.pitch : "transparent", color: mode === "signup" ? "#fff" : C.textDim }}>Sign up</button>
          </Card>
        )}

        {mode === "signin" && <SignInForm players={players} onPlayerLogin={onPlayerLogin} />}
        {mode === "signup" && <SignUpForm players={players} persistPlayers={persistPlayers} showToast={showToast} onPlayerLogin={onPlayerLogin} />}
        {mode === "admin" && <AdminLoginForm adminConfig={adminConfig} onAdminLogin={onAdminLogin} onBack={() => setMode("signin")} />}

        {mode !== "admin" && (
          <button onClick={() => setMode("admin")} className="w-full text-center text-xs mt-4 flex items-center justify-center gap-1" style={{ color: C.textFaint }}>
            <Lock size={11} /> Admin login instead
          </button>
        )}
      </div>
    </div>
  );
}

function SignInForm({ players, onPlayerLogin }) {
  const [id, setId] = useState(""); const [pwd, setPwd] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => {
    setErr("");
    const key = id.trim().toLowerCase();
    if (!key || !pwd) return setErr("Enter your username/email and password.");
    const p = players.find((x) => x.username?.toLowerCase() === key || x.email?.toLowerCase() === key);
    if (!p) return setErr("No account found with that username or email.");
    setBusy(true);
    const hash = await sha256(p.salt + ":" + pwd);
    setBusy(false);
    if (hash !== p.passwordHash) return setErr("Incorrect password.");
    onPlayerLogin(p);
  };
  return (
    <Card className="p-5">
      {players.length === 0 && <div className="text-xs mb-3" style={{ color: C.textFaint }}>No accounts yet — create the first one from Sign up.</div>}
      <Label>Username or email</Label>
      <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="you@example.com" />
      <div className="h-3" />
      <Label>Password</Label>
      <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Your password" onKeyDown={(e) => e.key === "Enter" && submit()} />
      {err && <div className="text-xs mt-2" style={{ color: C.claret }}>{err}</div>}
      <Btn className="w-full mt-4" disabled={busy} onClick={submit}><User size={16} /> {busy ? "Checking…" : "Sign in"}</Btn>
    </Card>
  );
}

function SignUpForm({ players, persistPlayers, showToast, onPlayerLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "", name: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setErr("");
    const uname = form.username.trim();
    const email = form.email.trim().toLowerCase();
    if (uname.length < 3) return setErr("Username needs at least 3 characters.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email.");
    if (form.password.length < 4) return setErr("Password needs at least 4 characters.");
    if (form.password !== form.confirm) return setErr("Passwords don't match.");
    if (!form.name.trim()) return setErr("Enter a display name.");
    const taken = players.some((p) => p.username?.toLowerCase() === uname.toLowerCase() || p.email?.toLowerCase() === email);
    if (taken) return setErr("That username or email is already registered.");
    setBusy(true);
    const salt = randomSalt();
    const passwordHash = await sha256(salt + ":" + form.password);
    const p = {
      id: uid(), username: uname, email, passwordHash, salt,
      name: form.name.trim(), avatar: null, avatarImage: null, flag: null,
      teamName: `${form.name.trim()}'s XI`, teamLogo: null,
      createdAt: now(),
    };
    await persistPlayers([...players, p]);
    setBusy(false);
    showToast(`Welcome to the league, ${p.name}! Set up your avatar and team in Profile.`);
    onPlayerLogin(p);
  };

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 gap-3">
        <div><Label>Display name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="How others see you" /></div>
        <div><Label>Username</Label><Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="e.g. shadow_striker" /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••" /></div>
          <div><Label>Confirm</Label><Input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="••••••" /></div>
        </div>
      </div>
      <div className="text-xs mt-3" style={{ color: C.textFaint }}>You can pick your avatar, flag and team crest afterwards in Profile.</div>
      {err && <div className="text-xs mt-2" style={{ color: C.claret }}>{err}</div>}
      <Btn className="w-full mt-4" disabled={busy} onClick={submit}><UserPlus size={16} /> {busy ? "Creating…" : "Create account"}</Btn>
    </Card>
  );
}

function AdminLoginForm({ adminConfig, onAdminLogin, onBack }) {
  const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3"><ShieldAlert size={16} color={C.gold} /><span className="text-sm font-semibold">Admin console</span></div>
      <Label>Admin password</Label>
      <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Enter admin password" onKeyDown={(e) => e.key === "Enter" && (pwd === adminConfig.password ? onAdminLogin() : setErr("Incorrect password."))} />
      {err && <div className="text-xs mt-2" style={{ color: C.claret }}>{err}</div>}
      <Btn variant="gold" className="w-full mt-4" onClick={() => { if (pwd !== adminConfig.password) return setErr("Incorrect password."); onAdminLogin(); }}><Lock size={16} /> Enter admin console</Btn>
      <button onClick={onBack} className="w-full text-center text-xs mt-3" style={{ color: C.textFaint }}>← Back to player sign in</button>
    </Card>
  );
}

/* ---------------------------------- TOP BAR + NAV ---------------------------------- */
function TopBar({ session, me, onLogout }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2"><span className="text-xl">🏆</span><span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 0.5 }}>FRIENDS eLEAGUE</span></div>
      <div className="flex items-center gap-3">
        {session.type === "admin" ? <Badge color={C.gold}>ADMIN</Badge> : me ? (
          <div className="flex items-center gap-2 text-sm"><span className="text-lg">{me.avatar}</span><span className="hidden sm:inline font-semibold">{me.name}</span></div>
        ) : null}
        <button onClick={onLogout} className="btn-hover p-2 rounded-lg transition-all-fast" style={{ border: `1px solid ${C.border}` }} title="Log out"><LogOut size={16} /></button>
      </div>
    </div>
  );
}

function NavTabs({ session, tab, setTab }) {
  const playerTabs = [
    { id: "dashboard", label: "Dashboard", icon: Home }, { id: "standings", label: "Standings", icon: ListOrdered },
    { id: "matches", label: "Matches", icon: Calendar }, { id: "playoffs", label: "Playoffs", icon: Swords },
    { id: "players", label: "Roster", icon: Users }, { id: "history", label: "History", icon: Archive },
    { id: "notifications", label: "Alerts", icon: Bell }, { id: "profile", label: "Profile", icon: UserCircle2 },
  ];
  const adminTabs = [
    { id: "admin", label: "Overview", icon: Home }, { id: "admin-players", label: "Players", icon: Users },
    { id: "admin-tournament", label: "Tournament", icon: Trophy }, { id: "admin-matches", label: "Matches", icon: Calendar },
    { id: "admin-playoffs", label: "Playoffs", icon: Swords }, { id: "admin-settings", label: "Settings", icon: Settings },
  ];
  const items = session.type === "admin" ? adminTabs : playerTabs;
  return (
    <div className="flex gap-1 overflow-x-auto pt-4 pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
      {items.map((it) => {
        const Icon = it.icon; const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="transition-all-fast flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0"
            style={{ background: active ? C.surface3 : "transparent", color: active ? C.pitchBright : C.textDim, border: `1px solid ${active ? C.borderLight : "transparent"}` }}>
            <Icon size={15} /> {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- STANDINGS TABLE ---------------------------------- */
function StandingsTable({ standings, highlightId }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ fontFamily: FONT_BODY, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: C.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <th className="text-left py-2 pl-2">#</th><th className="text-left py-2">Player</th>
            <th className="text-center py-2">P</th><th className="text-center py-2">W</th><th className="text-center py-2">D</th><th className="text-center py-2">L</th>
            <th className="text-center py-2">GF</th><th className="text-center py-2">GA</th><th className="text-center py-2">GD</th><th className="text-center py-2 pr-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const zoneColor = i < 2 ? C.gold : i < 4 ? C.claret : "transparent";
            const isMe = s.id === highlightId;
            return (
              <tr key={s.id} className="fade-up transition-all-fast" style={{ animationDelay: `${i * 35}ms`, background: isMe ? `${C.pitch}18` : "transparent", borderTop: `1px solid ${C.border}` }}>
                <td className="py-2.5 pl-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: zoneColor === "transparent" ? C.surface2 : `${zoneColor}33`, color: zoneColor === "transparent" ? C.textDim : zoneColor, border: `1px solid ${zoneColor === "transparent" ? C.border : zoneColor}` }}>{i + 1}</div>
                </td>
                <td className="py-2.5"><PlayerChip p={s} size={16} /></td>
                <td className="text-center" style={{ fontFamily: FONT_MONO }}>{s.played}</td>
                <td className="text-center" style={{ fontFamily: FONT_MONO }}>{s.won}</td>
                <td className="text-center" style={{ fontFamily: FONT_MONO }}>{s.drawn}</td>
                <td className="text-center" style={{ fontFamily: FONT_MONO }}>{s.lost}</td>
                <td className="text-center" style={{ fontFamily: FONT_MONO }}>{s.gf}</td>
                <td className="text-center" style={{ fontFamily: FONT_MONO }}>{s.ga}</td>
                <td className="text-center" style={{ fontFamily: FONT_MONO }}>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                <td className="text-center pr-2 font-bold" style={{ fontFamily: FONT_MONO, color: C.pitchBright }}>{s.pts}</td>
              </tr>
            );
          })}
          {standings.length === 0 && <tr><td colSpan={10} className="text-center py-6" style={{ color: C.textFaint }}>No players in this tournament yet.</td></tr>}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 px-2 text-[11px]" style={{ color: C.textFaint }}>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: C.gold }} /> Top match qualifiers</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: C.claret }} /> Bottom match qualifiers</span>
      </div>
    </div>
  );
}

/* ---------------------------------- PLAYER-SIDE VIEWS ---------------------------------- */
function PlayerViews(props) {
  const { tab } = props;
  if (tab === "dashboard") return <PlayerDashboard {...props} />;
  if (tab === "standings") return <StandingsView {...props} />;
  if (tab === "matches") return <MatchesView {...props} />;
  if (tab === "playoffs") return <PlayoffsView {...props} />;
  if (tab === "players") return <RosterView {...props} />;
  if (tab === "history") return <HistoryView {...props} />;
  if (tab === "notifications") return <NotificationsView {...props} />;
  if (tab === "profile") return <ProfileView {...props} />;
  return null;
}

function PlayerDashboard({ me, activeTournament, matches, players, setTab }) {
  const t = activeTournament;
  const tMatches = t ? matches.filter((m) => m.tournamentId === t.id) : [];
  const standings = t ? computeStandings(tMatches, players, t.id) : [];
  const myRank = standings.findIndex((s) => s.id === me.id) + 1;
  const myRow = standings.find((s) => s.id === me.id);
  const live = tMatches.filter((m) => m.status === "live");
  const myLive = live.filter((m) => m.homeId === me.id || m.awayId === me.id);
  const otherLive = live.filter((m) => m.homeId !== me.id && m.awayId !== me.id);
  const upcoming = tMatches.filter((m) => m.status === "scheduled" && (m.homeId === me.id || m.awayId === me.id)).sort((a, b) => new Date(a.scheduledAt || "9999") - new Date(b.scheduledAt || "9999")).slice(0, 3);
  const recent = tMatches.filter((m) => m.status === "completed" && (m.homeId === me.id || m.awayId === me.id)).sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)).slice(0, 5);

  if (!t) return <Card className="fade-up p-8 text-center"><Trophy className="mx-auto mb-3" color={C.textFaint} size={32} /><div style={{ fontFamily: FONT_DISPLAY, fontSize: 20 }}>No active tournament</div><p className="text-sm mt-1" style={{ color: C.textDim }}>Ask the admin to start a new season.</p></Card>;

  return (
    <div className="space-y-4">
      <Card className="fade-up p-6 flex flex-col items-center text-center gap-3" style={{ background: `linear-gradient(135deg, ${C.surface} 0%, ${C.surface2} 100%)` }}>
        <Avatar p={me} size={76} ring={C.pitch} glow />
        <div>
          <div className="text-xl font-bold" style={{ fontFamily: FONT_DISPLAY }}>{me.name} {me.flag}</div>
          <div className="text-xs" style={{ color: C.textDim }}>{me.teamLogo} {me.teamName}</div>
        </div>
        <div className="flex items-center gap-6 mt-1">
          <div className="text-center"><div className="text-2xl font-bold" style={{ fontFamily: FONT_MONO, color: C.gold }}>{myRank || "–"}</div><div className="text-[10px] uppercase tracking-wide" style={{ color: C.textFaint }}>Position</div></div>
          <div className="text-center"><div className="text-2xl font-bold" style={{ fontFamily: FONT_MONO, color: C.pitchBright }}>{myRow?.pts ?? 0}</div><div className="text-[10px] uppercase tracking-wide" style={{ color: C.textFaint }}>Points</div></div>
        </div>
      </Card>

      {myLive.map((m) => <div key={m.id} className="fade-up"><LiveScoreboard m={m} players={players} /></div>)}
      {otherLive.length > 0 && (
        <Card className="fade-up p-4">
          <SectionTitle icon={Radio}>Other live matches</SectionTitle>
          <div className="space-y-2">{otherLive.map((m) => <MatchCard key={m.id} m={m} players={players} />)}</div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="fade-up p-4">
          <SectionTitle icon={Clock} right={<button onClick={() => setTab("matches")} className="text-xs flex items-center gap-1" style={{ color: C.textDim }}>All <ChevronRight size={12} /></button>}>Upcoming</SectionTitle>
          <div className="space-y-2">{upcoming.length ? upcoming.map((m) => <MatchCard key={m.id} m={m} players={players} />) : <div className="text-sm py-4 text-center" style={{ color: C.textFaint }}>No fixtures scheduled.</div>}</div>
        </Card>
        <Card className="fade-up p-4">
          <SectionTitle icon={TrendingUp} right={<button onClick={() => setTab("matches")} className="text-xs flex items-center gap-1" style={{ color: C.textDim }}>All <ChevronRight size={12} /></button>}>Recent results</SectionTitle>
          <div className="space-y-2">{recent.length ? recent.map((m) => <MatchCard key={m.id} m={m} players={players} />) : <div className="text-sm py-4 text-center" style={{ color: C.textFaint }}>No results yet.</div>}</div>
        </Card>
      </div>

      <Card className="fade-up p-4">
        <SectionTitle icon={ListOrdered} right={<button onClick={() => setTab("standings")} className="text-xs flex items-center gap-1" style={{ color: C.textDim }}>Full table <ChevronRight size={12} /></button>}>League table</SectionTitle>
        <StandingsTable standings={standings.slice(0, 5)} highlightId={me.id} />
      </Card>
    </div>
  );
}

function StandingsView({ activeTournament, matches, players, me }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id);
  const standings = computeStandings(tMatches, players, activeTournament.id);
  const scorers = topScorers(tMatches, players, activeTournament.id).slice(0, 5);
  return (
    <div className="space-y-4">
      <Card className="fade-up p-4"><SectionTitle icon={ListOrdered}>{activeTournament.name} — Table</SectionTitle><StandingsTable standings={standings} highlightId={me?.id} /></Card>
      <Card className="fade-up p-4">
        <SectionTitle icon={Target}>Top scorers</SectionTitle>
        <div className="space-y-2">
          {scorers.map((s, i) => (
            <div key={s.id} className="fade-up flex items-center justify-between py-1.5" style={{ animationDelay: `${i * 40}ms`, borderBottom: i < scorers.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div className="flex items-center gap-2"><span className="text-xs w-4" style={{ color: C.textFaint }}>{i + 1}</span><PlayerChip p={s} size={16} /></div>
              <span className="font-bold" style={{ fontFamily: FONT_MONO, color: C.gold }}>{s.goals}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MatchesView({ activeTournament, matches, players }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round === "league");
  const live = tMatches.filter((m) => m.status === "live");
  const upcoming = tMatches.filter((m) => m.status === "scheduled").sort((a, b) => new Date(a.scheduledAt || "9999") - new Date(b.scheduledAt || "9999"));
  const completed = tMatches.filter((m) => m.status === "completed").sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  return (
    <div className="space-y-4">
      {live.length > 0 && <div className="space-y-3">{live.map((m) => <div key={m.id} className="fade-up"><LiveScoreboard m={m} players={players} /></div>)}</div>}
      <Card className="fade-up p-4"><SectionTitle icon={Clock}>Upcoming fixtures</SectionTitle><div className="space-y-2">{upcoming.length ? upcoming.map((m) => <MatchCard key={m.id} m={m} players={players} />) : <EmptyState text="No upcoming fixtures." />}</div></Card>
      <Card className="fade-up p-4"><SectionTitle icon={Calendar}>Match history</SectionTitle><div className="space-y-2">{completed.length ? completed.map((m) => <MatchCard key={m.id} m={m} players={players} />) : <EmptyState text="No completed matches yet." />}</div></Card>
    </div>
  );
}

function PlayoffBracketDisplay({ tMatches, players }) {
  const byRound = Object.fromEntries(tMatches.map((m) => [m.round, m]));
  const { semiA, semiB, challenger, final } = byRound;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: C.gold }}>Top match (Rank 1 vs 2)</div>{semiA ? (semiA.status === "live" ? <LiveScoreboard m={semiA} players={players} /> : <MatchCard m={semiA} players={players} />) : <EmptyState text="Not generated yet." />}</div>
        <div><div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: C.claret }}>Bottom match (Rank 3 vs 4)</div>{semiB ? (semiB.status === "live" ? <LiveScoreboard m={semiB} players={players} /> : <MatchCard m={semiB} players={players} />) : <EmptyState text="Not generated yet." />}</div>
      </div>
      <div><div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: C.textDim }}>Challenger match — Top match loser vs Bottom match winner</div>{challenger ? (challenger.status === "live" ? <LiveScoreboard m={challenger} players={players} /> : <MatchCard m={challenger} players={players} />) : <EmptyState text="Unlocks once both matches above are completed." />}</div>
      <div><div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: C.pitchBright }}>Final — Top match winner vs Challenger winner</div>{final ? (final.status === "live" ? <LiveScoreboard m={final} players={players} /> : <MatchCard m={final} players={players} />) : <EmptyState text="Unlocks once the challenger match is completed." />}</div>
      {final?.status === "completed" && (
        <Card className="fade-up p-5 text-center" style={{ background: `linear-gradient(135deg, ${C.gold}22, transparent)`, borderColor: C.gold }}>
          <Crown className="mx-auto mb-2" color={C.gold} size={28} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22 }}>{byId[matchWinnerId(final)]?.name} is the Champion! 🏆</div>
        </Card>
      )}
    </div>
  );
}

function PlayoffsView({ activeTournament, matches, players }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round !== "league");
  if (tMatches.length === 0) return <Card className="fade-up p-4"><EmptyState text="Playoffs haven't started yet. They unlock once the admin closes the league phase." /></Card>;
  return <Card className="fade-up p-4"><SectionTitle icon={Swords}>Playoff bracket</SectionTitle><PlayoffBracketDisplay tMatches={tMatches} players={players} /></Card>;
}

function RosterView({ players, matches }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {players.map((p, i) => {
        const pm = matches.filter((m) => m.status === "completed" && (m.homeId === p.id || m.awayId === p.id));
        const wins = pm.filter((m) => matchWinnerId(m) === p.id).length;
        const losses = pm.filter((m) => matchLoserId(m) === p.id).length;
        const draws = pm.length - wins - losses;
        const golds = matches.filter((m) => m.round === "final" && m.status === "completed" && matchWinnerId(m) === p.id).length;
        return (
          <Card key={p.id} className="fade-up card-hover p-4 flex items-center gap-3" style={{ animationDelay: `${i * 40}ms` }}>
            <Avatar p={p} size={56} />
            <div className="min-w-0 flex-1">
              <div className="font-bold flex items-center gap-1.5" style={{ fontFamily: FONT_DISPLAY, fontSize: 16 }}>{p.name} <span>{p.flag}</span></div>
              <div className="text-xs" style={{ color: C.textDim }}>{p.teamLogo} {p.teamName}</div>
              <div className="flex gap-3 mt-1.5 text-xs" style={{ fontFamily: FONT_MONO, color: C.textDim }}>
                <span>{wins}W</span><span>{draws}D</span><span>{losses}L</span>
                {golds > 0 && <span className="flex items-center gap-0.5" style={{ color: C.gold }}><Trophy size={11} />{golds}</span>}
              </div>
            </div>
          </Card>
        );
      })}
      {players.length === 0 && <EmptyState text="No players yet." />}
    </div>
  );
}

function HistoryView({ history, players }) {
  if (history.length === 0) return <Card className="fade-up p-4"><EmptyState text="No completed tournaments yet — this fills up once a season is finished." /></Card>;
  return (
    <div className="space-y-3">
      {history.map((t, i) => {
        const champ = players.find((p) => p.id === t.championId);
        const runner = players.find((p) => p.id === t.runnerUpId);
        const third = players.find((p) => p.id === t.thirdId);
        const mvp = players.find((p) => p.id === t.mvpId);
        return (
          <Card key={t.id} className="fade-up p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3"><div style={{ fontFamily: FONT_DISPLAY, fontSize: 18 }}>{t.name}</div><span className="text-xs" style={{ color: C.textFaint }}>{new Date(t.completedAt).toLocaleDateString()}</span></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg" style={{ background: `${C.gold}18` }}><Medal size={18} className="mx-auto mb-1" color={C.gold} /><div className="text-xs font-semibold">{champ?.name || "—"}</div><div className="text-[10px]" style={{ color: C.textFaint }}>Champion</div></div>
              <div className="p-2 rounded-lg" style={{ background: `#C0C0C022` }}><Medal size={18} className="mx-auto mb-1" color="#C0C0C0" /><div className="text-xs font-semibold">{runner?.name || "—"}</div><div className="text-[10px]" style={{ color: C.textFaint }}>Runner-up</div></div>
              <div className="p-2 rounded-lg" style={{ background: `#CD7F3222` }}><Medal size={18} className="mx-auto mb-1" color="#CD7F32" /><div className="text-xs font-semibold">{third?.name || "—"}</div><div className="text-[10px]" style={{ color: C.textFaint }}>Third place</div></div>
            </div>
            {mvp && <div className="mt-2 text-xs flex items-center gap-1.5 justify-center" style={{ color: C.pitchBright }}><Award size={13} /> MVP of the tournament: <strong>{mvp.name}</strong></div>}
          </Card>
        );
      })}
    </div>
  );
}

function NotificationsView({ notifications }) {
  return (
    <Card className="fade-up p-4">
      <SectionTitle icon={Bell}>Notifications</SectionTitle>
      <div className="space-y-2">
        {notifications.length ? notifications.map((n, i) => (
          <div key={n.id} className="fade-up p-3 rounded-lg flex items-start gap-2" style={{ animationDelay: `${i * 30}ms`, background: C.surface2, border: `1px solid ${C.border}` }}>
            <Bell size={14} className="mt-0.5 shrink-0" color={C.pitchBright} />
            <div><div className="text-sm">{n.text}</div><div className="text-[10px] mt-0.5" style={{ color: C.textFaint }}>{fmtDate(n.createdAt)}</div></div>
          </div>
        )) : <EmptyState text="No notifications yet." />}
      </div>
    </Card>
  );
}

/* ---------------------------------- PLAYER PROFILE SETTINGS ---------------------------------- */
function ProfileView({ me, players, persistPlayers, showToast }) {
  const [form, setForm] = useState({ name: me.name, teamName: me.teamName, avatar: me.avatar, avatarImage: me.avatarImage, flag: me.flag, teamLogo: me.teamLogo });
  const [pwd, setPwd] = useState(""); const [pwd2, setPwd2] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const saveProfile = async () => {
    if (!form.name.trim()) return showToast("Enter a display name");
    await persistPlayers(players.map((p) => (p.id === me.id ? { ...p, ...form, name: form.name.trim(), teamName: form.teamName.trim() || `${form.name.trim()}'s XI` } : p)));
    showToast("Profile updated");
  };

  const savePassword = async () => {
    if (pwd.length < 4) return showToast("Password needs at least 4 characters");
    if (pwd !== pwd2) return showToast("Passwords don't match");
    const salt = randomSalt();
    const passwordHash = await sha256(salt + ":" + pwd);
    await persistPlayers(players.map((p) => (p.id === me.id ? { ...p, salt, passwordHash } : p)));
    setPwd(""); setPwd2("");
    showToast("Password updated");
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImageFile(file);
      set("avatarImage", dataUrl);
    } catch { showToast("Couldn't read that image"); }
    setUploading(false);
  };

  const previewPlayer = { ...me, ...form };

  return (
    <div className="space-y-4">
      <Card className="fade-up p-6 flex flex-col items-center text-center">
        <Avatar p={previewPlayer} size={88} ring={C.pitch} glow />
        <div className="flex items-center gap-2 mt-3">
          <Btn variant="ghost" style={{ padding: "6px 10px" }} onClick={() => fileRef.current?.click()} disabled={uploading}><Camera size={14} /> {uploading ? "Uploading…" : "Upload photo"}</Btn>
          {form.avatarImage && <Btn variant="danger" style={{ padding: "6px 10px" }} onClick={() => set("avatarImage", null)}><X size={14} /> Remove</Btn>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <div className="text-xs mt-2" style={{ color: C.textFaint }}>Or pick an emoji avatar below</div>
      </Card>

      <Card className="fade-up p-4">
        <SectionTitle icon={UserCircle2}>Your profile</SectionTitle>
        <div className="grid gap-3">
          <div><Label>Display name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><Label>Team name</Label><Input value={form.teamName} onChange={(e) => set("teamName", e.target.value)} placeholder="e.g. FC Nightfall" /></div>
          <div><Label>Emoji avatar</Label><EmojiPicker options={AVATARS} value={form.avatar} onChange={(v) => set("avatar", v)} /></div>
          <div><Label>Flag</Label><LabeledPicker options={FLAGS} value={form.flag} onChange={(v) => set("flag", v)} /></div>
          <div><Label>Team crest</Label><LabeledPicker options={LOGOS} value={form.teamLogo} onChange={(v) => set("teamLogo", v)} /></div>
        </div>
        <Btn className="w-full mt-4" onClick={saveProfile}><Check size={15} /> Save profile</Btn>
      </Card>

      <Card className="fade-up p-4 max-w-sm">
        <SectionTitle icon={KeyRound}>Change password</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>New password</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••" /></div>
          <div><Label>Confirm</Label><Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder="••••••" /></div>
        </div>
        <Btn className="w-full mt-3" onClick={savePassword}><KeyRound size={15} /> Update password</Btn>
      </Card>
    </div>
  );
}

/* ---------------------------------- ADMIN CONSOLE ---------------------------------- */
function AdminConsole(props) {
  const { tab } = props;
  if (tab === "admin") return <AdminOverview {...props} />;
  if (tab === "admin-players") return <AdminPlayers {...props} />;
  if (tab === "admin-tournament") return <AdminTournament {...props} />;
  if (tab === "admin-matches") return <AdminMatches {...props} />;
  if (tab === "admin-playoffs") return <AdminPlayoffs {...props} />;
  if (tab === "admin-settings") return <AdminSettings {...props} />;
  return null;
}

function AdminOverview({ players, activeTournament, matches, history }) {
  const tMatches = activeTournament ? matches.filter((m) => m.tournamentId === activeTournament.id) : [];
  const live = tMatches.filter((m) => m.status === "live").length;
  const scheduled = tMatches.filter((m) => m.status === "scheduled").length;
  const completed = tMatches.filter((m) => m.status === "completed").length;
  const stats = [
    { label: "Players", value: players.length, icon: Users, color: C.pitchBright },
    { label: "Live now", value: live, icon: Radio, color: C.claret },
    { label: "Upcoming", value: scheduled, icon: Clock, color: C.gold },
    { label: "Completed", value: completed, icon: Check, color: C.textDim },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => { const Icon = s.icon; return (
          <Card key={s.label} className="fade-up p-4" style={{ animationDelay: `${i * 40}ms` }}><Icon size={16} color={s.color} /><div className="text-2xl font-bold mt-2" style={{ fontFamily: FONT_MONO }}>{s.value}</div><div className="text-xs" style={{ color: C.textFaint }}>{s.label}</div></Card>
        ); })}
      </div>
      <Card className="fade-up p-4"><SectionTitle icon={Trophy}>Current tournament</SectionTitle>{activeTournament ? <div className="text-sm" style={{ color: C.textDim }}><strong style={{ color: C.text }}>{activeTournament.name}</strong> — started {new Date(activeTournament.createdAt).toLocaleDateString()}</div> : <EmptyState text="No active tournament. Go to the Tournament tab to start one." />}</Card>
      <Card className="fade-up p-4"><SectionTitle icon={Archive}>Completed seasons</SectionTitle><div className="text-2xl font-bold" style={{ fontFamily: FONT_MONO, color: C.gold }}>{history.length}</div></Card>
    </div>
  );
}

function AdminPlayers({ players, persistPlayers, showToast }) {
  const [editing, setEditing] = useState(null);
  const blank = { name: "", username: "", email: "", avatar: null, flag: null, teamName: "", teamLogo: null, password: "" };
  const [form, setForm] = useState(blank);
  const startNew = () => { setForm(blank); setEditing("new"); };
  const startEdit = (p) => { setForm({ ...p, password: "" }); setEditing(p.id); };

  const save = async () => {
    if (!form.name.trim()) return showToast("Enter a player name");
    if (editing === "new") {
      if (!form.username.trim() || !form.email.trim()) return showToast("Username and email are required");
      if (form.password.length < 4) return showToast("Set a temporary password (4+ chars)");
      const salt = randomSalt();
      const passwordHash = await sha256(salt + ":" + form.password);
      const p = { ...form, id: uid(), salt, passwordHash, createdAt: now() };
      delete p.password;
      await persistPlayers([...players, p]);
      showToast(`${p.name} added — share their username/password so they can sign in`);
    } else {
      let patch = { ...form };
      if (form.password && form.password.length >= 4) {
        const salt = randomSalt();
        patch.salt = salt; patch.passwordHash = await sha256(salt + ":" + form.password);
      }
      delete patch.password;
      await persistPlayers(players.map((p) => (p.id === editing ? { ...p, ...patch, id: editing } : p)));
      showToast("Player updated");
    }
    setEditing(null);
  };
  const remove = async (id) => { await persistPlayers(players.filter((p) => p.id !== id)); showToast("Player removed"); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><SectionTitle icon={Users}>Players ({players.length})</SectionTitle><Btn onClick={startNew}><Plus size={15} /> Add player</Btn></div>
      {editing && (
        <Card className="fade-up p-4">
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16 }} className="mb-3">{editing === "new" ? "New player account" : "Edit player"}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Display name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Player name" /></div>
            <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" /></div>
            <div className="sm:col-span-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" /></div>
            <div className="sm:col-span-2"><Label>{editing === "new" ? "Temporary password" : "Reset password (leave blank to keep)"}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="4+ characters" /></div>
            {editing !== "new" && (
              <>
                <div><Label>Team name</Label><Input value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} placeholder="e.g. FC Nightfall" /></div>
                <div><Label>Avatar</Label><EmojiPicker options={AVATARS} value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} /></div>
                <div><Label>Flag</Label><LabeledPicker options={FLAGS} value={form.flag} onChange={(v) => setForm({ ...form, flag: v })} /></div>
                <div className="sm:col-span-2"><Label>Team crest</Label><LabeledPicker options={LOGOS} value={form.teamLogo} onChange={(v) => setForm({ ...form, teamLogo: v })} /></div>
              </>
            )}
          </div>
          {editing === "new" && <div className="text-xs mt-2" style={{ color: C.textFaint }}>They can set their own avatar, flag and team crest later from Profile.</div>}
          <div className="flex gap-2 mt-4"><Btn onClick={save}><Check size={15} /> Save</Btn><Btn variant="ghost" onClick={() => setEditing(null)}><X size={15} /> Cancel</Btn></div>
        </Card>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {players.map((p, i) => (
          <Card key={p.id} className="fade-up p-4 flex items-center gap-3" style={{ animationDelay: `${i * 40}ms` }}>
            <Avatar p={p} size={48} />
            <div className="flex-1 min-w-0"><div className="font-semibold truncate">{p.name} {p.flag}</div><div className="text-xs truncate" style={{ color: C.textDim }}>{p.teamLogo} {p.teamName} · @{p.username}</div></div>
            <button onClick={() => startEdit(p)} className="btn-hover p-2 rounded-lg" style={{ border: `1px solid ${C.border}` }}><Edit2 size={14} /></button>
            <button onClick={() => remove(p.id)} className="btn-hover p-2 rounded-lg" style={{ border: `1px solid ${C.claretDim}`, color: C.claret }}><Trash2 size={14} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminTournament({ tournaments, persistTournaments, players, matches, persistMatches, activeTournament, showToast, pushNotification, history }) {
  const [name, setName] = useState("");
  const [renameVal, setRenameVal] = useState(activeTournament?.name || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startTournament = async () => {
    if (!name.trim()) return showToast("Give the tournament a name");
    if (players.length < 2) return showToast("Need at least 2 registered players first");
    if (activeTournament) return showToast("Finish or close the current tournament first");
    const t = { id: uid(), name: name.trim(), status: "active", createdAt: now() };
    await persistTournaments([...tournaments, t]);
    await pushNotification(`New season kicked off: "${t.name}"`, "tournament");
    showToast("Tournament started"); setName("");
  };
  const generateFixtures = async (doubleRound) => {
    if (!activeTournament) return;
    const ps = players;
    if (ps.length < 2) return showToast("Need at least 2 players");
    const legs = [];
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { legs.push({ home: ps[i], away: ps[j] }); if (doubleRound) legs.push({ home: ps[j], away: ps[i] }); }
    const newMatches = legs.map((leg) => ({ id: uid(), tournamentId: activeTournament.id, round: "league", homeId: leg.home.id, awayId: leg.away.id, homeScore: null, awayScore: null, status: "scheduled", scheduledAt: "", label: "", liveState: null, decisive: false }));
    await persistMatches([...matches, ...newMatches]);
    await pushNotification(`${newMatches.length} league fixtures generated for "${activeTournament.name}"`, "fixtures");
    showToast(`${newMatches.length} fixtures generated`);
  };
  const closeSeasonEarly = async () => { if (!activeTournament) return; await persistTournaments(tournaments.map((t) => (t.id === activeTournament.id ? { ...t, status: "archived_incomplete" } : t))); showToast("Tournament closed without a result"); };
  const renameTournament = async () => {
    if (!renameVal.trim() || !activeTournament) return;
    await persistTournaments(tournaments.map((t) => (t.id === activeTournament.id ? { ...t, name: renameVal.trim() } : t)));
    showToast("Tournament renamed");
  };
  const deleteActiveTournament = async () => {
    if (!activeTournament) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await persistTournaments(tournaments.filter((t) => t.id !== activeTournament.id));
    await persistMatches(matches.filter((m) => m.tournamentId !== activeTournament.id));
    showToast("Tournament deleted");
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-4">
      {!activeTournament ? (
        <Card className="fade-up p-4"><SectionTitle icon={Trophy}>Start a new tournament</SectionTitle><Label>Tournament name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Winter Cup 2026" /><Btn className="mt-3" onClick={startTournament}><Play size={15} /> Start tournament</Btn></Card>
      ) : (
        <>
          <Card className="fade-up p-4">
            <SectionTitle icon={Trophy}>{activeTournament.name}</SectionTitle>
            <div className="text-sm mb-3" style={{ color: C.textDim }}>League phase — generate fixtures, then run each match live from the Matches tab (real-time clock, live scoring). Playoffs use extra time + penalties automatically; league matches can end level.</div>
            <div className="flex flex-wrap gap-2"><Btn onClick={() => generateFixtures(false)}><Plus size={15} /> Generate single round-robin</Btn><Btn variant="ghost" onClick={() => generateFixtures(true)}><Plus size={15} /> Generate home &amp; away (double)</Btn></div>
          </Card>
          <Card className="fade-up p-4">
            <SectionTitle icon={Edit2}>Edit tournament</SectionTitle>
            <Label>Tournament name</Label>
            <div className="flex gap-2"><Input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} /><Btn style={{ padding: "6px 12px" }} onClick={renameTournament}><Check size={14} /> Save</Btn></div>
          </Card>
          <Card className="fade-up p-4">
            <SectionTitle icon={AlertTriangle}>Danger zone</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <Btn variant="danger" onClick={closeSeasonEarly}>Close tournament without result</Btn>
              <Btn variant="danger" onClick={deleteActiveTournament}>
                <Trash2 size={14} /> {confirmDelete ? "Click again to confirm delete" : "Delete tournament"}
              </Btn>
              {confirmDelete && <Btn variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Btn>}
            </div>
            {confirmDelete && <div className="text-xs mt-2" style={{ color: C.claret }}>This permanently removes the tournament and all its matches.</div>}
          </Card>
        </>
      )}
      <TournamentHistoryAdmin history={history} tournaments={tournaments} persistTournaments={persistTournaments} matches={matches} persistMatches={persistMatches} players={players} showToast={showToast} />
    </div>
  );
}

function TournamentHistoryAdmin({ history, tournaments, persistTournaments, matches, persistMatches, players, showToast }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (history.length === 0) return null;

  const startEdit = (t) => { setForm({ name: t.name, championId: t.championId || "", runnerUpId: t.runnerUpId || "", thirdId: t.thirdId || "", mvpId: t.mvpId || "" }); setEditingId(t.id); };
  const save = async (id) => {
    await persistTournaments(tournaments.map((t) => (t.id === id ? { ...t, name: form.name.trim() || t.name, championId: form.championId || null, runnerUpId: form.runnerUpId || null, thirdId: form.thirdId || null, mvpId: form.mvpId || null } : t)));
    showToast("Tournament history updated");
    setEditingId(null);
  };
  const del = async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    await persistTournaments(tournaments.filter((t) => t.id !== id));
    await persistMatches(matches.filter((m) => m.tournamentId !== id));
    showToast("Tournament removed from history");
    setConfirmDeleteId(null);
  };

  return (
    <Card className="fade-up p-4">
      <SectionTitle icon={Archive}>Manage tournament history ({history.length})</SectionTitle>
      <div className="space-y-3">
        {history.map((t) => (
          <Card key={t.id} className="p-3" style={{ background: C.surface2 }}>
            {editingId === t.id ? (
              <div className="space-y-2">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Champion</Label><Select value={form.championId} onChange={(e) => setForm({ ...form, championId: e.target.value })}><option value="">—</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
                  <div><Label>Runner-up</Label><Select value={form.runnerUpId} onChange={(e) => setForm({ ...form, runnerUpId: e.target.value })}><option value="">—</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
                  <div><Label>Third place</Label><Select value={form.thirdId} onChange={(e) => setForm({ ...form, thirdId: e.target.value })}><option value="">—</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
                  <div><Label>MVP</Label><Select value={form.mvpId} onChange={(e) => setForm({ ...form, mvpId: e.target.value })}><option value="">—</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
                </div>
                <div className="flex gap-2"><Btn style={{ padding: "6px 12px" }} onClick={() => save(t.id)}><Check size={14} /> Save</Btn><Btn variant="ghost" style={{ padding: "6px 12px" }} onClick={() => setEditingId(null)}><X size={14} /> Cancel</Btn></div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs" style={{ color: C.textFaint }}>{new Date(t.completedAt).toLocaleDateString()}</div></div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(t)} className="btn-hover p-2 rounded-lg" style={{ border: `1px solid ${C.border}` }}><Edit2 size={13} /></button>
                  <button onClick={() => del(t.id)} className="btn-hover p-2 rounded-lg" style={{ border: `1px solid ${C.claretDim}`, color: C.claret }}><Trash2 size={13} /></button>
                  {confirmDeleteId === t.id && <span className="text-xs self-center" style={{ color: C.claret }}>Click delete again to confirm</span>}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------- ADMIN LIVE MATCH CONTROL ---------------------------------- */
function AdminMatchControl({ m, players, onUpdate, onNotify, showToast }) {
  useTicker(m.status === "live");
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  const clock = getClockState(m.liveState);
  const decisive = !!m.decisive;
  const flash = useGoalFlash((m.homeScore || 0) + (m.awayScore || 0));

  const startMatch = () => onUpdate({ status: "live", liveState: { phase: "first", phaseStartedAt: now(), paused: false, pauseStartedAt: null, totalPausedMs: 0 }, homeScore: 0, awayScore: 0 });
  const togglePause = () => {
    const ls = m.liveState;
    if (!ls.paused) onUpdate({ liveState: { ...ls, paused: true, pauseStartedAt: now() } });
    else {
      const extra = Date.now() - new Date(ls.pauseStartedAt).getTime();
      onUpdate({ liveState: { ...ls, paused: false, pauseStartedAt: null, totalPausedMs: (ls.totalPausedMs || 0) + extra } });
    }
  };
  const bumpScore = (side, delta) => {
    if (m.liveState?.paused) return;
    const key = side === "home" ? "homeScore" : "awayScore";
    const next = Math.max(0, (m[key] || 0) + delta);
    onUpdate({ [key]: next });
  };
  const endRegulation = () => {
    if (decisive && m.homeScore === m.awayScore) {
      onUpdate({ liveState: { phase: "extra", phaseStartedAt: now(), paused: false, pauseStartedAt: null, totalPausedMs: 0 }, wentToExtra: true });
    } else {
      finishMatch();
    }
  };
  const endExtra = () => {
    if (m.homeScore === m.awayScore) {
      onUpdate({ liveState: { ...m.liveState, phase: "penalties", penalties: { kicks: [], winner: null } } });
    } else finishMatch();
  };
  const finishMatch = () => {
    onUpdate({ status: "completed", completedAt: now(), liveState: { ...(m.liveState || {}), phase: "done" } });
    onNotify(`Result: ${h?.name} ${m.homeScore}-${m.awayScore} ${a?.name}${m.penaltyResult ? ` (${m.penaltyResult.home}-${m.penaltyResult.away} pens)` : ""}`);
  };
  const recordKick = (team, scored) => {
    const kicks = [...(m.liveState.penalties.kicks || []), { team, scored }];
    const check = checkPenaltyDecided(kicks);
    const penalties = { kicks, winner: check.decided ? check.winner : null };
    onUpdate({ liveState: { ...m.liveState, penalties } });
  };
  const finishPenalties = () => {
    const p = m.liveState.penalties;
    onUpdate({ status: "completed", completedAt: now(), penaltyResult: { home: p.kicks.filter(k=>k.team==="home"&&k.scored).length, away: p.kicks.filter(k=>k.team==="away"&&k.scored).length, winner: p.winner }, liveState: { ...m.liveState, phase: "done" } });
    onNotify(`Result: ${h?.name} ${m.homeScore}-${m.awayScore} ${a?.name} (pens decide it)`);
  };

  if (m.status === "completed") {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <PlayerChip p={h} size={16} />
          <div className="text-center px-3">
            <div className="font-bold text-lg" style={{ fontFamily: FONT_MONO, color: C.pitchBright }}>{m.homeScore} – {m.awayScore}</div>
            <Badge color={C.textDim}>{resultBadgeLabel(m)}{m.penaltyResult ? ` (${m.penaltyResult.home}-${m.penaltyResult.away})` : ""}</Badge>
          </div>
          <div className="flex justify-end"><PlayerChip p={a} size={16} /></div>
        </div>
      </Card>
    );
  }

  if (m.status === "scheduled") {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-[100px]"><PlayerChip p={h} size={16} /></div>
          <span className="text-xs" style={{ color: C.textFaint }}>vs</span>
          <div className="flex-1 min-w-[100px] flex justify-end"><PlayerChip p={a} size={16} /></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <Input type="datetime-local" style={{ width: 190 }} value={m.scheduledAt ? m.scheduledAt.slice(0, 16) : ""} onChange={(e) => onUpdate({ scheduledAt: e.target.value })} />
          <Btn style={{ padding: "6px 10px" }} onClick={startMatch}><PlayCircle size={14} /> Start live match</Btn>
        </div>
      </Card>
    );
  }

  // live
  return (
    <Card className={`p-4 live-ring ${flash ? "goal-flash" : ""}`} style={{ borderColor: C.claret }}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Badge color={C.claret} pulse>LIVE</Badge>
        {clock && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ fontFamily: FONT_MONO, background: C.bg2, color: C.pitchBright }}>{clock.phase === "penalties" ? "PENALTIES" : clock.label}</span>}
        {m.liveState?.paused && <Badge color={C.gold}>PAUSED</Badge>}
      </div>

      {m.liveState.phase !== "penalties" ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col items-center gap-1"><PlayerChip p={h} size={20} />
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => bumpScore("home", -1)} className="btn-hover w-7 h-7 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${C.border}` }}><Minus size={13} /></button>
                <span key={`h-${m.homeScore}`} className="score-pop text-3xl font-bold w-10 text-center" style={{ fontFamily: FONT_MONO }}>{m.homeScore ?? 0}</span>
                <button onClick={() => bumpScore("home", 1)} className="btn-hover w-7 h-7 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${C.pitch}`, color: C.pitchBright }}><Plus size={13} /></button>
              </div>
            </div>
            <Goal size={18} color={C.textFaint} />
            <div className="flex-1 flex flex-col items-center gap-1"><PlayerChip p={a} size={20} />
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => bumpScore("away", -1)} className="btn-hover w-7 h-7 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${C.border}` }}><Minus size={13} /></button>
                <span key={`a-${m.awayScore}`} className="score-pop text-3xl font-bold w-10 text-center" style={{ fontFamily: FONT_MONO }}>{m.awayScore ?? 0}</span>
                <button onClick={() => bumpScore("away", 1)} className="btn-hover w-7 h-7 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${C.pitch}`, color: C.pitchBright }}><Plus size={13} /></button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center mt-3 flex-wrap">
            <Btn variant="ghost" style={{ padding: "6px 10px" }} onClick={togglePause}>{m.liveState.paused ? <Play size={13} /> : <Pause size={13} />} {m.liveState.paused ? "Resume" : "Pause"}</Btn>
            {clock?.ended && m.liveState.phase === "first" && <Btn style={{ padding: "6px 10px" }} onClick={endRegulation}><Check size={13} /> {decisive && m.homeScore === m.awayScore ? "Start extra time" : "End match (FT)"}</Btn>}
            {clock?.ended && m.liveState.phase === "extra" && <Btn style={{ padding: "6px 10px" }} onClick={endExtra}><Check size={13} /> {m.homeScore === m.awayScore ? "Start penalties" : "End match (AET)"}</Btn>}
            {!clock?.ended && <Btn variant="ghost" style={{ padding: "6px 10px" }} onClick={m.liveState.phase === "first" ? endRegulation : endExtra}><Zap size={13} /> Force end phase</Btn>}
          </div>
        </>
      ) : (
        <PenaltyAdminPanel m={m} h={h} a={a} recordKick={recordKick} finishPenalties={finishPenalties} />
      )}
    </Card>
  );
}

function PenaltyAdminPanel({ m, h, a, recordKick, finishPenalties }) {
  const kicks = m.liveState.penalties.kicks;
  const winner = m.liveState.penalties.winner;
  const turn = kicks.length % 2 === 0 ? "home" : "away";
  const turnPlayer = turn === "home" ? h : a;
  return (
    <div>
      <PenaltyStrip penalties={m.liveState.penalties} />
      {!winner ? (
        <div className="text-center mt-3">
          <div className="text-xs mb-2" style={{ color: C.textDim }}>Next kick: <strong style={{ color: C.text }}>{turnPlayer?.name}</strong></div>
          <div className="flex items-center justify-center gap-2">
            <Btn onClick={() => recordKick(turn, true)}><Check size={14} /> Scored</Btn>
            <Btn variant="danger" onClick={() => recordKick(turn, false)}><X size={14} /> Missed</Btn>
          </div>
        </div>
      ) : (
        <div className="text-center mt-3">
          <div className="text-sm mb-2" style={{ color: C.pitchBright }}>{winner === "home" ? h?.name : a?.name} wins the shootout!</div>
          <Btn variant="gold" onClick={finishPenalties}><Trophy size={14} /> Finish match</Btn>
        </div>
      )}
    </div>
  );
}

function AdminMatches({ activeTournament, matches, persistMatches, players, pushNotification, showToast }) {
  const tMatches = activeTournament ? matches.filter((m) => m.tournamentId === activeTournament.id && m.round === "league") : [];
  const order = { live: 0, scheduled: 1, completed: 2 };
  const sorted = [...tMatches].sort((x, y) => order[x.status] - order[y.status]);

  const updateMatch = async (id, patch) => { await persistMatches(matches.map((m) => (m.id === id ? { ...m, ...patch } : m))); };
  const notify = async (text) => { await pushNotification(text, "result"); showToast("Result saved"); };

  return (
    <div className="space-y-4">
      <TickerResultsAdmin matches={matches} persistMatches={persistMatches} players={players} showToast={showToast} />
      {!activeTournament ? (
        <Card className="fade-up p-4"><EmptyState text="Start a tournament first to manage league matches." /></Card>
      ) : (
        <div className="space-y-3">
          <SectionTitle icon={Calendar}>Manage matches ({tMatches.length} league)</SectionTitle>
          {sorted.map((m, i) => (
            <div key={m.id} className="fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <AdminMatchControl m={m} players={players} onUpdate={(patch) => updateMatch(m.id, patch)} onNotify={notify} showToast={showToast} />
            </div>
          ))}
          {sorted.length === 0 && <EmptyState text="No fixtures yet — generate them in the Tournament tab." />}
        </div>
      )}
    </div>
  );
}

function TickerResultsAdmin({ matches, persistMatches, players, showToast }) {
  const [editingId, setEditingId] = useState(null);
  const [scores, setScores] = useState({ h: "", a: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const recent = matches.filter((m) => m.status === "completed").sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)).slice(0, 20);

  const startEdit = (m) => { setScores({ h: String(m.homeScore ?? 0), a: String(m.awayScore ?? 0) }); setEditingId(m.id); };
  const saveEdit = async (m) => {
    await persistMatches(matches.map((x) => (x.id === m.id ? { ...x, homeScore: Number(scores.h) || 0, awayScore: Number(scores.a) || 0 } : x)));
    showToast("Result updated in ticker"); setEditingId(null);
  };
  const deleteResult = async (m) => {
    if (confirmDeleteId !== m.id) { setConfirmDeleteId(m.id); return; }
    await persistMatches(matches.map((x) => (x.id === m.id ? { ...x, status: "scheduled", homeScore: null, awayScore: null, completedAt: null, liveState: null, penaltyResult: null } : x)));
    showToast("Result removed from ticker"); setConfirmDeleteId(null);
  };

  return (
    <Card className="fade-up p-4">
      <SectionTitle icon={Radio}>Ticker results ({recent.length})</SectionTitle>
      <div className="space-y-2">
        {recent.map((m, i) => {
          const h = byId[m.homeId], a = byId[m.awayId];
          return (
            <div key={m.id} className="fade-up flex items-center justify-between gap-2 p-2 rounded-lg flex-wrap" style={{ animationDelay: `${i * 25}ms`, background: C.surface2, border: `1px solid ${C.border}` }}>
              <div className="flex-1 min-w-0"><PlayerChip p={h} size={14} /></div>
              {editingId === m.id ? (
                <div className="flex items-center gap-1">
                  <Input style={{ width: 44, textAlign: "center", padding: "4px" }} value={scores.h} onChange={(e) => setScores({ ...scores, h: e.target.value.replace(/\D/g, "") })} />
                  <span style={{ color: C.textFaint }}>-</span>
                  <Input style={{ width: 44, textAlign: "center", padding: "4px" }} value={scores.a} onChange={(e) => setScores({ ...scores, a: e.target.value.replace(/\D/g, "") })} />
                </div>
              ) : (
                <span className="text-sm font-bold px-2" style={{ fontFamily: FONT_MONO, color: C.pitchBright }}>{m.homeScore}-{m.awayScore}</span>
              )}
              <div className="flex-1 min-w-0 flex justify-end"><PlayerChip p={a} size={14} /></div>
              <div className="flex gap-1">
                {editingId === m.id ? (
                  <>
                    <button onClick={() => saveEdit(m)} className="btn-hover p-1.5 rounded-lg" style={{ border: `1px solid ${C.pitch}`, color: C.pitchBright }}><Check size={13} /></button>
                    <button onClick={() => setEditingId(null)} className="btn-hover p-1.5 rounded-lg" style={{ border: `1px solid ${C.border}` }}><X size={13} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(m)} className="btn-hover p-1.5 rounded-lg" style={{ border: `1px solid ${C.border}` }}><Edit2 size={13} /></button>
                    <button onClick={() => deleteResult(m)} className="btn-hover p-1.5 rounded-lg" style={{ border: `1px solid ${C.claretDim}`, color: C.claret }}><Trash2 size={13} /></button>
                  </>
                )}
              </div>
              {confirmDeleteId === m.id && <div className="w-full text-xs" style={{ color: C.claret }}>Click delete again to remove this result and revert the fixture to scheduled.</div>}
            </div>
          );
        })}
        {recent.length === 0 && <EmptyState text="No results yet." />}
      </div>
    </Card>
  );
}

function AdminPlayoffs({ activeTournament, matches, persistMatches, players, persistTournaments, tournaments, pushNotification, showToast }) {
  if (!activeTournament) return <Card className="fade-up p-4"><EmptyState text="Start a tournament first." /></Card>;
  const leagueMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round === "league");
  const playoffMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round !== "league");
  const allLeagueDone = leagueMatches.length > 0 && leagueMatches.every((m) => m.status === "completed");
  const standings = computeStandings(leagueMatches, players, activeTournament.id);
  const byRound = Object.fromEntries(playoffMatches.map((m) => [m.round, m]));

  const generateSemis = async () => {
    if (playoffMatches.length > 0) return showToast("Playoffs already generated");
    const gen = generatePlayoffMatches(activeTournament.id, standings);
    if (gen.length === 0) return showToast("Need at least 4 players with completed matches");
    await persistMatches([...matches, ...gen]);
    await pushNotification(`Playoffs are set for "${activeTournament.name}"! Top match & bottom match ready.`, "playoffs");
    showToast("Playoff matches generated");
  };

  const updateMatch = async (id, patch) => {
    const nextMatches = matches.map((x) => (x.id === id ? { ...x, ...patch } : x));
    await persistMatches(nextMatches);
    return nextMatches;
  };

  const afterUpdate = async (id, patch) => {
    const nextMatches = await updateMatch(id, patch);
    const nb = Object.fromEntries(nextMatches.filter((m) => m.tournamentId === activeTournament.id && m.round !== "league").map((m) => [m.round, m]));
    // auto-generate challenger once both semis are completed
    if (nb.semiA?.status === "completed" && nb.semiB?.status === "completed" && !nb.challenger) {
      const loserA = matchLoserId(nb.semiA), winnerB = matchWinnerId(nb.semiB);
      const ch = { id: uid(), tournamentId: activeTournament.id, round: "challenger", homeId: loserA, awayId: winnerB, homeScore: null, awayScore: null, status: "scheduled", scheduledAt: "", label: "Challenger match", liveState: null, decisive: true };
      await persistMatches([...nextMatches, ch]);
      await pushNotification("Challenger match is set!", "playoffs");
      return;
    }
    // auto-generate final once semiA + challenger done
    if (nb.semiA?.status === "completed" && nb.challenger?.status === "completed" && !nb.final) {
      const finalist = matchWinnerId(nb.semiA), challWinner = matchWinnerId(nb.challenger);
      const f = { id: uid(), tournamentId: activeTournament.id, round: "final", homeId: finalist, awayId: challWinner, homeScore: null, awayScore: null, status: "scheduled", scheduledAt: "", label: "GRAND FINAL", liveState: null, decisive: true };
      await persistMatches([...nextMatches, f]);
      await pushNotification("The Grand Final is set! 🏆", "playoffs");
    }
  };

  const finishTournament = async (mvpId) => {
    const final = byRound.final;
    if (!final || final.status !== "completed") return showToast("Final not completed yet");
    const championId = matchWinnerId(final);
    const runnerUpId = matchLoserId(final);
    const thirdId = matchLoserId(byRound.challenger);
    await persistTournaments(tournaments.map((t) => (t.id === activeTournament.id ? { ...t, status: "completed", completedAt: now(), championId, runnerUpId, thirdId, mvpId: mvpId || null } : t)));
    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    await pushNotification(`🏆 Final result: ${byId[championId]?.name} is the champion of "${activeTournament.name}"!`, "final");
    showToast("Tournament completed and archived");
  };

  return (
    <div className="space-y-4">
      {!allLeagueDone ? (
        <Card className="fade-up p-4"><EmptyState text="Complete all league matches before starting playoffs." /></Card>
      ) : playoffMatches.length === 0 ? (
        <Card className="fade-up p-4"><SectionTitle icon={Swords}>League complete</SectionTitle><div className="text-sm mb-3" style={{ color: C.textDim }}>Top 4: {standings.slice(0, 4).map((s) => s.name).join(", ")}</div><Btn onClick={generateSemis}><Swords size={15} /> Generate playoff bracket</Btn></Card>
      ) : (
        <Card className="fade-up p-4">
          <SectionTitle icon={Swords}>Playoff bracket — run live</SectionTitle>
          <div className="space-y-4">
            {["semiA", "semiB", "challenger", "final"].map((r) => {
              const m = byRound[r];
              if (!m) return null;
              return (
                <div key={r}>
                  <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: C.textFaint }}>{m.label}</div>
                  <AdminMatchControl m={m} players={players} onUpdate={(patch) => afterUpdate(m.id, patch)} onNotify={async (t) => { await pushNotification(t, "result"); showToast("Result saved"); }} showToast={showToast} />
                </div>
              );
            })}
          </div>
          {byRound.final?.status === "completed" && <FinishTournamentPanel players={players} onFinish={finishTournament} />}
        </Card>
      )}
    </div>
  );
}

function FinishTournamentPanel({ players, onFinish }) {
  const [mvp, setMvp] = useState("");
  return (
    <Card className="fade-up p-4 mt-4" style={{ background: `${C.gold}14`, borderColor: C.gold }}>
      <SectionTitle icon={Award}>Wrap up the tournament</SectionTitle>
      <Label>MVP of the tournament (optional)</Label>
      <Select value={mvp} onChange={(e) => setMvp(e.target.value)}><option value="">— None —</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
      <Btn variant="gold" className="mt-3" onClick={() => onFinish(mvp)}><Trophy size={15} /> Finish &amp; archive tournament</Btn>
    </Card>
  );
}

function AdminSettings({ adminConfig, persistAdminConfig, showToast }) {
  const [pwd, setPwd] = useState("");
  return (
    <Card className="fade-up p-4 max-w-sm">
      <SectionTitle icon={Settings}>Admin settings</SectionTitle>
      <Label>Change admin password</Label>
      <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="New password" />
      <Btn className="mt-3" onClick={async () => { if (pwd.length < 4) return showToast("Use at least 4 characters"); await persistAdminConfig({ ...adminConfig, password: pwd }); setPwd(""); showToast("Password updated"); }}><KeyRound size={15} /> Update password</Btn>
    </Card>
  );
}
