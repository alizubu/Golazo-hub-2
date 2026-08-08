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
    transition: { staggerChildren: 0.07 }
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function AwardCard({ icon: Icon, label, playerName, value, player, accentFrom, accentTo, delay = 0 }) {
  return (
    <motion.div variants={cardVariants} className="relative group">
      <div className={`relative overflow-hidden rounded-2xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-[#0d1017] p-4 sm:p-5 transition-all duration-300 hover:border-border/50 dark:border-white/[0.12] hover:shadow-lg`}>
        {/* Gradient glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${accentFrom}15, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex items-start gap-3">
          {/* Player Avatar */}
          {player && (
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-full opacity-40 blur-md"
                style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
              />
              <Avatar p={player} size={40} className="relative z-10 ring-2 ring-white/10" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={14} style={{ color: accentFrom }} className="shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            {playerName && (
              <div className="text-sm font-bold text-foreground dark:text-zinc-100 truncate">{playerName}</div>
            )}
            <div className="text-lg sm:text-xl font-black mt-0.5" style={{ color: accentFrom }}>
              {value}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GlobalStatPill({ icon: Icon, label, value, color }) {
  return (
    <motion.div variants={cardVariants} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card dark:bg-[#0d1017] border border-border/50 dark:border-white/[0.06]">
      <Icon size={16} style={{ color }} className="shrink-0" />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-base font-black text-foreground dark:text-zinc-100">{value}</span>
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Season Header with Champion */}
      {(champion || runnerUp) && (
        <motion.div variants={cardVariants} className="mb-5">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-[#0d1017] p-5 sm:p-6">
            {/* Gold shimmer bg for champion */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 30% 0%, rgba(232,179,76,0.08), transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(192,192,192,0.04), transparent 60%)'
            }} />

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {/* Champion */}
              {champion && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-600/20 blur-lg" />
                    <Avatar p={champion} size={56} className="relative z-10 ring-2 ring-yellow-500/40" />
                    <div className="absolute -top-2 -right-2 z-20 bg-yellow-500 text-yellow-950 rounded-full p-1 shadow-lg shadow-yellow-500/30">
                      <Crown size={12} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-yellow-500/80">Champion</div>
                    <div className="text-sm font-bold text-foreground dark:text-zinc-100">{champion.name}</div>
                  </div>
                </div>
              )}

              {/* Runner-up */}
              {runnerUp && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-slate-300/20 to-slate-500/10 blur-md" />
                    <Avatar p={runnerUp} size={48} className="relative z-10 ring-2 ring-slate-400/30" />
                    <div className="absolute -top-1.5 -right-1.5 z-20 bg-slate-400 text-slate-900 rounded-full p-0.5 shadow-lg">
                      <Medal size={10} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400/80">Runner-Up</div>
                    <div className="text-sm font-bold text-muted-foreground">{runnerUp.name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Global Stats Row */}
      <motion.div variants={cardVariants} className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <GlobalStatPill icon={Swords} label="Matches" value={summary.totalMatches} color="#8b5cf6" />
        <GlobalStatPill icon={Target} label="Total Goals" value={summary.totalGoals} color="#f59e0b" />
        <GlobalStatPill icon={BarChart3} label="Avg/Match" value={summary.avgGoals} color="#22c55e" />
      </motion.div>

      {/* Award Cards Grid */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'} gap-2 sm:gap-3`}>
        <AwardCard
          icon={Target}
          label="Top Scorer"
          playerName={summary.topScorer.player?.name}
          value={`${summary.topScorer.goals} Goals`}
          player={summary.topScorer.player}
          accentFrom="#f59e0b"
          accentTo="#eab308"
        />
        <AwardCard
          icon={Trophy}
          label="Most Wins"
          playerName={summary.mostWins.player?.name}
          value={`${summary.mostWins.wins} Wins`}
          player={summary.mostWins.player}
          accentFrom="#22c55e"
          accentTo="#16a34a"
        />
        <AwardCard
          icon={Flame}
          label="Win Streak"
          playerName={summary.longestStreak.player?.name}
          value={`${summary.longestStreak.bestStreak} in a row`}
          player={summary.longestStreak.player}
          accentFrom="#ef4444"
          accentTo="#dc2626"
        />
        <AwardCard
          icon={Shield}
          label="Best Defense"
          playerName={summary.bestDefense.player?.name}
          value={`${summary.bestDefense.avgConceded} GA/Match`}
          player={summary.bestDefense.player}
          accentFrom="#3b82f6"
          accentTo="#2563eb"
        />
        <AwardCard
          icon={Star}
          label="Clean Sheets"
          playerName={summary.mostCleanSheets.player?.name}
          value={`${summary.mostCleanSheets.cleanSheets} CS`}
          player={summary.mostCleanSheets.player}
          accentFrom="#8b5cf6"
          accentTo="#7c3aed"
        />
        <AwardCard
          icon={Zap}
          label="Most Decisive"
          playerName={summary.mostDecisive.player?.name}
          value={`${summary.mostDecisive.bigWins} Big Wins`}
          player={summary.mostDecisive.player}
          accentFrom="#ec4899"
          accentTo="#db2777"
        />
      </div>
    </motion.div>
  );
}
