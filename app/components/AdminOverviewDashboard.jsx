'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Radio, Activity, ArrowRight, Shield, Flame, Swords, Target, Goal, TrendingUp, History, ListOrdered } from 'lucide-react';
import { Card, SectionTitle, EmptyState, MagicCard, FadeIn, Badge, Btn } from './UI';
import { supabase } from '@/lib/supabaseClient';
import { BorderBeam } from './magicui/BorderBeam';
import { NumberTicker } from './ui/number-ticker';
import confetti from 'canvas-confetti';
import { computeStandings } from './StandingsTable';

// 1. Hero Section
function HeroSeasonSummary({ activeSeason, players, matches }) {
  if (!activeSeason) return null;
  const totalMatches = matches.filter(m => m.seasonId === activeSeason.id && m.round === "league").length;
  const completedMatches = matches.filter(m => m.seasonId === activeSeason.id && m.round === "league" && m.status === 'completed').length;
  const progress = totalMatches === 0 ? 0 : Math.round((completedMatches / totalMatches) * 100);
  const isCompleted = progress >= 100;
  const hasFixtures = totalMatches > 0;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-2xl p-6 md:p-8">
      {/* Abstract Banner Background */}
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

// 2. Live Match Center (Priority #1)
function LiveMatchCenter({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const liveMatch = tMatches.find(m => m.status === 'live');
  const scheduledMatches = tMatches.filter(m => m.status === 'scheduled');
  
  if (liveMatch) {
    const home = players.find(p => p.id === liveMatch.homeId);
    const away = players.find(p => p.id === liveMatch.awayId);
    return (
      <FadeIn>
        <div className="relative rounded-2xl bg-card border border-border shadow-xl p-6 overflow-hidden group">
          <BorderBeam size={150} duration={8} delay={0} colorFrom="var(--claret)" colorTo="var(--gold)" />
          <div className="flex justify-between items-center mb-4">
            <SectionTitle icon={Radio}>Live Now</SectionTitle>
            <Badge color="var(--destructive)" pulse>LIVE</Badge>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-border overflow-hidden bg-secondary">
                {home?.avatarImage ? <img src={home.avatarImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-2xl">{home?.avatar}</span>}
              </div>
              <span className="font-bold text-sm uppercase tracking-wide">{home?.name}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4 text-4xl md:text-5xl font-display font-bold tracking-tighter">
                <span className="text-pitch-bright">{liveMatch.homeScore || 0}</span>
                <span className="text-muted-foreground text-2xl">-</span>
                <span className="text-pitch-bright">{liveMatch.awayScore || 0}</span>
              </div>
              {liveMatch.liveState?.phase === 'extra' && <span className="text-xs font-bold text-claret bg-claret/10 px-2 py-0.5 rounded">AET</span>}
              {liveMatch.liveState?.phase === 'penalties' && <span className="text-xs font-bold text-claret bg-claret/10 px-2 py-0.5 rounded">PENS</span>}
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-border overflow-hidden bg-secondary">
                {away?.avatarImage ? <img src={away.avatarImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-2xl">{away?.avatar}</span>}
              </div>
              <span className="font-bold text-sm uppercase tracking-wide">{away?.name}</span>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (scheduledMatches.length > 0) {
    const nextMatch = scheduledMatches[0];
    const home = players.find(p => p.id === nextMatch.homeId);
    const away = players.find(p => p.id === nextMatch.awayId);
    return (
      <FadeIn>
        <Card className="p-6 border-border shadow-md">
          <SectionTitle icon={Calendar}>Next Match</SectionTitle>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-secondary/30 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3 w-full sm:w-1/3 justify-end sm:justify-end">
              <span className="font-bold text-sm uppercase text-right">{home?.name}</span>
              <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                {home?.avatarImage ? <img src={home.avatarImage} className="w-full h-full object-cover" /> : <span>{home?.avatar}</span>}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-muted-foreground px-3 py-1 bg-background rounded-full">VS</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-1/3 justify-start sm:justify-start">
              <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                {away?.avatarImage ? <img src={away.avatarImage} className="w-full h-full object-cover" /> : <span>{away?.avatar}</span>}
              </div>
              <span className="font-bold text-sm uppercase text-left">{away?.name}</span>
            </div>
          </div>
        </Card>
      </FadeIn>
    );
  }

  return null;
}

// 3. Quick Stats
function QuickStats({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id);
  const completedMatches = tMatches.filter(m => m.status === 'completed');
  const totalGoals = completedMatches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0);
  const avgGoals = completedMatches.length > 0 ? (totalGoals / completedMatches.length).toFixed(1) : "0.0";

  const stats = [
    { label: "Total Players", value: players.length, icon: Users },
    { label: "Matches Played", value: completedMatches.length, icon: Radio },
    { label: "Goals Scored", value: totalGoals, icon: Goal },
    { label: "Avg Goals / Match", value: avgGoals, icon: TrendingUp }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <FadeIn key={stat.label} delay={i * 0.1}>
            <Card className="p-5 flex flex-col items-center justify-center text-center h-full hover:bg-secondary/20 transition-colors">
              <div className="p-2 bg-secondary/50 rounded-full mb-3 text-pitch-bright">
                <Icon size={18} />
              </div>
              <div className="text-2xl md:text-3xl font-bold font-mono tracking-tighter">
                {typeof stat.value === 'number' ? <NumberTicker value={stat.value} /> : stat.value}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-semibold">{stat.label}</div>
            </Card>
          </FadeIn>
        );
      })}
    </div>
  );
}

// 4. League Standings (Top 5)
function CompactStandings({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const standings = computeStandings(matches, players, activeSeason.id).slice(0, 5);

  return (
    <Card className="p-6">
      <SectionTitle icon={ListOrdered}>League Standings</SectionTitle>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead>
            <tr className="text-muted-foreground text-[10px] uppercase tracking-wider border-b border-border/50">
              <th className="p-3 font-semibold text-center w-8">Rank</th>
              <th className="p-3 font-semibold">Player</th>
              <th className="p-2 text-center font-semibold text-pitch-bright">Pts</th>
              <th className="p-2 text-center font-semibold">GD</th>
              <th className="p-2 text-center font-semibold">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="p-3 text-center font-bold text-muted-foreground">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </td>
                <td className="p-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-secondary">
                    {s.avatarImage ? <img src={s.avatarImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-[10px]">{s.avatar}</span>}
                  </div>
                  <span className="font-bold text-sm">{s.name}</span>
                </td>
                <td className="p-2 text-center font-bold text-pitch-bright text-base">{s.pts}</td>
                <td className="p-2 text-center font-mono text-muted-foreground">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                <td className="p-2 text-center font-mono text-[10px] text-muted-foreground">
                  {s.won}-{s.drawn}-{s.lost}
                </td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No matches played yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-4 border-t border-border/50 flex justify-center">
        <span className="text-xs text-muted-foreground">Navigate to Tournament to view full table</span>
      </div>
    </Card>
  );
}

// 5. Upcoming Fixtures
function UpcomingFixtures({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const tMatches = matches.filter(m => m.seasonId === activeSeason.id && m.status === 'scheduled');
  const upcoming = tMatches.slice(0, 5);

  return (
    <Card className="p-6">
      <SectionTitle icon={Calendar}>Upcoming Fixtures</SectionTitle>
      <div className="flex flex-col gap-3 mt-4">
        {upcoming.length > 0 ? (
          upcoming.map((m) => {
            const h = players.find(p => p.id === m.homeId);
            const a = players.find(p => p.id === m.awayId);
            return (
              <div key={m.id} className="flex flex-col p-3 rounded-xl bg-secondary/30 border border-border/50 gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs truncate flex-1">{h?.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 bg-background rounded-full mx-2">VS</span>
                  <span className="font-bold text-xs truncate flex-1 text-right">{a?.name}</span>
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

// 6. Top Players
function TopPlayers({ matches, players, activeSeason }) {
  if (!activeSeason) return null;
  const standings = computeStandings(matches, players, activeSeason.id);
  if (standings.length === 0) return null;

  const topScorer = [...standings].sort((a, b) => b.gf - a.gf)[0];
  const mostWins = [...standings].sort((a, b) => b.won - a.won)[0];
  // Best Defense -> least GA
  const bestDefense = [...standings].filter(s => s.played > 0).sort((a, b) => (a.ga / a.played) - (b.ga / b.played))[0] || standings[0];
  // Best GD -> proxy for Most Assists/Best Overall contribution
  const bestGD = [...standings].sort((a, b) => b.gd - a.gd)[0];

  const categories = [
    { label: "Top Scorer", player: topScorer, stat: `${topScorer?.gf || 0} Goals`, icon: Target },
    { label: "Most Wins", player: mostWins, stat: `${mostWins?.won || 0} Wins`, icon: Trophy },
    { label: "Best Defense", player: bestDefense, stat: `${bestDefense?.ga || 0} GA`, icon: Shield },
    { label: "Highest GD", player: bestGD, stat: `+${bestGD?.gd || 0} GD`, icon: Flame }
  ];

  return (
    <Card className="p-6">
      <SectionTitle icon={Flame}>Top Players</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {categories.map((cat, i) => (
          <FadeIn key={cat.label} delay={i * 0.1}>
            <div className="flex flex-col items-center text-center p-4 bg-secondary/30 rounded-xl border border-border/50 h-full">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3 flex items-center gap-1">
                <cat.icon size={12} /> {cat.label}
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary border border-border mb-2">
                {cat.player?.avatarImage ? <img src={cat.player.avatarImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-xl">{cat.player?.avatar}</span>}
              </div>
              <div className="font-bold text-sm mb-1">{cat.player?.name || "—"}</div>
              <div className="text-xs font-mono text-pitch-bright font-bold">{cat.stat}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Card>
  );
}

// 7. Activity Feed (Realtime)
function ActivityFeed({ events }) {
  return (
    <Card className="p-6 flex flex-col h-full border-border">
      <SectionTitle icon={Activity}>Recent Activity</SectionTitle>
      {events.length === 0 ? (
        <EmptyState text="No recent activity." />
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 mt-4">
          <AnimatePresence>
            {events.map((ev, i) => (
              <motion.div 
                key={ev.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-sm flex gap-3 items-start"
              >
                <div className="mt-0.5 p-1.5 bg-background rounded-full"><History size={12} className="text-pitch-bright" /></div>
                <div>
                  <div className="font-medium">{ev.message}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{ev.time}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}

// 8. Participants
function ParticipantsChips({ players }) {
  return (
    <Card className="p-6">
      <SectionTitle icon={Users}>Participants</SectionTitle>
      <div className="flex flex-wrap gap-2 mt-4">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border border-border/50 rounded-full">
            <span className={`w-2 h-2 rounded-full ${p.onlineStatus === 'online' ? 'bg-green-500' : 'bg-green-500/50'}`}></span>
            <span className="text-sm font-semibold">{p.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 9. Champion Celebration (Keep this from original)
function ChampionCelebration({ activeSeason, players }) {
  const [shown, setShown] = useState(false);
  
  useEffect(() => {
    if (activeSeason?.status === 'Archived' && activeSeason?.championId && !shown) {
      const champion = players.find(p => p.id === activeSeason.championId);
      if (champion) {
        setShown(true);
        // Fire confetti
        const end = Date.now() + 3 * 1000;
        const colors = ['#f59e0b', '#fbbf24', '#ffffff'];
        
        (function frame() {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });
        
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    }
  }, [activeSeason, players, shown]);

  if (!activeSeason || activeSeason.status !== 'Archived' || !activeSeason.championId) return null;
  const champion = players.find(p => p.id === activeSeason.championId);
  if (!champion) return null;

  return (
    <FadeIn>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gold/20 via-background to-background border border-gold/30 shadow-2xl p-8 flex flex-col items-center text-center my-6">
        <BorderBeam size={300} duration={10} colorFrom="#f59e0b" colorTo="#fcd34d" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-4"
        >
          <img src="/assets/trophies/BB-Champion.png" alt="Trophy" className="w-32 h-32 object-contain drop-shadow-2xl" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
          SEASON CHAMPION
        </h2>
        <div className="flex items-center gap-3 bg-secondary/80 px-6 py-2 rounded-full border border-border mt-2">
          {champion.avatarImage ? <img src={champion.avatarImage} className="w-8 h-8 rounded-full" /> : <span className="text-xl">{champion.avatar}</span>}
          <span className="font-bold text-lg">{champion.name}</span>
        </div>
      </div>
    </FadeIn>
  );
}

// Main Dashboard Component
export default function AdminOverviewDashboard({ players, activeSeason, matches, announcements = [] }) {
  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const [liveMatches, setLiveMatches] = useState(matches);

  useEffect(() => {
    setLiveMatches(matches);
  }, [matches]);

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
        
        setRealtimeEvents(prev => [{
          id: Date.now(),
          message: `Match Update: Score changed to ${matchData.homeScore}-${matchData.awayScore}`,
          time: 'Just now'
        }, ...prev].slice(0, 10));
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
      <ChampionCelebration activeSeason={activeSeason} players={players} />
      
      <div className="grid grid-cols-1 gap-6">
        <LiveMatchCenter matches={liveMatches} players={players} activeSeason={activeSeason} />
        <QuickStats matches={liveMatches} players={players} activeSeason={activeSeason} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CompactStandings matches={liveMatches} players={players} activeSeason={activeSeason} />
          <TopPlayers matches={liveMatches} players={players} activeSeason={activeSeason} />
        </div>
        <div className="flex flex-col gap-6">
          <UpcomingFixtures matches={liveMatches} players={players} activeSeason={activeSeason} />
          <ParticipantsChips players={players} />
          <ActivityFeed events={realtimeEvents} />
        </div>
      </div>
    </div>
  );
}
