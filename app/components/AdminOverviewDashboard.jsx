'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Radio, Clock, Check, Activity, Shield, Flame, Swords, ArrowRight, Megaphone } from 'lucide-react';
import { Card, SectionTitle, EmptyState, MagicCard, FadeIn, Badge } from './UI';
import { supabase } from '@/lib/supabaseClient';
import { BorderBeam } from './magicui/BorderBeam';
import { NumberTicker } from './ui/number-ticker';
import confetti from 'canvas-confetti';

// --- Subcomponents ---

// 1. Hero Season Summary
function HeroSeasonSummary({ activeSeason, players, matches }) {
  if (!activeSeason) return null;
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const progress = totalMatches === 0 ? 0 : Math.round((completedMatches / totalMatches) * 100);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-2xl p-6 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-pitch/10 to-transparent pointer-events-none" />
      <BorderBeam size={250} duration={12} delay={9} colorFrom="var(--pitch)" colorTo="var(--pitch-bright)" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
              🏆 {activeSeason.name}
            </h1>
            <Badge color="var(--destructive)" pulse>LIVE</Badge>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {players.length} Players • {completedMatches}/{totalMatches} Matches Completed
          </p>
        </div>
        
        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider text-muted-foreground">
            <span>League Progress</span>
            <span className="text-pitch-bright">{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-pitch to-pitch-bright"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Live Match Center
function LiveMatchCenter({ matches, players }) {
  const liveMatches = matches.filter(m => m.status === 'live');
  if (liveMatches.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle icon={Radio}>Live Match Center</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {liveMatches.map((m, i) => {
          const home = players.find(p => p.id === m.homeId);
          const away = players.find(p => p.id === m.awayId);
          return (
            <FadeIn key={m.id} delay={i * 0.1}>
              <div className="relative rounded-2xl bg-card border border-border shadow-xl p-6 overflow-hidden group">
                <BorderBeam size={150} duration={8} delay={i} colorFrom="var(--claret)" colorTo="var(--gold)" />
                <div className="absolute top-4 right-4"><Badge color="var(--destructive)" pulse>LIVE</Badge></div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-border overflow-hidden bg-secondary">
                      {home?.avatarImage ? <img src={home.avatarImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-2xl">{home?.avatar}</span>}
                    </div>
                    <span className="font-bold text-sm">{home?.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-4xl md:text-5xl font-display font-bold tracking-tighter">
                    <span className="text-pitch-bright">{m.homeScore || 0}</span>
                    <span className="text-muted-foreground text-2xl">-</span>
                    <span className="text-pitch-bright">{m.awayScore || 0}</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-border overflow-hidden bg-secondary">
                      {away?.avatarImage ? <img src={away.avatarImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-2xl">{away?.avatar}</span>}
                    </div>
                    <span className="font-bold text-sm">{away?.name}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}

// 3. Player Cards (ShineBorder simplified via MagicCard hover)
function PlayerCards({ players }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle icon={Users}>Roster</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {players.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <MagicCard className="p-4 flex flex-col items-center text-center gap-2 group cursor-default">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border border-border overflow-hidden bg-secondary shadow-md transition-transform group-hover:scale-105">
                  {p.avatarImage ? <img src={p.avatarImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-xl">{p.avatar}</span>}
                </div>
                {p.onlineStatus === 'online' && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />}
              </div>
              <div>
                <div className="font-bold text-sm truncate w-full">{p.name}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{p.teamName}</div>
              </div>
            </MagicCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// 4. Activity Feed (Realtime)
function ActivityFeed({ events }) {
  return (
    <Card className="p-5 flex flex-col h-full border-border">
      <SectionTitle icon={Activity}>Activity Feed</SectionTitle>
      {events.length === 0 ? (
        <EmptyState text="No recent activity." />
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
          <AnimatePresence>
            {events.map((ev, i) => (
              <motion.div 
                key={ev.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-sm flex gap-3 items-start"
              >
                <div className="mt-0.5"><Activity size={14} className="text-pitch-bright" /></div>
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

// 5. Champion Celebration
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

// 6. Marquee Announcements
function MarqueeAnnouncements({ announcements }) {
  if (!announcements || announcements.length === 0) return null;
  return (
    <div className="w-full overflow-hidden bg-pitch/10 border-y border-pitch/20 py-2 my-4 flex relative group">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
      <motion.div 
        className="flex whitespace-nowrap gap-12 px-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 15, repeat: Infinity }}
      >
        {/* Duplicate list for seamless loop */}
        {[...announcements, ...announcements].map((a, i) => (
          <span key={i} className="text-xs font-bold text-pitch-bright tracking-wider uppercase flex items-center gap-2">
            <Megaphone size={12} /> {a.title}: <span className="text-foreground font-medium normal-case">{a.content}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// 7. Main Dashboard Component
export default function AdminOverviewDashboard({ players, activeSeason, matches, announcements = [] }) {
  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const [liveMatches, setLiveMatches] = useState(matches);

  useEffect(() => {
    if (matches !== liveMatches) {
      setTimeout(() => setLiveMatches(matches), 0);
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  return (
    <div className="flex flex-col gap-6">
      <HeroSeasonSummary activeSeason={activeSeason} players={players} matches={liveMatches} />
      <MarqueeAnnouncements announcements={announcements} />
      <ChampionCelebration activeSeason={activeSeason} players={players} />
      <LiveMatchCenter matches={liveMatches} players={players} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlayerCards players={players} />
        </div>
        <div>
          <ActivityFeed events={realtimeEvents} />
        </div>
      </div>
      
      {/* League Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
        {[
          { label: "Total Goals", value: liveMatches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0) },
          { label: "Matches Played", value: liveMatches.filter(m => m.status === 'completed').length },
          { label: "Avg Goals/Match", value: (liveMatches.filter(m => m.status === 'completed').length > 0 ? (liveMatches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0) / liveMatches.filter(m => m.status === 'completed').length).toFixed(1) : 0) },
          { label: "Active Players", value: players.length }
        ].map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1}>
            <Card className="p-5 flex flex-col items-center justify-center text-center h-full">
              <div className="text-2xl md:text-3xl font-bold font-mono tracking-tighter text-pitch-bright">
                <NumberTicker value={Number(stat.value)} />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-semibold">{stat.label}</div>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
