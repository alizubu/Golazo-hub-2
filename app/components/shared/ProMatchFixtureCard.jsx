import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Badge } from '@/app/components/shared/UI';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { CLUBS } from '@/lib/data/clubs';
import nationalTeamsData from '@/lib/data/national_teams.json';
import { Trophy, BarChart2, Radio } from 'lucide-react';

const formatName = (name) => {
  if (!name) return 'TBD';
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const getLeagueFlag = (leagueName) => {
  if (!leagueName) return null;
  // Fallbacks for known leagues
  if (leagueName.includes('Serie A')) return nationalTeamsData.find(n => n.name === 'Italy')?.flag_url;
  if (leagueName.includes('La Liga') || leagueName.includes('LaLiga')) return nationalTeamsData.find(n => n.name === 'Spain')?.flag_url;
  if (leagueName.includes('Ligue 1')) return nationalTeamsData.find(n => n.name === 'France')?.flag_url;
  if (leagueName.includes('Premier League')) return nationalTeamsData.find(n => n.name === 'England')?.flag_url;
  if (leagueName.includes('Bundesliga')) return nationalTeamsData.find(n => n.name === 'Germany')?.flag_url;
  return null;
};

export function ProMatchFixtureCard({ m, h, a, hStats, aStats, index, onClick }) {
  const isCompleted = m?.status === 'completed';
  const hWon = m?.homeScore > m?.awayScore;
  const aWon = m?.awayScore > m?.homeScore;

  const hClub = CLUBS.find(c => c.name === h?.favoriteClub);
  const aClub = CLUBS.find(c => c.name === a?.favoriteClub);

  const hLeagueFlag = hClub ? getLeagueFlag(hClub.league) : null;
  const aLeagueFlag = aClub ? getLeagueFlag(aClub.league) : null;

  const hBadgeUrl = getPlayerIdentityBadgeUrl(h);
  const aBadgeUrl = getPlayerIdentityBadgeUrl(a);

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className="relative flex flex-col w-full p-6 rounded-3xl bg-[#0a0b10] border border-white/5 shadow-2xl cursor-pointer overflow-hidden group transition-all duration-500"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-50 pointer-events-none" />
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Match Pill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-score">Match {index + 1}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 mt-6 md:mt-2 relative z-10">
        
        {/* Home Player */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full justify-start">
          <div className="relative shrink-0 order-1 md:order-1">
            <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-full blur-[10px] opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative p-1 rounded-full bg-black">
              <Avatar p={h} size={80} className="rounded-full ring-2 ring-purple-500/50" />
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start min-w-0 order-2 md:order-2">
            <span className="font-bold text-xl md:text-2xl text-white truncate text-center md:text-left drop-shadow-md" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatName(h?.name)}
            </span>
            <div className="flex items-center gap-2 mt-1 text-slate-400">
              {hBadgeUrl && <img src={hBadgeUrl} alt="badge" className="w-5 h-5 object-contain" />}
              <span className="text-sm font-semibold">{h?.favoriteClub || 'TBD'}</span>
            </div>
            {hClub?.league && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                {hLeagueFlag && <img src={hLeagueFlag} alt="flag" className="w-3.5 h-3.5 object-cover rounded-sm" />}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{hClub.league}</span>
              </div>
            )}

            {/* Desktop Stats (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-6 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Rank</span>
                <span className="font-score font-black text-xl text-white">#{hStats?.rank || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Wins</span>
                <span className="font-score font-black text-xl text-emerald-400">{hStats?.wins || '0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center VS / Score */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[120px] relative order-3 md:order-2">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent hidden md:block" />
          
          <div className="relative z-10 flex flex-col items-center justify-center w-24 h-24">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </svg>
            
            {isCompleted ? (
              <div className="flex items-center gap-1 relative z-20">
                <span className="text-3xl font-score font-black text-white">{m.homeScore ?? 0}</span>
                <span className="text-lg font-score text-white/30">-</span>
                <span className="text-3xl font-score font-black text-white">{m.awayScore ?? 0}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-white relative z-20 font-score tracking-wider">VS</span>
            )}
          </div>
          
          {(!isCompleted) && (
            <div className="mt-2 flex flex-col items-center">
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                 <Radio size={12} className="text-emerald-400 animate-pulse" />
                 <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live</span>
               </div>
            </div>
          )}
        </div>

        {/* Away Player */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full justify-end order-4 md:order-3">
          
          <div className="flex flex-col items-center md:items-end min-w-0 order-2 md:order-1">
            <span className="font-bold text-xl md:text-2xl text-white truncate text-center md:text-right drop-shadow-md" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatName(a?.name)}
            </span>
            <div className="flex items-center gap-2 mt-1 text-slate-400">
              <span className="text-sm font-semibold">{a?.favoriteClub || 'TBD'}</span>
              {aBadgeUrl && <img src={aBadgeUrl} alt="badge" className="w-5 h-5 object-contain" />}
            </div>
            {aClub?.league && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                {aLeagueFlag && <img src={aLeagueFlag} alt="flag" className="w-3.5 h-3.5 object-cover rounded-sm" />}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{aClub.league}</span>
              </div>
            )}

            {/* Desktop Stats (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-6 mt-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Rank</span>
                <span className="font-score font-black text-xl text-white">#{aStats?.rank || '-'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Wins</span>
                <span className="font-score font-black text-xl text-emerald-400">{aStats?.wins || '0'}</span>
              </div>
            </div>
          </div>

          <div className="relative shrink-0 order-1 md:order-2">
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full blur-[10px] opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative p-1 rounded-full bg-black">
              <Avatar p={a} size={80} className="rounded-full ring-2 ring-blue-500/50" />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Stats Bar (Hidden on desktop) */}
      <div className="md:hidden mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Trophy size={20} className="text-amber-500 opacity-50" />
          <div className="flex flex-col items-start">
            <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Rank</span>
            <span className="font-score font-black text-lg text-white">#{hStats?.rank || '-'}</span>
          </div>
          <div className="flex flex-col items-start ml-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Wins</span>
            <span className="font-score font-black text-lg text-emerald-400">{hStats?.wins || '0'}</span>
          </div>
        </div>

        <BarChart2 size={24} className="text-white/10" />

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Rank</span>
            <span className="font-score font-black text-lg text-white">#{aStats?.rank || '-'}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Wins</span>
            <span className="font-score font-black text-lg text-emerald-400">{aStats?.wins || '0'}</span>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
