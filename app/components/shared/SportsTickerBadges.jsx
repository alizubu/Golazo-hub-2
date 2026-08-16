import React from 'react';
import { 
  CheckCircle2, Zap, TrendingUp, Flame, Trophy, Megaphone,
  Activity, BarChart2, PieChart, Target, Terminal,
  Video, Star, Camera, PlayCircle, Snowflake, Skull, Crown, FastForward
} from 'lucide-react';

/* ---------------------------------------------------------
   DATA: 40 THEMES FROM SHOWCASE
--------------------------------------------------------- */
const showcaseThemes = [
  { name: "Retro LED", tags: ["retro","vintage"], emoji: '👾', desc: 'Classic stadium board', speed: 20, radius: 4,
    wrap: { background: "#0a0704", border: "1px solid #2a2015" },
    chip: { background: "#120d08", border: "1px solid #3a2c17" },
    team: "#FFB000", score: "#FF7A00", font: "'JetBrains Mono', monospace",
    tab: { background: "#1a1108", color: "#FFB000" }, page: "dark", mono: true },

  { name: "Cathode CRT", tags: ["retro","tech"], emoji: '📺', desc: 'Scanlines & phosphor', speed: 21, radius: 2, glow: "rgba(57,255,106,0.3)", mono: true,
    wrap: { backgroundColor: "#020402",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(0,255,140,0.07) 0 1px, transparent 1px 3px)",
      border: "1px solid #0a3d1f" },
    chip: { background: "rgba(0,255,140,0.05)", border: "1px solid rgba(0,255,140,0.25)" },
    team: "#39FF6A", score: "#B6FFCB", font: "'JetBrains Mono', monospace",
    tab: { background: "#39FF6A", color: "#020402" }, page: "dark" },

  { name: "Satellite HUD", tags: ["retro","tech"], emoji: '🛰️', desc: 'Data projection grid', speed: 23, radius: 2, glow: "rgba(127,232,255,0.3)", mono: true,
    wrap: { backgroundColor: "#050b12",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(127,232,255,0.07) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(127,232,255,0.07) 0 1px, transparent 1px 24px)",
      border: "1px solid #123044" },
    chip: { background: "rgba(127,232,255,0.05)", border: "1px solid rgba(127,232,255,0.3)" },
    team: "#CFEFFF", score: "#7FE8FF", font: "'JetBrains Mono', monospace",
    tab: { background: "#7FE8FF", color: "#050b12" }, page: "dark" },

  { name: "Neon Pitch", tags: ["neon","cyberpunk"], emoji: '💚', desc: 'Glowing cyberpunk', speed: 26, radius: 10,
    wrap: { background: "linear-gradient(180deg,#052e16,#031a0d)", border: "1px solid #1f5c33" },
    chip: { background: "rgba(0,0,0,0.25)", border: "1px solid #2f7d4d", boxShadow: "0 0 14px rgba(163,255,120,0.18)" },
    team: "#D7FFDD", score: "#A3FF78", font: "'JetBrains Mono', monospace",
    tab: { background: "#0d3b1f", color: "#A3FF78" }, page: "dark" },

  { name: "Vantablack Onyx", tags: ["dark","minimal"], emoji: '🕳️', desc: 'Absorbing darkness', speed: 36, radius: 14, glow: "rgba(255,255,255,0.08)",
    wrap: { background: "#050505", border: "1px solid rgba(255,255,255,0.08)" },
    chip: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" },
    team: "#E8E8E8", score: "#F5F5F5", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(255,255,255,0.92)", color: "#050505" }, page: "dark" },

  { name: "Obsidian Glass", tags: ["glass","dark"], emoji: '🔪', desc: 'Sharp dark reflection', speed: 31, radius: 14, glow: "rgba(79,209,255,0.25)",
    wrap: { background: "#07080a", border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -30px 50px rgba(30,110,180,0.12)" },
    chip: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(120,180,255,0.2)" },
    team: "#DBE7FF", score: "#4FD1FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "#4FD1FF", color: "#07080a" }, page: "dark" },

  { name: "Stadium Lights", tags: ["glow","warm"], emoji: '🏟️', desc: 'Warm LED glow', speed: 30, radius: 12,
    wrap: { background: "radial-gradient(120% 140% at 10% 0%, #1c2b52 0%, #060a16 60%)", border: "1px solid #26345c" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #2c3c68" },
    team: "#EAF0FF", score: "#FFE49C", font: "'Space Grotesk', sans-serif",
    tab: { background: "#EAF0FF", color: "#0b1024" }, page: "dark" },

  { name: "Emerald Foil", tags: ["metallic","green"], emoji: '🧩', desc: 'Green metallic reflection', speed: 22, radius: 14,
    wrap: { border: "1px solid rgba(255,255,255,0.2)" }, extraClass: "foil-bg",
    chip: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.28)" },
    team: "#f0fff6", score: "#eaffef", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.4)", color: "#f0fff6" }, page: "dark" },

  { name: "Holographic Foil", tags: ["holo","shiny"], emoji: '✨', desc: 'Shimmering pastel holo', speed: 22, radius: 16,
    wrap: { border: "1px solid rgba(255,255,255,0.25)" }, extraClass: "holo-bg",
    chip: { background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.3)" },
    team: "#0a0a0a", score: "#0a0a0a", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.7)", color: "#fff" }, page: "light" },

  { name: "Liquid Mercury", tags: ["metallic","liquid"], emoji: '💧', desc: 'Flowing silver metal', speed: 20, radius: 12, glow: "rgba(200,200,210,0.35)",
    wrap: { border: "1px solid rgba(255,255,255,0.35)" }, extraClass: "mercury-bg",
    chip: { background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.4)" },
    team: "#141414", score: "#0a0a0a", font: "'Space Grotesk', sans-serif",
    tab: { background: "#141414", color: "#f2f2f2" }, page: "light" }];

export const THEMES = showcaseThemes.map(t => ({
  ...t,
  id: t.name.toLowerCase().replace(/\s+/g, '-'),
}));

// ── Separator characters ─────────────────────────────────────────────────────
export const SEPARATORS = {
  dot:     '·',
  ball:    '⚽',
  pipe:    '│',
  diamond: '◆',
  slash:   '//',
  none:    '',
};

// ── Speed → CSS duration ─────────────────────────────────────────────────────
export function speedToDuration(speed) {
  const s = Math.max(1, Math.min(100, speed || 50));
  return `${Math.round(120 - (s / 100) * 112)}s`;
}



export function getThemeStyles(themeId) {
  return THEMES.find(t => t.id === themeId) || THEMES[0];
}

/* ---------------------------------------------------------
   Shiny Badges (for Smart Content & Highlights)
--------------------------------------------------------- */
export const BADGE_STYLES = {
  breaking: { background: "linear-gradient(135deg,#8a0013,#ff0a33 50%,#8a0013)", color: "#fff", border: "1px solid #ff4d6d" },
  
  // STATS
  cyberNeon: { background: "#0a1128", color: "#00f0ff", border: "1px solid #00f0ff", boxShadow: "0 0 10px rgba(0,240,255,0.4)" },
  goldStandard: { background: "#1a1a1a", color: "#ffd700", border: "1px solid #ffd700" },
  frostGlass: { background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.3)" },
  holographic: { background: "linear-gradient(135deg, rgba(255,107,107,0.3), rgba(78,205,196,0.3))", color: "#ffffff", border: "1px solid #ffffff" },
  matrixGreen: { background: "#000000", color: "#00ff41", border: "1px dashed #00ff41" },
  
  // HIGHLIGHTS
  lavaFlow: { background: "linear-gradient(90deg, #7f1d1d, #ea580c)", color: "#ffffff", textShadow: "0 0 5px rgba(255,165,0,0.5)" },
  electricPurple: { background: "#4c1d95", color: "#f472b6", border: "1px solid #f472b6", textShadow: "0 0 5px rgba(244,114,182,0.5)" },
  sunriseBurst: { background: "linear-gradient(45deg, #fbbf24, #ec4899, #8b5cf6)", color: "#ffffff" },
  liquidChrome: { background: "linear-gradient(180deg, #f8fafc, #94a3b8)", color: "#0f172a", border: "1px solid #64748b" },
  neonPop: { background: "#06b6d4", color: "#000000", border: "1px solid #000", boxShadow: "2px 2px 0px #000" },

  // STREAKS
  inferno: { background: "#450a0a", color: "#ff4500", border: "1px solid #ff4500", boxShadow: "0 0 15px rgba(255,69,0,0.5)" },
  absoluteZero: { background: "#000033", color: "#00ffff", border: "1px solid #00ffff", textShadow: "0 0 5px #00ffff" },
  toxicForm: { background: "#022c22", color: "#39ff14", border: "1px solid #39ff14", boxShadow: "0 0 10px rgba(57,255,20,0.3)" },
  royalMomentum: { background: "#312e81", color: "#fbbf24", border: "1px solid #fbbf24" },
  velocity: { background: "linear-gradient(90deg, #1e293b, #eab308)", color: "#ffffff" },

  // LEGACY
  highlight: { background: "linear-gradient(90deg, #b91c1c, #d97706)", color: "#fff", border: "1px solid #fbbf24", boxShadow: "0 0 10px rgba(217,119,6,0.3)" },
  stats: { background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", color: "#39ff9c", border: "1px solid rgba(57,255,156,0.6)", boxShadow: "0 0 12px rgba(57,255,156,0.2)" },
  streakHot: { background: "#1a0800", color: "#ff8c00", border: "1px solid rgba(255,98,0,0.6)", boxShadow: "0 0 12px rgba(255,98,0,0.3)" },
  streakCold: { background: "#00081a", color: "#3988ff", border: "1px solid rgba(57,136,255,0.6)", boxShadow: "0 0 12px rgba(57,136,255,0.3)" }
};

export function ShinyBadge({ label, style, icon: Icon }) {
  return (
    <span
      className="shiny relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-wide shadow-lg shrink-0"
      style={style}
    >
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
}

// ── Shared UI Badges ─────────────────────────────────────────────────────────

export function StatusTag({ status, time, theme }) {
  const live = status === "LIVE";
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide shrink-0 mx-1"
      style={{ background: theme.tab.background, color: theme.tab.color }}
    >
      {live && <span className="pulse-dot" style={{ background: theme.tab.color }} />}
      {status === "LIVE" ? time : status}
    </span>
  );
}

export function SeparatorItem({ separator, theme }) {
  const char = SEPARATORS[separator];
  if (!char) return null;
  return (
    <span className="shrink-0 opacity-40 font-bold mx-2" style={{ color: theme.team }}>{char}</span>
  );
}

export function BreakingBadge({ sizeKey }) {
  return <ShinyBadge label="BREAKING" style={BADGE_STYLES.breaking} />;
}

export function StatsBadge({ sizeKey }) {
  return <ShinyBadge label="STATS" icon={TrendingUp} style={BADGE_STYLES.stats} />;
}

export function StreakBadge({ type, sizeKey }) {
  const isHot = type === 'win';
  return <ShinyBadge label={isHot ? "STREAK" : "ALERT"} icon={isHot ? Flame : Zap} style={isHot ? BADGE_STYLES.streakHot : BADGE_STYLES.streakCold} />;
}

export function HighlightBadge({ sizeKey }) {
  return <ShinyBadge label="HIGHLIGHT" icon={Trophy} style={BADGE_STYLES.highlight} />;
}

// ── CUSTOM MANUALLY ADDED BADGES ─────────────────────────────────────────────

// STATS
export function CyberNeonBadge({ label = "STATS" }) { return <ShinyBadge label={label} icon={Activity} style={BADGE_STYLES.cyberNeon} />; }
export function GoldStandardBadge({ label = "STATS" }) { return <ShinyBadge label={label} icon={BarChart2} style={BADGE_STYLES.goldStandard} />; }
export function FrostGlassBadge({ label = "STATS" }) { return <ShinyBadge label={label} icon={PieChart} style={BADGE_STYLES.frostGlass} />; }
export function HolographicBadge({ label = "STATS" }) { return <ShinyBadge label={label} icon={Target} style={BADGE_STYLES.holographic} />; }
export function MatrixGreenBadge({ label = "STATS" }) { return <ShinyBadge label={label} icon={Terminal} style={BADGE_STYLES.matrixGreen} />; }

// HIGHLIGHTS
export function LavaFlowBadge({ label = "HIGHLIGHT" }) { return <ShinyBadge label={label} icon={Video} style={BADGE_STYLES.lavaFlow} />; }
export function ElectricPurpleBadge({ label = "HIGHLIGHT" }) { return <ShinyBadge label={label} icon={Zap} style={BADGE_STYLES.electricPurple} />; }
export function SunriseBurstBadge({ label = "HIGHLIGHT" }) { return <ShinyBadge label={label} icon={Star} style={BADGE_STYLES.sunriseBurst} />; }
export function LiquidChromeBadge({ label = "HIGHLIGHT" }) { return <ShinyBadge label={label} icon={Camera} style={BADGE_STYLES.liquidChrome} />; }
export function NeonPopBadge({ label = "HIGHLIGHT" }) { return <ShinyBadge label={label} icon={PlayCircle} style={BADGE_STYLES.neonPop} />; }

// STREAKS
export function InfernoBadge({ label = "STREAK" }) { return <ShinyBadge label={label} icon={Flame} style={BADGE_STYLES.inferno} />; }
export function AbsoluteZeroBadge({ label = "STREAK" }) { return <ShinyBadge label={label} icon={Snowflake} style={BADGE_STYLES.absoluteZero} />; }
export function ToxicFormBadge({ label = "STREAK" }) { return <ShinyBadge label={label} icon={Skull} style={BADGE_STYLES.toxicForm} />; }
export function RoyalMomentumBadge({ label = "STREAK" }) { return <ShinyBadge label={label} icon={Crown} style={BADGE_STYLES.royalMomentum} />; }
export function VelocityBadge({ label = "STREAK" }) { return <ShinyBadge label={label} icon={FastForward} style={BADGE_STYLES.velocity} />; }
