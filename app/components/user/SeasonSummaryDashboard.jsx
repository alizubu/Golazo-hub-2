'use client';

import React, { useMemo } from 'react';
import {
  Trophy, Target, Shield, Flame, Swords, TrendingUp,
  Crown, Medal, Star, Zap, BarChart3, Goal
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

  let totalCleanSheets = 0;
  let biggestWinDiff = 0;
  let biggestWinScore = "0-0";

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

    if (as === 0) { h.cleanSheets++; totalCleanSheets++; }
    if (hs === 0) { a.cleanSheets++; totalCleanSheets++; }

    const diff = Math.abs(hs - as);
    if (diff > biggestWinDiff) {
      biggestWinDiff = diff;
      biggestWinScore = hs > as ? `${hs}-${as}` : `${as}-${hs}`;
    }

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
    totalCleanSheets,
    biggestWinScore,
    topScorer: { ...topScorer, player: playerMap.get(topScorer.id) },
    mostWins: { ...mostWins, player: playerMap.get(mostWins.id) },
    longestStreak: { ...longestStreak, player: playerMap.get(longestStreak.id) },
    bestDefense: { ...bestDefense, player: playerMap.get(bestDefense.id), avgConceded: (bestDefense.conceded / bestDefense.played).toFixed(1) },
    mostCleanSheets: { ...mostCleanSheets, player: playerMap.get(mostCleanSheets.id) },
    mostDecisive: { ...mostDecisive, player: playerMap.get(mostDecisive.id) },
  };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SeasonSummaryDashboard({ season, matches, players, compact = false }) {
  const summary = useMemo(
    () => computeSeasonSummary(matches, players, season?.id),
    [matches, players, season?.id]
  );

  if (!summary) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm font-medium border border-border/40 rounded-xl bg-card/40">
        No completed matches yet for this season.
      </div>
    );
  }

  // Aggregate stats for the season
  const completed = matches.filter(m => m.seasonId === season?.id && m.status === 'completed' && m.round === 'league');
  const totalMatches = completed.length;
  
  let decisiveMatches = 0;
  completed.forEach(m => {
    const hs = Number(m.homeScore) || 0;
    const as = Number(m.awayScore) || 0;
    if (hs !== as) decisiveMatches++;
  });
  
  const winRate = totalMatches > 0 ? Math.round((decisiveMatches / totalMatches) * 100) : 0;

  const primaryMetrics = [
    { label: "Matches", value: summary.totalMatches, icon: Swords, color: "text-purple-400" },
    { label: "Goals", value: summary.totalGoals, icon: Target, color: "text-amber-400" },
    { label: "Avg Goals", value: summary.avgGoals, icon: BarChart3, color: "text-green-400" },
    { label: "Clean Sheets", value: summary.totalCleanSheets, icon: Shield, color: "text-blue-400" },
    { label: "Biggest Win", value: summary.biggestWinScore, icon: Zap, color: "text-rose-400" },
    { label: "Decisive Rate", value: `${winRate}%`, icon: TrendingUp, color: "text-yellow-400" },
  ];

  const secondaryCards = [
    {
      label: "Top Scorer",
      player: summary.topScorer?.player,
      value: `${summary.topScorer?.goals || 0} Goals`,
      icon: Target,
      color: "text-amber-400",
      bgClass: "from-amber-500/20 via-amber-500/5 to-transparent",
      rank: "🥇"
    },
    {
      label: "Best Defense",
      player: summary.bestDefense?.player,
      value: `${summary.bestDefense?.avgConceded || "0.0"} GA`,
      icon: Shield,
      color: "text-blue-400",
      bgClass: "from-blue-500/10 to-transparent",
      rank: "#1"
    },
    {
      label: "Most Wins",
      player: summary.mostWins?.player,
      value: `${summary.mostWins?.wins || 0} Wins`,
      icon: Trophy,
      color: "text-green-400",
      bgClass: "from-green-500/10 to-transparent",
      rank: "#1"
    },
    {
      label: "Win Streak",
      player: summary.longestStreak?.player,
      value: `${summary.longestStreak?.bestStreak || 0} Streak`,
      icon: Flame,
      color: "text-rose-500",
      bgClass: "from-rose-500/10 to-transparent",
      rank: "🔥"
    },
    {
      label: "Clean Sheets",
      player: summary.mostCleanSheets?.player,
      value: `${summary.mostCleanSheets?.cleanSheets || 0} CS`,
      icon: Star,
      color: "text-indigo-400",
      bgClass: "from-indigo-500/10 to-transparent",
      rank: "#1"
    },
    {
      label: "Most Decisive",
      player: summary.mostDecisive?.player,
      value: `${summary.mostDecisive?.bigWins || 0} Big Wins`,
      icon: Zap,
      color: "text-pink-500",
      bgClass: "from-pink-500/10 to-transparent",
      rank: "⚡"
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Primary Metrics Rail */}
      <div className="flex flex-row items-center w-full bg-card border border-border/40 rounded-xl overflow-x-auto scrollbar-none shadow-sm divide-x divide-border/30">
        {primaryMetrics.map((metric, i) => (
          <div key={metric.label} className="flex-1 min-w-[90px] p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-1.5 opacity-70 mb-2">
              <metric.icon size={12} className={metric.color} />
              <span className={`text-[20px] sm:text-[24px] font-score font-black tracking-tight ${metric.color}`}>
                {metric.value}
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Secondary Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {secondaryCards.map((card, i) => (
          <div key={card.label} className={`relative overflow-hidden rounded-xl bg-[#101318] border border-border/30 p-4 sm:p-5 h-[140px] flex flex-col justify-between group hover:border-border/60 transition-colors ${i >= 4 ? 'lg:col-span-2' : 'col-span-1'}`}>
            
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgClass} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none z-0`} />
            
            {/* Icon Graphic Background */}
            <div className={`absolute -right-4 -bottom-4 opacity-[0.12] group-hover:opacity-[0.20] transition-opacity pointer-events-none z-0 rotate-[-15deg] ${card.color}`}>
              <card.icon size={100} strokeWidth={1.5} />
            </div>

            {/* Content Header */}
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <span className={`text-[11px] font-bold uppercase tracking-[0.15em] ${card.color}`}>{card.label}</span>
                {card.rank && (
                  <span className="text-[14px] opacity-90 drop-shadow-md">{card.rank}</span>
                )}
              </div>
              {card.player && (
                <div className="font-bold text-[14px] truncate text-foreground group-hover:text-white transition-colors">
                  {card.player.name}
                </div>
              )}
            </div>

            {/* Two-Level Stat */}
            <div className="relative z-10 mt-auto flex flex-col leading-none">
              <span className={`text-3xl sm:text-4xl font-score font-black ${card.color} tracking-tighter brightness-110 mb-1`}>
                {card.value.split(' ')[0]}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold">
                {card.value.split(' ').slice(1).join(' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend Footer */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-2 px-1">
        <div className="flex items-center gap-1.5"><Shield size={12} className="opacity-60"/> GA: Goals Against / Matches</div>
        <div className="flex items-center gap-1.5"><Star size={12} className="opacity-60"/> CS: Clean Sheets</div>
        <div className="flex items-center gap-1.5"><Zap size={12} className="opacity-60"/> BIG WINS: Wins by 3+ Goals</div>
      </div>
    </div>
  );
}
