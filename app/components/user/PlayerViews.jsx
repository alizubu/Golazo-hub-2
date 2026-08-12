'use client';

import React from 'react';
import { PageHeader } from '@/app/components/shared/PageHeader';
import { Trophy, Clock, ListOrdered, Calendar, Swords, Megaphone, Bell, Pen, Target, Handshake, Shield, Activity, Lock, Flame, BadgeCheck, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Btn, Badge, Avatar, PlayerChip, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Label, WavingFlag, PlayStyleBadge, OnFireAvatar } from '@/app/components/shared/UI';
import { AvatarWithBadge } from '@/app/components/shared/FootballIdentity';
import { ClubLogo } from '@/app/components/shared/ClubLogo';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SettingsView from '@/app/components/shared/SettingsView';
import MatchesPage from '@/app/components/shared/MatchesPage';
import MatchCard from '@/app/components/shared/MatchCard';

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
  { id: 'bb-championship', name: 'BB Championship', requirement: 'Win the ultimate BB League title.', image: '/assets/trophies/BB-Champion.png', icon: '🏆' },
  { id: 'ballon-dor', name: "Ballon d'Or", requirement: 'Voted the absolute best player in the world.', image: '/assets/trophies/BalanDor.png', icon: '🥇' },
  { id: 'golden-boot', name: 'Golden Boot', requirement: 'Score the most goals in the season.', image: '/assets/trophies/Golden-boot.png', icon: '👟' },
  { id: 'most-successful-pass', name: 'Pass Master', requirement: 'Achieve the highest pass accuracy.', image: '/assets/trophies/MostPasses.png', icon: '🎯' },
  { id: 'mvp', name: 'Tournament MVP', requirement: 'Dominate the pitch and earn MVP honors.', image: '/assets/trophies/MVP.png', icon: '⭐' }
];

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
  const nextMatch = upcoming[0];
  const recent = [...myMatches].sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)).slice(0, 5);

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
          
          {/* 1. Cover Banner & Glass Header */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
            {/* Cover Image */}
            <div className="h-56 md:h-72 w-full relative bg-secondary/50 overflow-hidden">
              <motion.div 
                style={{ y: shouldReduceMotion ? 0 : coverY }} 
                className="w-full h-[120%] -top-[10%] absolute"
              >
                {me.coverBanner && failedCoverUrl !== me.coverBanner ? (
                  <img src={me.coverBanner} alt="Cover Banner" className="w-full h-full object-cover" onError={() => setFailedCoverUrl(me.coverBanner)} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-pitch/80 via-claret/60 to-gold/40 flex items-center justify-center">
                    <span className="text-6xl drop-shadow-2xl opacity-50">⚽</span>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Glassmorphic Overlay Header (Floats at bottom of cover) */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/40 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
              {/* Left: Identity */}
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative -mt-16 shrink-0">
                  <div className="absolute -inset-2 rounded-full blur-[10px] animate-pulse"
                    style={{
                      background: selectedClub && CLUB_COLORS[selectedClub.name]
                        ? `linear-gradient(135deg, ${CLUB_COLORS[selectedClub.name].primary}, ${CLUB_COLORS[selectedClub.name].secondary})`
                        : selectedNationalTeam
                          ? `linear-gradient(135deg, var(--gold), var(--claret))`
                          : `linear-gradient(135deg, var(--pitch-bright), var(--pitch))`
                    }}
                  />
                  <div className="relative rounded-full p-1.5 bg-card shadow-2xl ring-4 ring-background/50">
                    <AvatarWithBadge player={me} size={160} isOnFire={isOnFire} />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight truncate text-white drop-shadow-md">
                      {me.name}
                    </h1>
                    {myRank === 1 && <BadgeCheck size={20} className="text-blue-400 shrink-0 drop-shadow-md" title="Top Ranked Player" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/70 font-score text-sm drop-shadow-sm">@{me.username}</span>
                    <PlayStyleBadge style={me.playStyle} showLabel={false} size="sm" />
                  </div>
                </div>
              </div>

              {/* Right: Actions & Status */}
              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-end">
                {tMatches.some(m => m.round !== 'league' && m.round !== 'friendly') && (
                  <Btn variant="primary" onClick={() => setTab('matches')} className="gap-2 rounded-full border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-gradient-to-r from-amber-600 to-amber-500 text-white backdrop-blur h-9 px-4">
                    <Trophy size={14} /> Playoffs
                  </Btn>
                )}
                {form.length > 0 && (
                  <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
                    {form.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + (i * 0.05), type: 'spring' }}
                        title={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Draw'}
                        className={`w-2.5 h-6 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                          r === 'W' ? 'bg-green-500 shadow-green-500/50' : r === 'L' ? 'bg-red-500 shadow-red-500/50' : 'bg-amber-400 shadow-amber-400/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {!viewOnly && (
                  <Btn variant="outline" onClick={() => setTab('settings')} className="gap-2 rounded-full border-white/20 text-xs shadow-sm bg-black/50 hover:bg-white/20 text-white backdrop-blur h-9">
                    <Pen size={14} /> Edit
                  </Btn>
                )}
                {!viewOnly && (
                  <div className="flex items-center gap-1.5 text-xs text-green-400 font-semibold bg-black/40 px-3 py-1.5 rounded-full border border-green-400/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Online
                  </div>
                )}
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
                <div className="shrink-0 bg-background p-2 rounded-xl border border-border shadow-sm z-10">
                  {selectedClub ? <ClubLogo club={selectedClub} size={32} /> : <Shield size={32} className="text-muted-foreground opacity-30" />}
                </div>
                <div className="flex flex-col z-10">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Favorite Club</span>
                  <span className="text-sm font-black truncate">{selectedClub ? selectedClub.name : 'Not set'}</span>
                </div>
              </div>
              {/* Nation Bottom Half */}
              <div className="flex-1 p-5 flex items-center gap-4 relative overflow-hidden bg-secondary/10">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gold opacity-5" />
                <div className="shrink-0 bg-background p-2 rounded-xl border border-border shadow-sm z-10">
                  {selectedNationalTeam ? <WavingFlag url={selectedNationalTeam.flag_url} size="md" /> : <WavingFlag code="UN" size="md" />}
                </div>
                <div className="flex flex-col z-10">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">National Team</span>
                  <span className="text-sm font-black truncate">{selectedNationalTeam ? selectedNationalTeam.name : 'Not set'}</span>
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

        {/* Trophy Cabinet Row */}
        <FadeIn delay={0.25} className="col-span-12">
          <div className="relative overflow-hidden w-full bg-card dark:bg-card border border-border/80 dark:border-white/[0.08] rounded-[20px] shadow-sm">
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

              const seenIcons = new Set();
              HARDCODED_TROPHIES.forEach(t => {
                if (t.icon) seenIcons.add(t.icon);
                templateMap.set(t.id, {
                  id: t.id,
                  name: t.name,
                  image: t.icon,
                  locked: true,
                  requirement: t.requirement
                });
              });

              // 2. Add any unique trophies awarded to ANY player (so users see what's out there)
              trophies.forEach(t => {
                const key = t.templateId || t.title.toLowerCase().replace(/\s+/g, '-');
                const isDuplicateIcon = t.icon && seenIcons.has(t.icon);
                if (!templateMap.has(key) && !isDuplicateIcon) {
                  if (t.icon) seenIcons.add(t.icon);
                  templateMap.set(key, {
                    id: t.id, // Just use the instance ID as a key
                    name: t.title,
                    image: t.icon || '🏆',
                    locked: true,
                    requirement: t.description || 'Locked'
                  });
                }
              });
              (me.badges || []).forEach(badgeName => {
                const badgeKey = `badge-${badgeName.toLowerCase().replace(/\s+/g, '-')}`;
                if (!templateMap.has(badgeKey)) {
                  templateMap.set(badgeKey, {
                    id: badgeKey,
                    name: badgeName,
                    image: '🎖️',
                    locked: false, // Badges are always unlocked since they are stored directly on the player
                    requirement: 'Admin Awarded Badge',
                    isBadge: true
                  });
                }
              });

              const trophyList = Array.from(templateMap.values());

              return (
                <>
                  <div className="pb-3 pt-5 px-5 sm:px-6 flex flex-row items-center justify-between gap-4 relative border-b border-border/40 dark:border-white/[0.06]">
                    <div className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 text-foreground" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
                      <Trophy className="text-amber-500 dark:text-amber-400" size={24} /> Trophy Cabinet
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="gold" className="px-3 py-1.5 font-score text-[10px] sm:text-xs font-black tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        {BENTO_TROPHIES.filter(tr => myTrophies.some(t => t.title === tr.name || t.id === tr.id)).length} / 5 UNLOCKED
                      </Badge>
                    </div>
                  </div>

                  {/* The Bento Vault */}
                  <div className="relative w-full overflow-hidden bg-[#0A0A0C] border-x border-b border-white/[0.05] rounded-b-2xl p-4 sm:p-8 shadow-[inset_0_20px_50px_rgba(0,0,0,0.8)]">
                    {/* Ambient Cabinet Lighting */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/15 blur-[100px] pointer-events-none z-0" />
                    <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0" />

                    <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-4 sm:gap-6 relative z-10 w-full max-w-6xl mx-auto">
                      {BENTO_TROPHIES.map((tr, index) => {
                        const isUnlocked = myTrophies.some(t => t.title === tr.name || t.id === tr.id);
                        const instances = myTrophies.filter(t => t.title === tr.name || t.id === tr.id);
                        const count = instances.length;
                        
                        // Determine grid placement
                        let bentoClass = "col-span-1";
                        if (index === 0) {
                          // The Crown Jewel: Spans 2 columns on mobile, 1 col & 2 rows on desktop
                          bentoClass = "col-span-2 md:col-span-1 md:row-span-2";
                        }

                        return (
                          <div key={tr.id} className={bentoClass}>
                            <BentoTrophyTile
                              trophy={tr}
                              unlocked={isUnlocked}
                              count={count}
                              instances={instances}
                              isLarge={index === 0}
                              onSelect={() => setSelectedTrophy({
                                trophy: tr,
                                unlocked: isUnlocked,
                                count: count,
                                instances,
                                requirement: tr.requirement
                              })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </FadeIn>

        {/* Live Matches */}
        {myLive.map((m, i) => (
          <FadeIn key={m.id} delay={0.3} className="col-span-12">
            <MatchCard m={m} players={players} onClick={onMatchClick} />
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


function BentoTrophyTile({ trophy, unlocked, count = 0, instances = [], isLarge, onSelect }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const showDuplicate = count > 1;

  return (
    <motion.div
      onClick={() => onSelect && onSelect()}
      whileHover={unlocked ? { scale: 1.02 } : { scale: 1.01 }}
      className={`relative flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-500 group w-full h-full min-h-[220px] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
        unlocked ? 'bg-gradient-to-br from-[#1a1306] to-[#0A0A0C] border border-amber-500/30' : 'bg-secondary/40 backdrop-blur-md border border-white/10'
      }`}
      style={{ perspective: 1000 }}
    >
      {/* Shiny Reflection Effect */}
      {unlocked && (
        <>
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms] ease-in-out pointer-events-none z-20" />
          <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-500 z-0 pointer-events-none" />
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-amber-500/50 shadow-[inset_0_0_20px_transparent] group-hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.3)] transition-all duration-500 pointer-events-none z-10" />
        </>
      )}

      {/* Duplicate Badge */}
      {showDuplicate && (
        <div className="absolute top-4 right-4 z-30 flex items-center justify-center">
          <span className="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping" />
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/40 border-2 border-amber-200">
            ×{count}
          </span>
        </div>
      )}

      <motion.div 
        className={`relative flex items-center justify-center shrink-0 z-10 ${isLarge ? 'w-32 h-32 md:w-48 md:h-48 mb-6' : 'w-24 h-24 sm:w-28 sm:h-28 mb-4'}`}
        whileHover={unlocked ? { rotateY: 360, scale: 1.1 } : { scale: 1.05 }}
        animate={unlocked ? { y: [0, -8, 0] } : {}}
        transition={unlocked ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8, ease: "easeInOut" }}
      >
        <img
          src={trophy.image}
          alt={trophy.name}
          className={`w-full h-full object-contain z-10 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${
            unlocked 
              ? 'drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_25px_25px_rgba(245,158,11,0.5)]' 
              : 'grayscale opacity-40 drop-shadow-none'
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            setImgLoaded(true);
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback Icon */}
        <span style={{ display: 'none' }} className={`text-5xl md:text-7xl drop-shadow-2xl absolute inset-0 items-center justify-center filter ${unlocked ? '' : 'grayscale opacity-40'}`}>{trophy.icon}</span>
        
        {/* Pedestal Glow */}
        <div className={`absolute w-[80%] h-4 rounded-[100%] blur-[8px] transition-all duration-500 pointer-events-none -bottom-6 z-0 ${unlocked ? 'bg-amber-500/40 group-hover:bg-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'bg-black/80'}`} />
      </motion.div>

      {/* Trophy Name */}
      <div className="w-full flex flex-col items-center justify-center z-10 relative overflow-hidden h-[45px]">
         <motion.div
           className="absolute inset-0 flex flex-col items-center justify-center"
           initial={{ y: 0 }}
           whileHover={unlocked ? { y: -45 } : {}}
         >
            <h4 className={`font-black leading-tight line-clamp-2 px-2 relative transition-colors ${isLarge ? 'text-lg md:text-xl' : 'text-sm sm:text-base'} ${unlocked ? 'text-amber-50 drop-shadow-md' : 'text-white/30'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
              {trophy.name}
            </h4>
         </motion.div>
         {unlocked && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center translate-y-[45px]"
              initial={{ y: 45 }}
              whileHover={{ y: 0 }}
            >
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-md">
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black font-score">
                  {instances[0]?.createdAt ? new Date(instances[0].createdAt).getFullYear() : 'Earned'}
                </span>
              </div>
            </motion.div>
         )}
      </div>

      {/* Locked Padlock */}
      {!unlocked && (
        <div className="absolute top-4 left-4 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-white/5 transition-colors group-hover:border-red-500/50 group-hover:bg-red-500/10" title={trophy.requirement}>
          <Lock size={14} className="text-white/20 group-hover:text-red-400 transition-colors" />
        </div>
      )}
    </motion.div>
  );
}
