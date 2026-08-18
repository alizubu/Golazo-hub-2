'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Radio, Activity, ArrowRight, Shield, Flame, Swords, Target, Goal, TrendingUp, History, ListOrdered, Zap, PlusCircle, CheckCircle2, Megaphone, Clock, AlertTriangle, ChevronRight, BarChart2, Star, CalendarDays, PlayCircle, Edit2, Bell, MoreVertical, ShieldAlert, Camera, Loader2 } from 'lucide-react';
import { Card, SectionTitle, EmptyState, MagicCard, FadeIn, Badge, Btn, Avatar, toTitleCase } from '@/app/components/shared/UI';
import { supabase } from '@/lib/supabaseClient';
import { BorderBeam } from '@/app/components/magicui/BorderBeam';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { computeStandings } from '@/app/components/shared/StandingsTable';
import StandingsTable from '@/app/components/shared/StandingsTable';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import TournamentControlPanel from '@/app/components/admin/TournamentControlPanel';
import LiveMatchControl from '@/app/components/admin/LiveMatchControl';
import SeasonSummaryDashboard from '@/app/components/user/SeasonSummaryDashboard';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';

function formatName(name) {
  if (!name) return 'TBD';
  const titleCased = toTitleCase(name);
  const parts = titleCased.trim().split(/\s+/);
  if (parts.length > 1 && titleCased.length > 12) {
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }
  return titleCased;
}

// 1. Season Hero
function HeroSeasonSummary({ activeSeason, players, matches, setTab }) {
  if (!activeSeason) return null;
  const totalMatches = matches.filter(m => m.seasonId === activeSeason.id).length;
  const completedMatches = matches.filter(m => m.seasonId === activeSeason.id && m.status === 'completed').length;
  const progress = totalMatches === 0 ? 0 : Math.round((completedMatches / totalMatches) * 100);
  const isCompleted = progress >= 100 && totalMatches > 0;
  const hasFixtures = totalMatches > 0;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-lg md:shadow-2xl flex flex-col md:block">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-pitch/10 via-background to-background pointer-events-none" />
      <div className="hidden md:block absolute -right-16 -top-16 opacity-10 pointer-events-none">
        <Trophy size={300} />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 p-4 md:p-8 pb-8 md:pb-8">
        <div className="space-y-1 md:space-y-2 max-w-xl flex-1">
          <div className="flex items-center justify-between md:justify-start gap-2 mb-2 md:mb-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-pitch-bright bg-pitch/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border border-pitch/20">Active Season</span>
              {isCompleted ? (
                <Badge color="var(--success)">Completed</Badge>
              ) : hasFixtures ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pitch/10 border border-pitch/30 text-[10px] font-bold text-pitch-bright uppercase tracking-wider shadow-[0_0_10px_rgba(20,184,166,0.15)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-pitch animate-pulse" />
                  Live
                </div>
              ) : (
                <Badge color="var(--gold)">Draft</Badge>
              )}
            </div>
            
            {/* Mobile Progress Pill */}
            <div className="md:hidden flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full border border-border/50 backdrop-blur-md">
              <span className="text-[10px] font-score font-bold">{progress}%</span>
            </div>
          </div>
          
          <h1 className="text-xl md:text-5xl font-heading font-black tracking-tight text-foreground leading-none">
            {activeSeason.name}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
            {activeSeason.type || "Standard Tournament"}{(activeSeason.startDate || activeSeason.createdAt) ? ` • Started ${new Date(activeSeason.startDate || activeSeason.createdAt).toLocaleDateString()}` : ''}
          </p>
        </div>

        {/* Desktop Detailed Stats Box */}
        <div className="hidden md:flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="flex flex-col justify-center px-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">League Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-score font-bold text-foreground">{progress}%</span>
              <div className="w-24 h-2 bg-background rounded-full overflow-hidden border border-border/50">
                <div className="h-full bg-gradient-to-r from-pitch to-pitch-bright transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 font-score">{completedMatches} / {totalMatches} Matches Played</span>
          </div>

          <div className="h-full w-px bg-border/50 hidden sm:block" />

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Btn variant="primary" onClick={() => setTab && setTab('admin/matches')} className="w-full justify-center text-xs uppercase font-bold tracking-wider py-2 shadow-lg shadow-pitch/20 cursor-pointer">
              Manage Matches <ArrowRight size={14} className="ml-1" />
            </Btn>
            <Btn variant="outline" onClick={() => setTab && setTab('admin/season')} className="w-full justify-center text-xs uppercase font-bold tracking-wider py-1.5 cursor-pointer">
              Season Settings
            </Btn>
          </div>
        </div>
      </div>

      {/* Edge-to-edge Mobile Progress Bar */}
      <div className="md:hidden h-1 w-full bg-border/30 absolute bottom-0 left-0">
        <div className="h-full bg-gradient-to-r from-pitch to-pitch-bright transition-all duration-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// 2. Metrics Ribbon
function AdminMetrics({ matches, activeSeason, notifications = [], setTab }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const liveMatchesCount = tMatches.filter(m => m.status === 'live').length;
  const scheduledCount = tMatches.filter(m => m.status === 'scheduled').length;
  const completedCount = tMatches.filter(m => m.status === 'completed').length;
  const unreadNotifs = notifications.length;

  const metrics = [
    { label: "Live Matches", value: liveMatchesCount, icon: Radio, color: "text-destructive", bg: "bg-destructive/15", pulse: liveMatchesCount > 0, tab: "admin/matches" },
    { label: "Upcoming Fixtures", value: scheduledCount, icon: Calendar, color: "text-sky-400", bg: "bg-sky-400/15", tab: "admin/matches" },
    { label: "Completed Matches", value: completedCount, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/15", tab: "admin/matches" },
    { label: "System Alerts", value: unreadNotifs, icon: AlertTriangle, color: unreadNotifs > 0 ? "text-amber-500" : "text-muted-foreground", bg: unreadNotifs > 0 ? "bg-amber-500/15" : "bg-secondary/50", sub: unreadNotifs > 0 ? "Click to review alerts" : "System normal", tab: "notifications" }
  ];

  return (
    <Card className="p-4 md:p-6 overflow-hidden border-border/50 shadow-lg">
      <SectionTitle icon={Activity}>System Overview</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
        {metrics.map((m, i) => (
          <FadeIn key={m.label} delay={i * 0.05} className="h-full">
            <div 
              onClick={() => m.tab && setTab && setTab(m.tab)}
              className={`p-5 flex flex-col justify-between bg-secondary/20 border border-border/50 rounded-xl hover:bg-secondary/40 transition-all h-full ${m.tab ? 'cursor-pointer hover:border-border dark:border-white/20' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate mr-2">
                  {m.label}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.bg} ${m.color}`}>
                  <m.icon size={20} className={m.pulse ? "animate-pulse" : ""} />
                </div>
              </div>
              <div className="text-3xl font-heading font-black font-score text-foreground mt-3">
                {m.value}
              </div>
              {m.sub && (
                <div className={`text-[10px] font-semibold mt-1.5 ${m.color}`}>
                  {m.sub}
                </div>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </Card>
  );
}

// 5. League Snapshot
function LeagueSnapshot({ matches, players, activeSeason, setTab }) {
  if (!activeSeason) return null;
  const standings = computeStandings(matches, players, activeSeason.id).slice(0, 3);

  return (
    <Card className="p-4 md:p-6 h-full flex flex-col border-border/50 shadow-lg">
      <SectionTitle icon={ListOrdered}>League Snapshot</SectionTitle>
      <div className="flex-1 flex flex-col justify-center gap-4 py-8">
        {standings.length > 0 ? (
          <div className="flex items-end justify-center gap-2 sm:gap-4 h-32 mt-4">
            {/* 2nd Place */}
            {standings[1] && (
              <div className="flex flex-col items-center flex-1">
                <Avatar p={standings[1]} size={36} className="mb-2 ring-2 ring-zinc-300 shadow-[0_0_15px_rgba(212,212,216,0.3)]" />
                <span className="font-bold text-xs truncate max-w-full px-1" title={standings[1].name}>{formatName(standings[1].name)}</span>
                <span className="text-[10px] text-muted-foreground font-score">{standings[1].pts} pts</span>
                <div className="w-full h-16 bg-zinc-300/10 border-t-2 border-zinc-300/30 rounded-t-lg mt-2 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-zinc-300/10 pointer-events-none" />
                  <span className="text-2xl font-black text-muted-foreground/50">2</span>
                </div>
              </div>
            )}
            
            {/* 1st Place */}
            {standings[0] && (
              <div className="flex flex-col items-center flex-1 -mt-6">
                <div className="relative">
                  <div className="absolute -top-4 -right-2 text-2xl animate-bounce drop-shadow-md z-10">👑</div>
                  <Avatar p={standings[0]} size={48} className="mb-2 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] relative z-0" />
                </div>
                <span className="font-bold text-sm truncate max-w-full px-1 text-amber-400" title={standings[0].name}>{formatName(standings[0].name)}</span>
                <span className="text-xs text-amber-500/80 font-bold font-score">{standings[0].pts} pts</span>
                <div className="w-full h-24 bg-amber-400/10 border-t-2 border-amber-400/30 rounded-t-lg mt-2 flex flex-col items-center justify-start pt-2 relative overflow-hidden shadow-[0_-10px_30px_rgba(251,191,36,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-400/20 pointer-events-none" />
                  <span className="text-3xl font-black text-amber-500/50">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {standings[2] && (
              <div className="flex flex-col items-center flex-1">
                <Avatar p={standings[2]} size={36} className="mb-2 ring-2 ring-orange-400/70 shadow-[0_0_15px_rgba(251,146,60,0.3)]" />
                <span className="font-bold text-xs truncate max-w-full px-1" title={standings[2].name}>{formatName(standings[2].name)}</span>
                <span className="text-[10px] text-orange-400/70 font-score">{standings[2].pts} pts</span>
                <div className="w-full h-12 bg-orange-400/10 border-t-2 border-orange-400/20 rounded-t-lg mt-2 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-orange-400/10 pointer-events-none" />
                  <span className="text-2xl font-black text-orange-500/40">3</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState text="No matches played." />
        )}
      </div>
      <div className="mt-auto border-t border-border/50 pt-4 flex justify-end">
        <button onClick={() => setTab && setTab('admin-season')} className="text-xs font-bold text-pitch-bright hover:text-foreground flex items-center transition-colors cursor-pointer">
          View Full Standings <ArrowRight size={12} className="ml-1" />
        </button>
      </div>
    </Card>
  );
}

// 6. Match Center (Segmented Control)
function MatchCenter({ matches, players, activeSeason, showToast, setTab }) {
  const [view, setView] = useState('recent'); // 'recent' or 'upcoming'
  if (!activeSeason) return null;

  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const completed = tMatches.filter(m => m.status === 'completed').slice(-4).reverse();
  const upcoming = tMatches.filter(m => m.status === 'scheduled').slice(0, 4);
  const displayMatches = view === 'recent' ? completed : upcoming;

  return (
    <Card className="p-4 md:p-6 h-full flex flex-col border-border/50 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <SectionTitle icon={Swords}>Match Center</SectionTitle>
        <div className="flex p-1 bg-secondary/40 rounded-lg border border-border/50 w-full sm:w-auto">
          <button 
            onClick={() => setView('recent')} 
            className={`flex-1 sm:px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'recent' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Recent
          </button>
          <button 
            onClick={() => setView('upcoming')} 
            className={`flex-1 sm:px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'upcoming' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 justify-center">
        {displayMatches.length > 0 ? (
          displayMatches.map((m) => {
            const h = players.find(p => p.id === m.homeId);
            const a = players.find(p => p.id === m.awayId);
            const isCompleted = m.status === 'completed';
            const hScore = m.homeScore || 0;
            const aScore = m.awayScore || 0;
            const hWon = isCompleted && hScore > aScore;
            const aWon = isCompleted && aScore > hScore;
            
            return (
              <div key={m.id} onClick={() => setTab && setTab('admin-matches')} className="group relative flex items-center justify-between py-2.5 sm:py-3 border border-border/30 bg-secondary/10 hover:bg-secondary/40 px-3 rounded-xl transition-colors cursor-pointer">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 w-full items-center">
                  <div className={`flex items-center justify-end gap-2 min-w-0 ${hWon ? 'text-pitch-bright font-black' : 'text-muted-foreground'}`} title={h?.name}>
                    <span className="font-bold text-sm truncate">{formatName(h?.name)}</span>
                    <Avatar p={h} size={24} className="shrink-0" />
                  </div>
                  
                  {isCompleted ? (
                    <div className="font-score text-xs sm:text-sm bg-background px-2 sm:px-3 py-1 rounded-lg font-black border border-border/50 shrink-0 flex items-center justify-center gap-1.5 min-w-[60px] shadow-sm">
                      <span className={hWon ? 'text-pitch-bright text-sm' : ''}>{hScore}</span>
                      <span className="text-muted-foreground/50">-</span>
                      <span className={aWon ? 'text-pitch-bright text-sm' : ''}>{aScore}</span>
                    </div>
                  ) : (
                    <div className="font-score text-[10px] sm:text-xs bg-background text-muted-foreground px-2 py-1 rounded-full font-bold border border-border/50 shrink-0 flex items-center justify-center min-w-[50px]">
                      {m.scheduledAt ? new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "VS"}
                    </div>
                  )}

                  <div className={`flex items-center justify-start gap-2 min-w-0 ${aWon ? 'text-pitch-bright font-black' : 'text-muted-foreground'}`} title={a?.name}>
                    <Avatar p={a} size={24} className="shrink-0" />
                    <span className="font-bold text-sm truncate">{formatName(a?.name)}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState text={`No ${view} matches found.`} />
        )}
      </div>
    </Card>
  );
}



// 8. Notification Feed
function NotificationCenter({ notifications = [], announcements = [], matches = [] }) {
  const liveMatches = matches.filter(m => m.status === 'live');
  const items = [];

  liveMatches.forEach(m => {
    items.push({
      icon: "🔴",
      title: "Match Live Now",
      desc: `Score: ${m.homeScore || 0} - ${m.awayScore || 0}`,
      color: "border-l-red-500"
    });
  });

  announcements.slice(0, 2).forEach(a => {
    const plainText = a.content ? a.content.replace(/<[^>]+>/g, '').substring(0, 50) + (a.content.length > 50 ? '...' : '') : "New league announcement";
    items.push({
      icon: "📢",
      title: a.title,
      desc: plainText,
      color: "border-l-blue-500"
    });
  });

  notifications.slice(0, 3).forEach(n => {
    items.push({
      icon: n.type === 'result' ? "⚽" : "🔔",
      title: n.type === 'result' ? "Match Completed" : "Notification",
      desc: n.text,
      color: "border-l-pitch"
    });
  });

  const displayItems = items.slice(0, 4);

  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={Bell}>Notifications</SectionTitle>
      <div className="flex-1 flex flex-col justify-center gap-3 py-4">
        {displayItems.length > 0 ? (
          displayItems.map((n, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 bg-secondary/10 border border-border/30 rounded-r-lg border-l-4 ${n.color}`}>
              <span className="text-base leading-none">{n.icon}</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm leading-tight">{n.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">{n.desc}</span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState text="No recent notifications." />
        )}
      </div>
    </Card>
  );
}

// 9. Top Players
function TopPlayersHorizontal({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const standings = computeStandings(matches, players, activeSeason.id);
  if (standings.length === 0) return null;

  const completed = matches.filter(m => m.seasonId === activeSeason.id && m.status === 'completed');

  const topScorer = [...standings].sort((a, b) => b.gf - a.gf)[0];
  const mostWins = [...standings].sort((a, b) => b.won - a.won)[0];
  const bestDefense = [...standings].filter(s => s.played > 0).sort((a, b) => (a.ga / a.played) - (b.ga / b.played))[0] || standings[0];
  
  const ratingsMap = {};
  const countMap = {};
  const passesMap = {};

  completed.forEach(m => {
    if (m.stats?.ratings?.a) {
      ratingsMap[m.homeId] = (ratingsMap[m.homeId] || 0) + parseFloat(m.stats.ratings.a);
      countMap[m.homeId] = (countMap[m.homeId] || 0) + 1;
    }
    if (m.stats?.ratings?.b) {
      ratingsMap[m.awayId] = (ratingsMap[m.awayId] || 0) + parseFloat(m.stats.ratings.b);
      countMap[m.awayId] = (countMap[m.awayId] || 0) + 1;
    }
    if (m.stats?.successfulPasses?.a) {
      passesMap[m.homeId] = (passesMap[m.homeId] || 0) + parseInt(m.stats.successfulPasses.a, 10);
    }
    if (m.stats?.successfulPasses?.b) {
      passesMap[m.awayId] = (passesMap[m.awayId] || 0) + parseInt(m.stats.successfulPasses.b, 10);
    }
  });

  let highestRatedPlayer = null;
  let highestRatingVal = 0;
  let mostPassesPlayer = null;
  let highestPassesVal = 0;

  standings.forEach(s => {
    if (countMap[s.id] > 0) {
      const avg = (ratingsMap[s.id] / countMap[s.id]);
      if (avg > highestRatingVal) {
        highestRatingVal = avg;
        highestRatedPlayer = s;
      }
    }
    if ((passesMap[s.id] || 0) > highestPassesVal) {
      highestPassesVal = passesMap[s.id];
      mostPassesPlayer = s;
    }
  });

  if (!highestRatedPlayer && standings.length > 0) {
    highestRatedPlayer = [...standings].sort((a, b) => ((b.pts * 2 + b.gd) - (a.pts * 2 + a.gd)))[0];
    highestRatingVal = 7.5;
  }
  if (!mostPassesPlayer && standings.length > 0) mostPassesPlayer = standings[0];

  const categories = [
    { label: "Golden Boot", player: topScorer, stat: `${topScorer?.gf || 0}`, statLabel: "Goals", icon: Target, color: "text-amber-400", borderColor: "hover:border-amber-500/40", shadow: "hover:shadow-[0_8px_20px_-8px_rgba(251,191,36,0.2)]" },
    { label: "Highest Rating", player: highestRatedPlayer, stat: `★ ${(highestRatingVal || 0).toFixed(1)}`, statLabel: "Rating", icon: Star, color: "text-purple-400", borderColor: "hover:border-purple-500/40", shadow: "hover:shadow-[0_8px_20px_-8px_rgba(192,132,252,0.2)]" },
    { label: "Most Wins", player: mostWins, stat: `${mostWins?.won || 0}`, statLabel: "Wins", icon: Trophy, color: "text-green-400", borderColor: "hover:border-green-500/40", shadow: "hover:shadow-[0_8px_20px_-8px_rgba(74,222,128,0.2)]" },
    { label: "Best Defense", player: bestDefense, stat: bestDefense && bestDefense.played > 0 ? (bestDefense.ga / bestDefense.played).toFixed(1) : "0.0", statLabel: "Goals Conceded", icon: Shield, color: "text-blue-400", borderColor: "hover:border-blue-500/40", shadow: "hover:shadow-[0_8px_20px_-8px_rgba(96,165,250,0.2)]" },
    { label: "Most Passes", player: mostPassesPlayer, stat: `${highestPassesVal}`, statLabel: "Successful Passes", icon: Zap, color: "text-orange-400", borderColor: "hover:border-orange-500/40", shadow: "hover:shadow-[0_8px_20px_-8px_rgba(251,146,60,0.2)]" }
  ];

  return (
    <div className="w-full flex flex-col mb-4 sm:mb-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-pitch-bright" />
          <h2 className="text-[14px] font-bold tracking-[0.04em] uppercase">Top Players</h2>
        </div>
        <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground uppercase flex items-center gap-1 transition-colors">
          View All <ChevronRight size={14} />
        </button>
      </div>

      {/* Grid / Carousel */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-3 pb-2 snap-x snap-mandatory scrollbar-none w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((cat, i) => (
          <div key={cat.label} className="snap-start shrink-0 w-[240px] sm:w-auto h-full">
            <div className={`flex flex-col p-3 rounded-2xl bg-card border border-border/40 transition-all duration-200 cursor-pointer h-[120px] justify-between group ${cat.borderColor} ${cat.shadow} hover:-translate-y-[2px]`}>
              
              {/* Category Header */}
              <div className="flex items-center gap-1.5 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <cat.icon size={12} className={cat.color} />
                <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${cat.color}`}>{cat.label}</span>
              </div>

              {/* Player Info */}
              <div className="flex items-center gap-3">
                <div className="relative group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] transition-all">
                  <Avatar p={cat.player} size={42} className="border border-border/50 shadow-sm" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="font-semibold text-[15px] truncate text-foreground group-hover:text-white transition-colors">
                    {formatName(cat.player?.name || "—")}
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5 truncate">
                    <span className={`font-score font-bold text-lg leading-none ${cat.color} brightness-110`}>{cat.stat}</span>
                    <span className="text-[10px] text-muted-foreground truncate uppercase">{cat.statLabel}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// 12. Mini Calendar
function MiniCalendar({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const upcoming = matches
    .filter(m => m.seasonId === activeSeason.id && m.status === 'scheduled')
    .slice(0, 3);

  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={CalendarDays}>Schedule</SectionTitle>
      <div className="flex-1 flex flex-col gap-3 mt-4 justify-center">
        {upcoming.length > 0 ? (
          upcoming.map((m) => {
            const h = players.find(p => p.id === m.homeId);
            const a = players.find(p => p.id === m.awayId);
            const timeStr = m.scheduledAt ? new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Scheduled";
            return (
              <div key={m.id} className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-sm font-semibold truncate flex-1 mr-2" title={`${h?.name || 'TBD'} vs ${a?.name || 'TBD'}`}>{formatName(h?.name)} vs {formatName(a?.name)}</span>
                <span className="text-xs font-score font-bold text-pitch-bright shrink-0">{timeStr}</span>
              </div>
            );
          })
        ) : (
          <EmptyState text="No upcoming scheduled fixtures." />
        )}
      </div>
    </Card>
  );
}

// Mobile-first Standings Cards
export function MobileStandingsList({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const standings = computeStandings(matches, players, activeSeason.id, activeSeason.config);
  
  if (standings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {standings.map((s, i) => {
        const isTop3 = i < 3;
        let borderClasses = "border-border/30";
        if (i === 0) borderClasses = "border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]";
        else if (i === 1) borderClasses = "border-zinc-300/50";
        else if (i === 2) borderClasses = "border-orange-400/50";

        const badgeUrl = getPlayerIdentityBadgeUrl(s);

        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.3 }}
            className={`bg-secondary/20 border rounded-xl p-3 sm:p-4 flex flex-col gap-3 ${borderClasses}`}
          >
            {/* Line 1 */}
            <div className="flex items-center gap-3">
              <div className="w-5 text-center font-black text-muted-foreground font-score text-xs">{i + 1}</div>
              <div className="relative flex-shrink-0 cursor-pointer">
                <Avatar p={s} size={32} className={isTop3 ? 'ring-2 ring-white/10' : ''} />
                {badgeUrl && (
                  <div className="absolute -bottom-1 -right-1 bg-transparent rounded-full p-0.5">
                    <img src={badgeUrl} alt="badge" className="w-4 h-4 object-contain drop-shadow-md" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground text-sm truncate">{formatName(s.name)}</div>
              </div>
              <div className="flex items-end justify-center gap-1">
                <div className="text-xl font-black font-score text-pitch-bright">{s.pts}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold pb-1">PTS</div>
              </div>
            </div>
            
            {/* Line 2: Compact Stats & Form */}
            <div className="flex items-center justify-between pl-8 sm:pl-11 pr-1">
              <div className="flex gap-4 sm:gap-6">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold font-score text-foreground">{s.won}-{s.drawn}-{s.lost}</span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">W-D-L</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold font-score text-foreground">{s.gf}</span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">GF</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold font-score text-foreground">{s.ga}</span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">GA</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold font-score ${s.gd > 0 ? 'text-emerald-400' : s.gd < 0 ? 'text-red-400' : 'text-foreground'}`}>
                    {s.gd > 0 ? `+${s.gd}` : s.gd}
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">GD</span>
                </div>
              </div>
              
              <div className="flex gap-0.5">
                {s.form.slice(-4).map((f, idx) => {
                  let bg = "bg-zinc-500";
                  if (f.result === 'W') bg = "bg-emerald-500";
                  if (f.result === 'L') bg = "bg-red-500";
                  return (
                    <div key={idx} className={`w-3.5 h-3.5 rounded-full ${bg} flex items-center justify-center text-[7px] font-bold text-white shadow-sm`}>
                      {f.result}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Main Component
export default function AdminOverviewDashboard({ players = [], activeSeason, matches = [], announcements = [], notifications = [], trophies = [], seasons = [], history = [], showToast, setTab, session, managerPermissions }) {
  const [realtimeOverrides, setRealtimeOverrides] = useState({});
  const summarySnapshotRef = useRef(null);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);

  const handleExportSnapshot = async () => {
    if (!summarySnapshotRef.current) return;
    setIsExportingSnapshot(true);
    try {
      const htmlToImage = await import('html-to-image');
      const download = (await import('downloadjs')).default;
      const dataUrl = await htmlToImage.toPng(summarySnapshotRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#0a0c10',
        style: { transform: 'scale(1)', transformOrigin: 'top left', padding: '16px' }
      });
      download(dataUrl, 'golazo-season-summary.png');
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  const liveMatches = React.useMemo(() => {
    if (!matches) return [];
    return matches.map(m => realtimeOverrides[m.id] ? { ...m, ...realtimeOverrides[m.id] } : m);
  }, [matches, realtimeOverrides]);

  useEffect(() => {
    const channel = supabase.channel('league-events')
      .on('broadcast', { event: 'match_update' }, (payload) => {
        const matchData = payload.payload;
        if (matchData?.id) {
          setRealtimeOverrides(prev => ({ ...prev, [matchData.id]: matchData }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!activeSeason) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Trophy size={64} className="text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold font-heading text-muted-foreground">No Active Tournament</h2>
        <p className="text-muted-foreground/70 mt-2 mb-4">Go to the Tournament tab to create a new season.</p>
        <Btn onClick={() => setTab && setTab('admin-season')} className="text-xs uppercase tracking-wider font-bold cursor-pointer">Create Season <ChevronRight size={14} className="ml-1" /></Btn>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      <HeroSeasonSummary activeSeason={activeSeason} players={players} matches={liveMatches} setTab={setTab} />
      <LiveMatchControl matches={liveMatches} players={players} activeSeason={activeSeason} showToast={showToast} />
      <AdminMetrics matches={liveMatches} activeSeason={activeSeason} notifications={notifications} setTab={setTab} />


      <div className="mb-6 w-full min-w-0">
        <div className="hidden md:block">
          <StandingsTable 
            matches={liveMatches} 
            players={players} 
            seasonId={activeSeason.id} 
            seasonName={activeSeason.name}
            config={activeSeason.config}
            headerLeft={
              <div className="flex items-center gap-2 px-2">
                <SectionTitle icon={ListOrdered} className="mb-0">League Standings</SectionTitle>
              </div>
            }
          />
        </div>
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={ListOrdered} className="mb-0">League Standings</SectionTitle>
          </div>
          <MobileStandingsList matches={liveMatches} players={players} activeSeason={activeSeason} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeagueSnapshot matches={liveMatches} players={players} activeSeason={activeSeason} setTab={setTab} />
        <MatchCenter matches={liveMatches} players={players} activeSeason={activeSeason} showToast={showToast} setTab={setTab} />
      </div>

      {/* End of Season Stats (Top Players + Summary) */}
      <div className="w-full relative bg-[#0a0c10]/40 border border-border/20 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-6 border-b border-border/30 pb-3">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-muted-foreground" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Season Wrap-up</h3>
          </div>
          <button 
            onClick={handleExportSnapshot}
            disabled={isExportingSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700/50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isExportingSnapshot ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {isExportingSnapshot ? 'Capturing...' : 'Snapshot'}
          </button>
        </div>

        <div ref={summarySnapshotRef} className="flex flex-col gap-6" style={{ background: isExportingSnapshot ? '#0a0c10' : 'transparent' }}>
          <TopPlayersHorizontal matches={liveMatches} players={players} activeSeason={activeSeason} />

          <div className="w-full">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={18} className="text-muted-foreground" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Season Summary</h3>
            </div>
            <SeasonSummaryDashboard season={activeSeason} matches={liveMatches} players={players} />
          </div>
        </div>
      </div>


      <TournamentControlPanel season={activeSeason} showToast={showToast} session={session} managerPermissions={managerPermissions} />
    </div>
  );
}
