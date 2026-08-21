'use client';

import React, { useMemo } from 'react';
import {
  Trophy, Target, Shield, Goal, Swords, TrendingUp,
  Activity, Star, Zap, ActivitySquare, Check, X,
  Calendar, Flame, History, BarChart3, Clock,
  ArrowRight, ShieldCheck, Footprints, Medal, AlertTriangle, Users
} from 'lucide-react';
import { Avatar } from '@/app/components/shared/UI';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { CLUBS } from '@/lib/data/clubs';
import { NATIONAL_TEAMS } from '@/lib/data/national-teams';

// ─── Simple Donut Chart ─────────────────────────
function DonutChart({ data, colors, size = 120, strokeWidth = 14, centerTitle, centerSub }) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#ffffff10" strokeWidth={strokeWidth} />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[18px] font-black text-white leading-none">0</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{centerTitle || 'Total'}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {data.map((item, i) => {
            if (item.value === 0) return null;
            const color = colors[i % colors.length];
            const id = `grad-${color.replace('#', '')}-${i}`;
            return (
              <linearGradient key={id} id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.4" />
              </linearGradient>
            );
          })}
        </defs>
        {data.map((item, i) => {
          if (item.value === 0) return null;
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset * circumference;
          currentOffset += percentage;
          
          const color = colors[i % colors.length];
          const gradId = `url(#grad-${color.replace('#', '')}-${i})`;
          
          return (
            <circle
              key={item.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={gradId}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              filter="url(#neonGlow)"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[18px] font-black text-white leading-none">{total}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{centerSub || 'Total'}</span>
      </div>
    </div>
  );
}

// ─── Simple Line Chart ─────────────────────────
function LineChart({ data, width = '100%', height = 140, accentColor = '#FFB800' }) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-muted-foreground flex items-center justify-center h-full w-full">No data</div>;
  }
  const paddingX = 20;
  const paddingY = 20;
  
  return (
    <div style={{ width, height, position: 'relative' }} className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-chart`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {(() => {
          const maxVal = Math.max(...data.map(d => d.value), 1);
          const minVal = 0;
          const chartWidth = 400 - paddingX * 2;
          const chartHeight = height - paddingY * 2;
          
          const points = data.map((d, i) => {
            const x = paddingX + (i / (Math.max(data.length - 1, 1))) * chartWidth;
            const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
            return { x, y, value: d.value, label: d.label };
          });

          const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
          const areaD = `${pathD} L ${points[points.length - 1]?.x},${height - paddingY} L ${points[0]?.x},${height - paddingY} Z`;

          return (
            <>
              {/* Grid Lines */}
              {[0, 0.5, 1].map((tick) => {
                const y = paddingY + tick * chartHeight;
                const val = (maxVal - tick * maxVal).toFixed(Number.isInteger(maxVal) ? 0 : 1);
                return (
                  <g key={tick}>
                    <line x1="0" y1={y} x2="400" y2={y} stroke="#ffffff10" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="0" y={y - 4} fill="#666" fontSize="10">{val}</text>
                  </g>
                );
              })}

              <path d={areaD} fill={`url(#gradient-chart)`} />
              <path d={pathD} fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3" fill="#181a20" stroke={accentColor} strokeWidth="2" />
                  <text x={p.x} y={height - 2} fill="#666" fontSize="10" textAnchor="middle">{p.label}</text>
                </g>
              ))}
            </>
          );
        })()}
      </svg>
    </div>
  );
}


// ─── Utility: Compute all season summary stats ──────────
function computeSeasonSummary(matches, players, seasonId) {
  const completed = matches
    .filter(m => m.seasonId === seasonId && m.status === 'completed')
    .sort((a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0));

  if (completed.length === 0) return null;

  const playerMap = new Map(players.map(p => [p.id, p]));
  const acc = {};
  players.forEach(p => {
    acc[p.id] = { 
      id: p.id, 
      goals: 0, 
      conceded: 0, 
      wins: 0, 
      losses: 0, 
      draws: 0, 
      played: 0, 
      cleanSheets: 0, 
      passes: 0, 
      minutesPlayed: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      currentCSStreak: 0,
      bestCSStreak: 0
    };
  });

  let totalGoals = 0;
  let homeGoals = 0;
  let awayGoals = 0;
  let homeWins = 0;
  let awayWins = 0;
  let totalDraws = 0;
  let totalCleanSheets = 0;
  let totalPasses = 0;
  let biggestWinDiff = 0;
  let biggestWinScore = "0 - 0";
  let biggestWinMatch = null;
  let maxGoalsInMatch = 0;
  let goalsTimeline = [];

  completed.forEach((m, idx) => {
    const hs = Number(m.homeScore) || 0;
    const as = Number(m.awayScore) || 0;
    const matchGoals = hs + as;
    
    totalGoals += matchGoals;
    homeGoals += hs;
    awayGoals += as;
    
    if (matchGoals > maxGoalsInMatch) maxGoalsInMatch = matchGoals;
    
    // Group timeline by matches (or take last 10)
    goalsTimeline.push({ label: `M${idx+1}`, value: matchGoals });

    const diff = Math.abs(hs - as);
    if (diff > biggestWinDiff) {
      biggestWinDiff = diff;
      biggestWinScore = hs > as ? `${hs} - ${as}` : `${as} - ${hs}`;
      biggestWinMatch = m;
    }

    if (hs > as) homeWins++;
    else if (as > hs) awayWins++;
    else totalDraws++;

    if (as === 0) totalCleanSheets++;
    if (hs === 0) totalCleanSheets++;

    const pA = parseInt(m.stats?.successfulPasses?.a || 0, 10);
    const pB = parseInt(m.stats?.successfulPasses?.b || 0, 10);
    totalPasses += pA + pB;

    const h = acc[m.homeId];
    const a = acc[m.awayId];
    
    if (h && a) {
      h.played++; a.played++;
      h.goals += hs; a.goals += as;
      h.conceded += as; a.conceded += hs;
      h.passes += pA; a.passes += pB;
      h.minutesPlayed += 90; a.minutesPlayed += 90;
      
      // Streaks
      if (hs > as) {
        h.wins++; h.currentWinStreak++; h.bestWinStreak = Math.max(h.bestWinStreak, h.currentWinStreak);
        a.losses++; a.currentWinStreak = 0;
      } else if (as > hs) {
        a.wins++; a.currentWinStreak++; a.bestWinStreak = Math.max(a.bestWinStreak, a.currentWinStreak);
        h.losses++; h.currentWinStreak = 0;
      } else {
        h.draws++; h.currentWinStreak = 0;
        a.draws++; a.currentWinStreak = 0;
      }

      // CS Streaks
      if (as === 0) {
        h.cleanSheets++; h.currentCSStreak++; h.bestCSStreak = Math.max(h.bestCSStreak, h.currentCSStreak);
      } else {
        h.currentCSStreak = 0;
      }
      
      if (hs === 0) {
        a.cleanSheets++; a.currentCSStreak++; a.bestCSStreak = Math.max(a.bestCSStreak, a.currentCSStreak);
      } else {
        a.currentCSStreak = 0;
      }
    }
  });

  const entries = Object.values(acc).filter(e => e.played > 0);
  
  const topScorers = [...entries].sort((a, b) => b.goals - a.goals).slice(0, 3).map(s => ({ ...s, player: playerMap.get(s.id) }));
  const topPassers = [...entries].sort((a, b) => b.passes - a.passes).slice(0, 3).map(s => ({ ...s, player: playerMap.get(s.id) }));
  const bestDefense = [...entries].filter(e => e.played > 0).sort((a, b) => (a.conceded/a.played) - (b.conceded/b.played)).slice(0, 3).map(s => ({ ...s, player: playerMap.get(s.id) }));
  const topCleanSheets = [...entries].sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 3).map(s => ({ ...s, player: playerMap.get(s.id) }));
  
  const mostMinutes = [...entries].sort((a, b) => b.minutesPlayed - a.minutesPlayed)[0];
  const longestWinStreak = [...entries].sort((a, b) => b.bestWinStreak - a.bestWinStreak)[0];
  const longestCSStreak = [...entries].sort((a, b) => b.bestCSStreak - a.bestCSStreak)[0];

  return {
    totalMatches: completed.length,
    totalGoals,
    homeGoals,
    awayGoals,
    homeWins,
    awayWins,
    totalDraws,
    totalCleanSheets,
    totalPasses,
    biggestWinScore,
    biggestWinMatch,
    maxGoalsInMatch,
    goalsTimeline: goalsTimeline.slice(-15), // limit to last 15 for chart
    topScorers,
    topPassers,
    bestDefense,
    topCleanSheets,
    mostMinutes: { ...mostMinutes, player: playerMap.get(mostMinutes?.id) },
    longestWinStreak: { ...longestWinStreak, player: playerMap.get(longestWinStreak?.id) },
    longestCSStreak: { ...longestCSStreak, player: playerMap.get(longestCSStreak?.id) },
    avgGoals: (totalGoals / completed.length).toFixed(1),
    avgPasses: (totalPasses / completed.length).toFixed(0),
  };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SeasonSummaryDashboard({ season, matches, players }) {
  const summary = useMemo(
    () => computeSeasonSummary(matches, players, season?.id),
    [matches, players, season?.id]
  );

  if (!summary) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm font-medium border border-border/20 rounded-[20px] bg-[#0c0e12]">
        <Activity size={32} className="mx-auto mb-4 opacity-20" />
        No completed matches yet for this season.
      </div>
    );
  }

  // Row 1: 8-Card Metrics Grid (Replaces Red/Yellow cards with Passes/Goal Diff logic)
  const metricsGrid = [
    { label: "Matches Played", value: summary.totalMatches, icon: Swords, color: "text-[#a855f7]", bg: "bg-[#a855f7]/10", border: "border-[#a855f7]/20" },
    { label: "Goals Scored", value: summary.totalGoals, icon: Goal, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/20" },
    { label: "Goals / Match", value: summary.avgGoals, icon: BarChart3, color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20" },
    { label: "Total Passes", value: summary.totalPasses, icon: Footprints, color: "text-[#f97316]", bg: "bg-[#f97316]/10", border: "border-[#f97316]/20" },
    { label: "Passes / Match", value: summary.avgPasses, icon: ActivitySquare, color: "text-[#ec4899]", bg: "bg-[#ec4899]/10", border: "border-[#ec4899]/20" },
    { label: "Clean Sheets", value: summary.totalCleanSheets, icon: ShieldCheck, color: "text-[#14b8a6]", bg: "bg-[#14b8a6]/10", border: "border-[#14b8a6]/20" },
    { label: "Home Wins", value: summary.homeWins, icon: Trophy, color: "text-[#22c55e]", bg: "bg-[#22c55e]/10", border: "border-[#22c55e]/20" },
    { label: "Away Wins", value: summary.awayWins, icon: Trophy, color: "text-[#06b6d4]", bg: "bg-[#06b6d4]/10", border: "border-[#06b6d4]/20" },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* ─── ROW 1: 8-Card Season Overview ─── */}
      <div>
        <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-4">Season Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {metricsGrid.map((m, i) => (
            <div key={i} className="flex flex-col items-center justify-center bg-[#13161c] border border-border/20 rounded-xl p-4 md:p-5 hover:-translate-y-1 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] group">
              <div className={`mb-3 p-2 rounded-lg ${m.bg} ${m.border} border group-hover:scale-110 group-hover:shadow-[0_0_15px_currentColor] transition-all duration-300`}>
                <m.icon size={20} className={m.color} strokeWidth={2} />
              </div>
              <span className="text-[26px] font-score font-black text-white leading-none mb-2 drop-shadow-sm">{m.value}</span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground group-hover:text-white/70 transition-colors tracking-[0.1em] text-center px-1 leading-tight">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ROW 2: Charts (Goal Breakdown, Result Dist, Goals Trend) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-2">
        {/* Chart 1 */}
        <div className="bg-[#13161c] border border-border/20 rounded-xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.08)] hover:border-white/10 transition-all duration-500 flex flex-col">
          <span className="text-[11px] font-bold text-[#f59e0b] uppercase tracking-[0.15em] mb-4">Goal Breakdown</span>
          <div className="flex-1 flex items-center justify-center gap-6">
            <DonutChart 
              data={[
                { label: 'Home Goals', value: summary.homeGoals },
                { label: 'Away Goals', value: summary.awayGoals },
              ]}
              colors={['#3b82f6', '#ef4444']}
              centerTitle="Goals"
              size={110}
              strokeWidth={10}
            />
            <div className="flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white tracking-widest"><div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" /> Home <span className="text-muted-foreground ml-auto">{((summary.homeGoals/summary.totalGoals)*100).toFixed(1)}%</span></div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white tracking-widest"><div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" /> Away <span className="text-muted-foreground ml-auto">{((summary.awayGoals/summary.totalGoals)*100).toFixed(1)}%</span></div>
            </div>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-[#13161c] border border-border/20 rounded-xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] hover:border-white/10 transition-all duration-500 flex flex-col">
          <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-[0.15em] mb-4">Result Distribution</span>
          <div className="flex-1 flex items-center justify-center gap-6">
            <DonutChart 
              data={[
                { label: 'Home Wins', value: summary.homeWins },
                { label: 'Draws', value: summary.totalDraws },
                { label: 'Away Wins', value: summary.awayWins },
              ]}
              colors={['#ef4444', '#eab308', '#3b82f6']}
              centerTitle="Matches"
              size={110}
              strokeWidth={10}
            />
            <div className="flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white tracking-widest"><div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" /> Home Win</div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white tracking-widest"><div className="w-2 h-2 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308]" /> Draw</div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white tracking-widest"><div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" /> Away Win</div>
            </div>
          </div>
        </div>

        {/* Chart 3 */}
        <div className="bg-[#13161c] border border-border/20 rounded-xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.08)] hover:border-white/10 transition-all duration-500 flex flex-col">
          <span className="text-[11px] font-bold text-[#a855f7] uppercase tracking-[0.15em] mb-2">Goals Per Match Trend</span>
          <div className="flex-1 flex items-center justify-center pt-2">
            <LineChart data={summary.goalsTimeline} height={120} accentColor="#a855f7" />
          </div>
        </div>
      </div>

      {/* ─── ROW 3: Top 4 Leaderboards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mt-4">
        
        {/* Top Scorers */}
        <div className="bg-gradient-to-b from-[#f59e0b]/15 via-[#13161c] to-[#0a0c10] border border-[#f59e0b]/30 rounded-xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-[#f59e0b]/60 transition-all duration-500 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Goal size={120} /></div>
          <span className="text-[11px] font-bold text-[#f59e0b] uppercase tracking-[0.15em] mb-5 relative z-10 drop-shadow-sm">Top Scorers</span>
          <div className="flex flex-col gap-4 relative z-10">
            {summary.topScorers.map((s, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] font-black w-3 text-center ${i===0 ? 'text-[#f59e0b]' : i===1 ? 'text-zinc-300' : i===2 ? 'text-orange-400' : 'text-muted-foreground'}`}>{i+1}</span>
                  <Avatar p={s.player} size={36} className={`border ${i===0 ? 'border-[#f59e0b]/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]'}`} />
                  <div className="flex flex-col">
                    <span className={`font-bold text-[13px] leading-tight transition-colors ${i===0 ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>{s.player?.name || '—'}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{s.player?.favoriteClub || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-score font-black text-[18px] leading-none ${i===0 ? 'text-[#f59e0b]' : 'text-white'}`}>{s.goals}</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assists / Passes */}
        <div className="bg-gradient-to-b from-[#14b8a6]/15 via-[#13161c] to-[#0a0c10] border border-[#14b8a6]/30 rounded-xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] hover:border-[#14b8a6]/60 transition-all duration-500 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Footprints size={120} /></div>
          <span className="text-[11px] font-bold text-[#14b8a6] uppercase tracking-[0.15em] mb-5 relative z-10 drop-shadow-sm">Passing Leaders</span>
          <div className="flex flex-col gap-4 relative z-10">
            {summary.topPassers.map((s, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] font-black w-3 text-center ${i===0 ? 'text-[#14b8a6]' : i===1 ? 'text-zinc-300' : i===2 ? 'text-orange-400' : 'text-muted-foreground'}`}>{i+1}</span>
                  <Avatar p={s.player} size={36} className={`border ${i===0 ? 'border-[#14b8a6]/50 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]'}`} />
                  <div className="flex flex-col">
                    <span className={`font-bold text-[13px] leading-tight transition-colors ${i===0 ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>{s.player?.name || '—'}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{s.player?.favoriteClub || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-score font-black text-[18px] leading-none ${i===0 ? 'text-[#14b8a6]' : 'text-white'}`}>{s.passes}</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Passes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Defense */}
        <div className="bg-gradient-to-b from-[#3b82f6]/15 via-[#13161c] to-[#0a0c10] border border-[#3b82f6]/30 rounded-xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-[#3b82f6]/60 transition-all duration-500 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Shield size={120} /></div>
          <span className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-[0.15em] mb-5 relative z-10 drop-shadow-sm">Best Defense</span>
          <div className="flex flex-col gap-4 relative z-10">
            {summary.bestDefense.map((s, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] font-black w-3 text-center ${i===0 ? 'text-[#3b82f6]' : i===1 ? 'text-zinc-300' : i===2 ? 'text-orange-400' : 'text-muted-foreground'}`}>{i+1}</span>
                  <Avatar p={s.player} size={36} className={`border ${i===0 ? 'border-[#3b82f6]/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]'}`} />
                  <div className="flex flex-col">
                    <span className={`font-bold text-[13px] leading-tight transition-colors ${i===0 ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>{s.player?.name || '—'}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{s.player?.favoriteClub || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-score font-black text-[18px] leading-none ${i===0 ? 'text-[#3b82f6]' : 'text-white'}`}>{(s.conceded / s.played).toFixed(1)}</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold mt-1">GA / Match</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clean Sheets */}
        <div className="bg-gradient-to-b from-[#ec4899]/15 via-[#13161c] to-[#0a0c10] border border-[#ec4899]/30 rounded-xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] hover:border-[#ec4899]/60 transition-all duration-500 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Star size={120} /></div>
          <span className="text-[11px] font-bold text-[#ec4899] uppercase tracking-[0.15em] mb-5 relative z-10 drop-shadow-sm">Clean Sheets</span>
          <div className="flex flex-col gap-4 relative z-10">
            {summary.topCleanSheets.map((s, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] font-black w-3 text-center ${i===0 ? 'text-[#ec4899]' : i===1 ? 'text-zinc-300' : i===2 ? 'text-orange-400' : 'text-muted-foreground'}`}>{i+1}</span>
                  <Avatar p={s.player} size={36} className={`border ${i===0 ? 'border-[#ec4899]/50 shadow-[0_0_10px_rgba(236,72,153,0.3)]' : 'border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]'}`} />
                  <div className="flex flex-col">
                    <span className={`font-bold text-[13px] leading-tight transition-colors ${i===0 ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>{s.player?.name || '—'}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{s.player?.favoriteClub || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-score font-black text-[18px] leading-none ${i===0 ? 'text-[#ec4899]' : 'text-white'}`}>{s.cleanSheets}</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Matches</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── ROW 4: Key Highlights Footer Ribbon ─── */}
      <div className="mt-4 bg-gradient-to-r from-[#0c0e12] via-[#13161c] to-[#0c0e12] border border-border/40 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]">
        {/* Subtle glow behind ribbon */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] pointer-events-none" />
        
        <div className="shrink-0 relative z-10 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 group-hover:border-white/30 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] drop-shadow-sm">Key Highlights</span>
        </div>

        <div className="flex-1 flex flex-wrap md:flex-nowrap items-center justify-start md:justify-around gap-6 w-full relative z-10 divide-x divide-white/10">
          
          <div className="flex items-center gap-3 pl-0">
            <div className="p-2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"><Target size={20} className="text-[#f59e0b]" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#f59e0b] drop-shadow-sm">Biggest Win</span>
              <span className="font-score font-black text-[22px] text-white leading-none mt-1 drop-shadow-md">{summary.biggestWinScore}</span>
              <span className="text-[11px] text-zinc-300 font-medium mt-0.5 truncate max-w-[130px]">
                {summary.biggestWinMatch ? (() => {
                  const p1 = players.find(p => p.id === summary.biggestWinMatch.homeId);
                  const p2 = players.find(p => p.id === summary.biggestWinMatch.awayId);
                  return `vs ${summary.biggestWinMatch.homeScore > summary.biggestWinMatch.awayScore ? p2?.name : p1?.name}`;
                })() : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-6">
            <div className="p-2 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]"><Flame size={20} className="text-[#22c55e]" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#22c55e] drop-shadow-sm">Win Streak</span>
              <span className="font-score font-black text-[22px] text-white leading-none mt-1 drop-shadow-md">{summary.longestWinStreak?.bestWinStreak || 0}</span>
              <span className="text-[11px] text-zinc-300 font-medium mt-0.5 truncate max-w-[130px]">Matches by {summary.longestWinStreak?.player?.name || '—'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-6">
            <div className="p-2 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]"><Star size={20} className="text-[#ec4899]" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#ec4899] drop-shadow-sm">CS Streak</span>
              <span className="font-score font-black text-[22px] text-white leading-none mt-1 drop-shadow-md">{summary.longestCSStreak?.bestCSStreak || 0}</span>
              <span className="text-[11px] text-zinc-300 font-medium mt-0.5 truncate max-w-[130px]">Matches by {summary.longestCSStreak?.player?.name || '—'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-6">
            <div className="p-2 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"><Clock size={20} className="text-[#3b82f6]" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#3b82f6] drop-shadow-sm">Most Minutes</span>
              <span className="font-score font-black text-[22px] text-white leading-none mt-1 drop-shadow-md">{summary.mostMinutes?.minutesPlayed || 0}</span>
              <span className="text-[11px] text-zinc-300 font-medium mt-0.5 truncate max-w-[130px]">By {summary.mostMinutes?.player?.name || '—'}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
