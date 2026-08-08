import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Trophy, Users, Sun, Moon, Star, Zap, Search, Volume2, VolumeX, Target,
} from "lucide-react";

/* ---------------------------------------------------------
   DATA — fictional "Apex League" clubs & fixtures
--------------------------------------------------------- */
const teams = [
  { code: "EMB", name: "Ember United",   c1: "#FF7A45", c2: "#B3261E" },
  { code: "NGT", name: "Northgate FC",   c1: "#4C86D6", c2: "#16294D" },
  { code: "RVR", name: "Riverside Rov.", c1: "#1FC2C2", c2: "#0B5C5C" },
  { code: "SBL", name: "Sable City",     c1: "#8A5CF6", c2: "#100014" },
  { code: "ARA", name: "Aurora Athletic",c1: "#F14FC4", c2: "#5B2A86" },
  { code: "VNT", name: "Vantage FC",     c1: "#26D9E6", c2: "#054F5C" },
  { code: "SOL", name: "Solstice SC",    c1: "#FFD23F", c2: "#E8590C" },
  { code: "MRW", name: "Marrow Town",    c1: "#C4272E", c2: "#3B0A0C" },
];
const T = (code) => teams.find((t) => t.code === code);

const fixtures = [
  { a: "EMB", b: "NGT", sa: 2, sb: 1, status: "LIVE", time: "67'" },
  { a: "RVR", b: "SBL", sa: 0, sb: 0, status: "HT",   time: "HT"  },
  { a: "ARA", b: "VNT", sa: 3, sb: 2, status: "FT",   time: "FT"  },
  { a: "SOL", b: "MRW", sa: 1, sb: 1, status: "LIVE", time: "34'" },
  { a: "EMB", b: "SBL", sa: 4, sb: 0, status: "FT",   time: "FT"  },
  { a: "NGT", b: "RVR", sa: 2, sb: 2, status: "LIVE", time: "78'" },
  { a: "VNT", b: "SOL", sa: 0, sb: 1, status: "HT",   time: "HT"  },
  { a: "MRW", b: "ARA", sa: 1, sb: 3, status: "FT",   time: "FT"  },
  { a: "SBL", b: "VNT", sa: 2, sb: 1, status: "LIVE", time: "12'" },
  { a: "RVR", b: "EMB", sa: 1, sb: 0, status: "FT",   time: "FT"  },
];

const standings = [
  { code: "EMB", p: 14, w: 10, d: 2, l: 2, gf: 31, ga: 14 },
  { code: "ARA", p: 14, w: 9,  d: 3, l: 2, gf: 27, ga: 15 },
  { code: "VNT", p: 14, w: 8,  d: 3, l: 3, gf: 24, ga: 17 },
  { code: "SOL", p: 14, w: 7,  d: 4, l: 3, gf: 22, ga: 18 },
  { code: "NGT", p: 14, w: 6,  d: 4, l: 4, gf: 19, ga: 19 },
  { code: "RVR", p: 14, w: 4,  d: 5, l: 5, gf: 17, ga: 21 },
  { code: "SBL", p: 14, w: 3,  d: 3, l: 8, gf: 13, ga: 26 },
  { code: "MRW", p: 14, w: 2,  d: 2, l: 10,gf: 11, ga: 29 },
].map((r) => ({ ...r, gd: r.gf - r.ga, pts: r.w * 3 + r.d }));

/* ---------------------------------------------------------
   PAGE PALETTE — hero, section chrome & cards react to this.
   The 20 bar skins, badges, breaking-news treatments and
   highlight badges carry their own explicit colors, so they
   stay legible regardless of page mode.
--------------------------------------------------------- */
const palettes = {
  dark: {
    bg: "#070a12", text: "#f5f7fb", textMuted: "rgba(245,247,251,0.62)",
    textFaint: "rgba(245,247,251,0.42)", surface: "rgba(255,255,255,0.05)",
    surfaceBorder: "rgba(255,255,255,0.1)", accent: "#34d399", rowAlt: "rgba(255,255,255,0.03)",
    heroBg: "radial-gradient(120% 100% at 50% -10%, #132038 0%, #070a12 60%)",
  },
  light: {
    bg: "#f4f6fb", text: "#0b1020", textMuted: "rgba(11,16,32,0.64)",
    textFaint: "rgba(11,16,32,0.46)", surface: "rgba(11,16,32,0.045)",
    surfaceBorder: "rgba(11,16,32,0.1)", accent: "#059669", rowAlt: "rgba(11,16,32,0.025)",
    heroBg: "radial-gradient(120% 100% at 50% -10%, #dce8ff 0%, #f4f6fb 60%)",
  },
};

/* ---------------------------------------------------------
   20 distinct, self-contained bar "skins" (with search tags)
--------------------------------------------------------- */
const themes = [
  { name: "Glass Frost", tags: ["glass"], speed: 32, radius: 14,
    wrap: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(14px)" },
    chip: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" },
    team: "#EAF2FF", score: "#7CE7FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(255,255,255,0.12)", color: "#EAF2FF" } },

  { name: "Neon Pitch", tags: ["neon"], speed: 26, radius: 10,
    wrap: { background: "linear-gradient(180deg,#052e16,#031a0d)", border: "1px solid #1f5c33" },
    chip: { background: "rgba(0,0,0,0.25)", border: "1px solid #2f7d4d", boxShadow: "0 0 14px rgba(163,255,120,0.18)" },
    team: "#D7FFDD", score: "#A3FF78", font: "'JetBrains Mono', monospace",
    tab: { background: "#0d3b1f", color: "#A3FF78" } },

  { name: "Chrome Ticker", tags: ["metallic"], speed: 24, radius: 6,
    wrap: { background: "linear-gradient(180deg,#e9edf1,#c3c9d1)", border: "1px solid #9aa2ad" },
    chip: { background: "linear-gradient(180deg,#ffffff,#d4d9df)", border: "1px solid #a9b0ba" },
    team: "#1b1f24", score: "#0a0c0f", font: "'Space Grotesk', sans-serif",
    tab: { background: "#1b1f24", color: "#e9edf1" } },

  { name: "Gold Premier", tags: ["metallic", "premium"], speed: 30, radius: 12,
    wrap: { background: "#0a0a0a", border: "1px solid #3a2c0f" },
    chip: { background: "#141414", border: "1px solid #6b5320" },
    team: "#F4E4B8", score: "#F5C542", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#8a6a1e,#F5C542)", color: "#141414" } },

  { name: "Minimal Mono", tags: ["minimal"], speed: 34, radius: 0,
    wrap: { background: "#ffffff", borderTop: "2px solid #111", borderBottom: "2px solid #111" },
    chip: { background: "transparent", borderRight: "1px solid #d8d8d8" },
    team: "#111111", score: "#111111", font: "'Space Grotesk', sans-serif",
    tab: { background: "#111111", color: "#ffffff" } },

  { name: "Holographic Foil", tags: ["holo"], speed: 22, radius: 16,
    wrap: { border: "1px solid rgba(255,255,255,0.25)" }, extraClass: "holo-bg",
    chip: { background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.3)" },
    team: "#0a0a0a", score: "#0a0a0a", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.7)", color: "#fff" } },

  { name: "Retro LED", tags: ["retro"], speed: 20, radius: 4,
    wrap: { background: "#0a0704", border: "1px solid #2a2015" },
    chip: { background: "#120d08", border: "1px solid #3a2c17" },
    team: "#FFB000", score: "#FF7A00", font: "'JetBrains Mono', monospace",
    tab: { background: "#1a1108", color: "#FFB000" }, mono: true },

  { name: "Carbon Fiber", tags: ["texture"], speed: 28, radius: 10,
    wrap: { backgroundColor: "#0d0d0d",
      backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)",
      border: "1px solid #d1252c33" },
    chip: { background: "rgba(209,37,44,0.08)", border: "1px solid #d1252c55" },
    team: "#f2f2f2", score: "#ff4655", font: "'Bebas Neue', sans-serif",
    tab: { background: "#d1252c", color: "#0d0d0d" } },

  { name: "Stadium Lights", tags: ["glow"], speed: 30, radius: 12,
    wrap: { background: "radial-gradient(120% 140% at 10% 0%, #1c2b52 0%, #060a16 60%)", border: "1px solid #26345c" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #2c3c68" },
    team: "#EAF0FF", score: "#FFE49C", font: "'Space Grotesk', sans-serif",
    tab: { background: "#EAF0FF", color: "#0b1024" } },

  { name: "Paper Ticket", tags: ["paper"], speed: 33, radius: 2,
    wrap: { background: "#F6F1E4", border: "1px dashed #2c2a24" },
    chip: { background: "#FBF8EE", border: "1px dashed #b8b09a" },
    team: "#2c2a24", score: "#7a1f1f", font: "'JetBrains Mono', monospace",
    tab: { background: "#2c2a24", color: "#F6F1E4" } },

  { name: "Cyberpunk Duotone", tags: ["neon"], speed: 21, radius: 8,
    wrap: { background: "linear-gradient(90deg,#1a0022,#001f24)", border: "1px solid #ff2bd6" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #29e0ff88" },
    team: "#ff6bf0", score: "#29E0FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "#ff2bd6", color: "#160018" } },

  { name: "Sunset Gradient", tags: ["gradient"], speed: 27, radius: 18,
    wrap: { background: "linear-gradient(90deg,#3b0a5c,#c0356b,#ff8a4c)" },
    chip: { background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.25)" },
    team: "#fff", score: "#FFE9B8", font: "'Bebas Neue', sans-serif",
    tab: { background: "rgba(0,0,0,0.35)", color: "#fff" } },

  { name: "Ice Rink", tags: ["glass"], speed: 31, radius: 14,
    wrap: { background: "linear-gradient(180deg,#eaf6ff,#cfeaff)", border: "1px solid #a9d6ef" },
    chip: { background: "rgba(255,255,255,0.6)", border: "1px solid #bfe1f4" },
    team: "#0c3a52", score: "#0f7ea8", font: "'Space Grotesk', sans-serif",
    tab: { background: "#0f7ea8", color: "#eaf6ff" } },

  { name: "Velvet VIP", tags: ["premium"], speed: 29, radius: 16,
    wrap: { background: "linear-gradient(180deg,#2a0e3d,#160522)", border: "1px solid #7a4fae" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #a97cf0aa" },
    team: "#f1e6ff", score: "#F5C542", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#7a4fae,#F5C542)", color: "#160522" } },

  { name: "Denim Casual", tags: ["texture"], speed: 25, radius: 999,
    wrap: { background: "linear-gradient(180deg,#2c5aa0,#1c3b6b)", border: "2px dashed rgba(255,255,255,0.35)" },
    chip: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)" },
    team: "#eaf1ff", score: "#ffd166", font: "'Space Grotesk', sans-serif",
    tab: { background: "#eaf1ff", color: "#1c3b6b" } },

  { name: "Solar Flare", tags: ["gradient"], speed: 23, radius: 12,
    wrap: { background: "radial-gradient(120% 160% at 0% 100%, #ff6a00 0%, #7a0c0c 55%, #200404 100%)" },
    chip: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,180,120,0.4)" },
    team: "#FFE9D6", score: "#FFB35C", font: "'Bebas Neue', sans-serif",
    tab: { background: "#FFB35C", color: "#200404" } },

  { name: "Midnight Grid", tags: ["grid"], speed: 30, radius: 10,
    wrap: { backgroundColor: "#0a0e1a",
      backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 28px)",
      border: "1px solid #1c2740" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #263354" },
    team: "#eef2ff", score: "#9db4ff", font: "'JetBrains Mono', monospace",
    tab: { background: "#9db4ff", color: "#0a0e1a" } },

  { name: "Emerald Foil", tags: ["holo"], speed: 22, radius: 14,
    wrap: { border: "1px solid rgba(255,255,255,0.2)" }, extraClass: "foil-bg",
    chip: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.28)" },
    team: "#f0fff6", score: "#eaffef", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.4)", color: "#f0fff6" } },

  { name: "Blueprint Tech", tags: ["grid"], speed: 34, radius: 2,
    wrap: { backgroundColor: "#0c2340",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px)",
      border: "1px solid #2f5488" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #3f6aa8" },
    team: "#DCEBFF", score: "#8FC1FF", font: "'JetBrains Mono', monospace",
    tab: { background: "#DCEBFF", color: "#0c2340" } },

  { name: "Aurora Wave", tags: ["gradient", "holo"], speed: 24, radius: 16,
    wrap: { border: "1px solid rgba(255,255,255,0.2)" }, extraClass: "aurora-bg",
    chip: { background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.3)" },
    team: "#fff", score: "#E8FFF6", font: "'Bebas Neue', sans-serif",
    tab: { background: "rgba(0,0,0,0.4)", color: "#fff" } },
].map((t, i) => ({ ...t, id: i }));

const allTags = [...new Set(themes.flatMap((t) => t.tags))];

/* ---------------------------------------------------------
   Small building blocks
--------------------------------------------------------- */
function TeamMark({ team, size = 26 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.36, color: "#fff",
        background: `linear-gradient(135deg, ${team.c1}, ${team.c2})`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
      }}
    >
      {team.code.slice(0, 2)}
    </div>
  );
}

function StatusTag({ status, time, theme }) {
  const live = status === "LIVE";
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide shrink-0"
      style={{ background: theme.tab.background, color: theme.tab.color }}
    >
      {live && <span className="pulse-dot" style={{ background: theme.tab.color }} />}
      {status === "LIVE" ? time : status}
    </span>
  );
}

function MatchChip({ m, theme }) {
  const A = T(m.a), B = T(m.b);
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 mx-1.5 shrink-0"
      style={{ ...theme.chip, borderRadius: theme.radius, fontFamily: theme.font }}
    >
      <TeamMark team={A} />
      <span className="text-[12px] font-semibold tracking-wide" style={{ color: theme.team }}>{A.code}</span>
      <span
        className="text-[15px] font-extrabold tabular-nums px-1"
        style={{ color: theme.score, fontFamily: theme.mono ? "'JetBrains Mono', monospace" : theme.font }}
      >
        {m.sa}–{m.sb}
      </span>
      <span className="text-[12px] font-semibold tracking-wide" style={{ color: theme.team }}>{B.code}</span>
      <TeamMark team={B} />
      <StatusTag status={m.status} time={m.time} theme={theme} />
    </div>
  );
}

function MarqueeBar({ theme, index }) {
  const doubled = [...fixtures, ...fixtures];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden ${theme.extraClass || ""}`}
      style={{ ...theme.wrap, borderRadius: theme.radius }}
    >
      <div className="flex items-center py-1 pl-1 pr-1">
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 my-1.5 ml-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap z-10"
          style={{ background: theme.tab.background, color: theme.tab.color }}
        >
          {String(index + 1).padStart(2, "0")} · {theme.name}
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex marquee-track" style={{ animationDuration: `${theme.speed}s` }}>
            {doubled.map((m, i) => <MatchChip key={i} m={m} theme={theme} />)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------
   5 BREAKING NEWS text styles
--------------------------------------------------------- */
const HEADLINE = "ARA SIGNS RECORD STRIKER FROM VNT AHEAD OF DERBY";

function BreakingAlert() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "#7a0c0c" }}>
      <span className="pulse-dot shrink-0" style={{ background: "#fff", width: 8, height: 8 }} />
      <span className="text-[11px] font-black tracking-widest rounded px-2 py-1 shrink-0" style={{ background: "#fff", color: "#7a0c0c" }}>BREAKING</span>
      <span className="text-sm sm:text-base font-bold tracking-wide text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{HEADLINE}</span>
    </div>
  );
}

function BreakingGradient() {
  return (
    <div className="px-1 py-2">
      <span
        className="text-2xl sm:text-3xl font-black tracking-tight"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          backgroundImage: "linear-gradient(90deg,#f59e0b,#ef4444,#b91c1c)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
        }}
      >
        {HEADLINE}
      </span>
    </div>
  );
}

function BreakingOutline({ accent }) {
  return (
    <div className="px-1 py-2">
      <span
        className="text-2xl sm:text-3xl font-black tracking-tight block"
        style={{ fontFamily: "'Bebas Neue', sans-serif", color: accent, WebkitTextStroke: "1.5px currentColor", paintOrder: "stroke fill" }}
      >
        {HEADLINE}
      </span>
    </div>
  );
}

function BreakingSplitFlap() {
  const chars = HEADLINE.split("");
  return (
    <div className="flex flex-wrap gap-1 px-1 py-2">
      {chars.map((c, i) => (
        <span
          key={i}
          className="flex items-center justify-center rounded-[3px] text-[13px] font-bold"
          style={{
            width: c === " " ? 8 : 20, height: 26,
            background: c === " " ? "transparent" : "#111",
            color: "#F5C542", fontFamily: "'JetBrains Mono', monospace",
            boxShadow: c === " " ? "none" : "inset 0 -2px 0 rgba(0,0,0,0.5)",
          }}
        >
          {c === " " ? "" : c}
        </span>
      ))}
    </div>
  );
}

function BreakingHighlightSweep() {
  return (
    <div className="px-1 py-2">
      <span className="relative inline-block text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0b1020" }}>
        <span className="absolute inset-y-1 left-0 right-0 -z-0 highlight-sweep" style={{ background: "#A3FF78" }} />
        <span className="relative z-10 px-1">{HEADLINE}</span>
      </span>
    </div>
  );
}

/* ---------------------------------------------------------
   Shiny score badges
--------------------------------------------------------- */
const badgeVariants = [
  { key: "gold",   label: "GOAL! 2–1", style: { background: "linear-gradient(135deg,#8a6a1e,#F5C542 50%,#8a6a1e)", color: "#241a03" } },
  { key: "chrome", label: "FT · 3–2",  style: { background: "linear-gradient(135deg,#7d8894,#ffffff 45%,#7d8894)", color: "#1a1e24" } },
  { key: "neon",   label: "LIVE 67'",  style: { background: "linear-gradient(135deg,#0b3d24,#39ff9c 50%,#0b3d24)", color: "#052a16" } },
  { key: "holo",   label: "HT",        style: { background: "linear-gradient(135deg,#ff9be0,#9bd9ff 35%,#c9ff9b 65%,#ff9be0)", color: "#1a0022" } },
  { key: "glass",  label: "PEN 4–3",   style: { background: "rgba(120,130,150,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" } },
];

function ShinyBadge({ label, style }) {
  return (
    <span className="shiny relative inline-flex items-center overflow-hidden rounded-full px-4 py-2 text-sm font-extrabold tracking-wide shadow-lg" style={style}>
      {label}
    </span>
  );
}

/* ---------------------------------------------------------
   HIGHLIGHT name badges
--------------------------------------------------------- */
function HighlightSpotlight({ name, team }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#141414", border: "1px solid #6b5320" }}>
      <div className="relative">
        <TeamMark team={team} size={34} />
        <span className="absolute -inset-1 rounded-full" style={{ boxShadow: "0 0 0 2px #F5C542", pointerEvents: "none" }} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-white">{name}</span>
        <span className="shiny relative inline-flex w-fit overflow-hidden rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest mt-0.5"
          style={{ background: "linear-gradient(135deg,#8a6a1e,#F5C542 50%,#8a6a1e)", color: "#241a03" }}>
          ★ HIGHLIGHT
        </span>
      </div>
    </div>
  );
}

function HighlightRibbon({ name, team }) {
  return (
    <div className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 overflow-hidden" style={{ background: "#0d3b1f", border: "1px solid #2f7d4d" }}>
      <div className="absolute -right-8 top-2 rotate-45 text-[9px] font-black tracking-widest px-8 py-0.5" style={{ background: "#A3FF78", color: "#052a16" }}>
        TOP FORM
      </div>
      <TeamMark team={team} size={34} />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-white">{name}</span>
        <span className="text-[11px] font-semibold" style={{ color: "#A3FF78" }}>Player of the match</span>
      </div>
    </div>
  );
}

function HighlightStamp({ name, team }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#1a0022", border: "1px solid #ff2bd6" }}>
      <TeamMark team={team} size={34} />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-white">{name}</span>
        <span className="inline-flex w-fit items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black tracking-wide -rotate-3 mt-0.5" style={{ border: "1.5px solid #29E0FF", color: "#29E0FF" }}>
          <Zap className="w-3 h-3" /> HIGHLIGHT REEL
        </span>
      </div>
    </div>
  );
}

function HighlightUnderline({ name, team }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#F6F1E4", border: "1px solid #b8b09a" }}>
      <TeamMark team={team} size={34} />
      <div className="flex flex-col leading-tight">
        <span className="relative text-sm font-bold text-[#2c2a24] w-fit">
          {name}
          <span className="absolute left-0 -bottom-0.5 h-[3px] w-full rounded-full" style={{ background: "#7a1f1f" }} />
        </span>
        <span className="text-[11px] font-semibold text-[#7a1f1f] mt-1 flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" /> HIGHLIGHT
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Avatar clusters — "who's watching" (2–4 people)
--------------------------------------------------------- */
const people = [
  { initials: "AK", name: "Ana Kova",   c1: "#FF7A45", c2: "#B3261E" },
  { initials: "MR", name: "Milo Reyes", c1: "#4C86D6", c2: "#16294D" },
  { initials: "JT", name: "Jules Tan",  c1: "#1FC2C2", c2: "#0B5C5C" },
  { initials: "PS", name: "Priya Shah", c1: "#F14FC4", c2: "#5B2A86" },
];

function AvatarCluster({ group, extraCount = 0, size = 34, pal }) {
  const names = group.map((p) => p.name.split(" ")[0]);
  const label = names.length <= 2 ? names.join(" & ") : `${names.slice(0, 2).join(", ")} +${names.length - 2 + extraCount} more`;
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {group.map((p, i) => (
          <div key={i} className="rounded-full flex items-center justify-center font-bold ring-2"
            style={{ width: size, height: size, fontSize: size * 0.36, color: "#fff", background: `linear-gradient(135deg, ${p.c1}, ${p.c2})`, boxShadow: "0 2px 6px rgba(0,0,0,0.35)", zIndex: group.length - i, borderColor: pal.bg }}>
            {p.initials}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="rounded-full flex items-center justify-center font-bold ring-2" style={{ width: size, height: size, fontSize: size * 0.32, borderColor: pal.bg, background: pal.surfaceBorder, color: pal.text }}>
            +{extraCount}
          </div>
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold" style={{ color: pal.text }}>{label}</span>
        <span className="text-xs" style={{ color: pal.textFaint }}>watching this match</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Standings table
--------------------------------------------------------- */
function StandingsTable({ pal }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: pal.surface, border: `1px solid ${pal.surfaceBorder}` }}>
      <div className="grid grid-cols-[28px_1fr_28px_28px_28px_28px_40px_44px] sm:grid-cols-[32px_1fr_36px_36px_36px_44px_44px_52px] gap-1 px-3 sm:px-4 py-2.5 text-[10px] sm:text-[11px] font-bold tracking-wide" style={{ color: pal.textFaint, borderBottom: `1px solid ${pal.surfaceBorder}` }}>
        <span>#</span><span>CLUB</span><span className="text-center">P</span>
        <span className="text-center hidden sm:block">W</span>
        <span className="text-center hidden sm:block">D</span>
        <span className="text-center">L</span><span className="text-center">GD</span><span className="text-right">PTS</span>
      </div>
      {standings.map((r, i) => {
        const team = T(r.code);
        const top = i === 0;
        const relegation = i >= standings.length - 2;
        return (
          <div key={r.code} className="grid grid-cols-[28px_1fr_28px_28px_28px_28px_40px_44px] sm:grid-cols-[32px_1fr_36px_36px_36px_44px_44px_52px] gap-1 items-center px-3 sm:px-4 py-2.5 text-[12px] sm:text-sm"
            style={{ background: i % 2 ? pal.rowAlt : "transparent", borderLeft: relegation ? "3px solid #dc2626" : top ? `3px solid ${pal.accent}` : "3px solid transparent" }}>
            <span className="font-bold" style={{ color: pal.textMuted }}>{i + 1}</span>
            <span className="flex items-center gap-2 min-w-0">
              <TeamMark team={team} size={22} />
              <span className="font-semibold truncate" style={{ color: pal.text }}>{team.name}</span>
            </span>
            <span className="text-center" style={{ color: pal.textMuted }}>{r.p}</span>
            <span className="text-center hidden sm:block" style={{ color: pal.textMuted }}>{r.w}</span>
            <span className="text-center hidden sm:block" style={{ color: pal.textMuted }}>{r.d}</span>
            <span className="text-center" style={{ color: pal.textMuted }}>{r.l}</span>
            <span className="text-center font-semibold" style={{ color: r.gd >= 0 ? pal.accent : "#f87171" }}>{r.gd > 0 ? `+${r.gd}` : r.gd}</span>
            <span className="text-right font-black" style={{ color: pal.text }}>{r.pts}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   Live pulse + sound/haptics goal simulator
--------------------------------------------------------- */
function GoalPulseDemo({ pal, soundOn }) {
  const [score, setScore] = useState({ sa: 1, sb: 1 });
  const [flash, setFlash] = useState(false);
  const audioCtxRef = useRef(null);

  const playChime = () => {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      [660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.28);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.3);
      });
    } catch (e) { /* audio unavailable, fail silently */ }
  };

  const simulateGoal = () => {
    setScore((s) => (Math.random() > 0.5 ? { ...s, sa: s.sa + 1 } : { ...s, sb: s.sb + 1 }));
    setFlash(true);
    playChime();
    if (soundOn && navigator.vibrate) navigator.vibrate([40, 30, 80]);
    setTimeout(() => setFlash(false), 900);
  };

  useEffect(() => {
    const id = setInterval(simulateGoal, 13000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  const A = T("EMB"), B = T("NGT");

  return (
    <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden" style={{ background: pal.surface, border: `1px solid ${pal.surfaceBorder}` }}>
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 40%, ${pal.accent}55, transparent 70%)` }}
          />
        )}
      </AnimatePresence>
      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <TeamMark team={A} size={38} />
          <motion.span animate={flash ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.5 }} className="text-3xl font-black tabular-nums" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            {score.sa}
          </motion.span>
          <span className="text-lg font-bold" style={{ color: pal.textFaint }}>–</span>
          <motion.span animate={flash ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.5 }} className="text-3xl font-black tabular-nums" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            {score.sb}
          </motion.span>
          <TeamMark team={B} size={38} />
        </div>
        <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide" style={{ background: "#7a0c0c", color: "#fff" }}>
          <span className="pulse-dot" style={{ background: "#fff" }} /> LIVE
        </span>
      </div>
      <p className="relative mt-3 text-xs sm:text-sm" style={{ color: pal.textMuted }}>
        {A.name} vs {B.name} — auto-simulates a goal roughly every 13s, or trigger one now.
      </p>
      <button
        onClick={simulateGoal}
        className="relative mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide"
        style={{ background: pal.accent, color: pal.bg }}
      >
        <Target className="w-3.5 h-3.5" /> Simulate goal
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */
export default function MatchDayShowcase() {
  const [mode, setMode] = useState("dark");
  const [soundOn, setSoundOn] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const pal = palettes[mode];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const sectionLabel = { color: pal.accent };
  const cardStyle = { background: pal.surface, border: `1px solid ${pal.surfaceBorder}` };

  const filteredThemes = themes.filter(
    (t) => (!activeTag || t.tags.includes(activeTag)) && t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: pal.bg, fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .marquee-track { width: max-content; animation-name: marquee; animation-timing-function: linear; animation-iteration-count: infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }

        .pulse-dot { width: 6px; height: 6px; border-radius: 999px; display: inline-block; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1);} 50% { opacity: .35; transform: scale(0.7);} }

        .shiny { position: relative; }
        .shiny::after {
          content: ''; position: absolute; top: 0; left: -150%; width: 55%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.75), transparent);
          transform: skewX(-20deg); animation: shine 2.6s ease-in-out infinite;
        }
        @keyframes shine { 0% { left: -150%; } 55%,100% { left: 150%; } }
        @media (prefers-reduced-motion: reduce) { .shiny::after { animation: none; display:none; } }

        .holo-bg { background: linear-gradient(120deg,#ff9be0,#9bd9ff,#c9ff9b,#ffe39b,#ff9be0); background-size: 300% 300%; animation: holoshift 8s ease infinite; }
        .foil-bg { background: linear-gradient(120deg,#0a3d24,#39ff9c,#0a3d24,#0a5c34); background-size: 300% 300%; animation: holoshift 7s ease infinite; }
        .aurora-bg { background: linear-gradient(120deg,#0b1f3a,#1fc2c2,#5b2a86,#0b1f3a); background-size: 300% 300%; animation: holoshift 9s ease infinite; }
        @keyframes holoshift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @media (prefers-reduced-motion: reduce) { .holo-bg,.foil-bg,.aurora-bg { animation: none; } }

        .highlight-sweep { animation: sweepIn 1.4s ease-out forwards; transform-origin: left; transform: scaleX(0); }
        @keyframes sweepIn { to { transform: scaleX(1); } }
        @media (prefers-reduced-motion: reduce) { .highlight-sweep { animation: none; transform: scaleX(1); } }
      `}</style>

      {/* HERO */}
      <header className="relative overflow-hidden border-b" style={{ background: pal.heroBg, borderColor: pal.surfaceBorder }}>
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-widest" style={{ ...cardStyle, color: pal.textMuted }}>
                <Radio className="w-3.5 h-3.5" style={{ color: pal.accent }} /> APEX LEAGUE · MATCH DAY
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundOn(!soundOn)}
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold tracking-wide"
                  style={{ ...cardStyle, color: pal.text }}
                  aria-label="Toggle sound and haptics"
                >
                  {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {soundOn ? "Sound on" : "Muted"}
                </button>
                <button
                  onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold tracking-wide"
                  style={{ ...cardStyle, color: pal.text }}
                  aria-label="Toggle light and dark mode"
                >
                  {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {mode === "dark" ? "Light" : "Dark"}
                </button>
              </div>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black leading-[0.95] tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
              20 WAYS TO<br /><span style={{ color: pal.accent }}>SHOW A SCORE</span>
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg" style={{ color: pal.textMuted }}>
              Ticker skins, standings, breaking-news styles, highlight badges, and a live goal simulator
              with sound and haptics — all tuned for light and dark.
            </p>
          </motion.div>
        </div>
      </header>

      {/* STANDINGS */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4" style={sectionLabel} />
            <span className="text-xs font-bold tracking-widest" style={sectionLabel}>LEAGUE TABLE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            Apex League standings
          </h2>
          <StandingsTable pal={pal} />
        </motion.div>
      </section>

      {/* LIVE PULSE + SOUND */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t" style={{ borderColor: pal.surfaceBorder }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" style={sectionLabel} />
            <span className="text-xs font-bold tracking-widest" style={sectionLabel}>LIVE GOAL PULSE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            Sound + haptic feedback on goal
          </h2>
          <GoalPulseDemo pal={pal} soundOn={soundOn} />
        </motion.div>
      </section>

      {/* MARQUEE GALLERY WITH SEARCH + FILTER */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t" style={{ borderColor: pal.surfaceBorder }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4" style={sectionLabel} />
            <span className="text-xs font-bold tracking-widest" style={sectionLabel}>20 TICKER STYLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            Search and filter the gallery
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: pal.textFaint }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search styles… e.g. glass, neon, retro"
                className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none"
                style={{ ...cardStyle, color: pal.text }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTag(null)}
              className="rounded-full px-3 py-1.5 text-xs font-bold tracking-wide"
              style={activeTag === null ? { background: pal.accent, color: pal.bg } : { ...cardStyle, color: pal.textMuted }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="rounded-full px-3 py-1.5 text-xs font-bold tracking-wide capitalize"
                style={activeTag === tag ? { background: pal.accent, color: pal.bg } : { ...cardStyle, color: pal.textMuted }}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs mb-4" style={{ color: pal.textFaint }}>
            Showing {filteredThemes.length} of {themes.length} styles
          </p>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredThemes.length ? (
                filteredThemes.map((theme) => <MarqueeBar key={theme.id} theme={theme} index={theme.id} />)
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm py-8 text-center" style={{ color: pal.textFaint }}>
                  No styles match “{query}”{activeTag ? ` in ${activeTag}` : ""}.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* BREAKING NEWS STYLES */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t" style={{ borderColor: pal.surfaceBorder }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" style={sectionLabel} />
            <span className="text-xs font-bold tracking-widest" style={sectionLabel}>BREAKING NEWS TEXT STYLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            Five ways to shout a headline
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl p-3" style={cardStyle}><BreakingAlert /></div>
            <div className="rounded-xl p-3" style={cardStyle}><BreakingGradient /></div>
            <div className="rounded-xl p-3" style={cardStyle}><BreakingOutline accent={pal.accent} /></div>
            <div className="rounded-xl p-3" style={{ background: "#0a0a0a", border: `1px solid ${pal.surfaceBorder}` }}><BreakingSplitFlap /></div>
            <div className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${pal.surfaceBorder}` }}><BreakingHighlightSweep /></div>
          </div>
        </motion.div>
      </section>

      {/* SHINY BADGES */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t" style={{ borderColor: pal.surfaceBorder }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4" style={sectionLabel} />
            <span className="text-xs font-bold tracking-widest" style={sectionLabel}>SHINY SCORE BADGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            Five finishes, one light sweep
          </h2>
          <div className="flex flex-wrap gap-4 rounded-xl p-5" style={cardStyle}>
            {badgeVariants.map((b) => <ShinyBadge key={b.key} label={b.label} style={b.style} />)}
          </div>
        </motion.div>
      </section>

      {/* HIGHLIGHT NAME BADGES */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t" style={{ borderColor: pal.surfaceBorder }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4" style={sectionLabel} />
            <span className="text-xs font-bold tracking-widest" style={sectionLabel}>HIGHLIGHT NAME BADGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            Four ways to spotlight a player
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <HighlightSpotlight name="Jules Tan" team={T("RVR")} />
            <HighlightRibbon name="Ana Kova" team={T("EMB")} />
            <HighlightStamp name="Priya Shah" team={T("ARA")} />
            <HighlightUnderline name="Milo Reyes" team={T("NGT")} />
          </div>
        </motion.div>
      </section>

      {/* AVATAR CLUSTERS */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t pb-24" style={{ borderColor: pal.surfaceBorder }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" style={sectionLabel} />
            <span className="text-xs font-bold tracking-widest" style={sectionLabel}>WHO'S WATCHING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", color: pal.text }}>
            Avatar + name, 2 to 4 people
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5" style={cardStyle}>
              <p className="text-xs mb-4 font-semibold tracking-wide" style={{ color: pal.textFaint }}>2 PEOPLE</p>
              <AvatarCluster group={people.slice(0, 2)} pal={pal} />
            </div>
            <div className="rounded-2xl p-5" style={cardStyle}>
              <p className="text-xs mb-4 font-semibold tracking-wide" style={{ color: pal.textFaint }}>3 PEOPLE</p>
              <AvatarCluster group={people.slice(0, 3)} pal={pal} />
            </div>
            <div className="rounded-2xl p-5" style={cardStyle}>
              <p className="text-xs mb-4 font-semibold tracking-wide" style={{ color: pal.textFaint }}>4 PEOPLE (+ OVERFLOW)</p>
              <AvatarCluster group={people.slice(0, 3)} extraCount={1} pal={pal} />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
