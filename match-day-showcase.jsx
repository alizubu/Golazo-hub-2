import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, Trophy, Users } from "lucide-react";

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

/* ---------------------------------------------------------
   20 distinct bar "skins" — each a fully different visual
   language, sharing one data-driven layout underneath
--------------------------------------------------------- */
const themes = [
  { name: "Glass Frost", speed: 32, radius: 14,
    wrap: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(14px)" },
    chip: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" },
    team: "#EAF2FF", score: "#7CE7FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(255,255,255,0.12)", color: "#EAF2FF" }, page: "dark" },

  { name: "Neon Pitch", speed: 26, radius: 10,
    wrap: { background: "linear-gradient(180deg,#052e16,#031a0d)", border: "1px solid #1f5c33" },
    chip: { background: "rgba(0,0,0,0.25)", border: "1px solid #2f7d4d", boxShadow: "0 0 14px rgba(163,255,120,0.18)" },
    team: "#D7FFDD", score: "#A3FF78", font: "'JetBrains Mono', monospace",
    tab: { background: "#0d3b1f", color: "#A3FF78" }, page: "dark" },

  { name: "Chrome Ticker", speed: 24, radius: 6,
    wrap: { background: "linear-gradient(180deg,#e9edf1,#c3c9d1)", border: "1px solid #9aa2ad" },
    chip: { background: "linear-gradient(180deg,#ffffff,#d4d9df)", border: "1px solid #a9b0ba" },
    team: "#1b1f24", score: "#0a0c0f", font: "'Space Grotesk', sans-serif",
    tab: { background: "#1b1f24", color: "#e9edf1" }, page: "light" },

  { name: "Gold Premier", speed: 30, radius: 12,
    wrap: { background: "#0a0a0a", border: "1px solid #3a2c0f" },
    chip: { background: "#141414", border: "1px solid #6b5320" },
    team: "#F4E4B8", score: "#F5C542", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#8a6a1e,#F5C542)", color: "#141414" }, page: "dark" },

  { name: "Minimal Mono", speed: 34, radius: 0,
    wrap: { background: "#ffffff", borderTop: "2px solid #111", borderBottom: "2px solid #111" },
    chip: { background: "transparent", borderRight: "1px solid #d8d8d8" },
    team: "#111111", score: "#111111", font: "'Space Grotesk', sans-serif",
    tab: { background: "#111111", color: "#ffffff" }, page: "light" },

  { name: "Holographic Foil", speed: 22, radius: 16,
    wrap: { border: "1px solid rgba(255,255,255,0.25)" }, extraClass: "holo-bg",
    chip: { background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.3)" },
    team: "#0a0a0a", score: "#0a0a0a", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.7)", color: "#fff" }, page: "light" },

  { name: "Retro LED", speed: 20, radius: 4,
    wrap: { background: "#0a0704", border: "1px solid #2a2015" },
    chip: { background: "#120d08", border: "1px solid #3a2c17" },
    team: "#FFB000", score: "#FF7A00", font: "'JetBrains Mono', monospace",
    tab: { background: "#1a1108", color: "#FFB000" }, page: "dark", mono: true },

  { name: "Carbon Fiber", speed: 28, radius: 10,
    wrap: { backgroundColor: "#0d0d0d",
      backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)",
      border: "1px solid #d1252c33" },
    chip: { background: "rgba(209,37,44,0.08)", border: "1px solid #d1252c55" },
    team: "#f2f2f2", score: "#ff4655", font: "'Bebas Neue', sans-serif",
    tab: { background: "#d1252c", color: "#0d0d0d" }, page: "dark" },

  { name: "Stadium Lights", speed: 30, radius: 12,
    wrap: { background: "radial-gradient(120% 140% at 10% 0%, #1c2b52 0%, #060a16 60%)", border: "1px solid #26345c" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #2c3c68" },
    team: "#EAF0FF", score: "#FFE49C", font: "'Space Grotesk', sans-serif",
    tab: { background: "#EAF0FF", color: "#0b1024" }, page: "dark" },

  { name: "Paper Ticket", speed: 33, radius: 2,
    wrap: { background: "#F6F1E4", border: "1px dashed #2c2a24" },
    chip: { background: "#FBF8EE", border: "1px dashed #b8b09a" },
    team: "#2c2a24", score: "#7a1f1f", font: "'JetBrains Mono', monospace",
    tab: { background: "#2c2a24", color: "#F6F1E4" }, page: "light" },

  { name: "Cyberpunk Duotone", speed: 21, radius: 8,
    wrap: { background: "linear-gradient(90deg,#1a0022,#001f24)", border: "1px solid #ff2bd6" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #29e0ff88" },
    team: "#ff6bf0", score: "#29E0FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "#ff2bd6", color: "#160018" }, page: "dark" },

  { name: "Sunset Gradient", speed: 27, radius: 18,
    wrap: { background: "linear-gradient(90deg,#3b0a5c,#c0356b,#ff8a4c)" },
    chip: { background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.25)" },
    team: "#fff", score: "#FFE9B8", font: "'Bebas Neue', sans-serif",
    tab: { background: "rgba(0,0,0,0.35)", color: "#fff" }, page: "dark" },

  { name: "Ice Rink", speed: 31, radius: 14,
    wrap: { background: "linear-gradient(180deg,#eaf6ff,#cfeaff)", border: "1px solid #a9d6ef" },
    chip: { background: "rgba(255,255,255,0.6)", border: "1px solid #bfe1f4" },
    team: "#0c3a52", score: "#0f7ea8", font: "'Space Grotesk', sans-serif",
    tab: { background: "#0f7ea8", color: "#eaf6ff" }, page: "light" },

  { name: "Velvet VIP", speed: 29, radius: 16,
    wrap: { background: "linear-gradient(180deg,#2a0e3d,#160522)", border: "1px solid #7a4fae" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #a97cf0aa" },
    team: "#f1e6ff", score: "#F5C542", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#7a4fae,#F5C542)", color: "#160522" }, page: "dark" },

  { name: "Denim Casual", speed: 25, radius: 999,
    wrap: { background: "linear-gradient(180deg,#2c5aa0,#1c3b6b)", border: "2px dashed rgba(255,255,255,0.35)" },
    chip: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)" },
    team: "#eaf1ff", score: "#ffd166", font: "'Space Grotesk', sans-serif",
    tab: { background: "#eaf1ff", color: "#1c3b6b" }, page: "dark" },

  { name: "Solar Flare", speed: 23, radius: 12,
    wrap: { background: "radial-gradient(120% 160% at 0% 100%, #ff6a00 0%, #7a0c0c 55%, #200404 100%)" },
    chip: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,180,120,0.4)" },
    team: "#FFE9D6", score: "#FFB35C", font: "'Bebas Neue', sans-serif",
    tab: { background: "#FFB35C", color: "#200404" }, page: "dark" },

  { name: "Midnight Grid", speed: 30, radius: 10,
    wrap: { backgroundColor: "#0a0e1a",
      backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 28px)",
      border: "1px solid #1c2740" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #263354" },
    team: "#eef2ff", score: "#9db4ff", font: "'JetBrains Mono', monospace",
    tab: { background: "#9db4ff", color: "#0a0e1a" }, page: "dark" },

  { name: "Emerald Foil", speed: 22, radius: 14,
    wrap: { border: "1px solid rgba(255,255,255,0.2)" }, extraClass: "foil-bg",
    chip: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.28)" },
    team: "#f0fff6", score: "#eaffef", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(0,0,0,0.4)", color: "#f0fff6" }, page: "dark" },

  { name: "Blueprint Tech", speed: 34, radius: 2,
    wrap: { backgroundColor: "#0c2340",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px)",
      border: "1px solid #2f5488" },
    chip: { background: "rgba(255,255,255,0.05)", border: "1px solid #3f6aa8" },
    team: "#DCEBFF", score: "#8FC1FF", font: "'JetBrains Mono', monospace",
    tab: { background: "#DCEBFF", color: "#0c2340" }, page: "dark" },

  { name: "Aurora Wave", speed: 24, radius: 16,
    wrap: { border: "1px solid rgba(255,255,255,0.2)" }, extraClass: "aurora-bg",
    chip: { background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.3)" },
    team: "#fff", score: "#E8FFF6", font: "'Bebas Neue', sans-serif",
    tab: { background: "rgba(0,0,0,0.4)", color: "#fff" }, page: "dark" },
];

/* ---------------------------------------------------------
   THE ATELIER COLLECTION — 20 more, luxury-material driven:
   metal, stone, glass, ink, silk, ceramic, optics
--------------------------------------------------------- */
const atelierThemes = [
  { name: "Vantablack Onyx", speed: 36, radius: 14, glow: "rgba(255,255,255,0.08)",
    wrap: { background: "#050505", border: "1px solid rgba(255,255,255,0.08)" },
    chip: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" },
    team: "#E8E8E8", score: "#F5F5F5", font: "'Space Grotesk', sans-serif",
    tab: { background: "rgba(255,255,255,0.92)", color: "#050505" } },

  { name: "Liquid Mercury", speed: 20, radius: 12, glow: "rgba(200,200,210,0.35)",
    wrap: { border: "1px solid rgba(255,255,255,0.35)" }, extraClass: "mercury-bg",
    chip: { background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.4)" },
    team: "#141414", score: "#0a0a0a", font: "'Space Grotesk', sans-serif",
    tab: { background: "#141414", color: "#f2f2f2" } },

  { name: "Kintsugi Gold Seam", speed: 30, radius: 10, glow: "rgba(212,175,55,0.3)",
    wrap: { background: "#1b1714",
      backgroundImage: "linear-gradient(115deg, transparent 0%, transparent 40%, rgba(212,175,55,0.65) 49%, #F5E6B8 50%, rgba(212,175,55,0.65) 51%, transparent 60%, transparent 100%)",
      border: "1px solid #3a2f1f" },
    chip: { background: "rgba(0,0,0,0.3)", border: "1px solid #5c4a26" },
    team: "#EFE3C5", score: "#F5D889", font: "'Bebas Neue', sans-serif",
    tab: { background: "linear-gradient(90deg,#8a6a1e,#F5D889)", color: "#1b1714" } },

  { name: "Marble Quarry", speed: 33, radius: 8, glow: "rgba(0,0,0,0.12)",
    wrap: { backgroundColor: "#f4f3f0",
      backgroundImage: "radial-gradient(circle at 20% 30%, rgba(120,120,120,0.18) 0%, transparent 40%), radial-gradient(circle at 75% 65%, rgba(90,90,90,0.14) 0%, transparent 38%), linear-gradient(120deg, transparent 44%, rgba(150,150,150,0.3) 46%, transparent 49%)",
      border: "1px solid #d8d5cc" },
    chip: { background: "rgba(255,255,255,0.55)", border: "1px solid #cfcabf" },
    team: "#2b2b2b", score: "#8a6a1e", font: "'Space Grotesk', sans-serif",
    tab: { background: "#2b2b2b", color: "#f4f3f0" } },

  { name: "Art Deco Gatsby", speed: 27, radius: 4, glow: "rgba(212,175,55,0.35)",
    wrap: { background: "#0b3d2e", border: "2px solid #D4AF37", boxShadow: "inset 0 0 0 4px rgba(212,175,55,0.15)" },
    chip: { background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.5)" },
    team: "#EFE3C5", score: "#D4AF37", font: "'Bebas Neue', sans-serif",
    tab: { background: "#D4AF37", color: "#0b3d2e" } },

  { name: "Brutalist Concrete", speed: 26, radius: 0, glow: "rgba(0,0,0,0.25)", mono: true,
    wrap: { backgroundColor: "#8f8f8a",
      backgroundImage: "repeating-radial-gradient(circle at 3px 3px, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 7px)",
      border: "3px solid #141414" },
    chip: { background: "rgba(0,0,0,0.08)", border: "2px solid #141414" },
    team: "#141414", score: "#141414", font: "'JetBrains Mono', monospace",
    tab: { background: "#141414", color: "#f2f2ee" } },

  { name: "Silk Ribbon", speed: 24, radius: 16, glow: "rgba(122,16,48,0.35)",
    wrap: { border: "1px solid rgba(255,220,180,0.25)" }, extraClass: "silk-bg",
    chip: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,220,180,0.3)" },
    team: "#F3E3C3", score: "#FFD9A0", font: "'Bebas Neue', sans-serif",
    tab: { background: "#F3E3C3", color: "#3b0a1a" } },

  { name: "Obsidian Glass", speed: 31, radius: 14, glow: "rgba(79,209,255,0.25)",
    wrap: { background: "#07080a", border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -30px 50px rgba(30,110,180,0.12)" },
    chip: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(120,180,255,0.2)" },
    team: "#DBE7FF", score: "#4FD1FF", font: "'Space Grotesk', sans-serif",
    tab: { background: "#4FD1FF", color: "#07080a" } },

  { name: "Perfume Editorial", speed: 35, radius: 999, glow: "rgba(176,141,87,0.25)",
    wrap: { background: "#F3E7E4", border: "1px solid #D9BFA8" },
    chip: { background: "rgba(255,255,255,0.5)", border: "1px solid #E3CDB8" },
    team: "#5C4632", score: "#B08D57", font: "'Space Grotesk', sans-serif",
    tab: { background: "#5C4632", color: "#F3E7E4" } },

  { name: "Vinyl Record Sleeve", speed: 22, radius: 999, glow: "rgba(255,122,26,0.3)",
    wrap: { backgroundColor: "#0c0c0c",
      backgroundImage: "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, transparent 2px, transparent 6px)",
      border: "1px solid #2a2a2a" },
    chip: { background: "rgba(255,122,26,0.08)", border: "1px solid rgba(255,122,26,0.35)" },
    team: "#f2f2f2", score: "#FF7A1A", font: "'Bebas Neue', sans-serif",
    tab: { background: "#FF7A1A", color: "#0c0c0c" } },

  { name: "Circuit PCB", speed: 29, radius: 6, glow: "rgba(232,196,104,0.25)", mono: true,
    wrap: { backgroundColor: "#08210f",
      backgroundImage: "repeating-linear-gradient(90deg, rgba(232,196,104,0.1) 0 2px, transparent 2px 26px), repeating-linear-gradient(0deg, rgba(232,196,104,0.06) 0 1px, transparent 1px 26px)",
      border: "1px solid #1e4a2c" },
    chip: { background: "rgba(0,0,0,0.3)", border: "1px solid #3a6b46" },
    team: "#BFFFD1", score: "#E8C468", font: "'JetBrains Mono', monospace",
    tab: { background: "#E8C468", color: "#08210f" } },

  { name: "Watch Chronograph", speed: 28, radius: 999, glow: "rgba(230,57,70,0.25)",
    wrap: { backgroundColor: "#0d1b2a",
      backgroundImage: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.07) 0deg 1deg, transparent 1deg 6deg)",
      border: "1px solid #223447" },
    chip: { background: "rgba(255,255,255,0.04)", border: "1px solid #33506b" },
    team: "#C9D6E3", score: "#E63946", font: "'Space Grotesk', sans-serif",
    tab: { background: "#C9D6E3", color: "#0d1b2a" } },

  { name: "Stained Glass Cathedral", speed: 25, radius: 2, glow: "rgba(120,60,180,0.3)",
    wrap: { background: "linear-gradient(100deg,#1b1030 0%,#3a1c5e 16%,#0f3d5c 32%,#0a5c4a 48%,#5c3d0a 64%,#5c0f24 80%,#1b1030 100%)",
      border: "2px solid #0a0a0a" },
    chip: { background: "rgba(0,0,0,0.3)", border: "2px solid rgba(0,0,0,0.5)" },
    team: "#F5EFE0", score: "#FFD9A0", font: "'Bebas Neue', sans-serif",
    tab: { background: "#0a0a0a", color: "#F5EFE0" } },

  { name: "Cathode CRT", speed: 21, radius: 2, glow: "rgba(57,255,106,0.3)", mono: true,
    wrap: { backgroundColor: "#020402",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(0,255,140,0.07) 0 1px, transparent 1px 3px)",
      border: "1px solid #0a3d1f" },
    chip: { background: "rgba(0,255,140,0.05)", border: "1px solid rgba(0,255,140,0.25)" },
    team: "#39FF6A", score: "#B6FFCB", font: "'JetBrains Mono', monospace",
    tab: { background: "#39FF6A", color: "#020402" } },

  { name: "Origami Paper Fold", speed: 32, radius: 6, glow: "rgba(0,0,0,0.1)",
    wrap: { background: "linear-gradient(135deg,#f2ede2,#e4dcc8)",
      backgroundImage: "linear-gradient(60deg, transparent 40%, rgba(0,0,0,0.05) 41%, transparent 42%)",
      border: "1px solid #d6cdb4" },
    chip: { background: "rgba(255,255,255,0.5)", border: "1px solid #ddd3ba" },
    team: "#4a3f2c", score: "#8a6a1e", font: "'Space Grotesk', sans-serif",
    tab: { background: "#4a3f2c", color: "#f2ede2" } },

  { name: "Satellite HUD", speed: 23, radius: 2, glow: "rgba(127,232,255,0.3)", mono: true,
    wrap: { backgroundColor: "#050b12",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(127,232,255,0.07) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(127,232,255,0.07) 0 1px, transparent 1px 24px)",
      border: "1px solid #123044" },
    chip: { background: "rgba(127,232,255,0.05)", border: "1px solid rgba(127,232,255,0.3)" },
    team: "#CFEFFF", score: "#7FE8FF", font: "'JetBrains Mono', monospace",
    tab: { background: "#7FE8FF", color: "#050b12" } },

  { name: "Champagne Editorial", speed: 34, radius: 2, glow: "rgba(0,0,0,0.1)",
    wrap: { background: "linear-gradient(180deg,#FBF6EC,#F1E4C8)", borderBottom: "2px solid #111" },
    chip: { background: "rgba(255,255,255,0.6)", border: "1px solid #e6d8b0" },
    team: "#2b2410", score: "#8a6a1e", font: "'Space Grotesk', sans-serif",
    tab: { background: "#111", color: "#FBF6EC" } },

  { name: "Bioluminescence", speed: 30, radius: 16, glow: "rgba(53,232,208,0.3)",
    wrap: { background: "radial-gradient(120% 140% at 80% 100%, #0a3d4a 0%, #021018 60%)",
      backgroundImage: "radial-gradient(4px 4px at 15% 40%, rgba(53,232,208,0.5), transparent), radial-gradient(3px 3px at 60% 25%, rgba(53,232,208,0.4), transparent), radial-gradient(3px 3px at 85% 70%, rgba(53,232,208,0.4), transparent)",
      border: "1px solid #0e4a56" },
    chip: { background: "rgba(53,232,208,0.06)", border: "1px solid rgba(53,232,208,0.3)" },
    team: "#BFFFF6", score: "#35E8D0", font: "'Space Grotesk', sans-serif",
    tab: { background: "#35E8D0", color: "#021018" } },

  { name: "Terrazzo Stone", speed: 33, radius: 18, glow: "rgba(0,0,0,0.08)",
    wrap: { backgroundColor: "#F5EDE4",
      backgroundImage: "radial-gradient(6px 6px at 10% 30%, #F2A6A6 0, transparent 60%), radial-gradient(5px 5px at 25% 70%, #9BD8C2 0, transparent 60%), radial-gradient(4px 4px at 45% 20%, #2C3E66 0, transparent 60%), radial-gradient(6px 6px at 60% 60%, #E8C468 0, transparent 60%), radial-gradient(5px 5px at 80% 35%, #F2A6A6 0, transparent 60%), radial-gradient(4px 4px at 92% 75%, #9BD8C2 0, transparent 60%)",
      border: "1px solid #e0d5c4" },
    chip: { background: "rgba(255,255,255,0.55)", border: "1px solid #e6dbc9" },
    team: "#2C3E66", score: "#C4272E", font: "'Space Grotesk', sans-serif",
    tab: { background: "#2C3E66", color: "#F5EDE4" } },

  { name: "Aurora Silk", speed: 26, radius: 20, glow: "rgba(180,150,220,0.35)",
    wrap: { border: "1px solid rgba(255,255,255,0.3)" }, extraClass: "auroraSilk-bg",
    chip: { background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" },
    team: "#3b1f4d", score: "#5b2a86", font: "'Bebas Neue', sans-serif",
    tab: { background: "#3b1f4d", color: "#f5eefc" } },
];

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
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.04 }}
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
   Shiny badges
--------------------------------------------------------- */
const badgeVariants = [
  { key: "gold",   label: "GOAL! 2–1", style: { background: "linear-gradient(135deg,#8a6a1e,#F5C542 50%,#8a6a1e)", color: "#241a03" } },
  { key: "chrome", label: "FT · 3–2",  style: { background: "linear-gradient(135deg,#7d8894,#ffffff 45%,#7d8894)", color: "#1a1e24" } },
  { key: "neon",   label: "LIVE 67'",  style: { background: "linear-gradient(135deg,#0b3d24,#39ff9c 50%,#0b3d24)", color: "#052a16" } },
  { key: "holo",   label: "HT",        style: { background: "linear-gradient(135deg,#ff9be0,#9bd9ff 35%,#c9ff9b 65%,#ff9be0)", color: "#1a0022" } },
  { key: "glass",  label: "PEN 4–3",   style: { background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(8px)" } },
];

function ShinyBadge({ label, style }) {
  return (
    <span
      className="shiny relative inline-flex items-center overflow-hidden rounded-full px-4 py-2 text-sm font-extrabold tracking-wide shadow-lg"
      style={style}
    >
      {label}
    </span>
  );
}

/* ---------------------------------------------------------
   Avatar clusters — "who's watching" (2–4 people)
--------------------------------------------------------- */
const people = [
  { initials: "AK", name: "Ana Kova",     c1: "#FF7A45", c2: "#B3261E" },
  { initials: "MR", name: "Milo Reyes",   c1: "#4C86D6", c2: "#16294D" },
  { initials: "JT", name: "Jules Tan",    c1: "#1FC2C2", c2: "#0B5C5C" },
  { initials: "PS", name: "Priya Shah",   c1: "#F14FC4", c2: "#5B2A86" },
];

function AvatarCluster({ group, extraCount = 0, size = 34 }) {
  const names = group.map((p) => p.name.split(" ")[0]);
  const label =
    names.length <= 2
      ? names.join(" & ")
      : `${names.slice(0, 2).join(", ")} +${names.length - 2 + extraCount} more`;
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {group.map((p, i) => (
          <div
            key={i}
            className="rounded-full flex items-center justify-center font-bold ring-2"
            style={{
              width: size, height: size, fontSize: size * 0.36, color: "#fff",
              background: `linear-gradient(135deg, ${p.c1}, ${p.c2})`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
              zIndex: group.length - i,
              borderColor: "#0c1220",
            }}
          >
            {p.initials}
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className="rounded-full flex items-center justify-center font-bold ring-2 bg-white/10 text-white/80"
            style={{ width: size, height: size, fontSize: size * 0.32, borderColor: "#0c1220" }}
          >
            +{extraCount}
          </div>
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="text-xs text-white/50">watching this match</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */
export default function MatchDayShowcase() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-[#070a12] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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

        .floodlight::before {
          content: ''; position: absolute; inset: -20% -20%;
          background: conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.06) 8deg, transparent 16deg);
          animation: sweep 6s linear infinite;
        }
        @keyframes sweep { to { transform: rotate(360deg); } }
      `}</style>

      {/* HERO */}
      <header className="relative overflow-hidden border-b border-white/10 floodlight">
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-semibold tracking-widest text-white/70 mb-6">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> APEX LEAGUE · MATCH DAY
            </div>
            <h1 className="text-5xl sm:text-7xl font-black leading-[0.95] tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              20 WAYS TO<br /><span className="text-emerald-400">SHOW A SCORE</span>
            </h1>
            <p className="mt-5 max-w-xl text-white/60 text-base sm:text-lg">
              One live-score data feed, twenty completely different ticker treatments — from frosted glass
              to carbon fibre to gold foil. Hover any row to pause the scroll.
            </p>
          </motion.div>
        </div>
      </header>

      {/* MARQUEE GALLERY */}
      <section className="max-w-6xl mx-auto px-6 py-14 space-y-4">
        {themes.map((theme, i) => (
          <MarqueeBar key={theme.name} theme={theme} index={i} />
        ))}
      </section>

      {/* SHINY BADGES */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-white/10">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">SHINY SCORE BADGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Five finishes, one light sweep
          </h2>
          <div className="flex flex-wrap gap-4">
            {badgeVariants.map((b) => (
              <ShinyBadge key={b.key} label={b.label} style={b.style} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* AVATAR CLUSTERS */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-white/10 pb-24">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">WHO'S WATCHING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Avatar + name, 2 to 4 people
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <p className="text-xs text-white/40 mb-4 font-semibold tracking-wide">2 PEOPLE</p>
              <AvatarCluster group={people.slice(0, 2)} />
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <p className="text-xs text-white/40 mb-4 font-semibold tracking-wide">3 PEOPLE</p>
              <AvatarCluster group={people.slice(0, 3)} />
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <p className="text-xs text-white/40 mb-4 font-semibold tracking-wide">4 PEOPLE (+ OVERFLOW)</p>
              <AvatarCluster group={people.slice(0, 3)} extraCount={1} />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
