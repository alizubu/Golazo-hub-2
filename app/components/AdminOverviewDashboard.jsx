'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Radio, Activity, ArrowRight, Shield, Flame, Swords, Target, Goal, TrendingUp, History, ListOrdered, Zap, PlusCircle, CheckCircle2, Megaphone, Clock, AlertTriangle, ChevronRight, BarChart2, Star, CalendarDays, PlayCircle, Edit2, Bell, MoreVertical } from 'lucide-react';
import { Card, SectionTitle, EmptyState, MagicCard, FadeIn, Badge, Btn, Avatar, toTitleCase } from './UI';
import { supabase } from '@/lib/supabaseClient';
import { BorderBeam } from './magicui/BorderBeam';
import { NumberTicker } from './ui/number-ticker';
import confetti from 'canvas-confetti';
import { computeStandings } from './StandingsTable';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { useRouter } from 'next/navigation';

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

          <div className="flex flex-col gap-2">
            <Btn variant="primary" onClick={() => setTab && setTab('admin-matches')} className="text-xs uppercase font-bold tracking-wider py-2 shadow-lg shadow-pitch/20 cursor-pointer">
              Manage Matches <ArrowRight size={14} className="ml-1" />
            </Btn>
            <Btn variant="outline" onClick={() => setTab && setTab('admin-season')} className="text-xs uppercase font-bold tracking-wider py-1.5 cursor-pointer">
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <FadeIn key={m.label} delay={i * 0.05}>
          <MagicCard 
            onClick={() => m.tab && setTab && setTab(m.tab)}
            className={`p-5 flex flex-col justify-between bg-card hover:bg-secondary/20 transition-all h-full ${m.tab ? 'cursor-pointer hover:border-white/20' : ''}`}
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
          </MagicCard>
        </FadeIn>
      ))}
    </div>
  );
}

// 3. Live Match Center (Banner)
function LiveMatchCenter({ matches, players, activeSeason, setTab }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const liveMatch = tMatches.find(m => m.status === 'live');
  
  if (liveMatch) {
    const home = players.find(p => p.id === liveMatch.homeId);
    const away = players.find(p => p.id === liveMatch.awayId);
    
    const homePoss = liveMatch.liveState?.possession?.home || liveMatch.stats?.possession?.a || 50;
    const awayPoss = liveMatch.liveState?.possession?.away || liveMatch.stats?.possession?.b || (100 - homePoss);
    const homeShots = liveMatch.liveState?.shots?.home || liveMatch.stats?.shots?.a || 0;
    const awayShots = liveMatch.liveState?.shots?.away || liveMatch.stats?.shots?.b || 0;
    const totalShots = (homeShots + awayShots) || 1;
    const timeDisplay = liveMatch.liveState?.clock ? `${liveMatch.liveState.clock}'` : (liveMatch.liveState?.phase === 'first' ? '1st Half' : liveMatch.liveState?.phase === 'second' ? '2nd Half' : liveMatch.liveState?.phase === 'extra' ? 'AET' : liveMatch.liveState?.phase === 'penalties' ? 'PENS' : 'LIVE');

    return (
      <FadeIn>
        <div className="relative rounded-2xl bg-gradient-to-b from-card to-secondary/30 border border-border shadow-xl p-0 overflow-hidden group">
          <BorderBeam size={200} duration={8} delay={0} colorFrom="var(--destructive)" colorTo="var(--gold)" />
          
          <div className="flex justify-between items-center p-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-destructive font-bold text-xs tracking-widest uppercase">
              <Radio size={14} className="animate-pulse" /> LIVE
            </div>
            <div className="text-xs font-bold bg-background px-3 py-1 rounded-full text-muted-foreground border border-border/50">
              {timeDisplay}
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center gap-3 w-1/3">
                <Avatar p={home} size={80} className="ring-2 ring-pitch ring-offset-2 ring-offset-card shadow-lg" />
                <span className="font-bold text-base md:text-lg tracking-wide text-center truncate w-full px-1" title={home?.name}>{toTitleCase(home?.name)}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-2 w-1/3">
                <div className="flex items-center justify-center gap-4 w-full">
                  <div className="text-5xl md:text-6xl font-heading font-black text-pitch-bright w-12 text-center">{liveMatch.homeScore || 0}</div>
                  <div className="text-2xl font-score text-muted-foreground/30 font-bold">VS</div>
                  <div className="text-5xl md:text-6xl font-heading font-black text-white w-12 text-center">{liveMatch.awayScore || 0}</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 w-1/3">
                <Avatar p={away} size={80} className="ring-2 ring-claret ring-offset-2 ring-offset-card shadow-lg" />
                <span className="font-bold text-base md:text-lg tracking-wide text-center truncate w-full px-1" title={away?.name}>{toTitleCase(away?.name)}</span>
              </div>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  <span>{homePoss}%</span>
                  <span>Possession</span>
                  <span>{awayPoss}%</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-background">
                  <div style={{ width: `${homePoss}%` }} className="bg-pitch" />
                  <div style={{ width: `${awayPoss}%` }} className="bg-claret" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  <span>{homeShots}</span>
                  <span>Shots</span>
                  <span>{awayShots}</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-background">
                  <div style={{ width: `${(homeShots/totalShots)*100}%` }} className="bg-pitch/60" />
                  <div style={{ width: `${(awayShots/totalShots)*100}%` }} className="bg-claret/60" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Btn variant="outline" onClick={() => setTab && setTab('admin-matches')} className="text-xs uppercase tracking-wider font-bold cursor-pointer">Open Match Center <ChevronRight size={14} className="ml-1" /></Btn>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-dashed border-border/60 bg-secondary/10">
      <div className="flex items-center gap-3.5 text-center sm:text-left">
        <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground/50 shrink-0">
          <Radio size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold font-heading text-foreground">No Live Matches Active</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Start a fixture from Match Control to broadcast live stats and scores.</p>
        </div>
      </div>
      <Btn onClick={() => setTab && setTab('admin-matches')} variant="outline" className="text-xs uppercase tracking-wider font-bold shrink-0 cursor-pointer border-border/80 hover:bg-secondary">
        Go to Match Control <ChevronRight size={14} className="ml-1" />
      </Btn>
    </Card>
  );
}

// 4. Action Grid
function QuickActions({ setTab, showToast }) {
  const actions = [
    { label: "Generate Fixtures", icon: CalendarDays, bg: "bg-blue-500/10 text-blue-500", onClick: () => setTab ? setTab("admin-season") : showToast?.("Go to Season tab") },
    { label: "Start Match", icon: PlayCircle, bg: "bg-green-500/10 text-green-500", onClick: () => setTab ? setTab("admin-matches") : showToast?.("Go to Matches tab") },
    { label: "Create Announcement", icon: Megaphone, bg: "bg-purple-500/10 text-purple-500", onClick: () => setTab ? setTab("admin-announcements") : showToast?.("Go to Announcements tab") },
    { label: "Edit Season", icon: Edit2, bg: "bg-orange-500/10 text-orange-500", onClick: () => setTab ? setTab("admin-season") : showToast?.("Go to Season tab") },
    { label: "Manage Players", icon: Users, bg: "bg-pink-500/10 text-pink-500", onClick: () => setTab ? setTab("admin-players") : showToast?.("Go to Players tab") },
    { label: "Manage Trophies", icon: Trophy, bg: "bg-gold/10 text-gold", onClick: () => setTab ? setTab("admin-trophies") : showToast?.("Go to Trophies tab") }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((act, i) => (
        <FadeIn key={act.label} delay={i * 0.05}>
          <button onClick={act.onClick} className="w-full h-full min-h-[110px] flex flex-col items-center justify-start p-4 bg-card border border-border/60 rounded-xl hover:bg-secondary/30 hover:border-white/20 transition-all group cursor-pointer shadow-sm">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mb-2.5 ${act.bg} group-hover:scale-105 transition-transform`}>
              <act.icon size={20} />
            </div>
            <span className="text-xs font-bold text-center leading-snug line-clamp-2 text-foreground/90 group-hover:text-foreground mt-auto flex items-center justify-center flex-1">{act.label}</span>
          </button>
        </FadeIn>
      ))}
    </div>
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
  const [editingMatch, setEditingMatch] = useState(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const router = useRouter();

  if (!activeSeason) return null;
  const completed = matches
    .filter(m => m.seasonId === activeSeason.id && m.status === 'completed')
    .slice(-4)
    .reverse();

  const handleEditSave = async () => {
    if(!editingMatch) return;
    try {
      const res = await fetch(`/api/matches/${editingMatch.id}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeScore, awayScore })
      });
      const data = await res.json();
      if (!data.success) {
        showToast?.(data.error || 'Failed to update score');
      } else {
        showToast?.("Score updated!");
        router.refresh();
      }
    } catch (err) {
      showToast?.("Failed to update score.");
    } finally {
      setEditingMatch(null);
    }
  };

  const handleRematch = async (m) => {
    try {
      const res = await fetch(`/api/matches/${m.id}/rematch`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        showToast?.(data.error || 'Failed to create rematch');
      } else {
        showToast?.(data.message || `Rematch scheduled!`);
        router.refresh();
      }
    } catch (err) {
      showToast?.("Failed to create rematch.");
    }
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={History}>Recent Match Results</SectionTitle>

      {/* Edit Score Dialog */}
      <AnimatePresence>
        {editingMatch && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-card border border-border p-6 rounded-2xl w-full max-w-sm shadow-xl">
                <h3 className="font-heading font-bold text-lg mb-2 text-white">Edit Score</h3>
                <p className="text-xs text-claret mb-6">Warning: Editing this score will recalculate standings and stats. Continue?</p>
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-sm font-bold truncate mb-3 text-white">{players.find(p=>p.id===editingMatch.homeId)?.name}</span>
                      <input type="number" value={homeScore} onChange={e=>setHomeScore(Number(e.target.value))} className="w-20 bg-background/50 border border-border rounded-lg text-center text-4xl font-score font-bold text-pitch-bright p-2 outline-none focus:ring-2 focus:ring-pitch" />
                    </div>
                    <span className="text-3xl text-muted-foreground/30 font-score">-</span>
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-sm font-bold truncate mb-3 text-white">{players.find(p=>p.id===editingMatch.awayId)?.name}</span>
                      <input type="number" value={awayScore} onChange={e=>setAwayScore(Number(e.target.value))} className="w-20 bg-background/50 border border-border rounded-lg text-center text-4xl font-score font-bold text-white p-2 outline-none focus:ring-2 focus:ring-pitch" />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Btn variant="outline" onClick={() => setEditingMatch(null)}>Cancel</Btn>
                    <Btn onClick={handleEditSave} className="bg-pitch text-pitch-foreground hover:bg-pitch-bright">Save Corrected Score</Btn>
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

                {/* Actions Menu */}
                <div className="absolute right-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-card/80 backdrop-blur-sm rounded-md shadow-sm border border-border/50">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground transition-colors"><MoreVertical size={16}/></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 border-border bg-popover shadow-xl rounded-xl">
                         <DropdownMenuItem className="cursor-pointer hover:bg-secondary/80 focus:bg-secondary/80 rounded-lg text-sm" onSelect={(e) => { e.preventDefault(); setEditingMatch(m); setHomeScore(m.homeScore||0); setAwayScore(m.awayScore||0); }}>
                            <Edit2 size={14} className="mr-2 text-muted-foreground" /> Edit Score
                         </DropdownMenuItem>
                         <DropdownMenuItem className="cursor-pointer hover:bg-secondary/80 focus:bg-secondary/80 rounded-lg text-sm" onSelect={(e) => { e.preventDefault(); if(window.confirm('Schedule a rematch?')) handleRematch(m); }}>
                            <History size={14} className="mr-2 text-muted-foreground" /> Rematch
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
    items.push({
      icon: "📢",
      title: a.title,
      desc: a.content || "New league announcement",
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
    const channel = supabase.channel('matches-page')
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
      <AdminMetrics matches={liveMatches} activeSeason={activeSeason} notifications={notifications} setTab={setTab} />
      <LiveMatchCenter matches={liveMatches} players={players} activeSeason={activeSeason} setTab={setTab} />
      <QuickActions setTab={setTab} showToast={showToast} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeagueSnapshot matches={liveMatches} players={players} activeSeason={activeSeason} setTab={setTab} />
        </div>
        <div className="lg:col-span-1">
          <UpcomingMatchesMini matches={liveMatches} players={players} activeSeason={activeSeason} setTab={setTab} />
        </div>
        <div className="lg:col-span-1">
          <MiniCalendar matches={liveMatches} players={players} activeSeason={activeSeason} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentResults matches={liveMatches} players={players} activeSeason={activeSeason} />
        <NotificationCenter notifications={notifications} announcements={announcements} matches={liveMatches} />
      </div>

      <TopPlayersHorizontal matches={liveMatches} players={players} activeSeason={activeSeason} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardStatistics matches={liveMatches} activeSeason={activeSeason} />
        <DashboardTimeline activeSeason={activeSeason} matches={liveMatches} />
      </div>
    </div>
  );
}
