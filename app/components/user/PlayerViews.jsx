'use client';

import React from 'react';
import { PageHeader } from '@/app/components/shared/PageHeader';
import { Trophy, Medal, Star, Target, Shield, Clock, ArrowRight, Lock, MapPin, Search, Calendar, ChevronRight, LayoutGrid, List, Megaphone, Bell, Pen, Handshake, Activity, Users, Swords, ListOrdered, Flame, BadgeCheck, TrendingUp } from 'lucide-react';
import { Btn, Badge, Avatar, PlayerChip, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Label, WavingFlag, PlayStyleBadge, OnFireAvatar } from '@/app/components/shared/UI';
import { AvatarWithBadge } from '@/app/components/shared/FootballIdentity';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { ClubLogo } from '@/app/components/shared/ClubLogo';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SettingsView from '@/app/components/shared/SettingsView';
import MatchesPage from '@/app/components/shared/MatchesPage';
import MatchCard from '@/app/components/shared/MatchCard';
import { ProMatchFixtureCard } from '@/app/components/shared/ProMatchFixtureCard';

import TrophyDetailModal from '@/app/components/shared/TrophyDetailModal';
import HeadToHeadModal from '@/app/components/shared/HeadToHeadModal';

import StatChip from '@/app/components/shared/StatChip';
import { SeasonStats } from '@/app/components/user/SeasonStats';
import SeasonSummaryDashboard from '@/app/components/user/SeasonSummaryDashboard';
import PlayerRankingView from '@/app/components/user/PlayerRankingView';
import { BorderBeam } from '@/app/components/magicui/BorderBeam';
import { markNotificationsRead } from '@/app/actions/player';
import { Skeleton } from '@/app/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/components/ui/hover-card';
import { computeStandings } from '@/app/components/shared/StandingsTable';
import { CLUB_COLORS } from '@/lib/data/club-colors';
import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';

const clubs = clubsData.map(c => ({ ...c, subtitle: `${c.league}, ${c.country}` }));
const nationalTeams = nationalTeamsData.map(nt => ({ ...nt, subtitle: nt.confederation }));

const BENTO_TROPHIES = [
  { id: 'bb-championship', name: 'BB Championship', category: 'Championships', priority: 1, requirement: 'Win the ultimate BB League title.', image: '/assets/trophies/BB-Champion.png', icon: '🏆', scale: 1.0 },
  { id: 'mvp', name: 'Tournament MVP', category: 'MVP', priority: 2, requirement: 'Dominate the pitch and earn MVP honors.', image: '/assets/trophies/MVP.png', icon: '⭐', scale: 0.85 },
  { id: 'ballon-dor', name: "Ballon d'Or", category: 'MVP', priority: 3, requirement: 'Voted the absolute best player in the world.', image: '/assets/trophies/BalanDor.png', icon: '🥇', scale: 0.88 },
  { id: 'golden-boot', name: 'Golden Boot', category: 'Scoring', priority: 4, requirement: 'Score the most goals in the season.', image: '/assets/trophies/Golden-boot.png', icon: '👟', scale: 0.82 },
  { id: 'most-successful-pass', name: 'Pass Master', category: 'Special', priority: 5, requirement: 'Achieve the highest pass accuracy.', image: '/assets/trophies/MostPasses.png', icon: '🎯', scale: 0.88 },
  { id: 'clean-sheet', name: 'Clean Sheet Glove', category: 'Defense', priority: 6, requirement: 'Keep the most clean sheets in the season.', image: '/assets/trophies/cleansheet.png', icon: '🧤', scale: 0.9 },
  { id: 'best-defender', name: 'Best Defender', category: 'Defense', priority: 7, requirement: 'The most dominant defender of the season.', image: '/assets/trophies/bestdefence.png', icon: '🛡️', scale: 0.9 },
];

const TROPHY_CATEGORIES = ['ALL', 'Championships', 'MVP', 'Scoring', 'Defense', 'Special'];

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
      {tab === "ranking" && <PlayerRankingView {...newProps} />}
      {tab === "notifications" && <NotificationsView {...newProps} />}
      {tab === "settings" && <SettingsView {...newProps} />}

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
            <div className="flex items-center gap-1.5 justify-center w-full px-1">
              {getPlayerIdentityBadgeUrl(h) && <img src={getPlayerIdentityBadgeUrl(h)} alt="badge" className="w-7 h-7 object-contain drop-shadow-sm shrink-0" />}
              <span className="text-sm font-semibold truncate text-center">{h?.name}</span>
            </div>
          </div>
        <div className="flex items-center gap-3 shrink-0 px-2">
          <NumberTicker value={m.homeScore ?? 0} className="text-5xl font-bold font-score text-foreground" />
          <span className="text-3xl opacity-40 font-score">-</span>
          <NumberTicker value={m.awayScore ?? 0} className="text-5xl font-bold font-score text-foreground" />
        </div>
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <Avatar p={a} size={56} />
            <div className="flex items-center gap-1.5 justify-center w-full px-1">
              {getPlayerIdentityBadgeUrl(a) && <img src={getPlayerIdentityBadgeUrl(a)} alt="badge" className="w-7 h-7 object-contain drop-shadow-sm shrink-0" />}
              <span className="text-sm font-semibold truncate text-center">{a?.name}</span>
            </div>
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
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 500], [0, 80]);

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
  const t = seasons.find(s => s.id === selectedSeasonId) || activeSeason;
  const tMatches = t ? matches.filter((m) => m.seasonId === t.id) : [];
  const standings = t ? computeStandings(tMatches, players, t.id) : [];
  const myRank = standings.findIndex((s) => s.id === me.id) + 1;
  const myRow = standings.find((s) => s.id === me.id);

  const myMatches = tMatches.filter((m) => (m.homeId === me.id || m.awayId === me.id) && m.status === 'completed');
  const myLive = tMatches.filter((m) => m.status === "live" && (m.homeId === me.id || m.awayId === me.id));
  const upcoming = tMatches.filter((m) => m.status === "scheduled" && (m.homeId === me.id || m.awayId === me.id)).slice(0, 1);
  const recent = [...myMatches].sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)).slice(0, 5);

  const getPlayerStats = (id) => {
    const row = standings.find(s => s.id === id);
    const rank = standings.findIndex(s => s.id === id) + 1;
    return { rank: rank > 0 ? rank : '-', wins: row ? row.won : 0 };
  };

  const allMyCompletedMatches = matches.filter(m => (m.homeId === me.id || m.awayId === me.id) && m.status === 'completed');
  allMyCompletedMatches.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));

  const last2 = allMyCompletedMatches.slice(0, 2);
  let isOnFire = false;
  if (last2.length === 2) {
    const isGood = (m) => {
      const isHome = m.homeId === me.id;
      const myScore = isHome ? m.homeScore : m.awayScore;
      const oppScore = isHome ? m.awayScore : m.homeScore;
      return myScore > oppScore || myScore > 0;
    };
    isOnFire = isGood(last2[0]) && isGood(last2[1]);
  }

  let winStreak = 0;
  for (const m of allMyCompletedMatches) {
    const isHome = m.homeId === me.id;
    const myScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    if (myScore > oppScore) winStreak++;
    else break;
  }

  const opponents = {};
  allMyCompletedMatches.forEach(m => {
    const oppId = m.homeId === me.id ? m.awayId : m.homeId;
    if (!oppId) return;
    if (!opponents[oppId]) opponents[oppId] = { matches: 0, w: 0, d: 0, l: 0 };
    opponents[oppId].matches++;
    const isHome = m.homeId === me.id;
    const myScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    if (myScore > oppScore) opponents[oppId].w++;
    else if (myScore < oppScore) opponents[oppId].l++;
    else opponents[oppId].d++;
  });

  let biggestRivalId = null;
  let maxMatches = 0;
  for (const [id, stats] of Object.entries(opponents)) {
    if (stats.matches > maxMatches) {
      maxMatches = stats.matches;
      biggestRivalId = id;
    }
  }
  const biggestRival = players.find(p => p.id === biggestRivalId);
  const rivalStats = biggestRivalId ? opponents[biggestRivalId] : null;

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

      <FadeIn delay={0.1}>
        <div className="relative w-full mb-10 flex flex-col gap-4">
          
          <div className="relative rounded-none sm:rounded-3xl overflow-hidden border-b sm:border border-border shadow-sm bg-card mb-4">
            <div className="h-48 md:h-64 w-full relative bg-secondary overflow-hidden">
              <motion.div 
                style={{ y: shouldReduceMotion ? 0 : coverY }} 
                className="w-full h-[120%] -top-[10%] absolute"
              >
                {me.coverBanner && failedCoverUrl !== me.coverBanner ? (
                  <img src={me.coverBanner} alt="Cover Banner" className="w-full h-full object-cover" onError={() => setFailedCoverUrl(me.coverBanner)} />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                    <span className="text-6xl opacity-30">⚽</span>
                  </div>
                )}
              </motion.div>
            </div>
            
            <div className="px-5 py-5 sm:px-8 sm:py-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-20">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full md:w-auto text-center sm:text-left">
                <div className="relative -mt-16 sm:-mt-20 shrink-0">
                  <div className="relative rounded-full p-1 bg-card shadow-md ring-4 ring-card border-none">
                    <AvatarWithBadge player={me} size={120} isOnFire={isOnFire} />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 mt-2 sm:mt-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate text-foreground">
                      {me.name}
                    </h1>
                    {myRank === 1 && <div className="text-blue-500 shrink-0" title="Top Ranked Player">👑</div>}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <span className="text-muted-foreground font-medium text-sm">@{me.username}</span>
                    <PlayStyleBadge style={me.playStyle} showLabel={false} size="sm" />
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                    {!viewOnly && (
                      <button onClick={() => setTab('settings')} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-bold rounded-lg transition-colors border border-border flex items-center gap-2 shadow-sm active:scale-95 outline-none">
                        <Pen size={14} /> Edit
                      </button>
                    )}
                    {!viewOnly && (
                      <div className="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-bold rounded-lg border border-green-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" /> Online
                      </div>
                    )}
                    {tMatches.some(m => m.round !== 'league' && m.round !== 'friendly') && (
                      <button onClick={() => setTab('matches')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 active:scale-95 outline-none">
                        <Trophy size={14} /> Playoffs
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-center gap-4 md:gap-3 w-full md:w-auto border-t md:border-t-0 border-border pt-5 md:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest hidden md:block">Form</span>
                  <div className="flex items-center gap-1 bg-secondary px-2.5 py-1.5 rounded-lg border border-border shadow-sm">
                    {form.length > 0 ? form.map((r, i) => (
                      <span key={i} title={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Draw'} className={`w-2.5 h-4 rounded-sm ${r === 'W' ? 'bg-green-500' : r === 'L' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    )) : <span className="text-xs font-bold text-muted-foreground px-1">No matches</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="md:col-span-4 relative rounded-3xl bg-card border border-border shadow-xl p-6 flex flex-col items-center justify-center group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              {winRate > 50 && <BorderBeam size={200} duration={12} delay={0} colorFrom="var(--gold)" colorTo="transparent" />}
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-4">Win Rate</span>
              <div className="relative">
                <CircularProgress value={winRate} color={winRate >= 50 ? "var(--brand-green)" : "var(--brand-red)"} label="" />
                {myRank > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -bottom-2 -right-2 bg-amber-500 text-black font-black text-xs px-2 py-1 rounded-lg border-2 border-card shadow-lg flex items-center gap-1"
                  >
                    <Trophy size={10} /> #{myRank}
                  </motion.div>
                )}
              </div>
              {winStreak >= 2 && (
                <div className="mt-4 text-[10px] font-bold text-orange-500 tracking-wide uppercase flex items-center gap-1 animate-pulse">
                  🔥 {winStreak} Streak
                </div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="md:col-span-4 grid grid-cols-2 gap-4"
            >
              <div className="bg-card border border-border shadow-md rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer" />
                <Swords size={20} className="text-muted-foreground mb-2" />
                <span className="text-3xl font-black font-score leading-none"><NumberTicker value={played} /></span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Matches</span>
              </div>
              <div className="bg-card border border-border shadow-md rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer" />
                <Trophy size={20} className="text-amber-500 mb-2" />
                <span className="text-3xl font-black font-score leading-none text-amber-500"><NumberTicker value={won} /></span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Wins</span>
              </div>
              <div className="bg-card border border-border shadow-md rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer" />
                <Target size={20} className="text-muted-foreground mb-2" />
                <span className="text-3xl font-black font-score leading-none"><NumberTicker value={goals} /></span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Goals</span>
              </div>
              <div className="bg-card border border-border shadow-md rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer" />
                <Activity size={20} className="text-blue-500 mb-2" />
                <span className="text-3xl font-black font-score leading-none text-blue-500"><NumberTicker value={played > 0 ? Math.round((goals/played)*10)/10 : 0} /></span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Gls/Game</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="md:col-span-4 rounded-3xl bg-card border border-border shadow-xl overflow-hidden flex flex-col relative group"
            >
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer z-10" />
              <div className="flex-1 p-5 flex items-center gap-4 border-b border-border/50 relative overflow-hidden bg-secondary/20">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-current opacity-5" style={{ color: selectedClub && CLUB_COLORS[selectedClub.name] ? CLUB_COLORS[selectedClub.name].primary : 'transparent' }} />
                <div className="shrink-0 bg-background/50 backdrop-blur p-2 rounded-xl border border-border shadow-sm z-10">
                  {selectedClub ? <ClubLogo club={selectedClub} size={48} /> : <Shield size={48} className="text-muted-foreground opacity-30" />}
                </div>
                <div className="flex flex-col z-10">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Favorite Club</span>
                  <span className="text-lg font-black truncate">{selectedClub ? selectedClub.name : 'Not set'}</span>
                </div>
              </div>
              <div className="flex-1 p-5 flex items-center gap-4 relative overflow-hidden bg-secondary/10">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gold opacity-5" />
                <div className="shrink-0 bg-background/50 backdrop-blur p-2 rounded-xl border border-border shadow-sm z-10">
                  {selectedNationalTeam ? <WavingFlag url={selectedNationalTeam.flag_url} size="lg" /> : <WavingFlag code="UN" size="lg" />}
                </div>
                <div className="flex flex-col z-10">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">National Team</span>
                  <span className="text-lg font-black truncate">{selectedNationalTeam ? selectedNationalTeam.name : 'Not set'}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {biggestRival && rivalStats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              onClick={() => onH2HClick(biggestRival.id)}
              className="w-full relative rounded-3xl bg-card border border-border shadow-xl p-4 sm:p-6 overflow-hidden cursor-pointer group hover:border-amber-500/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 opacity-50" />
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-4 w-full sm:w-1/3 justify-start">
                  <Avatar p={me} size={48} className="ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">You</span>
                    <span className="text-lg font-black truncate text-red-500">{rivalStats.w} Wins</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 w-full sm:w-1/3">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Swords size={14} className="text-muted-foreground" />
                    <Badge className="bg-black text-[10px] font-black border-white/10 shadow-sm tracking-widest px-3 py-1">H2H CLASH</Badge>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden flex w-full relative border border-border/50 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={!shouldReduceMotion ? { width: `${(rivalStats.w / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` } : { width: `${(rivalStats.w / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` }}
                      transition={{ duration: 1.5, type: "spring", bounce: 0, delay: 0.5 }}
                      className="h-full bg-red-500 rounded-l-full relative z-10 shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    />
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={!shouldReduceMotion ? { width: `${(rivalStats.l / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` } : { width: `${(rivalStats.l / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` }}
                      transition={{ duration: 1.5, type: "spring", bounce: 0, delay: 0.5 }}
                      className="absolute right-0 top-0 bottom-0 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                    />
                  </div>
                  <div className="text-[9px] uppercase font-bold text-muted-foreground mt-1 whitespace-nowrap">Tap to view full history <ArrowRight size={10} className="inline ml-0.5"/></div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-1/3 justify-end text-right">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rival</span>
                    <span className="text-lg font-black truncate text-blue-500">{rivalStats.l} Wins</span>
                  </div>
                  <Avatar p={biggestRival} size={48} className="ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0" />
                </div>

              </div>
            </motion.div>
          )}
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

        <FadeIn delay={0.25} className="col-span-12">
          <TrophyCabinetSection
            trophies={trophies}
            myTrophies={myTrophies}
            meBadges={me.badges || []}
            onSelectTrophy={(data) => setSelectedTrophy(data)}
          />
        </FadeIn>

        {myLive.map((m, i) => (
          <FadeIn key={m.id} delay={0.3} className="col-span-12">
            <ProMatchFixtureCard 
              m={m} 
              h={players.find(p => p.id === m.homeId)} 
              a={players.find(p => p.id === m.awayId)} 
              hStats={getPlayerStats(m.homeId)}
              aStats={getPlayerStats(m.awayId)}
              index={tMatches.findIndex(tm => tm.id === m.id) >= 0 ? tMatches.findIndex(tm => tm.id === m.id) : i}
              onClick={() => onMatchClick(m)} 
            />
          </FadeIn>
        ))}

        <FadeIn delay={0.35} className="col-span-12 h-full mb-8">
          <MagicCard className="p-0 overflow-hidden flex flex-col h-full bg-[#181a20]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.05] bg-gradient-to-r from-black/40 to-transparent">
              <SectionTitle icon={ListOrdered}>Current Standings</SectionTitle>
              <Btn variant="ghost" className="text-xs p-1 h-auto text-amber-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => setTab('matches')}>
                Full Table <ArrowRight size={14} className="ml-1" />
              </Btn>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] bg-black/40 border-b border-white/[0.05]">
                    <th className="py-4 px-4 text-center w-12">#</th>
                    <th className="py-4 px-4 font-bold">Player</th>
                    <th className="py-4 px-3 text-center">P</th>
                    <th className="py-4 px-3 text-center">W</th>
                    <th className="py-4 px-3 text-center">D</th>
                    <th className="py-4 px-3 text-center">L</th>
                    <th className="py-4 px-3 text-center">GF</th>
                    <th className="py-4 px-3 text-center">GA</th>
                    <th className="py-4 px-3 text-center">GD</th>
                    <th className="py-4 px-4 text-center text-amber-500 font-bold">PTS</th>
                    <th className="py-4 px-4 text-center">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {standings.map((s, i) => {
                    const isTop1 = i === 0;
                    const isTop2 = i === 1;
                    const isTop3 = i === 2;
                    const isMe = me && s.id === me.id;

                    let rowStyle = 'hover:bg-white/[0.02] transition-colors duration-300';
                    let rankStyle = 'text-muted-foreground font-bold';
                    let nameStyle = 'font-bold text-foreground';

                    if (isTop1) {
                      rowStyle = 'bg-gradient-to-r from-amber-500/10 via-transparent to-transparent hover:from-amber-500/20 border-l-2 border-l-amber-500 transition-all duration-300 shadow-[inset_0_1px_0_rgba(245,158,11,0.1)]';
                      rankStyle = 'text-amber-400 font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
                      nameStyle = 'font-black text-amber-50 drop-shadow-sm';
                    } else if (isTop2) {
                      rowStyle = 'bg-gradient-to-r from-slate-300/10 via-transparent to-transparent hover:from-slate-300/20 border-l-2 border-l-slate-300 transition-all duration-300';
                      rankStyle = 'text-slate-300 font-black drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]';
                      nameStyle = 'font-black text-slate-100';
                    } else if (isTop3) {
                      rowStyle = 'bg-gradient-to-r from-orange-700/10 via-transparent to-transparent hover:from-orange-700/20 border-l-2 border-l-orange-700 transition-all duration-300';
                      rankStyle = 'text-orange-500 font-black drop-shadow-[0_0_8px_rgba(194,65,12,0.4)]';
                      nameStyle = 'font-black text-orange-100';
                    } else if (isMe) {
                      rowStyle = 'bg-white/[0.03] hover:bg-white/[0.05] border-l-2 border-l-white/20 transition-all duration-300';
                    }

                    return (
                      <tr key={s.id} className={`group ${rowStyle}`}>
                        <td className={`py-4 px-4 text-center text-lg font-score ${rankStyle}`}>{i + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar p={players.find(p => p.id === s.id)} size={36} className={`border ${isTop1 ? 'border-amber-500/50' : isTop2 ? 'border-slate-300/50' : isTop3 ? 'border-orange-700/50' : 'border-white/10'}`} />
                              {isTop1 && <div className="absolute -top-2 -right-2 text-lg drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">👑</div>}
                            </div>
                            <span className={`${nameStyle} text-[15px]`}>{s.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center text-muted-foreground font-score group-hover:text-foreground transition-colors">{s.played}</td>
                        <td className="py-4 px-3 text-center text-emerald-400/70 font-score group-hover:text-emerald-400 transition-colors">{s.won}</td>
                        <td className="py-4 px-3 text-center text-slate-400/70 font-score group-hover:text-slate-300 transition-colors">{s.drawn}</td>
                        <td className="py-4 px-3 text-center text-red-400/70 font-score group-hover:text-red-400 transition-colors">{s.lost}</td>
                        <td className="py-4 px-3 text-center text-muted-foreground font-score">{s.gf}</td>
                        <td className="py-4 px-3 text-center text-muted-foreground font-score">{s.ga}</td>
                        <td className="py-4 px-3 text-center text-muted-foreground font-score">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                        <td className={`py-4 px-4 text-center font-black font-score text-lg ${isTop1 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-pitch-bright'}`}>{s.pts}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            {s.form.slice(-5).map((resObj, idx) => {
                              const res = typeof resObj === 'object' && resObj !== null ? resObj.result : resObj;
                              return (
                                <span key={idx} className={`w-4 h-4 rounded-[4px] flex items-center justify-center text-[9px] font-bold text-black shadow-inner
                                    ${res === 'W' ? 'bg-emerald-500 shadow-emerald-500/50' : res === 'D' ? 'bg-slate-400 shadow-slate-400/50' : 'bg-red-500 shadow-red-500/50'}
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
      </div>
    </div>
  );
}

function LegacyProgressBar({ multiWinCount, totalPossible, completePct }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 mt-6 rounded-xl border border-amber-500/10 bg-zinc-950/80">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center shrink-0">
          <Trophy size={20} className="text-amber-500" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-amber-500 tracking-widest uppercase">Legacy In Progress</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">Every trophy tells a story of dedication, passion, and greatness.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-amber-400">{multiWinCount}</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Multi-Win</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-amber-400">{totalPossible}</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Possible</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-amber-500 drop-shadow-md" strokeDasharray={`${completePct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span className="absolute text-[10px] font-black text-white">{completePct}%</span>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">
            VIEW STATS <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedTrophyCard({ trophy, onClick }) {
  const isUnlocked = !trophy.locked;
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e) => {
    if (!isUnlocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        layoutId={trophy.id}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        role="button"
        className="col-span-1 row-span-3 relative flex flex-col items-center justify-center rounded-2xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 overflow-hidden h-full min-h-[360px]"
        style={{
          background: isUnlocked 
            ? 'linear-gradient(180deg, rgba(20,20,22,0.95) 0%, rgba(10,10,12,0.95) 100%)' 
            : 'rgba(10,10,12,0.8)',
          border: isUnlocked ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.05)',
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        whileHover={isUnlocked ? { scale: 1.02 } : { scale: 1.01, opacity: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isUnlocked && (
          <>
            <motion.div
              className="absolute inset-0 z-0 pointer-events-none"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(251,191,36,0.06) 50%, transparent 80%)', transform: "translateZ(0)" }}
            />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.15),transparent_70%)]" style={{ transform: "translateZ(0)" }} />
          </>
        )}

        <div className="absolute top-4 left-4 z-20" style={{ transform: isUnlocked ? "translateZ(20px)" : "none" }}>
          <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-black tracking-widest text-amber-500">FEATURED</span>
        </div>

        {isUnlocked && trophy.wins > 1 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: [1, 1.15, 1], opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute top-4 right-4 z-20 flex flex-col items-center justify-center w-12 h-12 rounded-full border border-amber-400 bg-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            style={{ transform: "translateZ(30px)" }}
          >
            <span className="text-xs font-black text-amber-400">x{trophy.wins}</span>
            <span className="text-[7px] font-bold text-amber-500/80 mt-0.5 tracking-widest">WINS</span>
          </motion.div>
        )}

        <motion.div 
          className={`relative z-10 w-full flex-1 flex flex-col items-center justify-center p-8 ${!isUnlocked ? 'grayscale opacity-40' : ''}`}
          animate={isUnlocked ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: isUnlocked ? "translateZ(50px)" : "none" }}
        >
          {trophy.icon ? (
            <img src={trophy.icon} alt={trophy.name} className="w-full max-h-48 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
          ) : (
            <span className="text-6xl">{trophy.fallbackIcon}</span>
          )}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock size={48} className="text-zinc-400" />
            </div>
          )}
        </motion.div>

        <div className="relative z-20 w-full p-6 text-center border-t border-white/5 bg-black/40 backdrop-blur-md" style={{ transform: isUnlocked ? "translateZ(20px)" : "none" }}>
          <h3 className={`text-lg font-black uppercase tracking-wider ${isUnlocked ? 'text-amber-400' : 'text-zinc-500'}`}>{trophy.name}</h3>
          {isUnlocked && trophy.seasons?.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              {trophy.seasons.map((s, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[10px] font-bold tracking-widest text-amber-500">{s}</span>
                  {i < trophy.seasons.length - 1 && <span className="text-amber-500/30 text-[8px] mx-1.5">•</span>}
                </div>
              ))}
            </div>
          ) : !isUnlocked ? (
            <div className="mt-3 text-[10px] tracking-widest text-zinc-500 font-bold uppercase">Locked</div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function TrophyTile({ trophy, onClick }) {
  const isUnlocked = !trophy.locked;
  const isGold = ['championship', 'mvp'].includes(trophy.tier);
  const glowColor = isGold ? 'rgba(251,191,36,0.1)' : trophy.tier === 'scoring' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)';
  const textColor = isUnlocked ? (isGold ? 'text-amber-400' : 'text-zinc-200') : 'text-zinc-500';

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    if (!isUnlocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 800 }} className="h-full">
      <motion.div
        layoutId={trophy.id}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        role="button"
        className="relative flex flex-col rounded-2xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 overflow-hidden h-full min-h-[160px]"
        style={{
          background: isUnlocked 
            ? 'linear-gradient(180deg, rgba(20,20,22,0.9) 0%, rgba(10,10,12,0.9) 100%)' 
            : 'rgba(10,10,12,0.6)',
          border: isUnlocked ? '1px solid rgba(245,158,11,0.15)' : '1px solid rgba(255,255,255,0.04)',
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        whileHover={isUnlocked ? { scale: 1.05 } : { scale: 1.01, opacity: 0.6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isUnlocked && (
          <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(circle at 50% 30%, ${glowColor}, transparent 60%)`, transform: "translateZ(0)" }} />
        )}
        
        {isUnlocked && trophy.wins > 1 && (
          <div className="absolute top-3 right-3 z-20 flex flex-col items-center justify-center px-2 py-1 rounded-md border border-amber-500/40 bg-zinc-950/80 shadow-md" style={{ transform: "translateZ(15px)" }}>
            <span className="text-[10px] font-black text-amber-400 leading-none">x{trophy.wins}</span>
            <span className="text-[6px] font-bold text-amber-500/80 uppercase mt-0.5 tracking-widest leading-none">WINS</span>
          </div>
        )}

        {!isUnlocked && (
          <div className="absolute top-3 left-3 z-20">
            <Lock size={14} className="text-zinc-600" />
          </div>
        )}

        <div className={`relative z-10 flex-1 flex items-center justify-center p-4 ${!isUnlocked ? 'grayscale opacity-40' : ''}`} style={{ transform: isUnlocked ? "translateZ(30px)" : "none" }}>
          {trophy.icon ? (
            <img src={trophy.icon} alt={trophy.name} className="h-16 w-16 object-contain drop-shadow-xl" />
          ) : (
            <span className="text-4xl">{trophy.fallbackIcon}</span>
          )}
        </div>

        <div className="relative z-20 w-full px-3 pb-3 pt-2 text-center bg-black/20" style={{ transform: isUnlocked ? "translateZ(10px)" : "none" }}>
          <h4 className={`text-[10px] font-black uppercase tracking-wider truncate ${textColor}`}>{trophy.name}</h4>
          
          {isUnlocked && trophy.seasons?.length > 0 ? (
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-center gap-1.5">
              {trophy.seasons.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-bold tracking-widest text-zinc-400">{s}</span>
                </div>
              ))}
            </div>
          ) : !isUnlocked ? (
            <div className="mt-2 pt-2 border-t border-white/5 text-[9px] tracking-widest text-zinc-600 font-bold uppercase">Locked</div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function TrophyCabinetSection({ trophies = [], myTrophies = [], meBadges = [], onSelectTrophy }) {
  const [activeCategory, setActiveCategory] = React.useState('ALL');

  const templateMap = React.useMemo(() => {
    const map = new Map();
    const seenImages = new Set();

    BENTO_TROPHIES.forEach(t => {
      if (t.image) seenImages.add(t.image);
      map.set(t.id, { ...t, locked: true });
    });

    trophies.forEach(t => {
      const key = t.templateId || t.title.toLowerCase().replace(/\s+/g, '-');
      const isDuplicateImage = t.icon && seenImages.has(t.icon);
      if (!map.has(key) && !isDuplicateImage) {
        if (t.icon) seenImages.add(t.icon);
        map.set(key, {
          id: t.id,
          name: t.title,
          image: t.icon || null,
          icon: '🏆',
          category: 'Special',
          priority: 99,
          requirement: t.description || 'Admin Award',
          locked: true,
          scale: 0.88,
        });
      }
    });

    meBadges.forEach(badgeName => {
      const badgeKey = `badge-${badgeName.toLowerCase().replace(/\s+/g, '-')}`;
      if (!map.has(badgeKey)) {
        map.set(badgeKey, {
          id: badgeKey,
          name: badgeName,
          image: null,
          icon: '🎖️',
          category: 'Special',
          priority: 100,
          requirement: 'Admin Awarded Badge',
          locked: false,
          isBadge: true,
          scale: 0.88,
        });
      }
    });

    return map;
  }, [trophies, meBadges]);

  const allTrophyList = React.useMemo(() =>
    Array.from(templateMap.values()).sort((a, b) => (a.priority || 99) - (b.priority || 99)),
    [templateMap]
  );

  const formattedTrophies = React.useMemo(() => {
    return allTrophyList.map(tr => {
      const isUnlocked = myTrophies.some(t => t.title === tr.name || t.id === tr.id || t.icon === tr.image) || tr.locked === false;
      const instances = tr.isBadge ? [tr] : myTrophies.filter(t => t.title === tr.name || t.id === tr.id || t.icon === tr.image);
      const wins = instances.length;
      const seasons = instances.map(inst => inst.season || (inst.createdAt ? new Date(inst.createdAt).getFullYear() : 'Earned'));

      return {
        id: tr.id,
        name: tr.name,
        tier: tr.category === 'Special' ? 'special' : (tr.tier || 'championship'),
        icon: tr.image, 
        fallbackIcon: tr.icon,
        seasons: [...new Set(seasons)],
        wins: wins,
        locked: !isUnlocked,
        featured: tr.id === 'bb-championship',
        category: tr.category.toUpperCase(),
        raw: tr,
        instances: instances
      };
    });
  }, [allTrophyList, myTrophies]);

  const displayList = activeCategory === 'ALL' 
    ? formattedTrophies 
    : formattedTrophies.filter(t => t.category === activeCategory);

  const featured = displayList.find(t => t.featured) || displayList[0];
  const remaining = displayList.filter(t => t.id !== featured?.id);

  const totalPossible = formattedTrophies.length;
  const totalUnlocked = formattedTrophies.filter(t => !t.locked).length;
  const completePct = totalPossible > 0 ? Math.round((totalUnlocked / totalPossible) * 100) : 0;
  const multiWinCount = myTrophies.length - totalUnlocked;

  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-8 bg-zinc-950 rounded-2xl border border-white/5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TROPHY_CATEGORIES.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeCategory === tab 
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-bold tracking-widest px-4 py-2 bg-white/5 rounded-lg border border-white/5">
            <span>{totalUnlocked} EARNED</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span className="text-amber-500">{completePct}% COMPLETE</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5 hidden md:flex">
            <button className="p-1.5 bg-white/10 rounded text-white shadow-sm"><LayoutGrid size={16} /></button>
            <button className="p-1.5 text-zinc-500 hover:text-zinc-300"><List size={16} /></button>
          </div>
        </div>
      </div>

      {displayList.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
          <LayoutGrid size={48} className="opacity-20 mb-4" />
          <p className="text-sm tracking-widest uppercase font-bold">No Trophies Match Filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {featured && (
            <div className="md:col-span-4 lg:col-span-1 lg:row-span-3">
              <FeaturedTrophyCard trophy={featured} onClick={() => onSelectTrophy && onSelectTrophy({ trophy: featured.raw, unlocked: !featured.locked, count: featured.wins, instances: featured.instances, requirement: featured.raw.requirement })} />
            </div>
          )}

          <div className="md:col-span-4 lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr grid-flow-dense">
            <AnimatePresence mode="popLayout">
              {remaining.map((trophy, i) => (
                <motion.div
                  key={trophy.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="col-span-1"
                >
                  <TrophyTile trophy={trophy} onClick={() => onSelectTrophy && onSelectTrophy({ trophy: trophy.raw, unlocked: !trophy.locked, count: trophy.wins, instances: trophy.instances, requirement: trophy.raw.requirement })} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <LegacyProgressBar multiWinCount={multiWinCount} totalPossible={totalPossible} completePct={completePct} />
    </div>
  );
}

function RosterView({ players, matches, setTab }) {
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
              <MagicCard onClick={() => router.push(`/player/${p.username || p.id}`)} className="p-5 flex items-center gap-4 hover:border-slate-300 dark:hover:border-border transition-all cursor-pointer group bg-white dark:bg-stadium-surface/40 hover:bg-slate-50 dark:hover:bg-stadium-surface/60 border border-slate-200 dark:border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md dark:hover:shadow-lg hover:-translate-y-1">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold/50 via-pitch-bright to-claret/50 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative rounded-full bg-white dark:bg-card p-0.5 border border-slate-200 dark:border-border/50 shadow-sm ring-4 ring-white dark:ring-transparent">
                    <Avatar p={p} size={56} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-lg font-heading flex items-center gap-2 truncate text-slate-900 dark:text-foreground">
                    <span className="truncate">{p.name}</span>
                    {p.nationality && (
                      <span className="shrink-0 text-[10px] font-score tracking-wider font-semibold border border-slate-200 dark:border-border/50 rounded px-1.5 py-0.5 bg-slate-100 dark:bg-background/50 shadow-sm text-slate-600 dark:text-muted-foreground">
                        {p.nationality}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                    {p.teamLogo && <img src={p.teamLogo} className="w-3.5 h-3.5 object-contain" alt="" />}
                    {p.teamName || `${p.name}'s XI`}
                  </div>

                  <div className="flex gap-1.5 mt-3 text-[10px] font-score tracking-wider">
                    <span className="flex items-center justify-center font-bold px-2 py-0.5 rounded-sm bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 shadow-sm dark:shadow-none">
                      {wins}W
                    </span>
                    <span className="flex items-center justify-center font-bold px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20 shadow-sm dark:shadow-none">
                      {draws}D
                    </span>
                    <span className="flex items-center justify-center font-bold px-2 py-0.5 rounded-sm bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 shadow-sm dark:shadow-none">
                      {losses}L
                    </span>
                    {golds > 0 && (
                      <span className="flex items-center justify-center gap-1 font-bold px-2 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-400/20 shadow-sm dark:shadow-none">
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

function HistoryView({ history, players, matches, setTab }) {
  if (!history || history.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="No completed seasons yet." /></Card></FadeIn>;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="History" onBack={() => setTab('dashboard')} />

      {history.map((t, i) => {
        const mvp = players.find((p) => p.id === t.mvpId);
        const seasonMatches = t.matches && t.matches.length > 0 ? t.matches : matches.filter(m => m.seasonId === t.id);

        return (
          <FadeIn key={t.id} delay={i * 0.1}>
            <MagicCard className="p-6 bg-gradient-to-br from-card to-secondary/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-2">
                <div className="font-bold text-2xl font-heading">{t.name}</div>
                <span className="text-sm text-muted-foreground font-score bg-background/50 px-3 py-1 rounded-full w-fit">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {mvp && (
                <div className="mt-4 text-sm flex items-center gap-2 justify-center text-pitch-bright font-medium">
                  <Trophy size={16} /> MVP of the season: <strong className="font-bold">{mvp.name}</strong>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-border/50 dark:border-white/[0.06]">
                <SeasonSummaryDashboard season={t} matches={seasonMatches} players={players} compact />
              </div>
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
