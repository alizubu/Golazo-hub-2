'use client';

import React from 'react';
import { PageHeader } from '@/app/components/shared/PageHeader';
import { Trophy, Clock, ListOrdered, Calendar, Swords, Megaphone, Bell, Pen, Target, Handshake, Shield, Activity, Lock, Flame, BadgeCheck, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Btn, Badge, Avatar, PlayerChip, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Label, WavingFlag, PlayStyleBadge, OnFireAvatar } from '@/app/components/shared/UI';
import { AvatarWithBadge } from '@/app/components/shared/FootballIdentity';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { ClubLogo } from '@/app/components/shared/ClubLogo';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
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

      {/* ── NEW GLASS BENTO HERO ── */}
      <FadeIn delay={0.1}>
        <div className="relative w-full mb-10 flex flex-col gap-4">
          
          {/* 1. Cover Banner & Sharp Header */}
          <div className="relative rounded-none sm:rounded-3xl overflow-hidden border-b sm:border border-border shadow-sm bg-card mb-4">
            {/* Cover Image */}
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
            
            {/* Identity Card Block */}
            <div className="px-5 py-5 sm:px-8 sm:py-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-20">
              {/* Left: Identity */}
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
                    {myRank === 1 && <BadgeCheck size={20} className="text-blue-500 shrink-0" title="Top Ranked Player" />}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <span className="text-muted-foreground font-medium text-sm">@{me.username}</span>
                    <PlayStyleBadge style={me.playStyle} showLabel={false} size="sm" />
                  </div>
                  
                  {/* Actions inside Left block for mobile flow */}
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

              {/* Right: Actions & Status */}
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

          {/* 2. Bento Grid (Stats & Identity) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Win Rate Hero (4 cols) */}
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

            {/* Micro Stats (4 cols) */}
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

            {/* Identity Split (4 cols) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="md:col-span-4 rounded-3xl bg-card border border-border shadow-xl overflow-hidden flex flex-col relative group"
            >
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer z-10" />
              {/* Club Top Half */}
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
              {/* Nation Bottom Half */}
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

          {/* 3. Rivalry Clash Banner */}
          {biggestRival && rivalStats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              onClick={() => onH2HClick(biggestRival.id)}
              className="w-full relative rounded-3xl bg-card border border-border shadow-xl p-4 sm:p-6 overflow-hidden cursor-pointer group hover:border-amber-500/50 transition-colors"
            >
              {/* Cinematic Background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 opacity-50" />
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Me (Left) */}
                <div className="flex items-center gap-4 w-full sm:w-1/3 justify-start">
                  <Avatar p={me} size={48} className="ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">You</span>
                    <span className="text-lg font-black truncate text-red-500">{rivalStats.w} Wins</span>
                  </div>
                </div>

                {/* VS Tug of War (Center) */}
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

                {/* Rival (Right) */}
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

        {/* Trophy Cabinet — Hall of Fame */}
        <FadeIn delay={0.25} className="col-span-12">
          <TrophyCabinetSection
            trophies={trophies}
            myTrophies={myTrophies}
            meBadges={me.badges || []}
            onSelectTrophy={(data) => setSelectedTrophy(data)}
          />
        </FadeIn>

        {/* Live Matches */}
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

        {/* Cinematic Leaderboard */}
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
                    {getPlayerIdentityBadgeUrl(s) && <img src={getPlayerIdentityBadgeUrl(s)} alt="badge" className="w-4 h-4 object-contain drop-shadow-sm shrink-0" />}
                    <span className="font-semibold">{s.name}</span>
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
  const standings = computeStandings(tMatches, players, activeSeason.id);

  const getStats = (id) => {
    const row = standings.find(s => s.id === id);
    const rank = standings.findIndex(s => s.id === id) + 1;
    return { rank: rank > 0 ? rank : '-', wins: row ? row.won : 0 };
  };

  return (
    <FadeIn delay={0.1}>
      <Card className="p-5">
        <SectionTitle icon={Calendar}>All Matches</SectionTitle>
        <div className="flex flex-col gap-3">
          {tMatches.map((m, i) => {
            const h = players.find(p => p.id === m.homeId);
            const a = players.find(p => p.id === m.awayId);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <ProMatchFixtureCard 
                  m={m} 
                  h={h} 
                  a={a} 
                  hStats={getStats(m.homeId)}
                  aStats={getStats(m.awayId)}
                  index={i}
                  onClick={() => onMatchClick(m)} 
                />
              </motion.div>
            );
          })}
        </div>
      </Card>
    </FadeIn>
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
        // Use season's included matches if available, otherwise filter from all matches
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

              {/* Season Summary Dashboard */}
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


// ─── Trophy Cabinet — Hall of Fame ────────────────────────────────────────────

function TrophyCabinetSection({ trophies, myTrophies, meBadges, onSelectTrophy }) {
  const [activeCategory, setActiveCategory] = React.useState('ALL');

  // Build trophy template map (same merge logic, preserved)
  const templateMap = React.useMemo(() => {
    const map = new Map();
    const seenImages = new Set();

    // 1. Official trophy templates
    BENTO_TROPHIES.forEach(t => {
      if (t.image) seenImages.add(t.image);
      map.set(t.id, { ...t, locked: true });
    });

    // 2. Custom admin-awarded trophies not matching a template
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

    // 3. Admin badges
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

  const filteredList = React.useMemo(() =>
    activeCategory === 'ALL'
      ? allTrophyList
      : allTrophyList.filter(t => t.category === activeCategory),
    [allTrophyList, activeCategory]
  );

  // Stats
  const unlockedCount = allTrophyList.filter(tr =>
    myTrophies.some(t => t.title === tr.name || t.id === tr.id || t.icon === tr.image) || tr.locked === false
  ).length;
  const totalCount = allTrophyList.length;
  const completePct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const multiWinCount = allTrophyList.filter(tr => {
    const instances = tr.isBadge ? [] : myTrophies.filter(t => t.title === tr.name || t.id === tr.id || t.icon === tr.image);
    return instances.length > 1;
  }).length;
  const totalSeasons = [...new Set(myTrophies.map(t => t.season).filter(Boolean))].length;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, #0D1117 0%, #07090D 100%)',
        border: '1px solid rgba(214,166,58,0.12)',
        boxShadow: 'inset 0 1px 0 rgba(214,166,58,0.08), 0 20px 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Ambient ceiling glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-24 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(214,166,58,0.10) 0%, transparent 70%)' }} />
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: "url('/assets/noise.png')" }} />

      {/* ── Header ── */}
      <div className="relative z-10 px-5 sm:px-8 pt-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          {/* Title */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#D6A63A,#A87522)', boxShadow: '0 0 12px rgba(214,166,58,0.4)' }}>
                <Trophy size={16} className="text-black" />
              </div>
              <span className="text-xs uppercase tracking-[0.25em] font-black" style={{ color: '#D6A63A', fontFamily: "'Sora', sans-serif" }}>Trophy Cabinet</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-black uppercase tracking-wider" style={{ color: '#F5F7FA', fontFamily: "'Sora', sans-serif", letterSpacing: '0.08em' }}>
              Hall of Champions
            </h2>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {[
              { label: 'Trophies', value: unlockedCount, icon: '🏆' },
              { label: 'Seasons', value: totalSeasons || '–', icon: '📅' },
              { label: 'Complete', value: `${completePct}%`, icon: null, isPercent: true, pct: completePct },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(214,166,58,0.07)', border: '1px solid rgba(214,166,58,0.15)' }}>
                {s.icon && <span className="text-xs">{s.icon}</span>}
                {s.isPercent && (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(214,166,58,0.15)" strokeWidth="2.5" />
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#D6A63A" strokeWidth="2.5"
                      strokeDasharray={`${(s.pct / 100) * 62.8} 62.8`} strokeLinecap="round" />
                  </svg>
                )}
                <span className="text-xs font-black" style={{ color: '#F4C95D', fontFamily: "'Sora', sans-serif" }}>{s.value}</span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: '#5E6877' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-4 scrollbar-none" style={{ borderBottom: '1px solid rgba(214,166,58,0.08)' }}>
          {TROPHY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black transition-all duration-200"
              style={activeCategory === cat ? {
                background: 'linear-gradient(135deg,#D6A63A,#A87522)',
                color: '#000',
                boxShadow: '0 0 12px rgba(214,166,58,0.3)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: '#5E6877',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Trophy Grid ── */}
      <div className="relative z-10 px-5 sm:px-8 py-6 md:py-8">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-4xl opacity-20">🏆</div>
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#5E6877' }}>No Trophies Yet</p>
            <p className="text-xs" style={{ color: '#3D4554' }}>Your next victory belongs here.</p>
          </div>
        ) : (
          <>
            {/* Responsive bento grid */}
            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr grid-flow-dense"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
            >
              {filteredList.map((tr) => {
                const isAllCategory = activeCategory === 'ALL';
                
                let spanClasses = "col-span-1 row-span-1";
                let isHero = false;
                
                if (isAllCategory) {
                  if (tr.id === 'bb-championship') {
                    spanClasses = "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 aspect-[4/3] md:aspect-auto";
                    isHero = true;
                  } else if (['mvp', 'golden-boot'].includes(tr.id)) {
                    spanClasses = "col-span-1 md:col-span-1 lg:col-span-2 row-span-1";
                  }
                }

                const isUnlocked = myTrophies.some(t => t.title === tr.name || t.id === tr.id || t.icon === tr.image) || tr.locked === false;
                const instances = tr.isBadge ? [tr] : myTrophies.filter(t => t.title === tr.name || t.id === tr.id || t.icon === tr.image);
                const count = instances.length;

                return (
                  <motion.div
                    key={tr.id}
                    className={spanClasses}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <HallOfFameTrophyCard
                      trophy={tr}
                      unlocked={isUnlocked}
                      count={count}
                      instances={instances}
                      isHero={isHero}
                      onSelect={() => onSelectTrophy({ trophy: tr, unlocked: isUnlocked, count, instances, requirement: tr.requirement })}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}

      </div>

      {/* ── Legacy Footer ── */}
      <div
        className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 sm:px-8 py-4"
        style={{ borderTop: '1px solid rgba(214,166,58,0.08)', background: 'rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(214,166,58,0.08)', border: '1px solid rgba(214,166,58,0.15)' }}>
            <Trophy size={18} style={{ color: '#D6A63A' }} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#D6A63A' }}>Legacy In Progress</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#5E6877' }}>Every trophy tells a story of dedication, passion, and greatness.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {[
            { label: 'Multi-Win', value: multiWinCount },
            { label: 'Possible', value: totalCount },
            { label: 'Complete', value: `${completePct}%` },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-base font-black" style={{ color: '#F4C95D', fontFamily: "'Sora', sans-serif" }}>{s.value}</span>
              <span className="text-[9px] uppercase tracking-widest" style={{ color: '#5E6877' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Individual Trophy Card ───────────────────────────────────────────────────

function HallOfFameTrophyCard({ trophy, unlocked, count = 0, instances = [], isHero, onSelect }) {
  const showMultiplier = count > 1;
  const imgScale = trophy.scale || 0.9;

  return (
    <motion.div
      onClick={() => onSelect && onSelect()}
      role="button"
      tabIndex={0}
      aria-label={`${trophy.name} trophy${unlocked ? ', earned' : ', locked'}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect && onSelect()}
      whileHover={unlocked ? { scale: 1.02, y: -4 } : { scale: 1.02, opacity: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative w-full h-full flex flex-col items-center cursor-pointer group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl border ${unlocked ? 'border-white/10' : 'border-white/5 opacity-50'}`}
      style={{
        background: unlocked
          ? 'linear-gradient(160deg, rgba(21, 24, 31, 0.9) 0%, rgba(13, 17, 23, 0.9) 40%, rgba(8, 10, 14, 0.9) 100%)'
          : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(8px)',
        boxShadow: unlocked
          ? '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 1px rgba(214,166,58,0.2)'
          : '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Spotlight behind trophy */}
      {unlocked && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-80"
          style={{
            width: isHero ? '100%' : '80%',
            height: isHero ? '80%' : '70%',
            background: 'radial-gradient(ellipse at 50% 10%, rgba(214,166,58,0.18) 0%, transparent 60%)',
          }}
        />
      )}

      {/* Ambient shimmer on featured tile */}
      {unlocked && isHero && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(214,166,58,0.08) 50%, transparent 70%)',
          }}
        />
      )}

      {/* Fast metallic sweep on hover for all unlocked tiles */}
      {unlocked && (
        <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1000ms] ease-in-out pointer-events-none z-20" />
      )}

      {/* Multiplier Badge */}
      {showMultiplier && (
        <div className="absolute top-4 right-4 z-30">
          <span className="absolute inset-0 rounded-lg bg-amber-400/30 animate-ping" />
          <div
            className="relative flex flex-col items-center justify-center w-11 h-11 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #F4C95D, #A87522)',
              boxShadow: '0 4px 12px rgba(214,166,58,0.5)',
              border: '1px solid rgba(255,231,160,0.4)',
            }}
          >
            <span className="text-[10px] font-black text-black uppercase leading-none">x{count}</span>
            <span className="text-[8px] font-bold text-black/80 uppercase leading-none mt-0.5">WINS</span>
          </div>
        </div>
      )}

      {/* Locked icon */}
      {!unlocked && (
        <div className="absolute top-4 left-4 z-30 w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Lock size={14} style={{ color: '#3D4554' }} />
        </div>
      )}

      {/* Trophy image area */}
      <div
        className="flex items-end justify-center w-full relative"
        style={{
          flex: 1,
          padding: isHero ? '28px 24px 12px' : '16px 16px 8px',
        }}
      >
        <motion.div
          className="relative flex items-end justify-center w-full h-full"
          animate={unlocked ? { y: [0, -6, 0] } : {}}
          transition={unlocked ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : {}}
          style={{ maxHeight: isHero ? 240 : 130 }}
        >
          {typeof trophy.image === 'string' && trophy.image.startsWith('/') ? (
            <img
              src={trophy.image}
              alt={`${trophy.name} trophy`}
              className="w-full h-full"
              style={{
                objectFit: 'contain',
                objectPosition: 'bottom center',
                maxHeight: isHero ? 180 : 110,
                transform: `scale(${imgScale})`,
                transformOrigin: 'bottom center',
                filter: unlocked
                  ? 'drop-shadow(0 12px 20px rgba(0,0,0,0.7)) drop-shadow(0 4px 8px rgba(214,166,58,0.15))'
                  : 'grayscale(1) brightness(0.35)',
                transition: 'filter 0.4s ease',
              }}
              onError={e => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Emoji fallback */}
          <span
            style={{ display: (typeof trophy.image !== 'string' || !trophy.image.startsWith('/')) ? 'flex' : 'none' }}
            className="text-5xl items-center justify-center"
          >
            {trophy.icon || '🏆'}
          </span>
        </motion.div>

        {/* Floor ellipse shadow */}
        {unlocked && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-500 group-hover:opacity-100 opacity-60"
            style={{
              width: '50%',
              height: 8,
              borderRadius: '50%',
              background: 'rgba(214,166,58,0.25)',
              filter: 'blur(6px)',
              boxShadow: '0 0 12px rgba(214,166,58,0.4)',
            }}
          />
        )}
      </div>

      {/* Bottom nameplate */}
      <div
        className="relative z-10 w-full mt-auto"
        style={{
          background: 'rgba(0,0,0,0.35)',
          borderTop: `1px solid ${unlocked ? 'rgba(214,166,58,0.12)' : 'rgba(255,255,255,0.04)'}`,
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Trophy name */}
        <div className="px-3 pt-2.5 pb-1 text-center">
          <h4
            className="text-[11px] sm:text-xs font-black uppercase tracking-wider leading-tight line-clamp-1"
            style={{ color: unlocked ? '#F4C95D' : '#3D4554', fontFamily: "'Sora', sans-serif" }}
          >
            {trophy.name}
          </h4>
        </div>

        {/* Season ticker / locked message */}
        {unlocked && instances.length > 0 ? (
          <div className="w-full pb-3 px-3">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 w-full">
              {instances.map((inst, idx) => (
                <div key={idx} className="flex items-center shrink-0">
                  <span
                    className="text-[9px] uppercase tracking-widest font-bold"
                    style={{ color: '#D6A63A' }}
                  >
                    {inst.season || (inst.createdAt ? new Date(inst.createdAt).getFullYear() : 'Earned')}
                  </span>
                  {idx < instances.length - 1 && <span style={{ color: 'rgba(214,166,58,0.3)', fontSize: 8 }} className="ml-2">•</span>}
                </div>
              ))}
            </div>
          </div>
        ) : !unlocked ? (
          <div className="pb-2 text-center">
            <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#3D4554' }}>Locked</span>
          </div>
        ) : null}
      </div>

      {/* Hover border glow */}
      {unlocked && (
        <div
          className="absolute inset-0 rounded-[15px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(214,166,58,0.35), 0 0 20px rgba(214,166,58,0.08)' }}
        />
      )}
    </motion.div>
  );
}
