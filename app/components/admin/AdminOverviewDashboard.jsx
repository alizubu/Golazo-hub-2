'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Radio, Activity, ArrowRight, Shield, Flame, Swords, Target, Goal, TrendingUp, History, ListOrdered, Zap, PlusCircle, CheckCircle2, Megaphone, Clock, AlertTriangle, ChevronRight, BarChart2, Star, CalendarDays, PlayCircle, Edit2, Bell, MoreVertical, ShieldAlert, Camera, Loader2 } from 'lucide-react';
import { Card, SectionTitle, EmptyState, MagicCard, FadeIn, Badge, Btn, Avatar, toTitleCase, WavingFlag } from '@/app/components/shared/UI';
import { supabase } from '@/lib/supabaseClient';
import { CLUBS } from '@/lib/data/clubs';
import { NATIONAL_TEAMS } from '@/lib/data/national-teams';
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
  
  const passesMap = {};

  completed.forEach(m => {
    if (m.stats?.successfulPasses?.a) {
      passesMap[m.homeId] = (passesMap[m.homeId] || 0) + parseInt(m.stats.successfulPasses.a, 10);
    }
    if (m.stats?.successfulPasses?.b) {
      passesMap[m.awayId] = (passesMap[m.awayId] || 0) + parseInt(m.stats.successfulPasses.b, 10);
    }
  });

  let mostPassesPlayer = null;
  let highestPassesVal = 0;

  standings.forEach(s => {
    if ((passesMap[s.id] || 0) >= highestPassesVal) {
      highestPassesVal = passesMap[s.id] || 0;
      mostPassesPlayer = s;
    }
  });

  if (!mostPassesPlayer && standings.length > 0) mostPassesPlayer = standings[0];

  const categories = [
    { label: "Golden Boot", player: topScorer, stat: `${topScorer?.gf || 0}`, statLabel: "Goals", icon: Target, color: "text-[#ffb703]", borderTop: "border-t-[#ffb703]", glow: "from-[#ffb703]/10 via-[#ffb703]/5 to-transparent", rankNum: "1" },
    { label: "Most Wins", player: mostWins, stat: `${mostWins?.won || 0}`, statLabel: "Wins", icon: Trophy, color: "text-[#2dc653]", borderTop: "border-t-[#2dc653]", glow: "from-[#2dc653]/10 via-[#2dc653]/5 to-transparent", rankNum: "2" },
    { label: "Best Defense", player: bestDefense, stat: bestDefense && bestDefense.played > 0 ? (bestDefense.ga / bestDefense.played).toFixed(1) : "0.0", statLabel: "Goals Conceded", icon: Shield, color: "text-[#00b4d8]", borderTop: "border-t-[#00b4d8]", glow: "from-[#00b4d8]/10 via-[#00b4d8]/5 to-transparent", rankNum: "3" },
    { label: "Most Passes", player: mostPassesPlayer, stat: `${highestPassesVal}`, statLabel: "Successful Passes", icon: Zap, color: "text-[#f48c06]", borderTop: "border-t-[#f48c06]", glow: "from-[#f48c06]/10 via-[#f48c06]/5 to-transparent", rankNum: "4" }
  ];

  return (
    <div className="w-full flex flex-col mb-4 sm:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {categories.map((cat) => (
          <div key={cat.label} className="w-full h-full">
            <div className={`relative flex flex-col p-5 rounded-[16px] bg-[#0c0e12] border border-border/20 border-t-2 ${cat.borderTop} transition-all duration-300 cursor-pointer h-[240px] justify-between group overflow-hidden shadow-lg hover:-translate-y-1`}>
              
              {/* Subtle Gradient Glow */}
              <div className={`absolute inset-0 bg-gradient-to-b ${cat.glow} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none z-0`} />

              {/* Oversized Background Icon */}
              <div className={`absolute -right-4 -bottom-4 opacity-[0.06] group-hover:opacity-[0.10] transition-opacity pointer-events-none z-0 rotate-[-15deg] ${cat.color} group-hover:scale-110 duration-500`}>
                <cat.icon size={150} strokeWidth={1} />
              </div>
              
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="relative flex items-center justify-center w-[24px] h-[26px]">
                  <svg viewBox="0 0 24 24" className={`absolute inset-0 w-full h-full ${cat.color}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <polygon points="12 2 22 8 22 16 12 22 2 16 2 8 12 2" />
                  </svg>
                  <span className="text-[11px] font-black z-10 text-white mt-px">{cat.rankNum}</span>
                </div>
                <span className={`text-[12px] font-bold uppercase tracking-[0.15em] ${cat.color}`}>{cat.label}</span>
              </div>

              {/* Player Info & Big Stat */}
              <div className="flex flex-col justify-end relative z-10 mt-auto h-full gap-3">
                <div className="flex items-center gap-3 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">
                  <Avatar p={cat.player} size={60} className="border-2 border-border/50 shadow-sm rounded-full shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[15px] leading-tight text-foreground group-hover:text-white transition-colors line-clamp-2">
                      {cat.player?.name || "—"}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 opacity-95">
                      {(() => {
                        const badgePref = cat.player?.displayBadgePreference || 'club';
                        let displayType = null;
                        if (badgePref === 'club' && cat.player?.favoriteClub) displayType = 'club';
                        else if (badgePref === 'nation' && cat.player?.flag) displayType = 'nation';
                        else if (cat.player?.favoriteClub) displayType = 'club';
                        else if (cat.player?.flag) displayType = 'nation';

                        return displayType === 'club' ? (
                          <>
                            <img src={CLUBS.find(c => c.name === cat.player.favoriteClub)?.crestPath} alt="club" className="h-6 w-auto object-contain drop-shadow-md shrink-0" />
                            <span className="text-[11px] leading-tight text-muted-foreground font-semibold line-clamp-2">{cat.player.favoriteClub}</span>
                          </>
                        ) : displayType === 'nation' ? (
                          <>
                            <div className="shrink-0">
                              <WavingFlag code={NATIONAL_TEAMS.find(n => n.name === cat.player.flag)?.isoCode} size="md" />
                            </div>
                            <span className="text-[11px] leading-tight text-muted-foreground font-semibold line-clamp-2">{cat.player.flag}</span>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col leading-none">
                  <span className={`font-score font-bold text-[42px] ${cat.color} brightness-110 tracking-tighter drop-shadow-sm`}>{cat.stat}</span>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1">{cat.statLabel}</span>
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
    
    // Allow a tick for React to re-render any responsive classes bound to isExportingSnapshot
    await new Promise(r => setTimeout(r, 50));
    
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

  const completedMatchesCount = liveMatches.filter(m => m.seasonId === activeSeason?.id && m.status === 'completed' && m.round === 'league').length;
  const totalGoalsCount = liveMatches.filter(m => m.seasonId === activeSeason?.id && m.status === 'completed' && m.round === 'league').reduce((acc, m) => acc + (Number(m.homeScore) || 0) + (Number(m.awayScore) || 0), 0);

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


      {/* End of Season Stats (Top Players + Summary) */}
      <div id="season-wrap-up" ref={summarySnapshotRef} className="w-full relative bg-[#0a0c10] border border-border/20 rounded-[20px] p-6 mb-6" style={{ background: isExportingSnapshot ? '#0a0c10' : '#0a0c10' }}>
        
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('/img/stadium-texture.png')] bg-cover bg-center opacity-[0.02] pointer-events-none rounded-[20px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start mb-8 pb-4 gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <Trophy size={32} className="text-white opacity-80" />
              <h2 className="text-3xl font-black font-heading tracking-tight uppercase text-white m-0 leading-none">
                Season Wrap-Up
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-sm ml-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  SEASON COMPLETE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-muted-foreground font-semibold pl-1">
              <div className="flex items-center gap-1.5"><Calendar size={14} /> {completedMatchesCount} Matches</div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5"><Target size={14} /> {totalGoalsCount} Goals</div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5"><Users size={14} /> {players.length} Players</div>
            </div>
          </div>
          
          <button 
            onClick={handleExportSnapshot}
            disabled={isExportingSnapshot}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            {isExportingSnapshot ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {isExportingSnapshot ? 'Capturing...' : 'Snapshot'}
          </button>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <TopPlayersHorizontal matches={liveMatches} players={players} activeSeason={activeSeason} />

          <div className="w-full">
            <div className="flex items-center gap-2 mb-4 pl-1">
              <h3 className="text-[14px] font-bold uppercase tracking-[0.1em] text-white/80">Season Summary</h3>
            </div>
            <SeasonSummaryDashboard season={activeSeason} matches={liveMatches} players={players} />
          </div>
        </div>
      </div>


      <TournamentControlPanel season={activeSeason} showToast={showToast} session={session} managerPermissions={managerPermissions} />
    </div>
  );
}
