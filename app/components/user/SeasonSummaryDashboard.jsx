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

function formatName(name) {
  if (!name) return "—";
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

// ─── Utility: Compute Season Stats ─────────────────────────────────────────────────────────

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
  
  let totalPlayerWins = 0;
  completed.forEach(m => {
    const hs = Number(m.homeScore) || 0;
    const as = Number(m.awayScore) || 0;
    if (hs > as) totalPlayerWins++;
    if (as > hs) totalPlayerWins++;
  });
  
  const winRate = totalMatches > 0 ? Math.round((totalPlayerWins / (totalMatches * 2)) * 100) : 0;

  const primaryMetrics = [
    { label: "Matches", value: summary.totalMatches, icon: Swords, color: "text-[#9d4edd]" },
    { label: "Goals", value: summary.totalGoals, icon: Target, color: "text-[#ffb703]" },
    { label: "Avg Goals", value: summary.avgGoals, icon: BarChart3, color: "text-[#2dc653]" },
    { label: "Goals For", value: summary.totalGoals, icon: Goal, color: "text-[#00b4d8]" },
    { label: "Goals Against", value: summary.totalGoals, icon: Shield, color: "text-[#e63946]" },
    { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp, color: "text-[#ffb703]" },
  ];

  const secondaryCards = [
    {
      label: "Top Scorer",
      player: summary.topScorer?.player,
      value: `${summary.topScorer?.goals || 0} GOALS`,
      icon: Target,
      color: "text-[#9d4edd]",
      borderTop: "border-t-[#9d4edd]",
      bgClass: "from-[#9d4edd]/20 via-[#9d4edd]/5 to-transparent",
      shadow: "shadow-[0_-15px_30px_-15px_rgba(157,78,221,0.25)] hover:shadow-[0_-15px_30px_-15px_rgba(157,78,221,0.4)]"
    },
    {
      label: "Best Defense",
      player: summary.bestDefense?.player,
      value: `${summary.bestDefense?.avgConceded || "0.0"} GA`,
      icon: Shield,
      color: "text-[#00b4d8]",
      borderTop: "border-t-[#00b4d8]",
      bgClass: "from-[#00b4d8]/20 via-[#00b4d8]/5 to-transparent",
      shadow: "shadow-[0_-15px_30px_-15px_rgba(0,180,216,0.25)] hover:shadow-[0_-15px_30px_-15px_rgba(0,180,216,0.4)]"
    },
    {
      label: "Most Wins",
      player: summary.mostWins?.player,
      value: `${summary.mostWins?.wins || 0} WINS`,
      icon: Trophy,
      color: "text-[#2dc653]",
      borderTop: "border-t-[#2dc653]",
      bgClass: "from-[#2dc653]/20 via-[#2dc653]/5 to-transparent",
      shadow: "shadow-[0_-15px_30px_-15px_rgba(45,198,83,0.25)] hover:shadow-[0_-15px_30px_-15px_rgba(45,198,83,0.4)]"
    },
    {
      label: "Win Streak",
      player: summary.longestStreak?.player,
      value: `${summary.longestStreak?.bestStreak || 0} STREAK`,
      icon: Flame,
      color: "text-[#e63946]",
      borderTop: "border-t-[#e63946]",
      bgClass: "from-[#e63946]/20 via-[#e63946]/5 to-transparent",
      shadow: "shadow-[0_-15px_30px_-15px_rgba(230,57,70,0.25)] hover:shadow-[0_-15px_30px_-15px_rgba(230,57,70,0.4)]"
    },
    {
      label: "Clean Sheets",
      player: summary.mostCleanSheets?.player,
      value: `${summary.mostCleanSheets?.cleanSheets || 0} CS`,
      icon: Star,
      color: "text-[#7b2cbf]",
      borderTop: "border-t-[#7b2cbf]",
      bgClass: "from-[#7b2cbf]/20 via-[#7b2cbf]/5 to-transparent",
      shadow: "shadow-[0_-15px_30px_-15px_rgba(123,44,191,0.25)] hover:shadow-[0_-15px_30px_-15px_rgba(123,44,191,0.4)]"
    },
    {
      label: "Most Decisive",
      player: summary.mostDecisive?.player,
      value: `${summary.mostDecisive?.bigWins || 0} BIG WINS`,
      icon: Zap,
      color: "text-[#f72585]",
      borderTop: "border-t-[#f72585]",
      bgClass: "from-[#f72585]/20 via-[#f72585]/5 to-transparent",
      shadow: "shadow-[0_-15px_30px_-15px_rgba(247,37,133,0.25)] hover:shadow-[0_-15px_30px_-15px_rgba(247,37,133,0.4)]"
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Primary Metrics Rail */}
      <div className="flex flex-row items-center w-full bg-[#0c0e12] border border-border/20 rounded-[14px] overflow-x-auto scrollbar-none shadow-sm divide-x divide-border/20">
        {primaryMetrics.map((metric, i) => (
          <div key={metric.label} className="flex-1 min-w-[100px] p-4 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-full bg-white/[0.03] ${metric.color}`}>
                <metric.icon size={16} strokeWidth={2} />
              </div>
              <span className={`text-[22px] sm:text-[26px] font-score font-black tracking-tighter drop-shadow-sm ${metric.color}`}>
                {metric.value}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Secondary Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {secondaryCards.map((card, i) => (
          <div key={card.label} className={`relative overflow-hidden rounded-[14px] bg-[#0c0e12] border border-border/20 border-t-2 ${card.borderTop} p-5 h-[160px] flex flex-col justify-between group hover:border-border/40 transition-all duration-300 ${card.shadow} ${i >= 4 ? 'lg:col-span-2' : 'col-span-1'} hover:-translate-y-1`}>
            
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgClass} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none z-0`} />
            
            {/* Icon Graphic Background */}
            <div className={`absolute -right-4 -bottom-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity pointer-events-none z-0 rotate-[-15deg] ${card.color} group-hover:scale-110 duration-500`}>
              <card.icon size={130} strokeWidth={1} />
            </div>

            {/* Content Header */}
            <div className="relative z-10 flex flex-col gap-1">
              <span className={`text-[11px] font-bold uppercase tracking-[0.15em] ${card.color}`}>{card.label}</span>
              {card.player && (
                <div className="font-bold text-[15px] truncate text-foreground group-hover:text-white transition-colors mt-0.5">
                  {formatName(card.player?.name || "—")}
                </div>
              )}
            </div>

            {/* Two-Level Stat */}
            <div className="relative z-10 mt-auto flex items-end gap-2 leading-none">
              <span className={`text-[42px] font-score font-black ${card.color} tracking-tighter brightness-110 mb-0 drop-shadow-sm`}>
                {card.value.split(' ')[0]}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-2">
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
