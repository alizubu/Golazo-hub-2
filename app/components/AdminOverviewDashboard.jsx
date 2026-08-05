'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Radio, Activity, ArrowRight, Shield, Flame, Swords, Target, Goal, TrendingUp, History, ListOrdered, Zap, PlusCircle, CheckCircle2, Megaphone, Clock, AlertTriangle, ChevronRight, BarChart2, Star, CalendarDays, PlayCircle, Edit2, Bell, MoreVertical } from 'lucide-react';
import { Card, SectionTitle, EmptyState, MagicCard, FadeIn, Badge, Btn, Avatar, toTitleCase } from './UI';
import { supabase } from '@/lib/supabaseClient';
import { BorderBeam } from './magicui/BorderBeam';
import { NumberTicker } from './ui/number-ticker';
import { computeStandings } from './StandingsTable';
import StandingsTable from './StandingsTable';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import TournamentControlPanel from './TournamentControlPanel';
import LiveMatchControl from './LiveMatchControl';

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
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-2xl p-6 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-pitch/20 via-background to-background pointer-events-none" />
      <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
        <Trophy size={300} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-pitch-bright bg-pitch/10 px-2.5 py-1 rounded-full border border-pitch/20">Active Tournament</span>
            {isCompleted ? (
              <Badge color="var(--success)">Completed</Badge>
            ) : hasFixtures ? (
              <Badge color="var(--pitch)" pulse>In Progress</Badge>
            ) : (
              <Badge color="var(--gold)">Draft</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-foreground">
            {activeSeason.name}
          </h1>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {activeSeason.type || "Standard Tournament"}{(activeSeason.startDate || activeSeason.createdAt) ? ` • Started ${new Date(activeSeason.startDate || activeSeason.createdAt).toLocaleDateString()}` : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
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
            <Btn variant="primary" onClick={() => setTab && setTab('admin-matches')} className="w-full justify-center text-xs uppercase font-bold tracking-wider py-2 shadow-lg shadow-pitch/20 cursor-pointer">
              Manage Matches <ArrowRight size={14} className="ml-1" />
            </Btn>
            <Btn variant="outline" onClick={() => setTab && setTab('admin-season')} className="w-full justify-center text-xs uppercase font-bold tracking-wider py-1.5 cursor-pointer">
              Season Settings
            </Btn>
          </div>
        </div>
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
    { label: "Live Matches", value: liveMatchesCount, icon: Radio, color: "text-destructive", bg: "bg-destructive/15", pulse: liveMatchesCount > 0, tab: "admin-matches" },
    { label: "Upcoming Fixtures", value: scheduledCount, icon: Calendar, color: "text-sky-400", bg: "bg-sky-400/15", tab: "admin-matches" },
    { label: "Completed Matches", value: completedCount, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/15", tab: "admin-matches" },
    { label: "System Alerts", value: unreadNotifs, icon: AlertTriangle, color: unreadNotifs > 0 ? "text-amber-500" : "text-muted-foreground", bg: unreadNotifs > 0 ? "bg-amber-500/15" : "bg-secondary/50", sub: unreadNotifs > 0 ? "Click to review alerts" : "System normal", tab: "notifications" }
  ];

  return (
    <Card className="p-6">
      <SectionTitle icon={Activity}>System Overview</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {metrics.map((m, i) => (
          <FadeIn key={m.label} delay={i * 0.05}>
            <div 
              onClick={() => m.tab && setTab && setTab(m.tab)}
              className={`p-5 flex flex-col justify-between bg-secondary/20 border border-border/50 rounded-xl hover:bg-secondary/40 transition-all h-full ${m.tab ? 'cursor-pointer hover:border-white/20' : ''}`}
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

function QuickActions({ setTab, showToast }) {
  const actions = [
    { label: "Start Match", category: "Match Logistics", icon: PlayCircle, bg: "bg-green-500/10 text-green-500", onClick: () => setTab ? setTab("admin-matches") : showToast?.("Go to Matches tab") },
    { label: "Generate Fixtures", category: "Match Logistics", icon: CalendarDays, bg: "bg-blue-500/10 text-blue-500", onClick: () => setTab ? setTab("admin-season") : showToast?.("Go to Season tab") },
    { label: "Edit Season", category: "Match Logistics", icon: Edit2, bg: "bg-orange-500/10 text-orange-500", onClick: () => setTab ? setTab("admin-season") : showToast?.("Go to Season tab") },
    { label: "Create Announcement", category: "Content & Trophies", icon: Megaphone, bg: "bg-purple-500/10 text-purple-500", onClick: () => setTab ? setTab("admin-announcements") : showToast?.("Go to Announcements tab") },
    { label: "Manage Trophies", category: "Content & Trophies", icon: Trophy, bg: "bg-gold/10 text-gold", onClick: () => setTab ? setTab("admin-trophies") : showToast?.("Go to Trophies tab") },
    { label: "Manage Players", category: "Player Management", icon: Users, bg: "bg-pink-500/10 text-pink-500", onClick: () => setTab ? setTab("admin-players") : showToast?.("Go to Players tab") }
  ];

  return (
    <Card className="p-6">
      <SectionTitle icon={Zap}>Quick Actions</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {actions.map((act, i) => (
          <FadeIn key={act.label} delay={i * 0.05} className="h-full">
            <button onClick={act.onClick} className="w-full h-full flex items-center justify-start gap-4 p-4 bg-secondary/20 border border-border/60 rounded-xl hover:bg-secondary/40 hover:border-white/20 transition-all group cursor-pointer shadow-sm relative">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${act.bg} group-hover:scale-105 transition-transform`}>
                <act.icon size={18} />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-bold text-left leading-snug text-foreground/90 group-hover:text-foreground">{act.label}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{act.category}</span>
              </div>
            </button>
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
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={ListOrdered}>League Snapshot</SectionTitle>
      <div className="flex-1 flex flex-col justify-center gap-4 py-4">
        {standings.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xl shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <span className="font-bold text-sm truncate" title={s.name}>{formatName(s.name)}</span>
            </div>
            <div className="text-pitch-bright font-bold font-score text-sm shrink-0 ml-2">{s.pts} pts</div>
          </div>
        ))}
        {standings.length === 0 && <EmptyState text="No matches played." />}
      </div>
      <div className="mt-auto border-t border-border/50 pt-4 flex justify-end">
        <button onClick={() => setTab && setTab('admin-season')} className="text-xs font-bold text-pitch-bright hover:text-white flex items-center transition-colors cursor-pointer">
          View Full Standings <ArrowRight size={12} className="ml-1" />
        </button>
      </div>
    </Card>
  );
}

// 6. Upcoming Matches Mini
function UpcomingMatchesMini({ matches, players, activeSeason, setTab }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id && m.status === 'scheduled');
  const upcoming = tMatches.slice(0, 3);

  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={Calendar}>Upcoming Matches</SectionTitle>
      <div className="flex-1 flex flex-col justify-center gap-3 py-4">
        {upcoming.length > 0 ? (
          upcoming.map((m) => {
            const h = players.find(p => p.id === m.homeId);
            const a = players.find(p => p.id === m.awayId);
            return (
              <div key={m.id} onClick={() => setTab && setTab('admin-matches')} className="flex flex-col p-3 rounded-lg bg-secondary/20 border border-border/30 gap-1.5 hover:bg-secondary/40 transition-colors cursor-pointer">
                <div className="flex justify-between items-center text-sm gap-2">
                  <span className="font-bold truncate flex-1" title={h?.name}>{formatName(h?.name)}</span>
                  <span className="text-[10px] font-score text-muted-foreground px-2 py-0.5 bg-background rounded-full shrink-0 border border-border/50">VS</span>
                  <span className="font-bold truncate flex-1 text-right" title={a?.name}>{formatName(a?.name)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState text="No upcoming fixtures." />
        )}
      </div>
    </Card>
  );
}

// 7. Recent Results
function RecentResults({ matches, players, activeSeason, showToast }) {
  if (!activeSeason) return null;
  const completed = matches
    .filter(m => m.seasonId === activeSeason.id && m.status === 'completed')
    .slice(-4)
    .reverse();

  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={History}>Recent Match Results</SectionTitle>



      <div className="flex-1 flex flex-col justify-center gap-4 py-4">
        {completed.length > 0 ? (
          completed.map((m) => {
            const h = players.find(p => p.id === m.homeId);
            const a = players.find(p => p.id === m.awayId);
            const timeStr = m.completedAt ? new Date(m.completedAt).toLocaleDateString() : "Recent";
            const hScore = m.homeScore || 0;
            const aScore = m.awayScore || 0;
            const hWon = hScore > aScore;
            const aWon = aScore > hScore;
            return (
              <div key={m.id} className="group relative flex items-center justify-between py-2 sm:py-2.5 border-b border-border/20 last:border-0 hover:bg-secondary/40 px-2 -mx-2 rounded-lg transition-colors">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 w-full items-center">
                  <div className={`flex items-center justify-end gap-2 min-w-0 ${hWon ? 'text-pitch-bright font-black' : 'text-muted-foreground'}`} title={h?.name}>
                    <span className="font-bold text-sm truncate">{formatName(h?.name)}</span>
                    <Avatar p={h} size={20} className="shrink-0" />
                  </div>
                  <div className="font-score text-xs sm:text-sm bg-secondary/80 px-2 sm:px-3 py-1 rounded-lg font-black border border-border/50 shrink-0 flex items-center justify-center gap-1.5 min-w-[60px]">
                    <span className={hWon ? 'text-pitch-bright text-sm' : ''}>{hScore}</span>
                    <span className="text-muted-foreground/50">-</span>
                    <span className={aWon ? 'text-pitch-bright text-sm' : ''}>{aScore}</span>
                  </div>
                  <div className={`flex items-center justify-start gap-2 min-w-0 ${aWon ? 'text-pitch-bright font-black' : 'text-muted-foreground'}`} title={a?.name}>
                    <Avatar p={a} size={20} className="shrink-0" />
                    <span className="font-bold text-sm truncate">{formatName(a?.name)}</span>
                  </div>
                </div>

                <div className="absolute right-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-card/80 backdrop-blur-sm rounded-md shadow-sm border border-border/50">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground transition-colors"><MoreVertical size={16}/></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 border-border bg-popover shadow-xl rounded-xl">
                         <DropdownMenuItem className="cursor-pointer hover:bg-secondary/80 focus:bg-secondary/80 rounded-lg text-sm">
                            <CheckCircle2 size={14} className="mr-2 text-muted-foreground" /> View Match
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState text="No completed matches yet." />
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
  completed.forEach(m => {
    if (m.stats?.ratings?.a) {
      ratingsMap[m.homeId] = (ratingsMap[m.homeId] || 0) + parseFloat(m.stats.ratings.a);
      countMap[m.homeId] = (countMap[m.homeId] || 0) + 1;
    }
    if (m.stats?.ratings?.b) {
      ratingsMap[m.awayId] = (ratingsMap[m.awayId] || 0) + parseFloat(m.stats.ratings.b);
      countMap[m.awayId] = (countMap[m.awayId] || 0) + 1;
    }
  });

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

  const categories = [
    { label: "Golden Boot", player: topScorer, stat: `${topScorer?.gf || 0} Goals`, icon: Target },
    { label: "Highest Rating", player: highestRatedPlayer, stat: `⭐ ${highestRatingVal.toFixed(1)}`, icon: Star },
    { label: "Most Wins", player: mostWins, stat: `${mostWins?.won || 0} Wins`, icon: Trophy },
    { label: "Best Defense", player: bestDefense, stat: `${bestDefense?.ga || 0} Goals Conceded`, icon: Shield }
  ];

  return (
    <Card className="p-6">
      <SectionTitle icon={Flame}>Top Players</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        {categories.map((cat, i) => (
          <FadeIn key={cat.label} delay={i * 0.1}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 bg-secondary/30 rounded-xl border border-border/50 h-full group hover:bg-secondary/50 transition-colors">
              <Avatar p={cat.player} size={42} className="ring-1 ring-border" />
              <div className="min-w-0 flex-1 w-full">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1">
                  <cat.icon size={10} /> {cat.label}
                </div>
                <div className="font-bold text-sm truncate" title={cat.player?.name}>{formatName(cat.player?.name || "—")}</div>
                <div className="text-xs font-score text-pitch-bright font-bold mt-1 truncate">{cat.stat}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Card>
  );
}

// 10. Dashboard Stats
function DashboardStatistics({ matches, activeSeason }) {
  if (!activeSeason) return null;
  const completed = matches.filter(m => m.seasonId === activeSeason.id && m.status === 'completed');
  const totalGoals = completed.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0);
  
  let totalCards = 0;
  let totalPoss = 0, possCount = 0;
  let totalRating = 0, ratingCount = 0;

  completed.forEach(m => {
    if (m.stats?.yellowCards?.a) totalCards += Number(m.stats.yellowCards.a);
    if (m.stats?.yellowCards?.b) totalCards += Number(m.stats.yellowCards.b);
    if (m.stats?.redCards?.a) totalCards += Number(m.stats.redCards.a);
    if (m.stats?.redCards?.b) totalCards += Number(m.stats.redCards.b);

    if (m.stats?.possession?.a) { totalPoss += Number(m.stats.possession.a); possCount++; }
    if (m.stats?.possession?.b) { totalPoss += Number(m.stats.possession.b); possCount++; }

    if (m.stats?.ratings?.a) { totalRating += parseFloat(m.stats.ratings.a); ratingCount++; }
    if (m.stats?.ratings?.b) { totalRating += parseFloat(m.stats.ratings.b); ratingCount++; }
  });

  const avgRatingStr = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "7.0";
  const maxPossStr = possCount > 0 ? `${Math.round(totalPoss / possCount)}%` : "50%";

  const stats = [
    { label: "Total Goals", value: totalGoals },
    { label: "Total Cards", value: totalCards },
    { label: "Average Rating", value: avgRatingStr },
    { label: "Avg Possession", value: maxPossStr }
  ];

  return (
    <Card className="p-6 h-full">
      <SectionTitle icon={BarChart2}>Season Statistics</SectionTitle>
      <div className="grid grid-cols-2 gap-4 mt-4 h-full pb-4">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center justify-center text-center p-4 bg-secondary/10 border border-border/30 rounded-lg">
            <div className="text-2xl font-bold font-score text-foreground mb-1">{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 11. Timeline
function DashboardTimeline({ activeSeason, matches }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const hasFixtures = tMatches.length > 0;
  const completedCount = tMatches.filter(m => m.status === 'completed').length;
  const hasPlayoffs = tMatches.some(m => m.round !== 'league');
  const isArchived = activeSeason.isArchived || activeSeason.status === 'Archived';

  const steps = [
    { label: "Season Created", active: true, desc: "Tournament initialized" },
    { label: "Fixtures Generated", active: hasFixtures, desc: "Schedule ready" },
    { label: "League Running", active: hasFixtures && completedCount > 0, desc: "Matches in progress" },
    { label: "Playoffs / Finals", active: hasPlayoffs || isArchived, desc: "Championship stage" }
  ];

  return (
    <Card className="p-6 h-full flex flex-col justify-center">
      <SectionTitle icon={Activity}>Season Timeline</SectionTitle>
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2 relative w-full">
        {/* Horizontal line for Desktop */}
        <div className="hidden sm:block absolute top-3 left-[12%] right-[12%] h-0.5 bg-border/60 z-0" />
        {/* Vertical line for Mobile */}
        <div className="sm:hidden absolute top-3 bottom-3 left-3 w-0.5 bg-border/60 z-0" />

        {steps.map((s, i) => (
          <div key={i} className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 flex-1 relative z-10 w-full sm:w-auto">
            <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${
              s.active ? 'bg-pitch border-pitch text-background shadow-lg shadow-pitch/20 ring-4 ring-pitch/20' : 'bg-secondary border-border/80 text-muted-foreground'
            }`}>
              <span className="text-[10px] font-bold">{i + 1}</span>
            </div>
            <div className="flex flex-col sm:items-center text-left sm:text-center min-w-0 flex-1 sm:w-full sm:px-1">
              <span className={`text-xs font-bold font-heading leading-tight break-words ${s.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              <span className="hidden md:block text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {s.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
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

// Main Component
export default function AdminOverviewDashboard({ players = [], activeSeason, matches = [], announcements = [], notifications = [], trophies = [], seasons = [], history = [], showToast, setTab }) {
  const [liveMatches, setLiveMatches] = useState(matches);
  const [prevMatchesProp, setPrevMatchesProp] = useState(matches);

  if (matches !== prevMatchesProp) {
    setPrevMatchesProp(matches);
    setLiveMatches(matches);
  }

  useEffect(() => {
    const channel = supabase.channel('league-events')
      .on('broadcast', { event: 'match_update' }, (payload) => {
        const matchData = payload.payload;
        setLiveMatches(prev => {
          const idx = prev.findIndex(m => m.id === matchData.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = matchData;
            return next;
          } else {
            return [...prev, matchData];
          }
        });
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
    <div className="flex flex-col gap-6">
      <HeroSeasonSummary activeSeason={activeSeason} players={players} matches={liveMatches} setTab={setTab} />
      <LiveMatchControl matches={liveMatches} players={players} activeSeason={activeSeason} showToast={showToast} />
      <AdminMetrics matches={liveMatches} activeSeason={activeSeason} notifications={notifications} setTab={setTab} />
      <QuickActions setTab={setTab} showToast={showToast} />

      <div className="mb-6">
        <StandingsTable matches={liveMatches} players={players} seasonId={activeSeason.id} config={activeSeason.config} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeagueSnapshot matches={liveMatches} players={players} activeSeason={activeSeason} setTab={setTab} />
        <RecentResults matches={liveMatches} players={players} activeSeason={activeSeason} showToast={showToast} />
      </div>

      <TopPlayersHorizontal matches={liveMatches} players={players} activeSeason={activeSeason} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardStatistics matches={liveMatches} activeSeason={activeSeason} />
        <DashboardTimeline activeSeason={activeSeason} matches={liveMatches} />
      </div>

      <TournamentControlPanel season={activeSeason} showToast={showToast} />
    </div>
  );
}
