'use client';

import React, { useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Target, Star, Shield, Trophy, Zap, Flame } from 'lucide-react';
import { Avatar, formatName, computeStandings } from '@/app/components/shared/UI';

// --- Compute Combined Stats ---
function computeHighlightStats(matches, players, activeSeasonId) {
  const standings = computeStandings(matches, players, activeSeasonId);
  const completed = matches.filter(m => m.seasonId === activeSeasonId && m.status === 'completed');

  if (standings.length === 0 || completed.length === 0) return [];

  const playerMap = new Map(players.map(p => [p.id, p]));

  // Golden Boot
  const topScorer = [...standings].sort((a, b) => b.gf - a.gf)[0];
  
  // Most Wins
  const mostWins = [...standings].sort((a, b) => b.won - a.won)[0];
  
  // Best Defense (Fewest Goals Conceded per Game)
  const bestDefense = [...standings].filter(s => s.played >= 3).sort((a, b) => (a.ga / a.played) - (b.ga / b.played))[0] || standings[0];

  // Ratings calculation
  const ratingsMap = {};
  const countMap = {};
  
  // Advanced stats
  const acc = {};
  players.forEach(p => {
    acc[p.id] = { id: p.id, cleanSheets: 0, bigWins: 0, bestStreak: 0, currentStreak: 0 };
  });

  completed.forEach(m => {
    const hs = Number(m.homeScore) || 0;
    const as = Number(m.awayScore) || 0;
    const h = acc[m.homeId];
    const a = acc[m.awayId];

    // Ratings
    if (m.stats?.ratings?.a) {
      ratingsMap[m.homeId] = (ratingsMap[m.homeId] || 0) + parseFloat(m.stats.ratings.a);
      countMap[m.homeId] = (countMap[m.homeId] || 0) + 1;
    }
    if (m.stats?.ratings?.b) {
      ratingsMap[m.awayId] = (ratingsMap[m.awayId] || 0) + parseFloat(m.stats.ratings.b);
      countMap[m.awayId] = (countMap[m.awayId] || 0) + 1;
    }

    if (!h || !a) return;

    // Clean Sheets
    if (as === 0) h.cleanSheets++;
    if (hs === 0) a.cleanSheets++;

    // Big Wins & Streaks
    if (hs > as) {
      if (hs - as >= 3) h.bigWins++;
      h.currentStreak = h.currentStreak > 0 ? h.currentStreak + 1 : 1;
      a.currentStreak = a.currentStreak < 0 ? a.currentStreak - 1 : -1;
    } else if (as > hs) {
      if (as - hs >= 3) a.bigWins++;
      a.currentStreak = a.currentStreak > 0 ? a.currentStreak + 1 : 1;
      h.currentStreak = h.currentStreak < 0 ? h.currentStreak - 1 : -1;
    } else {
      h.currentStreak = 0; a.currentStreak = 0;
    }
    h.bestStreak = Math.max(h.bestStreak, h.currentStreak);
    a.bestStreak = Math.max(a.bestStreak, a.currentStreak);
  });

  // Highest Rated
  let highestRatedPlayer = null;
  let highestRatingVal = 0;
  standings.forEach(s => {
    if (countMap[s.id] > 0) {
      const avg = (ratingsMap[s.id] / countMap[s.id]);
      if (avg > highestRatingVal) {
        highestRatingVal = avg;
        highestRatedPlayer = s;
      }
    }
  });
  if (!highestRatedPlayer && standings.length > 0) {
    highestRatedPlayer = [...standings].sort((a, b) => ((b.pts * 2 + b.gd) - (a.pts * 2 + a.gd)))[0];
    highestRatingVal = 7.5;
  }

  // Derived advanced
  const entries = Object.values(acc);
  const longestStreak = [...entries].sort((a, b) => b.bestStreak - a.bestStreak)[0];
  const mostCleanSheets = [...entries].sort((a, b) => b.cleanSheets - a.cleanSheets)[0];
  const mostDecisive = [...entries].sort((a, b) => b.bigWins - a.bigWins)[0];

  return [
    { label: "Golden Boot", player: playerMap.get(topScorer?.id), stat: `${topScorer?.gf || 0} Goals`, icon: Target, color: "#FBBF24" }, // amber-400
    { label: "Highest Rating", player: playerMap.get(highestRatedPlayer?.id), stat: `⭐ ${highestRatingVal.toFixed(1)}`, icon: Star, color: "#60A5FA" }, // blue-400
    { label: "Most Wins", player: playerMap.get(mostWins?.id), stat: `${mostWins?.won || 0} Wins`, icon: Trophy, color: "#34D399" }, // emerald-400
    { label: "Best Defense", player: playerMap.get(bestDefense?.id), stat: `${bestDefense?.ga || 0} GA`, icon: Shield, color: "#A78BFA" }, // violet-400
    { label: "Win Streak", player: playerMap.get(longestStreak?.id), stat: `${longestStreak?.bestStreak || 0} Streak`, icon: Flame, color: "#F87171" }, // red-400
    { label: "Clean Sheets", player: playerMap.get(mostCleanSheets?.id), stat: `${mostCleanSheets?.cleanSheets || 0} CS`, icon: Shield, color: "#38BDF8" }, // sky-400
    { label: "Most Decisive", player: playerMap.get(mostDecisive?.id), stat: `${mostDecisive?.bigWins || 0} Big Wins`, icon: Zap, color: "#F472B6" }, // pink-400
  ].filter(item => item.player && (parseInt(item.stat) > 0 || item.label === "Highest Rating" || item.label === "Best Defense"));
}

// --- Holographic Trading Card Component ---
function HolographicCard({ data, index }) {
  const ref = useRef(null);
  
  // Mouse position values for the tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the mouse values
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse positions to rotation degrees (range -15 to 15)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  // Calculate glare position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the card (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Icon = data.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative shrink-0 w-44 sm:w-52 h-60 sm:h-72 rounded-2xl cursor-pointer snap-center sm:snap-start select-none touch-pan-y group"
    >
      {/* Background with Glassmorphism */}
      <div className="absolute inset-0 rounded-2xl bg-secondary/40 backdrop-blur-md border border-border/50 overflow-hidden shadow-xl flex flex-col items-center justify-center p-4">
        
        {/* Holographic Glare Overlay */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-60 transition-opacity duration-300"
          style={{
            background: useTransform(
              () => `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.8) 0%, transparent 60%)`
            ),
          }}
        />

        {/* Ambient colored glow behind avatar */}
        <div 
          className="absolute inset-0 opacity-10 sm:opacity-20 blur-2xl z-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-40" 
          style={{ background: `radial-gradient(circle at center, ${data.color}, transparent 70%)` }}
        />

        <div className="relative z-10 flex flex-col items-center gap-4 transform-gpu" style={{ transform: "translateZ(30px)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: data.color }}>
            <Icon size={12} /> {data.label}
          </div>
          
          <Avatar p={data.player} size={72} className="ring-2 shadow-2xl relative z-10 mx-auto" style={{ '--tw-ring-color': data.color }} />
          
          <div className="text-center w-full mt-2">
            <div className="font-bold text-sm truncate max-w-[140px] mx-auto text-foreground drop-shadow-md">{formatName(data.player.name)}</div>
            <div className="text-xl font-score font-black mt-1 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" style={{ color: data.color }}>
              {data.stat}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Container ---
export default function LeagueHighlightsCarousel({ matches, players, activeSeason }) {
  const highlights = useMemo(() => {
    if (!activeSeason) return [];
    return computeHighlightStats(matches, players, activeSeason.id);
  }, [matches, players, activeSeason]);

  if (!activeSeason || highlights.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2 px-1">
        <Flame size={18} className="text-orange-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Season Highlights</h3>
      </div>
      
      {/* Scrollable Container */}
      <div 
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 px-1 snap-x snap-mandatory hide-scrollbar relative z-10"
        style={{ perspective: "1000px" }}
      >
        {highlights.map((item, index) => (
          <HolographicCard key={item.label} data={item} index={index} />
        ))}
      </div>
    </div>
  );
}
