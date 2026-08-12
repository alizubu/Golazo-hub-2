'use client';

import React, { useMemo } from 'react';
import {
  Trophy, Target, Shield, Flame, Swords, TrendingUp,
  Crown, Medal, Star, Zap, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '@/app/components/shared/UI';

// ─── Utility: compute all season summary stats from raw match data ──────────
function computeSeasonSummary(matches, players, seasonId) {
  const completed = matches
    .filter(m => m.seasonId === seasonId && m.status === 'completed' && m.round === 'league')
    .sort((a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0));

  if (completed.length === 0) return null;

  const playerMap = new Map(players.map(p => [p.id, p]));

  // Accumulators
  const acc = {};
  players.forEach(p => {
    acc[p.id] = {
      id: p.id,
      name: p.name,
      goals: 0,
      conceded: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      played: 0,
      cleanSheets: 0,
      bigWins: 0, // won by 3+
      currentStreak: 0,
      bestStreak: 0,
      form: [], // 'W' | 'L' | 'D'
    };
  });

  let totalGoals = 0;

  completed.forEach(m => {
    const hs = Number(m.homeScore) || 0;
    const as = Number(m.awayScore) || 0;
    totalGoals += hs + as;

    const h = acc[m.homeId];
    const a = acc[m.awayId];
    if (!h || !a) return;

    h.played++; a.played++;
    h.goals += hs; a.goals += as;
    h.conceded += as; a.conceded += hs;

    if (as === 0) h.cleanSheets++;
    if (hs === 0) a.cleanSheets++;

    if (hs > as) {
      h.wins++; a.losses++;
      h.form.push('W'); a.form.push('L');
      if (hs - as >= 3) h.bigWins++;
      // Streak
      h.currentStreak = h.currentStreak > 0 ? h.currentStreak + 1 : 1;
      a.currentStreak = a.currentStreak < 0 ? a.currentStreak - 1 : -1;
    } else if (as > hs) {
      a.wins++; h.losses++;
      a.form.push('W'); h.form.push('L');
      if (as - hs >= 3) a.bigWins++;
      a.currentStreak = a.currentStreak > 0 ? a.currentStreak + 1 : 1;
      h.currentStreak = h.currentStreak < 0 ? h.currentStreak - 1 : -1;
    } else {
      h.draws++; a.draws++;
      h.form.push('D'); a.form.push('D');
      h.currentStreak = 0; a.currentStreak = 0;
    }

    h.bestStreak = Math.max(h.bestStreak, h.currentStreak);
    a.bestStreak = Math.max(a.bestStreak, a.currentStreak);
  });

  const entries = Object.values(acc).filter(e => e.played > 0);
  if (entries.length === 0) return null;

  // Derived stats
  const topScorer = [...entries].sort((a, b) => b.goals - a.goals)[0];
  const mostWins = [...entries].sort((a, b) => b.wins - a.wins)[0];
  const longestStreak = [...entries].sort((a, b) => b.bestStreak - a.bestStreak)[0];
  const bestDefense = [...entries].filter(e => e.played >= 3).sort((a, b) => (a.conceded / a.played) - (b.conceded / b.played))[0] || entries[0];
  const mostCleanSheets = [...entries].sort((a, b) => b.cleanSheets - a.cleanSheets)[0];
  const mostDecisive = [...entries].sort((a, b) => b.bigWins - a.bigWins)[0];

  return {
    totalMatches: completed.length,
    totalGoals,
    avgGoals: (totalGoals / completed.length).toFixed(1),
    topScorer: { ...topScorer, player: playerMap.get(topScorer.id) },
    mostWins: { ...mostWins, player: playerMap.get(mostWins.id) },
    longestStreak: { ...longestStreak, player: playerMap.get(longestStreak.id) },
    bestDefense: { ...bestDefense, player: playerMap.get(bestDefense.id), avgConceded: (bestDefense.conceded / bestDefense.played).toFixed(1) },
    mostCleanSheets: { ...mostCleanSheets, player: playerMap.get(mostCleanSheets.id) },
    mostDecisive: { ...mostDecisive, player: playerMap.get(mostDecisive.id) },
  };
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function Podium({ champion, runnerUp, thirdPlace }) {
  if (!champion && !runnerUp && !thirdPlace) return null;

  return (
    <div className="relative pt-16 pb-4 flex items-end justify-center gap-1 sm:gap-4 w-full max-w-4xl mx-auto min-h-[250px] sm:min-h-[300px] mb-8">
      {/* Third Place (Right) */}
      {thirdPlace && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
          className="flex flex-col items-center justify-end w-[30%] sm:w-36 order-3 z-10"
        >
          <div className="relative mb-3">
            <Avatar p={thirdPlace} size={56} className="ring-4 ring-[#CD7F32]/40 relative z-10 shadow-lg shadow-[#CD7F32]/20 sm:w-[64px] sm:h-[64px]" />
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#CD7F32] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-md z-20 whitespace-nowrap">
              3RD PLACE
            </div>
          </div>
          <div className="text-center w-full px-1">
            <div className="text-xs sm:text-sm font-black truncate">{thirdPlace.name}</div>
          </div>
          <div className="w-full h-16 sm:h-24 bg-gradient-to-t from-[#CD7F32]/20 to-[#CD7F32]/5 mt-3 sm:mt-4 rounded-t-lg border-t-2 border-x border-[#CD7F32]/30 flex items-start justify-center pt-2 backdrop-blur-sm">
            <span className="text-[#CD7F32] font-black text-xl sm:text-2xl opacity-50">3</span>
          </div>
        </motion.div>
      )}

      {/* Champion (Center) */}
      {champion && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
          className="flex flex-col items-center justify-end w-[40%] sm:w-48 order-2 z-30"
        >
          <div className="relative mb-4">
            <div className="absolute -inset-6 bg-yellow-500/20 blur-xl rounded-full animate-pulse z-0" />
            <Avatar p={champion} size={72} className="ring-4 ring-yellow-400 relative z-10 shadow-[0_0_30px_rgba(250,204,21,0.4)] sm:w-[88px] sm:h-[88px]" />
            <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-20 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
              <Crown size={28} className="sm:w-[32px] sm:h-[32px]" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-yellow-950 text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full shadow-lg z-20 whitespace-nowrap tracking-wider">
              CHAMPION
            </div>
          </div>
          <div className="text-center w-full px-1">
            <div className="text-sm sm:text-lg font-black truncate text-foreground">{champion.name}</div>
          </div>
          <div className="w-full h-24 sm:h-36 bg-gradient-to-t from-yellow-500/30 to-yellow-500/10 mt-3 sm:mt-4 rounded-t-xl border-t-2 border-x border-yellow-500/50 flex items-start justify-center pt-2 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10 mix-blend-overlay" />
            <span className="text-yellow-500 font-black text-3xl sm:text-4xl opacity-50 relative z-10 drop-shadow-lg">1</span>
          </div>
        </motion.div>
      )}

      {/* Runner Up (Left) */}
      {runnerUp && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
          className="flex flex-col items-center justify-end w-[30%] sm:w-36 order-1 z-20"
        >
          <div className="relative mb-3">
            <Avatar p={runnerUp} size={64} className="ring-4 ring-slate-300/60 relative z-10 shadow-lg shadow-slate-300/20 sm:w-[72px] sm:h-[72px]" />
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-md z-20 whitespace-nowrap">
              RUNNER-UP
            </div>
          </div>
          <div className="text-center w-full px-1">
            <div className="text-xs sm:text-sm font-black truncate">{runnerUp.name}</div>
          </div>
          <div className="w-full h-20 sm:h-28 bg-gradient-to-t from-slate-400/20 to-slate-400/5 mt-3 sm:mt-4 rounded-t-lg border-t-2 border-x border-slate-400/30 flex items-start justify-center pt-2 backdrop-blur-sm">
            <span className="text-slate-400 font-black text-2xl sm:text-3xl opacity-50">2</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function BentoStatCard({ icon: Icon, label, playerName, value, accentFrom, className = "" }) {
  return (
    <motion.div variants={cardVariants} className={`relative group ${className}`}>
      <div className="relative overflow-hidden rounded-3xl border border-border/50 dark:border-white/[0.06] bg-card/60 backdrop-blur-md p-5 sm:p-6 transition-all duration-500 hover:border-border/80 dark:hover:border-white/[0.15] hover:shadow-xl hover:-translate-y-1 h-full flex flex-col justify-between">
        {/* Hover Glow */}
        <div
          className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl z-0"
          style={{
            background: `radial-gradient(circle at top right, ${accentFrom}15, transparent 60%)`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted-foreground">{label}</span>
            <div className="p-2 sm:p-2.5 rounded-xl bg-background/50 shadow-inner">
              <Icon size={20} className="sm:w-[24px] sm:h-[24px]" style={{ color: accentFrom }} />
            </div>
          </div>
          
          <div className="mt-auto pt-2">
            {playerName && (
              <div className="text-xs sm:text-sm font-black text-foreground dark:text-zinc-100 truncate mb-1">{playerName}</div>
            )}
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-score tracking-tight" style={{ color: accentFrom }}>
              {value}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SeasonSummaryDashboard({ season, matches, players, compact = false }) {
  const summary = useMemo(
    () => computeSeasonSummary(matches, players, season.id),
    [matches, players, season.id]
  );

  if (!summary) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm font-medium">
        No completed matches yet for this season.
      </div>
    );
  }

  const champion = season.championId ? players.find(p => p.id === season.championId) : null;
  const runnerUp = season.runnerUpId ? players.find(p => p.id === season.runnerUpId) : null;
  const thirdPlace = season.thirdId ? players.find(p => p.id === season.thirdId) : null;

  return (
    <div className="w-full">
      {/* The Podium */}
      <Podium champion={champion} runnerUp={runnerUp} thirdPlace={thirdPlace} />

      {/* The Bento Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative z-10"
      >
        {/* Global Match Stats */}
        <BentoStatCard
          icon={Swords} label="Matches Played" value={summary.totalMatches} accentFrom="#8b5cf6"
          className="col-span-2 md:col-span-1"
        />
        <BentoStatCard
          icon={Target} label="Total Goals" value={summary.totalGoals} accentFrom="#f59e0b"
          className="col-span-1 md:col-span-2"
        />
        <BentoStatCard
          icon={BarChart3} label="Avg Goals" value={summary.avgGoals} accentFrom="#22c55e"
          className="col-span-1 md:col-span-1"
        />

        {/* Major Awards */}
        <BentoStatCard
          icon={Target} label="Top Scorer" playerName={summary.topScorer.player?.name} value={`${summary.topScorer.goals} Gls`} accentFrom="#f59e0b"
          className="col-span-2 md:col-span-2"
        />
        <BentoStatCard
          icon={Shield} label="Best Defense" playerName={summary.bestDefense.player?.name} value={`${summary.bestDefense.avgConceded} GA`} accentFrom="#3b82f6"
          className="col-span-2 md:col-span-2"
        />
        
        {/* Minor Awards */}
        <BentoStatCard
          icon={Trophy} label="Most Wins" playerName={summary.mostWins.player?.name} value={`${summary.mostWins.wins} Wins`} accentFrom="#22c55e"
          className="col-span-1 md:col-span-2"
        />
        <BentoStatCard
          icon={Flame} label="Win Streak" playerName={summary.longestStreak.player?.name} value={`${summary.longestStreak.bestStreak} Streak`} accentFrom="#ef4444"
          className="col-span-1 md:col-span-1"
        />
        <BentoStatCard
          icon={Star} label="Clean Sheets" playerName={summary.mostCleanSheets.player?.name} value={`${summary.mostCleanSheets.cleanSheets} CS`} accentFrom="#8b5cf6"
          className="col-span-1 md:col-span-1"
        />
        <BentoStatCard
          icon={Zap} label="Most Decisive" playerName={summary.mostDecisive.player?.name} value={`${summary.mostDecisive.bigWins} Big Wins`} accentFrom="#ec4899"
          className="col-span-1 md:col-span-4" // spans full width on bottom to anchor
        />
      </motion.div>
    </div>
  );
}
