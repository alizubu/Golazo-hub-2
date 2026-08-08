import React from 'react';
import { CheckCircle2, Zap, TrendingUp, Flame, Trophy, Megaphone } from 'lucide-react';

/* ---------------------------------------------------------
   DATA: 40 THEMES FROM SHOWCASE
--------------------------------------------------------- */
const showcaseThemes = [
  { name: "Glass Frost", tags: ["glass","modern"], emoji: '🪟', desc: 'Frosted transparency', speed: 32, radius: 14,
    wrap: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(14px)" },
    chip: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" },
    team: "#EAF2FF", score: "#7CE7FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(255,255,255,0.12)", color: "#EAF2FF" }, page: "dark" },

  { name: "Neon Pitch", tags: ["neon","cyberpunk"], emoji: '💚', desc: 'Glowing cyberpunk', speed: 26, radius: 10,
    wrap: { background: "linear-gradient(180deg,#052e16,#031a0d)", border: "1px solid #1f5c33" },
    chip: { background: "rgba(0,0,0,0.25)", border: "1px solid #2f7d4d", boxShadow: "0 0 14px rgba(163,255,120,0.18)" },
    team: "#D7FFDD", score: "#A3FF78", font: "'JetBrains Mono', monospace",
    tab: { background: "#0d3b1f", color: "#A3FF78" }, page: "dark" },

  { name: "Chrome Ticker", tags: ["metallic","sleek"], emoji: '💿', desc: 'Sleek silver metal', speed: 24, radius: 6,
    wrap: { background: "linear-gradient(180deg,#e9edf1,#c3c9d1)", border: "1px solid #9aa2ad" },
    chip: { background: "linear-gradient(180deg,#ffffff,#d4d9df)", border: "1px solid #a9b0ba" },
    team: "#1b1f24", score: "#0a0c0f", font: "'Space Grotesk', sans-serif",
    tab: { background: "#1b1f24", color: "#e9edf1" }, page: "light" },

  { name: "Gold Premier", tags: ["metallic","premium"], emoji: '🏆', desc: 'Gold metallic shine', speed: 30, radius: 12,
    wrap: { background: "#0a0a0a", border: "1px solid #3a2c0f" },
    chip: { background: "#141414", border: "1px solid #6b5320" },
    team: "#F4E4B8", score: "#F5C542", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#8a6a1e,#F5C542)", color: "#141414" }, page: "dark" },

  { name: "Minimal Mono", tags: ["minimal","clean"], emoji: '📓', desc: 'Clean black & white', speed: 34, radius: 0,
    wrap: { background: "#ffffff", borderTop: "2px solid #111", borderBottom: "2px solid #111" },
    chip: { background: "transparent", borderRight: "1px solid #d8d8d8" },
    team: "#111111", score: "#111111", font: "'Space Grotesk', sans-serif",
    tab: { background: "#111111", color: "#ffffff" }, page: "light" },

  { name: "Holographic Foil", tags: ["holo","shiny"], emoji: '✨', desc: 'Shimmering pastel holo', speed: 22, radius: 16,
    wrap: { border: "1px solid rgba(255,255,255,0.25)" }, extraClass: "holo-bg",
    chip: { background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.3)" },
    team: "#0a0a0a", score: "#0a0a0a", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.7)", color: "#fff" }, page: "light" },

  { name: "Retro LED", tags: ["retro","vintage"], emoji: '👾', desc: 'Classic stadium board', speed: 20, radius: 4,
    wrap: { background: "#0a0704", border: "1px solid #2a2015" },
    chip: { background: "#120d08", border: "1px solid #3a2c17" },
    team: "#FFB000", score: "#FF7A00", font: "'JetBrains Mono', monospace",
    tab: { background: "#1a1108", color: "#FFB000" }, page: "dark", mono: true },

  { name: "Carbon Fiber", tags: ["texture","racing"], emoji: '🏁', desc: 'Racing inspired texture', speed: 28, radius: 10,
    wrap: { backgroundColor: "#0d0d0d",
      backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)",
      border: "1px solid #d1252c33" },
    chip: { background: "rgba(209,37,44,0.08)", border: "1px solid #d1252c55" },
    team: "#f2f2f2", score: "#ff4655", font: "'Bebas Neue', sans-serif",
    tab: { background: "#d1252c", color: "#0d0d0d" }, page: "dark" },

  { name: "Stadium Lights", tags: ["glow","warm"], emoji: '🏟️', desc: 'Warm LED glow', speed: 30, radius: 12,
    wrap: { background: "radial-gradient(120% 140% at 10% 0%, #1c2b52 0%, #060a16 60%)", border: "1px solid #26345c" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #2c3c68" },
    team: "#EAF0FF", score: "#FFE49C", font: "'Space Grotesk', sans-serif",
    tab: { background: "#EAF0FF", color: "#0b1024" }, page: "dark" },

  { name: "Paper Ticket", tags: ["paper","vintage"], emoji: '🎟️', desc: 'Vintage match ticket', speed: 33, radius: 2,
    wrap: { background: "#F6F1E4", border: "1px dashed #2c2a24" },
    chip: { background: "#FBF8EE", border: "1px dashed #b8b09a" },
    team: "#2c2a24", score: "#7a1f1f", font: "'JetBrains Mono', monospace",
    tab: { background: "#2c2a24", color: "#F6F1E4" }, page: "light" },

  { name: "Cyberpunk Duotone", tags: ["neon","cyberpunk"], emoji: '🤖', desc: 'Neon pink & cyan', speed: 21, radius: 8,
    wrap: { background: "linear-gradient(90deg,#1a0022,#001f24)", border: "1px solid #ff2bd6" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #29e0ff88" },
    team: "#ff6bf0", score: "#29E0FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "#ff2bd6", color: "#160018" }, page: "dark" },

  { name: "Sunset Gradient", tags: ["gradient","warm"], emoji: '🌅', desc: 'Coral-orange warmth', speed: 27, radius: 18,
    wrap: { background: "linear-gradient(90deg,#3b0a5c,#c0356b,#ff8a4c)" },
    chip: { background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.25)" },
    team: "#fff", score: "#FFE9B8", font: "'Bebas Neue', sans-serif",
    tab: { background: "rgba(0,0,0,0.35)", color: "#fff" }, page: "dark" },

  { name: "Ice Rink", tags: ["glass","cold"], emoji: '❄️', desc: 'Icy blue frost', speed: 31, radius: 14,
    wrap: { background: "linear-gradient(180deg,#eaf6ff,#cfeaff)", border: "1px solid #a9d6ef" },
    chip: { background: "rgba(255,255,255,0.6)", border: "1px solid #bfe1f4" },
    team: "#0c3a52", score: "#0f7ea8", font: "'Space Grotesk', sans-serif",
    tab: { background: "#0f7ea8", color: "#eaf6ff" }, page: "light" },

  { name: "Velvet VIP", tags: ["texture","premium"], emoji: '🎭', desc: 'Purple-gold luxury', speed: 29, radius: 16,
    wrap: { background: "linear-gradient(180deg,#2a0e3d,#160522)", border: "1px solid #7a4fae" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #a97cf0aa" },
    team: "#f1e6ff", score: "#F5C542", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#7a4fae,#F5C542)", color: "#160522" }, page: "dark" },

  { name: "Denim Casual", tags: ["texture","fabric"], emoji: '👖', desc: 'Blue jeans texture', speed: 25, radius: 999,
    wrap: { background: "linear-gradient(180deg,#2c5aa0,#1c3b6b)", border: "2px dashed rgba(255,255,255,0.35)" },
    chip: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)" },
    team: "#eaf1ff", score: "#ffd166", font: "'Space Grotesk', sans-serif",
    tab: { background: "#eaf1ff", color: "#1c3b6b" }, page: "dark" },

  { name: "Solar Flare", tags: ["glow","hot"], emoji: '☀️', desc: 'Intense heat glow', speed: 23, radius: 12,
    wrap: { background: "radial-gradient(120% 160% at 0% 100%, #ff6a00 0%, #7a0c0c 55%, #200404 100%)" },
    chip: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,180,120,0.4)" },
    team: "#FFE9D6", score: "#FFB35C", font: "'Bebas Neue', sans-serif",
    tab: { background: "#FFB35C", color: "#200404" }, page: "dark" },

  { name: "Midnight Grid", tags: ["minimal","dark"], emoji: '🌙', desc: 'Deep navy starlight', speed: 30, radius: 10,
    wrap: { backgroundColor: "#0a0e1a",
      backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 28px)",
      border: "1px solid #1c2740" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #263354" },
    team: "#eef2ff", score: "#9db4ff", font: "'JetBrains Mono', monospace",
    tab: { background: "#9db4ff", color: "#0a0e1a" }, page: "dark" },

  { name: "Emerald Foil", tags: ["metallic","green"], emoji: '🧩', desc: 'Green metallic reflection', speed: 22, radius: 14,
    wrap: { border: "1px solid rgba(255,255,255,0.2)" }, extraClass: "foil-bg",
    chip: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.28)" },
    team: "#f0fff6", score: "#eaffef", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.4)", color: "#f0fff6" }, page: "dark" },

  { name: "Blueprint Tech", tags: ["retro","schematic"], emoji: '📐', desc: 'Drafting schematic', speed: 34, radius: 2,
    wrap: { backgroundColor: "#0c2340",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px)",
      border: "1px solid #2f5488" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #3f6aa8" },
    team: "#DCEBFF", score: "#8FC1FF", font: "'JetBrains Mono', monospace",
    tab: { background: "#DCEBFF", color: "#0c2340" }, page: "dark" },

  { name: "Aurora Wave", tags: ["glow","cosmic"], emoji: '🌌', desc: 'Cosmic dark energy', speed: 24, radius: 16,
    wrap: { border: "1px solid rgba(255,255,255,0.2)" }, extraClass: "aurora-bg",
    chip: { background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.3)" },
    team: "#fff", score: "#E8FFF6", font: "'Bebas Neue', sans-serif",
    tab: { background: "rgba(0,0,0,0.4)", color: "#fff" }, page: "dark" },

  /* ATELIER COLLECTION */
  { name: "Vantablack Onyx", tags: ["dark","minimal"], emoji: '🕳️', desc: 'Absorbing darkness', speed: 36, radius: 14, glow: "rgba(255,255,255,0.08)",
    wrap: { background: "#050505", border: "1px solid rgba(255,255,255,0.08)" },
    chip: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" },
    team: "#E8E8E8", score: "#F5F5F5", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(255,255,255,0.92)", color: "#050505" }, page: "dark" },

  { name: "Liquid Mercury", tags: ["metallic","liquid"], emoji: '💧', desc: 'Flowing silver metal', speed: 20, radius: 12, glow: "rgba(200,200,210,0.35)",
    wrap: { border: "1px solid rgba(255,255,255,0.35)" }, extraClass: "mercury-bg",
    chip: { background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.4)" },
    team: "#141414", score: "#0a0a0a", font: "'Space Grotesk', sans-serif",
    tab: { background: "#141414", color: "#f2f2f2" }, page: "light" },

  { name: "Kintsugi Gold Seam", tags: ["texture","premium"], emoji: '🏺', desc: 'Repaired with gold', speed: 30, radius: 10, glow: "rgba(212,175,55,0.3)",
    wrap: { background: "#1b1714",
      backgroundImage: "linear-gradient(115deg, transparent 0%, transparent 40%, rgba(212,175,55,0.65) 49%, #F5E6B8 50%, rgba(212,175,55,0.65) 51%, transparent 60%, transparent 100%)",
      border: "1px solid #3a2f1f" },
    chip: { background: "rgba(0,0,0,0.3)", border: "1px solid #5c4a26" },
    team: "#EFE3C5", score: "#F5D889", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#8a6a1e,#F5D889)", color: "#1b1714" }, page: "dark" },

  { name: "Marble Quarry", tags: ["texture","stone"], emoji: '🏛️', desc: 'Classic stone texture', speed: 33, radius: 8, glow: "rgba(0,0,0,0.12)",
    wrap: { backgroundColor: "#f4f3f0",
      backgroundImage: "radial-gradient(circle at 20% 30%, rgba(120,120,120,0.18) 0%, transparent 40%), radial-gradient(circle at 75% 65%, rgba(90,90,90,0.14) 0%, transparent 38%), linear-gradient(120deg, transparent 44%, rgba(150,150,150,0.3) 46%, transparent 49%)",
      border: "1px solid #d8d5cc" },
    chip: { background: "rgba(255,255,255,0.55)", border: "1px solid #cfcabf" },
    team: "#2b2b2b", score: "#8a6a1e", font: "'Space Grotesk', sans-serif",
    tab: { background: "#2b2b2b", color: "#f4f3f0" }, page: "light" },

  { name: "Art Deco Gatsby", tags: ["retro","gold"], emoji: '🍸', desc: '1920s luxury gold', speed: 27, radius: 4, glow: "rgba(212,175,55,0.35)",
    wrap: { background: "#0b3d2e", border: "2px solid #D4AF37", boxShadow: "inset 0 0 0 4px rgba(212,175,55,0.15)" },
    chip: { background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.5)" },
    team: "#EFE3C5", score: "#D4AF37", font: "'Bebas Neue', sans-serif",
    tab: { background: "#D4AF37", color: "#0b3d2e" }, page: "dark" },

  { name: "Brutalist Concrete", tags: ["texture","raw"], emoji: '🏗️', desc: 'Raw concrete block', speed: 26, radius: 0, glow: "rgba(0,0,0,0.25)", mono: true,
    wrap: { backgroundColor: "#8f8f8a",
      backgroundImage: "repeating-radial-gradient(circle at 3px 3px, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 7px)",
      border: "3px solid #141414" },
    chip: { background: "rgba(0,0,0,0.08)", border: "2px solid #141414" },
    team: "#141414", score: "#141414", font: "'JetBrains Mono', monospace",
    tab: { background: "#141414", color: "#f2f2ee" }, page: "light" },

  { name: "Silk Ribbon", tags: ["texture","fabric"], emoji: '🎀', desc: 'Flowing luxury fabric', speed: 24, radius: 16, glow: "rgba(122,16,48,0.35)",
    wrap: { border: "1px solid rgba(255,220,180,0.25)" }, extraClass: "silk-bg",
    chip: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,220,180,0.3)" },
    team: "#F3E3C3", score: "#FFD9A0", font: "'Bebas Neue', sans-serif",
    tab: { background: "#F3E3C3", color: "#3b0a1a" }, page: "dark" },

  { name: "Obsidian Glass", tags: ["glass","dark"], emoji: '🔪', desc: 'Sharp dark reflection', speed: 31, radius: 14, glow: "rgba(79,209,255,0.25)",
    wrap: { background: "#07080a", border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -30px 50px rgba(30,110,180,0.12)" },
    chip: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(120,180,255,0.2)" },
    team: "#DBE7FF", score: "#4FD1FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "#4FD1FF", color: "#07080a" }, page: "dark" },

  { name: "Perfume Editorial", tags: ["clean","premium"], emoji: '🧴', desc: 'High fashion tones', speed: 35, radius: 999, glow: "rgba(176,141,87,0.25)",
    wrap: { background: "#F3E7E4", border: "1px solid #D9BFA8" },
    chip: { background: "rgba(255,255,255,0.5)", border: "1px solid #E3CDB8" },
    team: "#5C4632", score: "#B08D57", font: "'Space Grotesk', sans-serif",
    tab: { background: "#5C4632", color: "#F3E7E4" }, page: "light" },

  { name: "Vinyl Record Sleeve", tags: ["retro","texture"], emoji: '📀', desc: 'Grooved black vinyl', speed: 22, radius: 999, glow: "rgba(255,122,26,0.3)",
    wrap: { backgroundColor: "#0c0c0c",
      backgroundImage: "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, transparent 2px, transparent 6px)",
      border: "1px solid #2a2a2a" },
    chip: { background: "rgba(255,122,26,0.08)", border: "1px solid rgba(255,122,26,0.35)" },
    team: "#f2f2f2", score: "#FF7A1A", font: "'Bebas Neue', sans-serif",
    tab: { background: "#FF7A1A", color: "#0c0c0c" }, page: "dark" },

  { name: "Circuit PCB", tags: ["retro","tech"], emoji: '⚡', desc: 'Electronic green board', speed: 29, radius: 6, glow: "rgba(232,196,104,0.25)", mono: true,
    wrap: { backgroundColor: "#08210f",
      backgroundImage: "repeating-linear-gradient(90deg, rgba(232,196,104,0.1) 0 2px, transparent 2px 26px), repeating-linear-gradient(0deg, rgba(232,196,104,0.06) 0 1px, transparent 1px 26px)",
      border: "1px solid #1e4a2c" },
    chip: { background: "rgba(0,0,0,0.3)", border: "1px solid #3a6b46" },
    team: "#BFFFD1", score: "#E8C468", font: "'JetBrains Mono', monospace",
    tab: { background: "#E8C468", color: "#08210f" }, page: "dark" },

  { name: "Watch Chronograph", tags: ["texture","tech"], emoji: '⌚', desc: 'Precision dial ticks', speed: 28, radius: 999, glow: "rgba(230,57,70,0.25)",
    wrap: { backgroundColor: "#0d1b2a",
      backgroundImage: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.07) 0deg 1deg, transparent 1deg 6deg)",
      border: "1px solid #223447" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #33506b" },
    team: "#C9D6E3", score: "#E63946", font: "'Space Grotesk', sans-serif",
    tab: { background: "#C9D6E3", color: "#0d1b2a" }, page: "dark" },

  { name: "Stained Glass Cathedral", tags: ["glass","colorful"], emoji: '⛪', desc: 'Colorful light panes', speed: 25, radius: 2, glow: "rgba(120,60,180,0.3)",
    wrap: { background: "linear-gradient(100deg,#1b1030 0%,#3a1c5e 16%,#0f3d5c 32%,#0a5c4a 48%,#5c3d0a 64%,#5c0f24 80%,#1b1030 100%)",
      border: "2px solid #0a0a0a" },
    chip: { background: "rgba(0,0,0,0.3)", border: "2px solid rgba(0,0,0,0.5)" },
    team: "#F5EFE0", score: "#FFD9A0", font: "'Bebas Neue', sans-serif",
    tab: { background: "#0a0a0a", color: "#F5EFE0" }, page: "dark" },

  { name: "Cathode CRT", tags: ["retro","tech"], emoji: '📺', desc: 'Scanlines & phosphor', speed: 21, radius: 2, glow: "rgba(57,255,106,0.3)", mono: true,
    wrap: { backgroundColor: "#020402",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(0,255,140,0.07) 0 1px, transparent 1px 3px)",
      border: "1px solid #0a3d1f" },
    chip: { background: "rgba(0,255,140,0.05)", border: "1px solid rgba(0,255,140,0.25)" },
    team: "#39FF6A", score: "#B6FFCB", font: "'JetBrains Mono', monospace",
    tab: { background: "#39FF6A", color: "#020402" }, page: "dark" },

  { name: "Origami Paper Fold", tags: ["paper","clean"], emoji: '🕊️', desc: 'Creased geometry', speed: 32, radius: 6, glow: "rgba(0,0,0,0.1)",
    wrap: { background: "linear-gradient(135deg,#f2ede2,#e4dcc8)",
      backgroundImage: "linear-gradient(60deg, transparent 40%, rgba(0,0,0,0.05) 41%, transparent 42%)",
      border: "1px solid #d6cdb4" },
    chip: { background: "rgba(255,255,255,0.5)", border: "1px solid #ddd3ba" },
    team: "#4a3f2c", score: "#8a6a1e", font: "'Space Grotesk', sans-serif",
    tab: { background: "#4a3f2c", color: "#f2ede2" }, page: "light" },

  { name: "Satellite HUD", tags: ["retro","tech"], emoji: '🛰️', desc: 'Data projection grid', speed: 23, radius: 2, glow: "rgba(127,232,255,0.3)", mono: true,
    wrap: { backgroundColor: "#050b12",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(127,232,255,0.07) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(127,232,255,0.07) 0 1px, transparent 1px 24px)",
      border: "1px solid #123044" },
    chip: { background: "rgba(127,232,255,0.05)", border: "1px solid rgba(127,232,255,0.3)" },
    team: "#CFEFFF", score: "#7FE8FF", font: "'JetBrains Mono', monospace",
    tab: { background: "#7FE8FF", color: "#050b12" }, page: "dark" },

  { name: "Champagne Editorial", tags: ["clean","premium"], emoji: '🍾', desc: 'Effervescent luxury', speed: 34, radius: 2, glow: "rgba(0,0,0,0.1)",
    wrap: { background: "linear-gradient(180deg,#FBF6EC,#F1E4C8)", borderBottom: "2px solid #111" },
    chip: { background: "rgba(255,255,255,0.6)", border: "1px solid #e6d8b0" },
    team: "#2b2410", score: "#8a6a1e", font: "'Space Grotesk', sans-serif",
    tab: { background: "#111", color: "#FBF6EC" }, page: "light" },

  { name: "Bioluminescence", tags: ["glow","dark"], emoji: '🦠', desc: 'Deep ocean glow', speed: 30, radius: 16, glow: "rgba(53,232,208,0.3)",
    wrap: { background: "radial-gradient(120% 140% at 80% 100%, #0a3d4a 0%, #021018 60%)",
      backgroundImage: "radial-gradient(4px 4px at 15% 40%, rgba(53,232,208,0.5), transparent), radial-gradient(3px 3px at 60% 25%, rgba(53,232,208,0.4), transparent), radial-gradient(3px 3px at 85% 70%, rgba(53,232,208,0.4), transparent)",
      border: "1px solid #0e4a56" },
    chip: { background: "rgba(53,232,208,0.06)", border: "1px solid rgba(53,232,208,0.3)" },
    team: "#BFFFF6", score: "#35E8D0", font: "'Space Grotesk', sans-serif",
    tab: { background: "#35E8D0", color: "#021018" }, page: "dark" },

  { name: "Terrazzo Stone", tags: ["texture","stone"], emoji: '🪨', desc: 'Speckled tile surface', speed: 33, radius: 18, glow: "rgba(0,0,0,0.08)",
    wrap: { backgroundColor: "#F5EDE4",
      backgroundImage: "radial-gradient(6px 6px at 10% 30%, #F2A6A6 0, transparent 60%), radial-gradient(5px 5px at 25% 70%, #9BD8C2 0, transparent 60%), radial-gradient(4px 4px at 45% 20%, #2C3E66 0, transparent 60%), radial-gradient(6px 6px at 60% 60%, #E8C468 0, transparent 60%), radial-gradient(5px 5px at 80% 35%, #F2A6A6 0, transparent 60%), radial-gradient(4px 4px at 92% 75%, #9BD8C2 0, transparent 60%)",
      border: "1px solid #e0d5c4" },
    chip: { background: "rgba(255,255,255,0.55)", border: "1px solid #e6dbc9" },
    team: "#2C3E66", score: "#C4272E", font: "'Space Grotesk', sans-serif",
    tab: { background: "#2C3E66", color: "#F5EDE4" }, page: "light" },

  { name: "Aurora Silk", tags: ["texture","cosmic"], emoji: '🎆', desc: 'Flowing cosmic fabric', speed: 26, radius: 20, glow: "rgba(180,150,220,0.35)",
    wrap: { border: "1px solid rgba(255,255,255,0.3)" }, extraClass: "auroraSilk-bg",
    chip: { background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" },
    team: "#3b1f4d", score: "#5b2a86", font: "'Bebas Neue', sans-serif",
    tab: { background: "#3b1f4d", color: "#f5eefc" }, page: "dark" },
];

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

// ── Size → classes ───────────────────────────────────────────────────────────
export const SIZE_CLASSES = {
  compact: { container: 'h-[44px]', text: 'text-[11px]', badge: 'text-[9px] px-2 py-0.5', avatar: 18, gap: 'gap-1.5 mr-6', paddingY: 'py-0.5' },
  normal:  { container: 'h-[56px]', text: 'text-[13px]', badge: 'text-[10px] px-2.5 py-1', avatar: 24, gap: 'gap-2.5 mr-10', paddingY: 'py-1' },
  large:   { container: 'h-[72px]', text: 'text-base', badge: 'text-[11px] px-3 py-1.5', avatar: 30, gap: 'gap-3 mr-12', paddingY: 'py-1.5' },
};

export function getThemeStyles(themeId) {
  return THEMES.find(t => t.id === themeId) || THEMES[0];
}

/* ---------------------------------------------------------
   Shiny Badges (for Smart Content & Highlights)
--------------------------------------------------------- */
export const BADGE_STYLES = {
  breaking: { background: "linear-gradient(135deg,#5c000d,#ff0a33 50%,#5c000d)", color: "#fff" },
  highlight: { background: "linear-gradient(135deg,#8a6a1e,#F5C542 50%,#8a6a1e)", color: "#241a03" },
  stats: { background: "linear-gradient(135deg,#0b3d24,#39ff9c 50%,#0b3d24)", color: "#052a16" },
  streakHot: { background: "linear-gradient(135deg,#7a1f00,#ff6200 50%,#7a1f00)", color: "#ffe6cc" },
  streakCold: { background: "linear-gradient(135deg,#0b1a3d,#3988ff 50%,#0b1a3d)", color: "#cce0ff" }
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
