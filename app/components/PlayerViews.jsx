'use client';

import React from 'react';
import { PageHeader } from './PageHeader';
import { Trophy, Clock, ListOrdered, Calendar, Swords, Megaphone, Bell, Pen, Target, Handshake, Shield, Activity, Lock, Flame, BadgeCheck, TrendingUp, Users } from 'lucide-react';
import { Btn, Badge, Avatar, PlayerChip, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Label } from './UI';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { NumberTicker } from './ui/number-ticker';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SettingsView from './SettingsView';
import MatchesPage from './MatchesPage';
import MatchCard from './MatchCard';
import MatchStatsModal from './MatchStatsModal';
import TrophyDetailModal from './TrophyDetailModal';
import HeadToHeadModal from './HeadToHeadModal';

import StatChip from './StatChip';
import { SeasonStats } from './SeasonStats';
import { BorderBeam } from './magicui/BorderBeam';
import { markNotificationsRead } from '@/app/actions/player';
import { Skeleton } from '@/app/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/components/ui/hover-card';
import { computeStandings } from './StandingsTable';
import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';

const clubs = clubsData.map(c => ({ ...c, subtitle: `${c.league}, ${c.country}` }));
const nationalTeams = nationalTeamsData.map(nt => ({ ...nt, subtitle: nt.confederation }));

export default function PlayerViews(props) {
  const [selectedMatchId, setSelectedMatchId] = React.useState(null);
  const [h2hTargetId, setH2hTargetId] = React.useState(null);

  const handleMatchClick = (id) => setSelectedMatchId(id);
  const handleCloseModal = () => setSelectedMatchId(null);
  const handleH2HClick = (id) => {
    if (id !== props.me?.id) {
      setH2hTargetId(id);
    }
  };

  const newProps = { ...props, onMatchClick: handleMatchClick, onH2HClick: handleH2HClick };
  const { tab, me, players, matches } = props;

  const h2hTarget = players.find(p => p.id === h2hTargetId);

  return (
    <>
      {tab === "dashboard" && <PlayerDashboard {...newProps} />}
      {tab === "matches" && <><PageHeader title="Matches" onBack={() => props.setTab('dashboard')} /><div className="p-4 sm:p-8"><MatchesPage {...newProps} /></div></>}
      {tab === "players" && <RosterView {...newProps} />}
      {tab === "history" && <HistoryView {...newProps} />}
      {tab === "notifications" && <NotificationsView {...newProps} />}
      {tab === "settings" && <SettingsView {...newProps} />}
      
      {selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}
      {h2hTarget && <HeadToHeadModal playerA={me} playerB={h2hTarget} allMatches={matches} onClose={() => setH2hTargetId(null)} onMatchClick={handleMatchClick} players={players} />}
    </>
  );
}



function LiveScoreboard({ m, players }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  return (
    <MagicCard className="p-5 bg-gradient-to-br from-surface-3 to-surface border-claret/30">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Badge color="var(--claret)" pulse>LIVE</Badge>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <Avatar p={h} size={56} />
          <span className="text-sm font-semibold truncate text-center">{h?.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 px-2">
          <NumberTicker value={m.homeScore ?? 0} className="text-5xl font-bold font-score text-foreground" />
          <span className="text-3xl opacity-40 font-score">-</span>
          <NumberTicker value={m.awayScore ?? 0} className="text-5xl font-bold font-score text-foreground" />
        </div>
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <Avatar p={a} size={56} />
          <span className="text-sm font-semibold truncate text-center">{a?.name}</span>
        </div>
      </div>
    </MagicCard>
  );
}

function OldMatchCard({ m, players }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  return (
    <MagicCard className="flex items-center justify-between p-4 bg-secondary">
      <div className="flex-1 min-w-0"><PlayerChip p={h} size={20} /></div>
      <div className="px-4 text-center shrink-0">
        {m.status === "completed" ? (
          <div>
            <div className="font-bold text-xl font-score text-pitch-bright">{m.homeScore} – {m.awayScore}</div>
            <div className="flex items-center gap-1 justify-center mt-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">FT</span>
            </div>
          </div>
        ) : m.status === "live" ? (
          <div>
            <Badge color="var(--claret)" pulse>LIVE</Badge>
            <div className="font-bold text-xl mt-1 font-score text-foreground">
              <span className="score-pop">{m.homeScore ?? 0}</span> – <span className="score-pop">{m.awayScore ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-score font-medium">TBD</div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex justify-end"><PlayerChip p={a} size={20} /></div>
    </MagicCard>
  );
}

function CircularProgress({ value, color = "var(--pitch-bright)", label }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="40" cy="40" r={radius} fill="transparent" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <motion.circle 
            cx="40" cy="40" r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute font-score font-bold text-lg">{value}%</div>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
    </div>
  );
}

export function PlayerDashboard({ me, activeSeason, seasons = [], matches, players, announcements = [], trophies = [], notifications = [], setTab, persistPlayers, onMatchClick, viewOnly, onH2HClick }) {
  const router = useRouter();
  const [selectedSeasonId, setSelectedSeasonId] = React.useState(activeSeason?.id);
  const [statsLoaded, setStatsLoaded] = React.useState(false);
  const [failedCoverUrl, setFailedCoverUrl] = React.useState(null);
  const [selectedTrophy, setSelectedTrophy] = React.useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setStatsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    async function syncProfile() {
      if (!me) return;
      try {
        const res = await fetch(`/api/user/profile?id=${me.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.player) {
            const dbPlayer = data.player;
            if (dbPlayer.avatarImage !== me.avatarImage || dbPlayer.coverBanner !== me.coverBanner) {
              const newPlayers = players.map(p => p.id === me.id ? { ...p, avatarImage: dbPlayer.avatarImage, coverBanner: dbPlayer.coverBanner } : p);
              if (persistPlayers) persistPlayers(newPlayers);
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync profile', err);
      }
    }
    syncProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  // ── Guard: admin viewing player tabs has me === null ──────────────────────
  // ALL code below assumes me is a player object. If me is null (admin viewOnly),
  // bail out early before any me.id access crashes the render.
  if (!me) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
        <Users size={52} className="opacity-30" />
        <div className="text-center">
          <p className="font-bold text-foreground/70 text-lg">No Player Selected</p>
          <p className="text-sm mt-1">You&apos;re viewing as admin. Player dashboards are only visible when logged in as a player.</p>
        </div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────
  const t = seasons.find(s => s.id === selectedSeasonId) || activeSeason;
  const tMatches = t ? matches.filter((m) => m.seasonId === t.id) : [];
  const standings = t ? computeStandings(tMatches, players, t.id) : [];
  const myRank = standings.findIndex((s) => s.id === me.id) + 1;
  const myRow = standings.find((s) => s.id === me.id);
  
  const myMatches = tMatches.filter((m) => (m.homeId === me.id || m.awayId === me.id) && m.status === 'completed');
  const myLive = tMatches.filter((m) => m.status === "live" && (m.homeId === me.id || m.awayId === me.id));
  const upcoming = tMatches.filter((m) => m.status === "scheduled" && (m.homeId === me.id || m.awayId === me.id)).slice(0, 1);
  const nextMatch = upcoming[0];
  const recent = [...myMatches].sort((a,b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)).slice(0, 5);
  
  const getMatchResult = (m) => {
    if (!m) return null;
    const isHome = m.homeId === me.id;
    const myScore = isHome ? Number(m.homeScore) : Number(m.awayScore);
    const oppScore = isHome ? Number(m.awayScore) : Number(m.homeScore);
    if (myScore > oppScore) return 'W';
    if (myScore < oppScore) return 'L';
    return 'D';
  };
  const getOpponent = (m) => {
    const oppId = m.homeId === me.id ? m.awayId : m.homeId;
    return players.find(p => p.id === oppId);
  };

  const form = recent.map(getMatchResult).reverse();
  const played = myRow?.played || 0;
  const won = myRow?.won || 0;
  const goals = myRow?.gf || 0;
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
  const myTrophies = trophies.filter(tr => tr.playerId === me.id);
  const elo = 1200 + ((myRow?.pts || 0) * 15);
  const assists = me.assists || Math.round(goals * 0.4);

  const selectedClub = clubs.find(c => c.name === me.favoriteClub);
  const selectedNationalTeam = nationalTeams.find(nt => nt.name === me.flag);



  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {announcements.length > 0 && (
        <FadeIn delay={0.05}>
          <div className="flex flex-col gap-3">
            {announcements.map((ann) => (
              <MagicCard key={ann.id} className="p-4 bg-secondary/80 border-pitch/50 border-l-4 border-l-pitch backdrop-blur-sm">
                <div className="flex gap-3">
                  <Megaphone className="text-pitch-bright shrink-0" size={20} />
                  <div className="w-full overflow-hidden">
                    <div className="font-bold text-sm">{ann.title}</div>
                    <div 
                      className="text-sm text-muted-foreground mt-1 max-w-none" 
                      dangerouslySetInnerHTML={{ __html: ann.content }} 
                    />
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Hero Profile Card */}
      <FadeIn delay={0.1}>
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-2xl flex flex-col">
          {/* Cover Banner */}
          <div className="h-48 md:h-56 w-full relative bg-secondary/50 overflow-hidden flex-shrink-0">
            {me.coverBanner && failedCoverUrl !== me.coverBanner ? (
              <img src={me.coverBanner} alt="Cover Banner" className="w-full h-full object-cover" onError={() => setFailedCoverUrl(me.coverBanner)} />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-pitch/80 via-claret/60 to-gold/40 flex items-center justify-center">
                <span className="text-6xl drop-shadow-2xl opacity-50">⚽</span>
              </div>
            )}


          </div>

          {/* Profile Body */}
          <div className="px-6 md:px-10 pb-8 pt-4 relative bg-card flex-1">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start justify-between relative z-20">
              
              {/* LEFT COLUMN: Identity & Stats */}
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full md:w-auto">
                
                {/* Avatar */}
                <div className="-mt-16 md:-mt-20 relative z-30 flex-shrink-0">
                  <div className="relative inline-block">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold via-pitch-bright to-claret animate-spin [animation-duration:4s] blur-[1px] opacity-80" />
                    <div className="relative rounded-full p-1 bg-card shadow-xl">
                      <Avatar p={me} size={100} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center md:items-start gap-1 pt-1 min-w-0">
                  
                  {/* Name + Rank Badge */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full"
                  >
                    <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight flex items-center gap-2 truncate">
                      {me.name}
                      {myRank === 1 && <BadgeCheck size={22} className="text-blue-400 shrink-0" title="Top Ranked Player" />}
                    </h1>
                    {myRank > 0 && (
                      <Badge className="shrink-0 bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 shadow-sm text-sm font-bold flex items-center gap-1.5">
                        <Trophy size={12} className="text-amber-500" />
                        #{myRank}
                      </Badge>
                    )}
                  </motion.div>

                  {/* Handle Row */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-muted-foreground font-score text-sm mb-3"
                  >
                    @{me.username}
                  </motion.div>

                  {/* Stat Chips Row */}
                  {played > 0 && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4 w-full">
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <StatChip icon={Swords} value={played} label="Matches" />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.24 }}>
                        <StatChip icon={Trophy} value={won} label="Wins" />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28 }}>
                        <StatChip icon={TrendingUp} value={`${winRate}%`} label="Win Rate" />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.32 }}>
                        <StatChip icon={Target} value={goals} label="Goals" />
                      </motion.div>
                    </div>
                  )}

                  {/* Identity Badges Row (Club & Nation) */}
                  {(selectedClub || selectedNationalTeam) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-wrap items-center justify-center md:justify-start gap-2 w-full"
                    >
                      {selectedClub && (
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md border border-border/50 text-xs font-semibold shadow-sm">
                          <span className="text-muted-foreground">Favorite Club:</span> {selectedClub.name}
                        </div>
                      )}
                      {selectedNationalTeam && (
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md border border-border/50 text-xs font-semibold shadow-sm">
                          <span className="text-muted-foreground">Favorite Team:</span> {selectedNationalTeam.name}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Divider for desktop */}
              <div className="hidden md:block w-px h-24 bg-border/40 shrink-0 self-center mx-2" />
              {/* Divider for mobile */}
              <div className="md:hidden w-full h-px bg-border/40 my-2" />

              {/* RIGHT COLUMN: Status Panel */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto pt-2 md:pt-0 shrink-0"
              >
                {/* Online Status */}
                {!viewOnly && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Online now
                  </div>
                )}

                {/* FORM Indicator */}
                {form.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-full border border-border/40 shadow-inner">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mr-1">Form</span>
                    {form.map((r, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + (i * 0.05), type: 'spring' }}
                        title={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Draw'}
                        className={`w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0 ${
                          r === 'W' ? 'bg-green-500' : r === 'L' ? 'bg-red-500' : 'bg-amber-400'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Edit Profile Button */}
                {!viewOnly && (
                  <Btn variant="outline" onClick={() => setTab('settings')} className="gap-2 rounded-xl border-border/50 text-xs shadow-sm bg-background hover:bg-secondary w-full md:w-auto mt-1 h-10 md:h-8">
                    <Pen size={14} /> Edit Profile
                  </Btn>
                )}
              </motion.div>
              
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
        <SeasonStats 
          playerId={me.id}
          initialStats={{ rank: myRank, elo, played, winRate, goals, assists }}
          seasons={seasons}
          activeSeason={activeSeason}
          selectedSeasonId={selectedSeasonId}
          onSeasonChange={setSelectedSeasonId}
        />

        {/* Trophy Cabinet Row */}
        <FadeIn delay={0.25} className="col-span-12">
          <MagicCard gradientColor="rgba(251, 191, 36, 0.15)">
            <Card className="bg-transparent border-none shadow-none">
              {(() => {
                // Combine hardcoded templates, db templates, and all unique awarded trophies in the game
                const templateMap = new Map();

                // 0. Add the 6 official hardcoded trophies
                const HARDCODED_TROPHIES = [
                  { id: 'bb-champion', name: 'BB Champion', icon: '/assets/trophies/BB-Champion.png', requirement: 'Champion of the BB League season.' },
                  { id: 'world-cup', name: 'World Cup Winner', icon: '/assets/trophies/World-Cup-Winner-Trophy.png', requirement: 'Won the World Cup season.' },
                  { id: 'golden-boot', name: 'Golden Boot', icon: '/assets/trophies/Golden-boot.png', requirement: 'Top goalscorer of the season.' },
                  { id: 'mvp', name: 'MVP', icon: '/assets/trophies/MVP.png', requirement: 'Most Valuable Player of the season.' },
                  { id: 'la-liga', name: 'La Liga Champion', icon: '/assets/trophies/La-Liga-trophy.png', requirement: 'La Liga season champion.' },
                  { id: 'premier-league', name: 'Premier League Champion', icon: '/assets/trophies/Premier-League.png', requirement: 'Premier League season champion.' },
                ];
                
                HARDCODED_TROPHIES.forEach(t => {
                  templateMap.set(t.name, {
                    id: t.id,
                    name: t.name,
                    image: t.icon,
                    locked: true,
                    requirement: t.requirement
                  });
                });
                // 2. Add any unique trophies awarded to ANY player (so users see what's out there)
                trophies.forEach(t => {
                  if (!templateMap.has(t.title)) {
                    templateMap.set(t.title, {
                      id: t.id, // Just use the instance ID as a key
                      name: t.title,
                      image: t.icon || '🏆',
                      locked: true,
                      requirement: t.description || 'Locked'
                    });
                  }
                });

                const trophyList = Array.from(templateMap.values());

                const earnedTrophies = trophyList.filter(tr => {
                  const instances = myTrophies.filter(t => t.title === tr.name || t.id === tr.id);
                  return instances.length > 0 || !tr.locked;
                });

                return (
                  <>
                    <CardHeader className="pb-3 border-b border-stadium-subtle/50 flex flex-row items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-heading font-bold flex items-center gap-2.5 text-stadium-primary">
                        <Trophy className="text-amber-400" size={20}/> Trophy Cabinet
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="gold" className="px-2.5 py-1 font-score text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {myTrophies.length} TROPHIES
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {earnedTrophies.length === 0 ? (
                        <EmptyState text="No trophies earned yet." />
                      ) : (
                        <motion.div 
                          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 w-full min-w-0" 
                          variants={{hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } }}} 
                          initial="hidden" 
                          whileInView="show" 
                          viewport={{ once: true }}
                        >
                          {earnedTrophies.map((tr) => {
                            const instances = myTrophies.filter(t => t.title === tr.name || t.id === tr.id);
                            const isUnlocked = instances.length > 0 || !tr.locked;

                            return (
                              <TrophyCard 
                                key={tr.id} 
                                trophy={tr} 
                                unlocked={isUnlocked} 
                                count={instances.length} 
                                instances={instances}
                                requirement={tr.requirement}
                                onSelect={() => setSelectedTrophy({
                                  trophy: tr,
                                  unlocked: isUnlocked,
                                  count: instances.length,
                                  instances,
                                  requirement: tr.requirement
                                })}
                              />
                            );
                          })}
                        </motion.div>
                      )}
                    </CardContent>
                  </>
                );
              })()}
            </Card>
          </MagicCard>
        </FadeIn>

        {/* Live Matches */}
        {myLive.map((m, i) => (
          <FadeIn key={m.id} delay={0.3} className="col-span-12">
            <MatchCard m={m} players={players} onClick={onMatchClick} />
          </FadeIn>
        ))}

        {/* Remaining Dashboard Widgets */}
        <FadeIn delay={0.35} className="col-span-12 md:col-span-7 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur overflow-hidden flex flex-col">
            <SectionTitle icon={ListOrdered}>League Standings</SectionTitle>
            <div className="overflow-x-auto mt-2 flex-1">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase tracking-wider border-b border-border/50">
                    <th className="pb-2 font-semibold w-8">#</th>
                    <th className="pb-2 font-semibold">Player</th>
                    <th className="pb-2 text-center font-semibold">P</th>
                    <th className="pb-2 text-center font-semibold">W</th>
                    <th className="pb-2 text-center font-semibold">L</th>
                    <th className="pb-2 text-center font-semibold">GD</th>
                    <th className="pb-2 text-center font-semibold text-pitch-bright">Pts</th>
                    <th className="pb-2 text-center font-semibold w-24">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.slice(0, 5).map((s, i) => {
                    const isTop4 = i < 4;
                    const rowBorderClass = isTop4 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent';
                    
                    return (
                      <tr key={s.id} className={`border-b border-border/30 last:border-0 ${s.id === me.id ? 'bg-white/5' : ''} ${rowBorderClass}`}>
                        <td className="py-2.5 font-bold font-score text-center">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-muted-foreground">{i + 1}</span>}
                        </td>
                        <td className="py-2.5"><PlayerChip p={s} size={20} /></td>
                        <td className="py-2.5 text-center text-muted-foreground">{s.played}</td>
                        <td className="py-2.5 text-center text-muted-foreground">{s.won}</td>
                        <td className="py-2.5 text-center text-muted-foreground">{s.lost}</td>
                        <td className="py-2.5 text-center text-muted-foreground">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                        <td className="py-2.5 text-center font-bold text-pitch-bright">{s.pts}</td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {s.form.slice(-3).map((resObj, idx) => {
                              const res = typeof resObj === 'object' && resObj !== null ? resObj.result : resObj;
                              return (
                                <span key={idx} className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold text-white
                                  ${res === 'W' ? 'bg-emerald-500' : res === 'D' ? 'bg-slate-400' : 'bg-red-500'}
                                `}>
                                  {res}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </MagicCard>
        </FadeIn>

        <FadeIn delay={0.4} className="col-span-12 md:col-span-5 h-full">
          <MagicCard className="h-full p-6 flex flex-col bg-card/50 backdrop-blur">
            <SectionTitle icon={Calendar}>Upcoming Fixture</SectionTitle>
            <div className="flex-1 flex flex-col justify-center">
              {nextMatch ? (
                <div className="flex flex-col items-center bg-secondary/50 rounded-2xl p-6 border border-border/50 shadow-inner">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 text-center flex flex-col gap-1">
                    <span>Matchday {nextMatch.matchday || 1}</span>
                    <span className="text-pitch-bright">{nextMatch.scheduledAt ? new Date(nextMatch.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit'}) : 'Date TBD'}</span>
                    <span className="text-destructive animate-pulse">Starts in 2 hours</span>
                  </div>
                  <div className="flex items-center justify-center gap-6 w-full mb-4">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <Avatar p={players.find(p => p.id === nextMatch.homeId)} size={56} />
                      <span className="font-bold text-sm truncate w-full text-center">{players.find(p => p.id === nextMatch.homeId)?.name}</span>
                    </div>
                    <div className="font-score text-xl text-muted-foreground font-bold">VS</div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <Avatar p={players.find(p => p.id === nextMatch.awayId)} size={56} />
                      <span className="font-bold text-sm truncate w-full text-center">{players.find(p => p.id === nextMatch.awayId)?.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold w-full mt-2 pt-3 border-t border-border/50">
                    <span>🏟️ Wembley Stadium</span>
                    <span>👨‍⚖️ Ref: Mike Dean</span>
                  </div>
                  <Btn variant="primary" className="mt-4 w-full text-xs" onClick={() => setTab('matches')}>View All Fixtures</Btn>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-4xl mb-4 opacity-50">🎉</span>
                  <div className="font-semibold text-foreground">No upcoming fixtures.</div>
                  <div className="text-sm text-muted-foreground mt-1">Enjoy your break!</div>
                </div>
              )}
            </div>
          </MagicCard>
        </FadeIn>

        <FadeIn delay={0.45} className="col-span-12 md:col-span-7 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur flex flex-col">
            <SectionTitle icon={Clock}>Last Five Matches</SectionTitle>
            <div className="flex flex-col gap-2 flex-1 justify-center">
              {recent.length > 0 ? recent.map((m, i) => {
                const res = getMatchResult(m);
                const opp = getOpponent(m);
                const isHome = m.homeId === me.id;
                const myScore = isHome ? m.homeScore : m.awayScore;
                const oppScore = isHome ? m.awayScore : m.homeScore;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white ${res === 'W' ? 'bg-green-500' : res === 'L' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                      {res === 'W' ? '✅' : res === 'L' ? '❌' : '➖'}
                    </div>
                    <div className="text-sm font-semibold flex-1 flex items-center gap-1">
                      {res === 'W' ? 'Won' : res === 'L' ? 'Lost' : 'Draw'} 
                      <span className="font-score text-muted-foreground ml-1">{myScore}–{oppScore}</span> 
                      <span className="text-muted-foreground mx-1">vs</span> 
                      <span className="truncate max-w-[100px]">{opp?.name}</span>
                    </div>
                  </div>
                );
              }) : (
                <EmptyState text="No completed matches yet." />
              )}
            </div>
          </MagicCard>
        </FadeIn>

        <FadeIn delay={0.5} className="col-span-12 md:col-span-5 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur flex flex-col">
            <SectionTitle icon={Calendar}>Season Progress</SectionTitle>
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <CircularProgress 
                value={myRow ? Math.round((myRow.played / (players.length * 2 - 2)) * 100) || 0 : 0} 
                label="Matches Played" 
                color="var(--gold)"
              />
              <div className="text-sm mt-6 text-center text-muted-foreground">
                <span className="font-bold text-foreground">{myRow?.played || 0}</span> out of <span className="font-bold text-foreground">{players.length * 2 - 2}</span> matches completed
              </div>
            </div>
          </MagicCard>
        </FadeIn>
      </div>
    </div>
  );
}

function StandingsView({ activeSeason, matches, players, me }) {
  const router = useRouter();
  if (!activeSeason) return <EmptyState text="No active season yet." />;
  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id);
  const standings = computeStandings(tMatches, players, activeSeason.id);
  
  return (
    <FadeIn delay={0.1}>
      <Card className="p-5">
        <SectionTitle icon={ListOrdered}>{activeSeason.name} — Table</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-muted-foreground text-[11px] uppercase tracking-wider border-b border-border/50">
                <th className="p-3 font-semibold">#</th>
                <th className="p-3 font-semibold text-center w-8">Change</th>
                <th className="p-3 font-semibold">Player</th>
                <th className="p-3 text-center font-semibold">P</th>
                <th className="p-3 text-center font-semibold">W</th>
                <th className="p-3 text-center font-semibold">D</th>
                <th className="p-3 text-center font-semibold">L</th>
                <th className="p-3 text-center font-semibold">GF</th>
                <th className="p-3 text-center font-semibold">GA</th>
                <th className="p-3 text-center font-semibold">GD</th>
                <th className="p-3 text-center font-semibold text-pitch-bright">Pts</th>
                <th className="p-3 text-center font-semibold">Form</th>
                <th className="p-3 text-center font-semibold">Streak</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  key={s.id}
                  onClick={() => router.push(`/player/${s.username || s.id}`)}
                  className={`border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer ${s.id === me.id ? 'bg-pitch/10 hover:bg-pitch/20' : ''}`}
                >
                  <td className="p-3 font-medium text-muted-foreground">{i + 1}</td>
                  <td className="p-3 text-center text-[10px] font-bold">
                    {s.posChange === '▲' ? <span className="text-green-500">▲</span> : s.posChange === '▼' ? <span className="text-red-500">▼</span> : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <Avatar p={s} size={24} />
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-lg">{s.flag}</span>
                  </td>
                  <td className="p-3 text-center">{s.played}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.won}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.drawn}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.lost}</td>
                  <td className="p-3 text-center">{s.gf}</td>
                  <td className="p-3 text-center">{s.ga}</td>
                  <td className="p-3 text-center font-score">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                  <td className="p-3 text-center font-bold text-pitch-bright text-base">{s.pts}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {s.form.map((f, i) => (
                        <span key={i} className={`w-3 h-3 rounded-full ${f === 'W' ? 'bg-green-500' : f === 'L' ? 'bg-red-500' : 'bg-amber-400'}`} title={f}></span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center font-score text-xs">
                    {s.streak > 0 ? <span className="text-green-500">W{s.streak}</span> : s.streak < 0 ? <span className="text-red-500">L{Math.abs(s.streak)}</span> : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </FadeIn>
  );
}

function MatchesView({ activeSeason, matches, players, onMatchClick }) {
  if (!activeSeason) return <EmptyState text="No active season yet." />;
  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === "league");
  return (
    <FadeIn delay={0.1}>
      <Card className="p-5">
        <SectionTitle icon={Calendar}>All Matches</SectionTitle>
        <div className="flex flex-col gap-3">
          {tMatches.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <MatchCard onClick={onMatchClick} m={m} players={players} />
            </motion.div>
          ))}
        </div>
      </Card>
    </FadeIn>
  );
}



export function RosterView({ players, matches, setTab }) {
  const router = useRouter();
  const matchWinnerId = (m) => {
    if (!m || m.status !== "completed") return null;
    if (m.homeScore > m.awayScore) return m.homeId;
    if (m.awayScore > m.homeScore) return m.awayId;
    if (m.penaltyWinner) return m.penaltyWinner === "home" ? m.homeId : m.awayId;
    return null;
  };
  const matchLoserId = (m) => {
    const w = matchWinnerId(m);
    if (!w) return null;
    return w === m.homeId ? m.awayId : m.homeId;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <PageHeader title="Roster" onBack={() => setTab('dashboard')} />
        <Badge variant="outline" className="px-2 py-0.5 rounded-full text-xs font-score font-semibold border-border/50 text-muted-foreground mt-1">
          {players.length} Players
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((p, i) => {
          const pm = matches.filter((m) => m.status === "completed" && (m.homeId === p.id || m.awayId === p.id));
          const wins = pm.filter((m) => matchWinnerId(m) === p.id).length;
          const losses = pm.filter((m) => matchLoserId(m) === p.id).length;
          const draws = pm.length - wins - losses;
          const golds = matches.filter((m) => m.round === "final" && m.status === "completed" && matchWinnerId(m) === p.id).length;
          
          return (
            <FadeIn key={p.id} delay={i * 0.05}>
              <MagicCard onClick={() => router.push(`/player/${p.username || p.id}`)} className="p-5 flex items-center gap-4 hover:border-border hover:scale-[1.02] transition-all hover:shadow-lg cursor-pointer group bg-stadium-surface/40 hover:bg-stadium-surface/60">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold/50 via-pitch-bright to-claret/50 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative rounded-full bg-card p-0.5 border border-border/50 shadow-md">
                    <Avatar p={p} size={56} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-lg font-heading flex items-center gap-2 truncate">
                    <span className="truncate">{p.name}</span>
                    {p.nationality && (
                      <span className="shrink-0 text-[10px] font-score tracking-wider font-semibold border border-border/50 rounded px-1.5 py-0.5 bg-background/50 shadow-sm text-muted-foreground">
                        {p.nationality}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                    {p.teamLogo && <img src={p.teamLogo} className="w-3.5 h-3.5 object-contain" alt="" />} 
                    {p.teamName || `${p.name}'s XI`}
                  </div>
                  
                  <div className="flex gap-1.5 mt-3 text-[10px] font-score tracking-wider">
                    <span className="flex items-center justify-center font-bold text-white bg-green-500/20 text-green-400 px-2 py-0.5 rounded-sm border border-green-500/20">
                      {wins}W
                    </span>
                    <span className="flex items-center justify-center font-bold text-white bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-sm border border-slate-500/20">
                      {draws}D
                    </span>
                    <span className="flex items-center justify-center font-bold text-white bg-red-500/20 text-red-400 px-2 py-0.5 rounded-sm border border-red-500/20">
                      {losses}L
                    </span>
                    {golds > 0 && (
                      <span className="flex items-center justify-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-sm border border-amber-400/20">
                        <Trophy size={10} />{golds}
                      </span>
                    )}
                  </div>
                </div>
              </MagicCard>
            </FadeIn>
          );
        })}
        {players.length === 0 && (
          <div className="col-span-1 md:col-span-2">
            <EmptyState text="No players yet." />
          </div>
        )}
      </div>
    </div>
  );
}

export function HistoryView({ history, players, setTab }) {
  if (!history || history.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="No completed seasons yet." /></Card></FadeIn>;
  
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="History" onBack={() => setTab('dashboard')} />

      {history.map((t, i) => {
        const champ = players.find((p) => p.id === t.championId);
        const runner = players.find((p) => p.id === t.runnerUpId);
        const third = players.find((p) => p.id === t.thirdId);
        const mvp = players.find((p) => p.id === t.mvpId);
        
        return (
          <FadeIn key={t.id} delay={i * 0.1}>
            <MagicCard className="p-6 bg-gradient-to-br from-card to-secondary/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-2">
                <div className="font-bold text-2xl font-heading">{t.name}</div>
                <span className="text-sm text-muted-foreground font-score bg-background/50 px-3 py-1 rounded-full w-fit">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                  <Trophy size={24} className="mx-auto mb-2 text-gold" />
                  <div className="text-sm font-bold font-heading tracking-wide">{champ?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Champion</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-400/10 border border-zinc-400/20">
                  <Trophy size={24} className="mx-auto mb-2 text-zinc-400" />
                  <div className="text-sm font-bold font-heading tracking-wide">{runner?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Runner-up</div>
                </div>
                <div className="p-4 rounded-xl bg-[#CD7F32]/10 border border-[#CD7F32]/20">
                  <Trophy size={24} className="mx-auto mb-2 text-[#CD7F32]" />
                  <div className="text-sm font-bold font-heading tracking-wide">{third?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Third place</div>
                </div>
              </div>
              {mvp && (
                <div className="mt-4 text-sm flex items-center gap-2 justify-center text-pitch-bright font-medium">
                  <Trophy size={16} /> MVP of the season: <strong className="font-bold">{mvp.name}</strong>
                </div>
              )}
            </MagicCard>
          </FadeIn>
        );
      })}
    </div>
  );
}

export function NotificationsView({ notifications, me }) {
  const [localReadAt, setLocalReadAt] = React.useState(me?.lastReadNotificationAt);

  const handleMarkRead = async () => {
    setLocalReadAt(new Date().toISOString());
    
    await markNotificationsRead(me.id);
  };

  const unreadCount = notifications ? notifications.filter(n => !localReadAt || new Date(n.createdAt) > new Date(localReadAt)).length : 0;

  if (!notifications || notifications.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="No notifications yet." /></Card></FadeIn>;
  return (
    <FadeIn delay={0.1}>
      <Card className="p-6">
        <SectionTitle 
          icon={Bell}
          right={
            unreadCount > 0 ? (
              <button onClick={handleMarkRead} className="text-xs font-semibold text-pitch-bright hover:underline cursor-pointer bg-transparent border-none">
                Mark all as read
              </button>
            ) : null
          }
        >
          Notifications
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {notifications.map((n, i) => {
            const isUnread = !localReadAt || new Date(n.createdAt) > new Date(localReadAt);
            return (
              <motion.div 
                key={n.id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl flex items-start gap-3 border ${isUnread ? 'bg-secondary border-pitch-bright/30' : 'bg-secondary/20 border-border/30 opacity-70'}`}
              >
                <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${isUnread ? 'bg-pitch-bright animate-pulse' : 'bg-muted-foreground/30'}`} />
                <div>
                  <div className={`text-sm ${isUnread ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.text}</div>
                  <div className="text-[10px] mt-1 text-muted-foreground font-score">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </FadeIn>
  );
}


function TrophyCard({ trophy, unlocked, count = 0, instances = [], requirement, onSelect }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const showDuplicate = count > 1;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      onClick={() => onSelect && onSelect()}
      className={`relative flex flex-col justify-between items-center p-4 sm:p-5 border rounded-2xl text-center cursor-pointer transition-all group overflow-visible min-h-[220px] sm:min-h-[240px] w-full ${
        unlocked
          ? 'bg-gradient-to-b from-amber-500/15 via-stadium-raised to-stadium-surface border-amber-500/40 shadow-lg shadow-amber-500/5 hover:-translate-y-1.5 hover:border-amber-400/80 hover:shadow-amber-500/15'
          : 'bg-stadium-surface/80 border-stadium-subtle hover:bg-stadium-surface hover:border-stadium-subtle/80 hover:-translate-y-0.5'
      }`}
    >
      {unlocked && (
        <BorderBeam size={100} duration={8} delay={0} colorFrom="#E8B34C" colorTo="transparent" />
      )}

      {/* Duplicate count badge */}
      {showDuplicate && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.15 }}
          className="absolute -top-2.5 -right-2.5 z-20 flex items-center justify-center"
        >
          <span className="absolute w-6 h-6 rounded-full bg-amber-400/40 animate-ping" />
          <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black text-[10px] font-black shadow-lg shadow-amber-500/40 border border-amber-300/60">
            ×{count}
          </span>
        </motion.div>
      )}

      {/* Top: Trophy Artwork */}
      <div className="my-2 relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
        {!imgLoaded && <Skeleton className="absolute inset-0 rounded-xl bg-stadium-raised" />}

        <motion.img
          src={trophy.image || trophy.icon}
          alt={trophy.name}
          className={`w-full h-full object-contain drop-shadow-md z-10 transition-all duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${!unlocked ? 'grayscale opacity-40 group-hover:opacity-60' : 'group-hover:scale-110'}`}
          whileHover={{ scale: unlocked ? 1.15 : 1.05, rotate: [-2, 2, -2, 2, 0] }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            setImgLoaded(true);
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />

        <div className="hidden absolute inset-0 items-center justify-center text-5xl transition-transform group-hover:scale-110 opacity-30 grayscale select-none">
          🏆
        </div>
      </div>

      {/* Middle: Trophy Name */}
      <div className="w-full my-2 flex flex-col items-center justify-center flex-1">
        <h4 className="font-bold font-heading text-xs sm:text-sm leading-tight text-stadium-primary line-clamp-2 px-1 relative z-10 group-hover:text-amber-300 transition-colors" title={trophy.name}>
          {trophy.name}
        </h4>
      </div>

      {/* Bottom: 2-Tier Achievement State System (Unlocked or Locked) */}
      <div className="w-full mt-auto pt-2 border-t border-stadium-subtle/40 z-10">
        {unlocked ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black font-score">
              {count > 1 ? `WON ×${count}` : 'UNLOCKED'}
            </span>
            <span className="text-[9px] text-stadium-secondary font-score truncate max-w-full">
              {instances[0]?.createdAt ? new Date(instances[0].createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Champion'}
            </span>
          </div>
        ) : (
          /* Locked, No Progress (0%) */
          <div className="w-full flex items-center justify-center gap-1 text-[10px] font-medium text-stadium-muted py-0.5 px-1">
            <Lock size={10} className="shrink-0 text-stadium-secondary/60" />
            <span className="truncate" title={requirement || "Locked"}>
              {requirement || "Locked"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
