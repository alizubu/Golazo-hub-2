'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Radio, Activity, ArrowRight, Shield, Flame, Swords, Target, Goal, TrendingUp, History, ListOrdered, Zap, PlusCircle, CheckCircle2, Megaphone, Clock, AlertTriangle, ChevronRight, BarChart2, Star, CalendarDays, PlayCircle, Edit2, Bell } from 'lucide-react';
import { Card, SectionTitle, EmptyState, MagicCard, FadeIn, Badge, Btn, Avatar } from './UI';
import { supabase } from '@/lib/supabaseClient';
import { BorderBeam } from './magicui/BorderBeam';
import { NumberTicker } from './ui/number-ticker';
import confetti from 'canvas-confetti';
import { computeStandings } from './StandingsTable';

// 1. Season Hero
function HeroSeasonSummary({ activeSeason, players, matches }) {
  if (!activeSeason) return null;
  const totalMatches = matches.filter(m => m.seasonId === activeSeason.id && m.round === "league").length;
  const completedMatches = matches.filter(m => m.seasonId === activeSeason.id && m.round === "league" && m.status === 'completed').length;
  const progress = totalMatches === 0 ? 0 : Math.round((completedMatches / totalMatches) * 100);
  const isCompleted = progress >= 100;
  const hasFixtures = totalMatches > 0;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-2xl p-6 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-pitch/20 via-background to-background pointer-events-none" />
      <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
        <Trophy size={200} />
      </div>
      <BorderBeam size={250} duration={12} delay={9} colorFrom="var(--pitch)" colorTo="var(--pitch-bright)" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-2">
              🏆 {activeSeason.name}
            </h1>
            {isCompleted ? (
              <Badge color="#1F8A5C">COMPLETED</Badge>
            ) : hasFixtures ? (
              <Badge color="var(--destructive)" pulse>LIVE</Badge>
            ) : (
              <Badge color="#D9A93B">DRAFT</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono mt-4">
            <div className="flex items-center gap-1.5"><Calendar size={14} /> Started: {new Date(activeSeason.createdAt).toLocaleDateString()}</div>
            <div>•</div>
            <div className="flex items-center gap-1.5"><Users size={14} /> Players: {players.length}</div>
            <div>•</div>
            <div className="flex items-center gap-1.5"><Radio size={14} /> Matches: {completedMatches} / {totalMatches}</div>
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider text-muted-foreground">
            <span>Season Progress</span>
            <span className="text-pitch-bright">{progress}%</span>
          </div>
          <div className="h-4 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-pitch to-pitch-bright relative"
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
            </motion.div>
          </div>
          <div className="text-right text-[10px] text-muted-foreground mt-1 font-mono">{completedMatches} / {totalMatches} Matches</div>
        </div>
      </div>
    </div>
  );
}

// 2. Admin Metrics
function AdminMetrics({ matches, activeSeason, unreadCount = 3 }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const liveMatchesCount = tMatches.filter(m => m.status === 'live').length;
  const matchesToday = 4;
  const pendingResults = 1;

  const metrics = [
    { label: "Live Matches", value: liveMatchesCount, icon: Radio, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Matches Today", value: matchesToday, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Results", value: pendingResults, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Unread Reports", value: unreadCount, icon: AlertTriangle, color: "text-pitch-bright", bg: "bg-pitch/10" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <FadeIn key={m.label} delay={i * 0.1}>
            <Card className="p-5 flex flex-col justify-between h-full hover:bg-secondary/20 transition-colors border-border/50">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${m.bg} ${m.color}`}>
                  <Icon size={16} />
                </div>
                <div className="text-2xl font-bold font-mono tracking-tighter">
                  <NumberTicker value={m.value} />
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mt-2">{m.label}</div>
            </Card>
          </FadeIn>
        );
      })}
    </div>
  );
}

// 3. Live Match Center
function LiveMatchCenter({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const liveMatch = tMatches.find(m => m.status === 'live');
  
  if (liveMatch) {
    const home = players.find(p => p.id === liveMatch.homeId);
    const away = players.find(p => p.id === liveMatch.awayId);
    
    const homePoss = 54;
    const awayPoss = 46;
    const homeShots = 8;
    const awayShots = 5;

    return (
      <FadeIn>
        <div className="relative rounded-2xl bg-gradient-to-b from-card to-secondary/30 border border-border shadow-xl p-0 overflow-hidden group">
          <BorderBeam size={200} duration={8} delay={0} colorFrom="var(--destructive)" colorTo="var(--gold)" />
          
          <div className="flex justify-between items-center p-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-destructive font-bold text-xs tracking-widest uppercase">
              <Radio size={14} className="animate-pulse" /> LIVE
            </div>
            <div className="text-xs font-bold bg-background px-3 py-1 rounded-full text-muted-foreground border border-border/50">
              72&apos;
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center gap-3 w-1/3">
                <Avatar p={home} size={80} className="ring-2 ring-pitch ring-offset-2 ring-offset-card shadow-lg" />
                <span className="font-bold text-base md:text-lg uppercase tracking-wide text-center">{home?.name}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-2 w-1/3">
                <div className="flex items-center justify-center gap-4 w-full">
                  <div className="text-5xl md:text-6xl font-display font-black text-pitch-bright w-12 text-center">{liveMatch.homeScore || 0}</div>
                  <div className="text-2xl font-mono text-muted-foreground/30 font-bold">VS</div>
                  <div className="text-5xl md:text-6xl font-display font-black text-white w-12 text-center">{liveMatch.awayScore || 0}</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 w-1/3">
                <Avatar p={away} size={80} className="ring-2 ring-claret ring-offset-2 ring-offset-card shadow-lg" />
                <span className="font-bold text-base md:text-lg uppercase tracking-wide text-center">{away?.name}</span>
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
                  <div style={{ width: `${(homeShots/(homeShots+awayShots))*100}%` }} className="bg-pitch/60" />
                  <div style={{ width: `${(awayShots/(homeShots+awayShots))*100}%` }} className="bg-claret/60" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Btn variant="outline" className="text-xs uppercase tracking-wider font-bold">Open Match Center <ChevronRight size={14} className="ml-1" /></Btn>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed border-border/50 bg-secondary/10">
      <Radio size={48} className="text-muted-foreground/30 mb-4" />
      <h3 className="text-lg font-bold">No Live Matches</h3>
      <p className="text-sm text-muted-foreground mt-1">Start a match from the Match Control panel to see it here.</p>
    </Card>
  );
}

// 4. Quick Actions
function QuickActions() {
  const actions = [
    { label: "Generate Fixtures", icon: CalendarDays, bg: "bg-blue-500/10 text-blue-500" },
    { label: "Start Match", icon: PlayCircle, bg: "bg-green-500/10 text-green-500" },
    { label: "Create Announcement", icon: Megaphone, bg: "bg-purple-500/10 text-purple-500" },
    { label: "Edit Season", icon: Edit2, bg: "bg-orange-500/10 text-orange-500" },
    { label: "Manage Players", icon: Users, bg: "bg-pink-500/10 text-pink-500" },
    { label: "Archive Season", icon: History, bg: "bg-zinc-500/10 text-zinc-400" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((act, i) => (
        <FadeIn key={act.label} delay={i * 0.05}>
          <button className="w-full flex flex-col items-center justify-center gap-3 p-4 bg-card border border-border/50 rounded-xl hover:bg-secondary/40 transition-colors group h-full">
            <div className={`p-3 rounded-full ${act.bg} group-hover:scale-110 transition-transform`}>
              <act.icon size={20} />
            </div>
            <span className="text-xs font-semibold text-center leading-tight">{act.label}</span>
          </button>
        </FadeIn>
      ))}
    </div>
  );
}

// 5. League Snapshot
function LeagueSnapshot({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const standings = computeStandings(matches, players, activeSeason.id).slice(0, 3);

  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={ListOrdered}>League Snapshot</SectionTitle>
      <div className="flex-1 flex flex-col justify-center gap-4 py-4">
        {standings.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3">
              <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <span className="font-bold text-sm">{s.name}</span>
            </div>
            <div className="text-pitch-bright font-bold font-mono text-sm">{s.pts} pts</div>
          </div>
        ))}
        {standings.length === 0 && <EmptyState text="No matches played." />}
      </div>
      <div className="mt-auto border-t border-border/50 pt-4 flex justify-end">
        <button className="text-xs font-bold text-pitch-bright hover:text-white flex items-center transition-colors">
          View Full Standings <ArrowRight size={12} className="ml-1" />
        </button>
      </div>
    </Card>
  );
}

// 6. Upcoming Matches (Mini)
function UpcomingMatchesMini({ matches, players, activeSeason }) {
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
              <div key={m.id} className="flex flex-col p-3 rounded-lg bg-secondary/20 border border-border/30 gap-1.5 hover:bg-secondary/40 transition-colors cursor-pointer">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold truncate flex-1">{h?.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 bg-background rounded-full mx-2 border border-border/50">VS</span>
                  <span className="font-bold truncate flex-1 text-right">{a?.name}</span>
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
function RecentResults() {
  const results = [
    { home: "Ali", away: "Levi", hScore: 3, aScore: 1, time: "Today" },
    { home: "Saeed", away: "Nowshad", hScore: 2, aScore: 2, time: "Yesterday" },
  ];
  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={History}>Recent Match Results</SectionTitle>
      <div className="flex-1 flex flex-col justify-center gap-4 py-4">
        {results.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="font-bold text-sm min-w-[50px]">{r.home}</div>
              <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded font-bold border border-border/50">
                {r.hScore} - {r.aScore}
              </div>
              <div className="font-bold text-sm min-w-[50px] text-right">{r.away}</div>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{r.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 8. Notification Center
function NotificationCenter() {
  const notifs = [
    { icon: "🔴", title: "Match paused", desc: "Ali vs Levi", color: "border-l-red-500" },
    { icon: "🏆", title: "Trophy awarded", desc: "Golden Boot Updated", color: "border-l-gold" },
    { icon: "📢", title: "New Announcement", desc: "Week 5 Fixtures", color: "border-l-blue-500" }
  ];
  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={Bell}>Notifications</SectionTitle>
      <div className="flex-1 flex flex-col justify-center gap-3 py-4">
        {notifs.map((n, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 bg-secondary/10 border border-border/30 rounded-r-lg border-l-4 ${n.color}`}>
            <span className="text-base leading-none">{n.icon}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-sm leading-tight">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 9. Top Players
function TopPlayersHorizontal({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const standings = computeStandings(matches, players, activeSeason.id);
  if (standings.length === 0) return null;

  const topScorer = [...standings].sort((a, b) => b.gf - a.gf)[0];
  const mostWins = [...standings].sort((a, b) => b.won - a.won)[0];
  const bestDefense = [...standings].filter(s => s.played > 0).sort((a, b) => (a.ga / a.played) - (b.ga / b.played))[0] || standings[0];
  
  const mockRating = standings.length > 0 ? [...standings].sort((a, b) => ((b.pts * 2 + b.gd) - (a.pts * 2 + a.gd)))[0] : null;

  const categories = [
    { label: "Golden Boot", player: topScorer, stat: `${topScorer?.gf || 0} Goals`, icon: Target },
    { label: "Highest Rating", player: mockRating, stat: `⭐ 8.8`, icon: Star },
    { label: "Most Wins", player: mostWins, stat: `${mostWins?.won || 0} Wins`, icon: Trophy },
    { label: "Best Defense", player: bestDefense, stat: `${bestDefense?.ga || 0} Goals Conceded`, icon: Shield }
  ];

  return (
    <Card className="p-6">
      <SectionTitle icon={Flame}>Top Players</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {categories.map((cat, i) => (
          <FadeIn key={cat.label} delay={i * 0.1}>
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-border/50 h-full group hover:bg-secondary/50 transition-colors">
              <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-secondary border border-border flex items-center justify-center">
                {cat.player?.avatarImage ? <img src={cat.player.avatarImage} className="w-full h-full object-cover" alt="" /> : <span className="text-xl">{cat.player?.avatar || '👤'}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1">
                  <cat.icon size={10} /> {cat.label}
                </div>
                <div className="font-bold text-sm truncate">{cat.player?.name || "—"}</div>
                <div className="text-xs font-mono text-pitch-bright font-bold mt-1 truncate">{cat.stat}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Card>
  );
}

// 10. Dashboard Statistics
function DashboardStatistics() {
  const stats = [
    { label: "Goals", value: "46" },
    { label: "Yellow Cards", value: "5" },
    { label: "Average Rating", value: "7.8" },
    { label: "Most Possession", value: "58%" }
  ];
  return (
    <Card className="p-6 h-full">
      <SectionTitle icon={BarChart2}>Season Statistics</SectionTitle>
      <div className="grid grid-cols-2 gap-4 mt-4 h-full pb-4">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center justify-center text-center p-4 bg-secondary/10 border border-border/30 rounded-lg">
            <div className="text-2xl font-bold font-mono text-foreground mb-1">{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 11. Dashboard Timeline
function DashboardTimeline() {
  const steps = [
    { label: "Season Created", active: true },
    { label: "Fixtures Generated", active: true },
    { label: "League Running", active: true },
    { label: "Playoffs", active: false }
  ];
  return (
    <Card className="p-6 h-full flex flex-col justify-center">
      <SectionTitle icon={Activity}>Season Timeline</SectionTitle>
      <div className="flex justify-between items-center mt-12 mb-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/50 -translate-y-1/2 z-0" />
        <div className="absolute top-1/2 left-0 right-1/4 h-0.5 bg-pitch -translate-y-1/2 z-0" />
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3 z-10 relative bg-card px-2">
            <div className={`w-4 h-4 rounded-full border-2 ${s.active ? 'bg-pitch border-pitch ring-4 ring-pitch/20' : 'bg-secondary border-border'}`} />
            <span className={`absolute top-8 w-24 text-center text-[10px] uppercase font-bold tracking-wider ${s.active ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 12. Mini Calendar
function MiniCalendar() {
  return (
    <Card className="p-6 h-full flex flex-col">
      <SectionTitle icon={CalendarDays}>Schedule</SectionTitle>
      <div className="flex-1 flex flex-col gap-4 mt-4">
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Today</div>
          <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg border border-border/30">
            <span className="text-sm font-semibold">Ali vs Levi</span>
            <span className="text-xs font-mono font-bold text-pitch-bright">9 PM</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Tomorrow</div>
          <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg border border-border/30 opacity-70">
            <span className="text-sm font-semibold">Saeed vs Nowshad</span>
            <span className="text-xs font-mono font-bold">TBD</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Main Dashboard Component
export default function AdminOverviewDashboard({ players, activeSeason, matches, announcements = [] }) {
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
          }
          return prev;
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
        <h2 className="text-2xl font-bold font-display text-muted-foreground">No Active Tournament</h2>
        <p className="text-muted-foreground/70 mt-2">Go to the Tournament tab to create a new season.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <HeroSeasonSummary activeSeason={activeSeason} players={players} matches={liveMatches} />
      <AdminMetrics matches={liveMatches} activeSeason={activeSeason} />
      <LiveMatchCenter matches={liveMatches} players={players} activeSeason={activeSeason} />
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeagueSnapshot matches={liveMatches} players={players} activeSeason={activeSeason} />
        </div>
        <div className="lg:col-span-1">
          <UpcomingMatchesMini matches={liveMatches} players={players} activeSeason={activeSeason} />
        </div>
        <div className="lg:col-span-1">
          <MiniCalendar />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentResults />
        <NotificationCenter />
      </div>

      <TopPlayersHorizontal matches={liveMatches} players={players} activeSeason={activeSeason} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardStatistics />
        <DashboardTimeline />
      </div>
    </div>
  );
}
