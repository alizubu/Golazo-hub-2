'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/app/components/shared/PageHeader';
import { Trophy, Medal, Star, Target, Shield, Clock, ArrowRight, Lock, MapPin, Search, Calendar, ChevronRight, LayoutGrid, List, Megaphone, Bell, Pen, Handshake, Activity, Users, Swords, ListOrdered, Flame, BadgeCheck, TrendingUp, Check } from 'lucide-react';
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
import { TournamentMatchCard } from '@/app/components/shared/TournamentMatchCard';

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
import StandingsTable, { computeStandings } from '@/app/components/shared/StandingsTable';
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
  const coverY = useTransform(scrollY, [0, 500], [0, 50]);

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
          <div className="flex flex-col gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group">
                {/* Holographic Glowing Border Effect */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>
                
                <div className="p-5 md:p-6 relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4 border-b border-white/[0.06] pb-4">
                    <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                      <Megaphone className="text-amber-500" size={18} />
                    </div>
                    <h3 className="font-[800] text-[15px] md:text-[17px] text-white tracking-wide uppercase">{ann.title}</h3>
                  </div>
                  
                  {/* Content with Rich Text Fixes */}
                  <div
                    className="text-sm md:text-[15px] text-gray-300 leading-relaxed max-w-none 
                    [&_p]:mb-3 last:[&_p]:mb-0 
                    [&_ul]:list-none [&_ul]:mb-3 [&_ul]:pl-1 
                    [&_li]:relative [&_li]:pl-5 [&_li]:mb-1.5 
                    [&_li::before]:content-[''] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:top-[8px] [&_li::before]:w-1.5 [&_li::before]:h-1.5 [&_li::before]:bg-amber-500 [&_li::before]:rounded-full [&_li::before]:shadow-[0_0_5px_rgba(245,158,11,0.5)]
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol_li::before]:hidden [&_ol_li]:pl-1
                    [&_strong]:text-white [&_strong]:font-[700]"
                    dangerouslySetInnerHTML={{ __html: ann.content }}
                  />
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <div className="relative w-full mb-10 flex flex-col gap-4">
          
          <div className="relative rounded-none sm:rounded-[2rem] overflow-hidden border-b sm:border border-amber-500/30 shadow-2xl bg-card min-h-[420px] md:min-h-[500px] flex flex-col justify-end group/hero transition-all duration-700 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] mb-4">
            {/* Background Cover Image */}
            <div className="absolute inset-0 z-0">
              <motion.div 
                style={{ y: shouldReduceMotion ? 0 : coverY }} 
                className="w-full h-[150%] -top-[25%] absolute"
              >
                {me.coverBanner && failedCoverUrl !== me.coverBanner ? (
                  <img src={me.coverBanner} alt="Cover Banner" className="w-full h-full object-cover opacity-80" onError={() => setFailedCoverUrl(me.coverBanner)} />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <span className="text-6xl opacity-30">⚽</span>
                  </div>
                )}
              </motion.div>
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
            </div>

            {/* Content Container */}
            <div className="relative z-20 px-5 pt-20 pb-5 sm:px-8 sm:pb-8 flex flex-col w-full">
              
              {/* Top Right: Form */}
              <div className="absolute top-5 right-5 sm:top-6 sm:right-6 hidden sm:flex items-center gap-3 bg-[#0B0F14]/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 shadow-2xl transition-colors z-20">
                <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">Form</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const r = form[i];
                    return (
                      <span 
                        key={i} 
                        title={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : r === 'D' ? 'Draw' : 'No Match'} 
                        className={cn(
                          "w-3 h-4 rounded-sm transition-all duration-300",
                          r === 'W' ? "bg-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.4)]" : 
                          r === 'L' ? "bg-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.4)]" : 
                          r === 'D' ? "bg-[#F5B72B] shadow-[0_0_10px_rgba(245,183,43,0.4)]" : 
                          "bg-[#8B95A3]/30 border border-white/10"
                        )} 
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 w-full">
                
                {/* Left Side: Avatar and Name */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 md:gap-8 w-full md:w-auto text-center sm:text-left">
                  <div className="relative shrink-0">
                    <div className="relative rounded-full p-1.5 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(245,158,11,0.4)] ring-[3px] ring-amber-500 border-none group transition-transform duration-300 hover:scale-105">
                      <AvatarWithBadge player={me} size={140} isOnFire={isOnFire} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col min-w-0 pb-1 sm:mt-0">
                    <span className="text-amber-500 text-xs sm:text-[13px] font-black tracking-[0.15em] uppercase mb-1.5 drop-shadow-md">BB Legend</span>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-4xl md:text-[44px] font-black tracking-tight truncate text-white drop-shadow-lg leading-none">
                        {me.name}
                      </h1>
                      {myRank === 1 && <div className="text-amber-500 shrink-0 text-2xl drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] ml-1" title="Top Ranked Player">🔥</div>}
                      {isOnFire && myRank !== 1 && <div className="text-orange-500 shrink-0 text-2xl drop-shadow-[0_0_15px_rgba(249,115,22,0.8)] ml-1" title="On Fire">🔥</div>}
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="text-gray-300 font-medium text-[15px]">@{me.username}</span>
                      <div className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center text-black shadow-[0_0_12px_rgba(34,197,94,0.5)]">
                        <BadgeCheck size={12} strokeWidth={4} />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5">
                      {!viewOnly && (
                        <button onClick={() => setTab('settings')} className="px-5 py-2 h-10 bg-[#1A1F26]/80 hover:bg-[#252B36] backdrop-blur-md text-white text-[13px] font-bold rounded-xl border border-white/5 flex items-center gap-2 transition-colors outline-none shadow-sm">
                          <Pen size={14} /> Edit Profile
                        </button>
                      )}
                      <div className="px-5 py-2 h-10 bg-[#1A1F26]/80 backdrop-blur-md text-green-500 text-[13px] font-bold rounded-xl border border-green-500/20 flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" /> Online
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Badges */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  {selectedClub && (
                    <div className="flex items-center gap-4 bg-[#0B0F14]/90 hover:bg-[#11171E] transition-colors backdrop-blur-xl px-5 py-4 w-full sm:w-[220px] rounded-[20px] border border-white/5 shadow-2xl group">
                      <div className="bg-white/5 p-2 rounded-full group-hover:scale-110 transition-transform shadow-inner shrink-0">
                        <ClubLogo club={selectedClub} size={32} />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest group-hover:text-amber-500 transition-colors mb-0.5">Favorite Club</span>
                        <span className="text-[15px] font-black text-white truncate w-full">{selectedClub.name}</span>
                      </div>
                    </div>
                  )}
                  {selectedNationalTeam && (
                    <div className="flex items-center gap-4 bg-[#0B0F14]/90 hover:bg-[#11171E] transition-colors backdrop-blur-xl px-5 py-4 w-full sm:w-[220px] rounded-[20px] border border-white/5 shadow-2xl group">
                      <div className="bg-white/5 p-2 rounded-full group-hover:scale-110 transition-transform overflow-hidden shadow-inner shrink-0 flex items-center justify-center">
                        <WavingFlag url={selectedNationalTeam.flag_url} code={selectedNationalTeam.flag_url ? null : 'UN'} size="lg" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest group-hover:text-amber-500 transition-colors mb-0.5">National Team</span>
                        <span className="text-[15px] font-black text-white truncate w-full">{selectedNationalTeam.name}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>


        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 md:mt-12">
        <SeasonStats
          playerId={me.id}
          initialStats={{ rank: myRank, elo, played, winRate, goals, assists, won: myRow?.won || 0, lost: myRow?.lost || 0 }}
          seasons={seasons}
          activeSeason={activeSeason}
          selectedSeasonId={selectedSeasonId}
          onSeasonChange={setSelectedSeasonId}
        />

        {biggestRival && rivalStats && (
          <FadeIn delay={0.3} className="col-span-12">
            <motion.div 
              onClick={() => onH2HClick(biggestRival.id)}
              className="w-full relative rounded-3xl bg-card border border-border/50 shadow-xl p-4 sm:p-6 overflow-hidden cursor-pointer group hover:border-border transition-colors mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 opacity-50 pointer-events-none" />
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-shimmer pointer-events-none" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Left Side */}
                <div className="flex items-center gap-4 w-full sm:w-1/3 justify-start">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/30 blur-md rounded-full" />
                    <Avatar p={me} size={56} className="ring-2 ring-red-500/80 relative z-10 group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">You</span>
                    <span className="text-xl font-black truncate text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{rivalStats.w} Wins</span>
                  </div>
                </div>

                {/* Center Bar */}
                <div className="flex flex-col items-center gap-3 w-full sm:w-1/3">
                  <div className="flex items-center justify-center gap-2">
                    <Swords size={16} className="text-muted-foreground opacity-50" />
                    <span className="text-xs font-black tracking-widest text-white">H2H CLASH</span>
                  </div>
                  
                  <div className="h-[3px] rounded-full bg-secondary overflow-hidden flex w-full relative group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-shadow">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={!shouldReduceMotion ? { width: `${(rivalStats.w / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` } : { width: `${(rivalStats.w / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` }}
                      transition={{ duration: 1.5, type: "spring", bounce: 0, delay: 0.5 }}
                      className="h-full bg-red-500 relative z-10 shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    />
                    
                    {/* Glowing Spark at intersection */}
                    <motion.div
                      initial={{ left: 0, opacity: 0 }}
                      animate={!shouldReduceMotion ? { left: `${(rivalStats.w / ((rivalStats.w + rivalStats.l) || 1)) * 100}%`, opacity: 1 } : { left: `${(rivalStats.w / ((rivalStats.w + rivalStats.l) || 1)) * 100}%`, opacity: 1 }}
                      transition={{ duration: 1.5, type: "spring", bounce: 0, delay: 0.5 }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full blur-[2px] shadow-[0_0_15px_rgba(255,255,255,1)] z-20"
                    />

                    <motion.div 
                      initial={{ width: 0 }}
                      animate={!shouldReduceMotion ? { width: `${(rivalStats.l / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` } : { width: `${(rivalStats.l / ((rivalStats.w + rivalStats.l) || 1)) * 100}%` }}
                      transition={{ duration: 1.5, type: "spring", bounce: 0, delay: 0.5 }}
                      className="absolute right-0 top-0 bottom-0 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]" 
                    />
                  </div>
                  
                  <div className="text-[10px] font-medium text-muted-foreground mt-2 group-hover:text-white transition-colors">
                    TAP TO VIEW FULL HISTORY <ArrowRight size={10} className="inline ml-1 opacity-70"/>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 w-full sm:w-1/3 justify-end text-right">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Rival</span>
                    <span className="text-xl font-black truncate text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">{rivalStats.l} Wins</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full" />
                    <Avatar p={biggestRival} size={56} className="ring-2 ring-blue-500/80 relative z-10 group-hover:scale-105 transition-transform" />
                  </div>
                </div>

              </div>
            </motion.div>
          </FadeIn>
        )}

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
            <TournamentMatchCard 
              stage="normal"
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

        <FadeIn delay={0.35} className="col-span-12 mb-8">
          <StandingsTable
            matches={tMatches}
            players={players}
            seasonId={t?.id}
            me={me}
            onH2HClick={onH2HClick}
            config={t?.config || {}}
            headerLeft={
              <div className="flex items-center gap-4">
                <SectionTitle icon={ListOrdered}>Current Standings</SectionTitle>
                <Btn variant="ghost" className="text-xs p-1 h-auto text-amber-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => setTab('matches')}>
                  Full Table <ArrowRight size={14} className="ml-1" />
                </Btn>
              </div>
            }
          />
        </FadeIn>
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
    <div style={{ perspective: 1000 }} className="h-full w-full">
      <motion.div
        layoutId={trophy.id}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        role="button"
        className={`relative flex flex-col justify-between rounded-2xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 overflow-hidden h-full min-h-[360px] lg:min-h-[450px] bg-[#181a20]/60 backdrop-blur-xl border transition-all duration-300 ${isUnlocked ? 'border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_35px_rgba(251,191,36,0.3)] hover:border-amber-400' : 'border-border/80 dark:border-white/[0.08]'}`}
        style={{
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
            animate={{ scale: [1, 1.15, 1], opacity: 1, boxShadow: ['0 0 10px rgba(251,191,36,0.3)', '0 0 25px rgba(251,191,36,0.6)', '0 0 10px rgba(251,191,36,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ scale: 1.25 }}
            className="absolute top-4 right-4 z-20 flex flex-col items-center justify-center min-w-[3rem] min-h-[3rem] px-2 py-1 rounded-full border border-amber-400/80 bg-zinc-950 overflow-hidden cursor-pointer"
            style={{ transform: "translateZ(30px)" }}
          >
            <motion.div
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            />
            <span className="relative z-10 text-xs font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">x{trophy.wins}</span>
            <span className="relative z-10 text-[7px] font-bold text-amber-500/80 mt-0.5 tracking-widest drop-shadow-sm">WINS</span>
          </motion.div>
        )}

        <motion.div 
          className={`relative z-10 w-full flex-1 flex flex-col items-center justify-center p-8 ${!isUnlocked ? 'grayscale opacity-40' : ''}`}
          animate={isUnlocked ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: isUnlocked ? "translateZ(50px)" : "none" }}
        >
          {trophy.icon ? (
            <img src={trophy.icon} alt={trophy.name} className={`w-[85%] h-[85%] max-h-[320px] object-contain ${isUnlocked ? 'drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]' : 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]'}`} />
          ) : (
            <span className="text-8xl">{trophy.fallbackIcon}</span>
          )}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock size={64} className="text-zinc-400" />
            </div>
          )}
        </motion.div>

        <div className="relative z-20 w-full p-6 pb-6 text-left border-t border-border/40 dark:border-white/[0.06] bg-secondary/40 dark:bg-black/20 backdrop-blur-md shrink-0" style={{ transform: isUnlocked ? "translateZ(20px)" : "none" }}>
          <h3 className={`text-lg font-black uppercase tracking-wider ${isUnlocked ? 'text-amber-400' : 'text-zinc-500'}`}>{trophy.name}</h3>
          {isUnlocked && trophy.seasons?.length > 0 ? (
            <div 
              className="mt-4 relative w-full overflow-hidden flex items-center h-6"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
            >
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="flex items-center whitespace-nowrap min-w-max"
              >
                <div className="flex items-center gap-2 pr-2">
                  {trophy.seasons.concat(trophy.seasons).map((s, i) => (
                    <div key={i} className="flex items-center">
                      <span className="text-[11px] text-amber-200/80 uppercase tracking-widest font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">{s}</span>
                      <span className="text-amber-500/40 text-[10px] mx-2 flex items-center">•</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pr-2">
                  {trophy.seasons.concat(trophy.seasons).map((s, i) => (
                    <div key={`dup-${i}`} className="flex items-center">
                      <span className="text-[11px] text-amber-200/80 uppercase tracking-widest font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">{s}</span>
                      <span className="text-amber-500/40 text-[10px] mx-2 flex items-center">•</span>
                    </div>
                  ))}
                </div>
              </motion.div>
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
    <div style={{ perspective: 800 }} className="h-full w-full">
      <motion.div
        layoutId={trophy.id}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        role="button"
        className={`relative flex flex-col justify-between rounded-2xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 overflow-hidden h-full min-h-[180px] lg:min-h-[240px] bg-[#181a20]/50 backdrop-blur-md border transition-all duration-300 ${isUnlocked ? (isGold ? 'border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]' : 'border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.1)] hover:shadow-[0_0_25px_rgba(148,163,184,0.25)]') : 'border-border/80 dark:border-white/[0.08]'}`}
        style={{
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
          <motion.div 
            whileHover={{ scale: 1.15 }}
            animate={{ boxShadow: ['0 0 5px rgba(251,191,36,0.2)', '0 0 15px rgba(251,191,36,0.5)', '0 0 5px rgba(251,191,36,0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-3 right-3 z-20 flex flex-col items-center justify-center px-2 py-1 rounded-md border border-amber-500/60 bg-black overflow-hidden group cursor-pointer" 
            style={{ transform: "translateZ(15px)" }}
          >
            <motion.div
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            />
            <span className="relative z-10 text-[10px] font-black text-amber-400 leading-none drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">x{trophy.wins}</span>
            <span className="relative z-10 text-[6px] font-bold text-amber-500/80 uppercase mt-0.5 tracking-widest leading-none drop-shadow-sm">WINS</span>
          </motion.div>
        )}

        {!isUnlocked && (
          <div className="absolute top-3 left-3 z-20">
            <Lock size={18} className="text-zinc-600" />
          </div>
        )}

        <motion.div 
          className={`relative z-10 flex-1 flex items-center justify-center p-4 ${!isUnlocked ? 'grayscale opacity-40' : ''}`} 
          style={{ transform: isUnlocked ? "translateZ(30px)" : "none" }}
          animate={isUnlocked ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: (trophy.id.length % 3) * 0.5 }}
        >
          {trophy.icon ? (
            <img src={trophy.icon} alt={trophy.name} className={`h-32 w-32 object-contain ${isUnlocked ? (isGold ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'drop-shadow-[0_0_15px_rgba(148,163,184,0.4)]') : 'drop-shadow-xl'}`} />
          ) : (
            <span className="text-6xl">{trophy.fallbackIcon}</span>
          )}
        </motion.div>

        <div className="relative z-20 w-full px-3 pb-6 pt-3 text-center border-t border-border/40 dark:border-white/[0.06] bg-secondary/40 dark:bg-black/20 shrink-0" style={{ transform: isUnlocked ? "translateZ(10px)" : "none" }}>
          <h4 className={`text-[10px] font-black uppercase tracking-wider truncate ${textColor}`}>{trophy.name}</h4>
          
          {isUnlocked && trophy.seasons?.length > 0 ? (
            <div 
              className="mt-2 pt-2 border-t border-border/40 dark:border-white/[0.05] relative w-full overflow-hidden flex items-center h-5"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
            >
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="flex items-center whitespace-nowrap min-w-max"
              >
                <div className="flex items-center gap-2 pr-2">
                  {trophy.seasons.concat(trophy.seasons).map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                      <span className="text-[8px] font-bold tracking-widest text-amber-200/70 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pr-2">
                  {trophy.seasons.concat(trophy.seasons).map((s, i) => (
                    <div key={`dup-${i}`} className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                      <span className="text-[8px] font-bold tracking-widest text-amber-200/70 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]">{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : !isUnlocked ? (
            <div className="mt-2 pt-2 border-t border-border/40 dark:border-white/[0.05] text-[9px] tracking-widest text-zinc-600 font-bold uppercase">Locked</div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function TrophyCabinetSection({ trophies = [], myTrophies = [], meBadges = [], onSelectTrophy }) {
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

  const displayList = formattedTrophies;

  const featured = displayList.find(t => t.featured) || displayList[0];
  const remaining = displayList.filter(t => t.id !== featured?.id);

  const totalPossible = formattedTrophies.length;
  const totalUnlocked = formattedTrophies.filter(t => !t.locked).length;
  const completePct = totalPossible > 0 ? Math.round((totalUnlocked / totalPossible) * 100) : 0;
  const multiWinCount = myTrophies.length - totalUnlocked;

  return (
    <div className="relative overflow-hidden w-full flex flex-col bg-card dark:bg-card border border-border/80 dark:border-white/[0.08] rounded-[20px] shadow-sm">
      <div className="pb-3 pt-5 px-5 sm:px-6 flex items-center justify-between relative border-b border-border/40 dark:border-white/[0.06]">
        <div className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 text-foreground" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
          <Trophy className="text-foreground/70" size={24}/> Trophy Cabinet
        </div>
      </div>
      
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {displayList.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
            <LayoutGrid size={48} className="opacity-20 mb-4" />
            <p className="text-sm tracking-widest uppercase font-bold">No Trophies Match Filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {featured && (
              <div className="lg:col-span-1 w-full h-full">
                <FeaturedTrophyCard trophy={featured} onClick={() => onSelectTrophy && onSelectTrophy({ trophy: featured.raw, unlocked: !featured.locked, count: featured.wins, instances: featured.instances, requirement: featured.raw.requirement })} />
              </div>
            )}

            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr grid-flow-dense h-full">
              <AnimatePresence mode="popLayout">
                {remaining.map((trophy, i) => (
                  <motion.div
                    key={trophy.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="col-span-1 h-full w-full"
                  >
                    <TrophyTile trophy={trophy} onClick={() => onSelectTrophy && onSelectTrophy({ trophy: trophy.raw, unlocked: !trophy.locked, count: trophy.wins, instances: trophy.instances, requirement: trophy.raw.requirement })} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}


      </div>
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
