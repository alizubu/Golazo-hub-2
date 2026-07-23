'use client';

import React from 'react';
import { PageHeader } from './PageHeader';
import { Trophy, Clock, ListOrdered, Calendar, Swords, Megaphone, Bell, Pen, Target, Handshake, Shield, Activity, Lock, Flame, BadgeCheck } from 'lucide-react';
import { Btn, Badge, Avatar, PlayerChip, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Label } from './UI';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { NumberTicker } from './ui/number-ticker';
import { motion } from 'framer-motion';
import SettingsView from './SettingsView';
import MatchesPage from './MatchesPage';
import MatchCard from './MatchCard';
import MatchStatsModal from './MatchStatsModal';
import { BorderBeam } from './magicui/BorderBeam';
import { markNotificationsRead } from '@/app/actions/player';
import { Skeleton } from '@/app/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/components/ui/hover-card';
import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';

const clubs = clubsData.map(c => ({ ...c, subtitle: `${c.league}, ${c.country}` }));
const nationalTeams = nationalTeamsData.map(nt => ({ ...nt, subtitle: nt.confederation }));

export default function PlayerViews(props) {
  const [selectedMatchId, setSelectedMatchId] = React.useState(null);
  const handleMatchClick = (id) => setSelectedMatchId(id);
  const handleCloseModal = () => setSelectedMatchId(null);
  const newProps = { ...props, onMatchClick: handleMatchClick };
  const { tab } = props;
  if (tab === "dashboard") return <><PlayerDashboard {...newProps} />{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "matches") return <><PageHeader title="Matches" onBack={() => props.setTab('dashboard')} /><div className="p-4 sm:p-8"><MatchesPage {...newProps} /></div>{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "players") return <><RosterView {...props} />{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "history") return <><HistoryView {...props} />{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "notifications") return <NotificationsView {...props} />;
  if (tab === "settings") return <SettingsView {...props} />;
  return null;
}

function computeStandings(matches, players, seasonId) {
  const table = {};
  players.forEach((p) => {
    table[p.id] = { ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });
  matches
    .filter((m) => m.seasonId === seasonId && m.round === "league" && m.status === "completed")
    .forEach((m) => {
      const h = table[m.homeId], a = table[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      h.gf += hs; h.ga += as;
      a.gf += as; a.ga += hs;
      if (hs > as) { h.won++; a.lost++; h.pts += 2; }
      else if (hs < as) { a.won++; h.lost++; a.pts += 2; }
      else { h.drawn++; a.drawn++; h.pts += 1; a.pts += 1; }
    });
  Object.values(table).forEach((t) => (t.gd = t.gf - t.ga));
  return Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
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
          <NumberTicker value={m.homeScore ?? 0} className="text-5xl font-bold font-mono text-foreground" />
          <span className="text-3xl opacity-40 font-mono">-</span>
          <NumberTicker value={m.awayScore ?? 0} className="text-5xl font-bold font-mono text-foreground" />
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
            <div className="font-bold text-xl font-mono text-pitch-bright">{m.homeScore} – {m.awayScore}</div>
            <div className="flex items-center gap-1 justify-center mt-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">FT</span>
            </div>
          </div>
        ) : m.status === "live" ? (
          <div>
            <Badge color="var(--claret)" pulse>LIVE</Badge>
            <div className="font-bold text-xl mt-1 font-mono text-foreground">
              <span className="score-pop">{m.homeScore ?? 0}</span> – <span className="score-pop">{m.awayScore ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-mono font-medium">TBD</div>
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
        <div className="absolute font-mono font-bold text-lg">{value}%</div>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
    </div>
  );
}

function PlayerDashboard({ me, activeSeason, matches, players, announcements = [], trophies = [], notifications = [], setTab, persistPlayers, onMatchClick }) {
  const t = activeSeason;
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

  const [statsLoaded, setStatsLoaded] = React.useState(false);
  const [failedCoverUrl, setFailedCoverUrl] = React.useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setStatsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    async function syncProfile() {
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
  }, [me.id]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {announcements.length > 0 && (
        <FadeIn delay={0.05}>
          <div className="flex flex-col gap-3">
            {announcements.map((ann) => (
              <MagicCard key={ann.id} className="p-4 bg-secondary/80 border-pitch/50 border-l-4 border-l-pitch backdrop-blur-sm">
                <div className="flex gap-3">
                  <Megaphone className="text-pitch-bright shrink-0" size={20} />
                  <div>
                    <div className="font-bold text-sm">{ann.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{ann.content}</div>
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

            {/* Top-right cluster: FORM indicator + Rank badge */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {/* Form circles (last 5 results) */}
              {form.length > 0 && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/10">
                  <span className="text-[9px] text-white/60 uppercase font-bold tracking-widest mr-1">Form</span>
                  {form.map((r, i) => (
                    <span
                      key={i}
                      title={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Draw'}
                      className={`w-4 h-4 rounded-full border border-black/30 flex-shrink-0 ${
                        r === 'W' ? 'bg-green-500' : r === 'L' ? 'bg-red-500' : 'bg-amber-400'
                      }`}
                    />
                  ))}
                </div>
              )}
              {/* Rank badge */}
              {myRank > 0 && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
                  myRank === 1
                    ? 'bg-gold/80 text-black border-gold/50'
                    : 'bg-black/50 text-white border-white/10'
                }`}>
                  {myRank === 1 && <Flame size={11} />}
                  #{myRank}
                </div>
              )}
            </div>
          </div>

          {/* Profile Body */}
          <div className="px-6 md:px-10 pb-8 pt-4 relative bg-card flex-1">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-20">

              {/* Avatar with animated gradient ring + country chip */}
              <div className="-mt-16 md:-mt-20 relative z-30 flex-shrink-0">
                <div className="relative inline-block">
                  {/* Animated gradient ring */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold via-pitch-bright to-claret animate-spin [animation-duration:4s] blur-[1px] opacity-80" />
                  <div className="relative rounded-full p-1 bg-card shadow-xl">
                    <Avatar p={me} size={100} />
                  </div>
                  {/* Country chip bottom-right of avatar */}
                  {me.nationality && (
                    <div className="absolute -bottom-1 -right-1 z-40 bg-card border border-border/60 rounded-full px-1.5 py-0.5 text-sm leading-none shadow-md">
                      {me.nationality}
                    </div>
                  )}
                  {/* Online dot */}
                  <span className="absolute top-1 right-1 z-40 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 w-full pt-1">
                <div className="text-center md:text-left">
                  {/* Name + verified badge */}
                  <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    {me.name}
                    {myRank === 1 && (
                      <BadgeCheck size={22} className="text-blue-400 shrink-0" title="Top Ranked Player" />
                    )}
                  </h1>

                  {/* Inline COBEG-style stat row */}
                  {played > 0 && (
                    <div className="text-sm text-muted-foreground font-mono mt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-0.5">
                      <span className="font-semibold text-foreground">{played}</span> <span>matches</span>
                      <span className="text-border">·</span>
                      <span className="font-semibold text-foreground">{won}</span> <span>wins</span>
                      <span className="text-border">·</span>
                      <span className="font-semibold text-pitch-bright">{winRate}%</span> <span>win rate</span>
                      <span className="text-border">·</span>
                      <span className="font-semibold text-foreground">{goals}</span> <span>goals</span>
                    </div>
                  )}

                  {/* Username line */}
                  <div className="text-muted-foreground font-mono mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
                    <span className="text-muted-foreground">@{me.username}</span>

                    {(selectedClub || selectedNationalTeam) && (
                      <>
                        <span className="text-border">·</span>
                        <div className="flex items-center gap-1.5">
                          {selectedClub && (
                            <button onClick={() => setTab('settings')} className="flex items-center gap-1.5 bg-secondary/50 hover:bg-secondary px-2 py-1 rounded-full text-xs font-semibold transition-colors border border-border/50">
                              {selectedClub.logo_url ? (
                                <img src={selectedClub.logo_url} alt={selectedClub.name} className="w-3.5 h-3.5 object-contain" />
                              ) : <Shield size={12} />}
                              {selectedClub.name}
                            </button>
                          )}
                          {selectedNationalTeam && (
                            <button onClick={() => setTab('settings')} className="flex items-center gap-1.5 bg-secondary/50 hover:bg-secondary px-2 py-1 rounded-full text-xs font-semibold transition-colors border border-border/50">
                              {selectedNationalTeam.flag_url ? (
                                <img src={selectedNationalTeam.flag_url} alt={selectedNationalTeam.name} className="w-3.5 h-3.5 object-contain" />
                              ) : <Shield size={12} />}
                              {selectedNationalTeam.name}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: Edit button */}
                <div className="flex flex-col items-center md:items-end gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Online now
                  </div>
                  <Btn variant="outline" onClick={() => setTab('settings')} className="gap-2 rounded-full border-border/50 text-xs shadow-sm bg-background/50 hover:bg-secondary">
                    <Pen size={12} /> Edit Profile
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        <FadeIn delay={0.2} className="col-span-1 md:col-span-12 h-full">
          <MagicCard gradientColor="rgba(250, 204, 21, 0.1)" className="h-full">
            <Card className="h-full bg-transparent border-none shadow-none flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2"><Activity className="text-pitch-bright" size={20}/> Player Statistics</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-2 h-full">
                  <Card className="col-span-2 sm:col-span-1 relative overflow-hidden bg-gradient-to-br from-gold/10 to-transparent border-t-2 border-t-gold border-x-border/50 border-b-border/50 flex flex-col items-center justify-center text-center p-6 group shadow-none min-h-[140px] flex-1">
                    {myRank === 1 && <BorderBeam size={150} duration={8} delay={1} colorFrom="var(--gold)" colorTo="transparent" />}
                    <Label className="text-gold/80 mb-1 z-10">Current Rank</Label>
                    <div className="text-4xl font-black font-mono text-gold z-10 drop-shadow-md">#{myRank || '-'}</div>
                  </Card>

                  <PlayerStatCard label="ELO Rating" value={elo} loaded={statsLoaded} icon={Activity} />
                  <PlayerStatCard label="Matches" value={played} loaded={statsLoaded} icon={Swords} emptyValue={0} />
                  
                  <Card className="col-span-2 sm:col-span-1 relative overflow-hidden bg-secondary/30 border-t-2 border-t-green-500 border-x-border/50 border-b-border/50 flex flex-col items-center justify-center text-center p-6 shadow-none min-h-[140px] flex-1">
                    <Label className="mb-2">Win Rate</Label>
                    {statsLoaded ? (
                      winRate > 0 ? (
                        <div className="relative w-16 h-16 flex items-center justify-center mt-1">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-secondary-foreground/10 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <motion.path className="text-pitch-bright stroke-current" strokeWidth="3" strokeDasharray={`${winRate}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${winRate}, 100` }} transition={{ duration: 1.5, ease: "easeOut" }} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono">
                            <NumberTicker value={winRate} />%
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground opacity-50 mt-1">
                          <span className="text-3xl font-mono font-bold">—</span>
                        </div>
                      )
                    ) : (
                      <Skeleton className="w-16 h-16 rounded-full" />
                    )}
                  </Card>

                  <PlayerStatCard label="Goals" value={goals} loaded={statsLoaded} icon={Target} emptyValue={0} />
                  <PlayerStatCard label="Assists" value={assists} loaded={statsLoaded} icon={Handshake} emptyValue={0} />
                </div>
              </CardContent>
            </Card>
          </MagicCard>
        </FadeIn>

        {/* Trophy Cabinet Row */}
        <FadeIn delay={0.25} className="col-span-12">
          <MagicCard gradientColor="rgba(251, 191, 36, 0.15)">
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="pb-4 border-b border-border/30">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground"><Trophy className="text-gold" size={20}/> Trophy Cabinet</h3>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:pb-0 w-full min-w-0" variants={{hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } }}} initial="hidden" whileInView="show" viewport={{ once: true }}>
                  {[
                    { id: "bb-champion", name: "BB Champion", image: "/assets/trophies/BB-Champion.png", locked: true },
                    { id: "world-cup", name: "World Cup Winner", image: "/assets/trophies/World-Cup-Winner-Trophy.png", locked: true },
                    { id: "golden-boot", name: "Golden Boot", image: "/assets/trophies/Golden-boot.png", locked: true },
                    { id: "mvp", name: "MVP", image: "/assets/trophies/MVP.png", locked: true },
                    { id: "la-liga", name: "La Liga Champion", image: "/assets/trophies/La-Liga-trophy.png", locked: true },
                    { id: "premier-league", name: "Premier League Champion", image: "/assets/trophies/Premier-League.png", locked: true },
                  ].map((tr) => {
                    const instances = myTrophies.filter(t => t.title === tr.name || t.id === tr.id);
                    const isUnlocked = instances.length > 0 || !tr.locked;
                    return <TrophyCard key={tr.id} trophy={tr} unlocked={isUnlocked} count={instances.length} instances={instances} />;
                  })}
                </motion.div>
              </CardContent>
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
                    <th className="pb-2 text-center font-semibold">GF</th>
                    <th className="pb-2 text-center font-semibold">GA</th>
                    <th className="pb-2 text-center font-semibold text-pitch-bright">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.slice(0, 5).map((s, i) => (
                    <tr key={s.id} className={`border-b border-border/30 last:border-0 ${s.id === me.id ? 'bg-white/5' : ''}`}>
                      <td className="py-2.5 font-bold font-mono">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-muted-foreground ml-1">{i + 1}</span>}
                      </td>
                      <td className="py-2.5"><PlayerChip p={s} size={20} /></td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.played}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.won}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.lost}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.gf}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.ga}</td>
                      <td className="py-2.5 text-center font-bold text-pitch-bright">{s.pts}</td>
                    </tr>
                  ))}
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
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 text-center">
                    Week {nextMatch.matchday || 1} • {nextMatch.scheduledAt ? new Date(nextMatch.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit'}) : 'TBD'}
                  </div>
                  <div className="flex items-center justify-center gap-6 w-full">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <Avatar p={players.find(p => p.id === nextMatch.homeId)} size={56} />
                      <span className="font-bold text-sm truncate w-full text-center">{players.find(p => p.id === nextMatch.homeId)?.name}</span>
                    </div>
                    <div className="font-mono text-xl text-muted-foreground font-bold">VS</div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <Avatar p={players.find(p => p.id === nextMatch.awayId)} size={56} />
                      <span className="font-bold text-sm truncate w-full text-center">{players.find(p => p.id === nextMatch.awayId)?.name}</span>
                    </div>
                  </div>
                  <Btn variant="primary" className="mt-6 w-full text-xs" onClick={() => setTab('matches')}>View All Fixtures</Btn>
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
                      <span className="font-mono text-muted-foreground ml-1">{myScore}–{oppScore}</span> 
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
                <th className="p-3 font-semibold">Player</th>
                <th className="p-3 text-center font-semibold">P</th>
                <th className="p-3 text-center font-semibold">W</th>
                <th className="p-3 text-center font-semibold">D</th>
                <th className="p-3 text-center font-semibold">L</th>
                <th className="p-3 text-center font-semibold">GF</th>
                <th className="p-3 text-center font-semibold">GA</th>
                <th className="p-3 text-center font-semibold text-pitch-bright">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  key={s.id} 
                  className={`border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-colors ${s.id === me.id ? 'bg-pitch/10 hover:bg-pitch/20' : ''}`}
                >
                  <td className="p-3 font-medium text-muted-foreground">{i + 1}</td>
                  <td className="p-3"><PlayerChip p={s} size={20} /></td>
                  <td className="p-3 text-center">{s.played}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.won}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.drawn}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.lost}</td>
                  <td className="p-3 text-center">{s.gf}</td>
                  <td className="p-3 text-center">{s.ga}</td>
                  <td className="p-3 text-center font-bold text-pitch-bright text-base">{s.pts}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </FadeIn>
  );
}

function MatchesView({ activeSeason, matches, players }) {
  if (!activeSeason) return <EmptyState text="No active season yet." />;
  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === "league");
  return (
    <FadeIn delay={0.1}>
      <Card className="p-5">
        <SectionTitle icon={Calendar}>All Matches</SectionTitle>
        <div className="flex flex-col gap-3">
          {tMatches.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <MatchCard onClick={props.onMatchClick} m={m} players={players} />
            </motion.div>
          ))}
        </div>
      </Card>
    </FadeIn>
  );
}

function PlayoffBracketDisplay({ tMatches, players }) {
  const byRound = Object.fromEntries(tMatches.map((m) => [m.round, m]));
  const { semiA, semiB, challenger, final } = byRound;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  
  const matchWinnerId = (m) => {
    if (!m || m.status !== "completed") return null;
    if (m.homeScore > m.awayScore) return m.homeId;
    if (m.awayScore > m.homeScore) return m.awayId;
    if (m.penaltyWinner) return m.penaltyWinner === "home" ? m.homeId : m.awayId;
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Matches" onBack={() => props.setTab('dashboard')} />

      <PageHeader title="Standings" onBack={() => props.setTab('dashboard')} />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-gold">Top match (Rank 1 vs 2)</div>
          {semiA ? (semiA.status === "live" ? <MatchCard m={semiA} players={players} onClick={onMatchClick} /> : <MatchCard onClick={props.onMatchClick} m={semiA} players={players} />) : <EmptyState text="Not generated yet." />}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-claret">Bottom match (Rank 3 vs 4)</div>
          {semiB ? (semiB.status === "live" ? <MatchCard m={semiB} players={players} onClick={onMatchClick} /> : <MatchCard onClick={props.onMatchClick} m={semiB} players={players} />) : <EmptyState text="Not generated yet." />}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-muted-foreground">Challenger match — Top match loser vs Bottom match winner</div>
        {challenger ? (challenger.status === "live" ? <MatchCard m={challenger} players={players} onClick={onMatchClick} /> : <MatchCard onClick={props.onMatchClick} m={challenger} players={players} />) : <EmptyState text="Unlocks once both matches above are completed." />}
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-pitch-bright">Final — Top match winner vs Challenger winner</div>
        {final ? (final.status === "live" ? <MatchCard m={final} players={players} onClick={onMatchClick} /> : <MatchCard onClick={props.onMatchClick} m={final} players={players} />) : <EmptyState text="Unlocks once the challenger match is completed." />}
      </div>
      {final?.status === "completed" && (
        <FadeIn>
          <MagicCard className="p-8 text-center bg-gradient-to-br from-gold/20 to-transparent border-gold/50">
            <Trophy className="mx-auto mb-4 text-gold" size={48} />
            <div className="text-3xl font-bold font-display text-gold">{byId[matchWinnerId(final)]?.name} is the Champion! 🏆</div>
          </MagicCard>
        </FadeIn>
      )}
    </div>
  );
}

function PlayoffsView({ activeSeason, matches, players }) {
  if (!activeSeason) return <EmptyState text="No active season yet." />;
  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round !== "league");
  
  if (tMatches.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="Playoffs haven't started yet. They unlock once the admin closes the league phase." /></Card></FadeIn>;
  return (
    <FadeIn delay={0.1}>
      <Card className="p-6">
        <SectionTitle icon={Swords}>Playoff bracket</SectionTitle>
        <PlayoffBracketDisplay tMatches={tMatches} players={players} />
      </Card>
    </FadeIn>
  );
}

function RosterView({ players, matches }) {
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
    <div className="grid md:grid-cols-2 gap-4">
      <PageHeader title="Roster" onBack={() => props.setTab('dashboard')} />

      <PageHeader title="Playoffs" onBack={() => props.setTab('dashboard')} />

      {players.map((p, i) => {
        const pm = matches.filter((m) => m.status === "completed" && (m.homeId === p.id || m.awayId === p.id));
        const wins = pm.filter((m) => matchWinnerId(m) === p.id).length;
        const losses = pm.filter((m) => matchLoserId(m) === p.id).length;
        const draws = pm.length - wins - losses;
        const golds = matches.filter((m) => m.round === "final" && m.status === "completed" && matchWinnerId(m) === p.id).length;
        
        return (
          <FadeIn key={p.id} delay={i * 0.05}>
            <MagicCard className="p-5 flex items-center gap-4 hover:border-border transition-colors cursor-default">
              <Avatar p={p} size={64} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-lg font-display flex items-center gap-2">{p.name} <span>{p.flag}</span></div>
                <div className="text-sm text-muted-foreground mt-0.5">{p.teamLogo} {p.teamName}</div>
                <div className="flex gap-4 mt-3 text-xs font-mono text-muted-foreground">
                  <span className="font-semibold text-foreground">{wins}W</span>
                  <span className="font-semibold text-foreground">{draws}D</span>
                  <span className="font-semibold text-foreground">{losses}L</span>
                  {golds > 0 && <span className="flex items-center gap-1 text-gold"><Trophy size={12} />{golds}</span>}
                </div>
              </div>
            </MagicCard>
          </FadeIn>
        );
      })}
      {players.length === 0 && <EmptyState text="No players yet." />}
    </div>
  );
}

function HistoryView({ history, players }) {
  if (!history || history.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="No completed seasons yet." /></Card></FadeIn>;
  
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="History" onBack={() => props.setTab('dashboard')} />

      {history.map((t, i) => {
        const champ = players.find((p) => p.id === t.championId);
        const runner = players.find((p) => p.id === t.runnerUpId);
        const third = players.find((p) => p.id === t.thirdId);
        const mvp = players.find((p) => p.id === t.mvpId);
        
        return (
          <FadeIn key={t.id} delay={i * 0.1}>
            <MagicCard className="p-6 bg-gradient-to-br from-card to-secondary/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-2">
                <div className="font-bold text-2xl font-display">{t.name}</div>
                <span className="text-sm text-muted-foreground font-mono bg-background/50 px-3 py-1 rounded-full w-fit">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                  <Trophy size={24} className="mx-auto mb-2 text-gold" />
                  <div className="text-sm font-bold font-display tracking-wide">{champ?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Champion</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-400/10 border border-zinc-400/20">
                  <Trophy size={24} className="mx-auto mb-2 text-zinc-400" />
                  <div className="text-sm font-bold font-display tracking-wide">{runner?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Runner-up</div>
                </div>
                <div className="p-4 rounded-xl bg-[#CD7F32]/10 border border-[#CD7F32]/20">
                  <Trophy size={24} className="mx-auto mb-2 text-[#CD7F32]" />
                  <div className="text-sm font-bold font-display tracking-wide">{third?.name || "—"}</div>
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

function NotificationsView({ notifications, me }) {
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
                  <div className="text-[10px] mt-1 text-muted-foreground font-mono">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </FadeIn>
  );
}

function PlayerStatCard({ label, value, loaded, icon: Icon, emptyValue = null }) {
  const isEmpty = value === emptyValue || !value;
  return (
    <Card className={`bg-secondary/30 border-t-2 border-x-border/50 border-b-border/50 flex flex-col items-center justify-center text-center p-6 shadow-none flex-1 min-h-[140px] ${isEmpty ? 'border-t-border/50' : 'border-t-blue-500/50'}`}>
      {Icon && isEmpty && <Icon size={24} className="mb-2 text-muted-foreground/30" />}
      <Label className="mb-2">{label}</Label>
      {loaded ? (
        isEmpty ? (
          <span className="text-3xl font-mono font-bold text-muted-foreground opacity-50">—</span>
        ) : (
          <NumberTicker value={value} className="text-3xl font-bold font-mono text-foreground" />
        )
      ) : (
        <Skeleton className="h-9 w-20" />
      )}
    </Card>
  );
}

function TrophyCard({ trophy, unlocked, count = 0, instances = [] }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const showDuplicate = count > 1;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className={`relative flex flex-col items-center p-5 border rounded-2xl text-center cursor-help transition-all group overflow-visible h-full ${
            unlocked
              ? 'bg-gradient-to-b from-gold/15 to-transparent border-gold/30 shadow-lg shadow-gold/5 hover:-translate-y-1 hover:border-gold/60'
              : 'bg-secondary/20 border-border/50 hover:bg-secondary/30'
          }`}
        >
          {unlocked && (
            <BorderBeam size={100} duration={8} delay={0} colorFrom="var(--gold)" colorTo="transparent" />
          )}

          {/* Duplicate count badge */}
          {showDuplicate && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.15 }}
              className="absolute -top-2.5 -right-2.5 z-20 flex items-center justify-center"
            >
              {/* Glow ring behind badge */}
              <span className="absolute w-6 h-6 rounded-full bg-amber-400/40 animate-ping" />
              <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black text-[10px] font-black shadow-lg shadow-amber-500/40 border border-amber-300/60">
                ×{count}
              </span>
            </motion.div>
          )}

          <div className="mb-3 relative w-20 h-20 flex items-center justify-center shrink-0">
            {!imgLoaded && <Skeleton className="absolute inset-0 rounded-xl" />}

            <motion.img
              src={trophy.image}
              alt={trophy.name}
              className={`w-full h-full object-contain drop-shadow-md z-10 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${!unlocked ? 'grayscale opacity-[0.45]' : ''}`}
              whileHover={{ scale: 1.08, rotate: [-2, 2, -2, 2, 0] }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                e.target.style.display = 'none';
                setImgLoaded(true);
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />

            <div className="hidden absolute inset-0 items-center justify-center text-5xl transition-transform group-hover:scale-110 opacity-30 grayscale">
              🏆
            </div>

            {!unlocked && imgLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <Lock className="text-foreground/80 drop-shadow-md bg-background/50 p-1.5 rounded-full backdrop-blur-sm" size={28} />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between items-center w-full">
            <div className="font-bold text-sm leading-tight text-foreground relative z-10 mb-2">{trophy.name}</div>

            <div className="mt-auto">
              {!unlocked ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-background border border-border text-[9px] font-bold shadow-sm z-10">LOCKED</span>
              ) : (
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold relative z-10">
                  {count > 0 ? `Won ×${count}` : 'Unlocked'}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-64 bg-card/95 backdrop-blur shadow-xl border-border z-50">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            {trophy.name}
            {showDuplicate && (
              <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-400 rounded-full text-[10px] font-bold border border-amber-400/30">×{count}</span>
            )}
          </h4>
          {/* Individual award instances */}
          {instances.length > 0 ? (
            <div className="space-y-1.5 mt-2 pt-2 border-t border-border/50">
              {instances.map((inst, i) => (
                <div key={inst.id || i} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-pitch-bright">{inst.season}</span>
                  <span className="text-muted-foreground font-mono">{inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {trophy.desc || `Win the ${trophy.name} to unlock this achievement.`}
            </p>
          )}
          {!unlocked && (
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-pitch-bright font-bold mt-2 pt-2 border-t border-border/50">
              <Lock size={10} /> Keep playing to unlock
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
