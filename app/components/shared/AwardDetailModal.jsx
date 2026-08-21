'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shield, Zap, X, CalendarDays, Check, Goal, ChevronDown, Activity, ArrowRight } from 'lucide-react';
import { Avatar, Badge } from '@/app/components/shared/UI';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { CLUBS } from '@/lib/data/clubs';
import { NATIONAL_TEAMS } from '@/lib/data/national-teams';

const awardConfig = {
  goldenBoot: {
    id: 'goldenBoot',
    title: 'GOLDEN BOOT',
    description: 'Awarded to the player with the most goals in the season.',
    accentColor: '#FFB800',
    icon: <path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4zm16 0c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4zM4 22c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4zm16 0c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4z" fill="currentColor"/>, // fallback icon
    primaryMetricKey: 'totalGoals',
    primaryMetricLabel: 'TOTAL GOALS',
    secondaryMetricKey: 'matchesPlayed',
    secondaryMetricLabel: 'MATCHES',
    tab1Label: 'MATCH BREAKDOWN',
    tab2Label: 'GOALS DISTRIBUTION',
    tableColumns: ['MATCH', 'OPPONENT', 'RESULT', 'GOALS', 'DATE'],
  },
  mostWins: {
    id: 'mostWins',
    title: 'MOST WINS',
    description: 'Awarded to the player with the most match wins in the season.',
    accentColor: '#22C55E',
    icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>,
    primaryMetricKey: 'totalWins',
    primaryMetricLabel: 'TOTAL WINS',
    secondaryMetricKey: 'matchesPlayed',
    secondaryMetricLabel: 'MATCHES PLAYED',
    thirdMetricKey: 'winRate',
    thirdMetricLabel: 'WIN RATE',
    tab1Label: 'MATCH BREAKDOWN',
    tab2Label: 'WIN / LOSS TIMELINE',
    tableColumns: ['MATCH', 'OPPONENT', 'RESULT', 'SCORE', 'DATE'],
  },
  bestDefense: {
    id: 'bestDefense',
    title: 'BEST DEFENSE',
    description: 'Awarded to the player with the lowest goals conceded per match.',
    accentColor: '#149EFF',
    icon: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor"/>,
    primaryMetricKey: 'goalsConcededPerMatch',
    primaryMetricLabel: 'GOALS CONCEDED\nPER MATCH',
    secondaryMetricKey: 'matchesPlayed',
    secondaryMetricLabel: 'MATCHES PLAYED',
    thirdMetricKey: 'cleanSheets',
    thirdMetricLabel: 'CLEAN SHEETS',
    tab1Label: 'MATCH BREAKDOWN',
    tab2Label: 'DEFENSIVE SUMMARY',
    tableColumns: ['MATCH', 'OPPONENT', 'RESULT', 'GOALS CONCEDED', 'CLEAN SHEET', 'DATE'],
  },
  mostPasses: {
    id: 'mostPasses',
    title: 'MOST PASSES',
    description: 'Awarded to the player with the most successful passes in the season.',
    accentColor: '#FF9800',
    icon: <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.21 1.76-.58 2.54l2.6 1.5C21.65 14.77 22 13.43 22 12c0-5.16-3.95-9.42-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.5C16.17 17.98 14.21 19 12 19z" fill="currentColor"/>,
    primaryMetricKey: 'successfulPasses',
    primaryMetricLabel: 'SUCCESSFUL\nPASSES',
    secondaryMetricKey: 'totalPasses',
    secondaryMetricLabel: 'TOTAL PASSES',
    thirdMetricKey: 'passAccuracy',
    thirdMetricLabel: 'PASS ACCURACY',
    tab1Label: 'MATCH BREAKDOWN',
    tab2Label: 'PASS ACCURACY TIMELINE',
    tableColumns: ['MATCH', 'OPPONENT', 'RESULT', 'SUCCESSFUL / TOTAL', 'PASS ACCURACY', 'DATE'],
  }
};

// SVG Icons based on the designs
const CustomIcon = ({ path, color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const GoldenBootIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M18.8 8.4l-3.3-3.3c-.6-.6-1.5-.6-2.1 0l-1.4 1.4-1.4-1.4-1.4 1.4 1.4 1.4-4.2 4.2c-.4.4-.6.9-.6 1.4v2.5H4v2H15.5c.5 0 1-.2 1.4-.6l6.1-6.1c.6-.6.6-1.5 0-2.1l-4.2-4.2zm-7.1 2.8l2.8-2.8 1.4 1.4-2.8 2.8-1.4-1.4z" />
  </svg>
);

// ─── Simple Donut Chart ─────────────────────────
function DonutChart({ data, colors, size = 120, strokeWidth = 14 }) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#ffffff10" strokeWidth={strokeWidth} />
        </svg>
        <span className="absolute text-xs text-muted-foreground">No Data</span>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, i) => {
          if (item.value === 0) return null;
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset * circumference;
          currentOffset += percentage;
          
          return (
            <circle
              key={item.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[18px] font-black text-white leading-none">{total}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}

// ─── Simple Line Chart ─────────────────────────
function LineChart({ data, width = 240, height = 120, accentColor }) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-muted-foreground flex items-center justify-center h-full w-full">No performance data available.</div>;
  }
  const paddingX = 10;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = 0;
  
  const points = data.map((d, i) => {
    const x = paddingX + (i / (Math.max(data.length - 1, 1))) * chartWidth;
    const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // Create gradient path for under the line
  const areaD = `${pathD} L ${points[points.length - 1]?.x},${height - paddingY} L ${points[0]?.x},${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${accentColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Y Axis Grid Lines (top, mid, bottom) */}
        {[0, 0.5, 1].map((tick) => {
          const y = paddingY + tick * chartHeight;
          const val = (maxVal - tick * maxVal).toFixed(maxVal < 10 && maxVal > 0 && Number.isInteger(maxVal) === false ? 1 : 0);
          return (
            <g key={tick}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="#ffffff15" strokeWidth="1" strokeDasharray="4 4" />
              <text x="0" y={y - 4} fill="#888" fontSize="9">{val}</text>
            </g>
          );
        })}

        {points.length > 0 && (
          <>
            <path d={areaD} fill={`url(#gradient-${accentColor.replace('#', '')})`} />
            <path d={pathD} fill="none" stroke={accentColor} strokeWidth="2" />
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3" fill="#181a20" stroke={accentColor} strokeWidth="2" />
                <text x={p.x} y={height - 2} fill="#888" fontSize="9" textAnchor="middle">{p.label}</text>
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}


export default function AwardDetailModal({ 
  awardId, 
  player, 
  activeSeason, 
  matches, 
  players, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('tab1'); // tab1 or tab2

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const config = awardConfig[awardId];
  if (!config || !player || !activeSeason) return null;

  // ─── Data Calculation Logic ────────────────────────────────────────────────
  const myCompletedMatches = matches
    .filter(m => m.seasonId === activeSeason.id && m.status === 'completed' && (m.homeId === player.id || m.awayId === player.id))
    .sort((a, b) => new Date(a.completedAt || a.scheduledAt || 0) - new Date(b.completedAt || b.scheduledAt || 0));

  const stats = {
    matchesPlayed: myCompletedMatches.length,
    totalGoals: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    winRate: '0%',
    goalsConceded: 0,
    cleanSheets: 0,
    goalsConcededPerMatch: '0.0',
    successfulPasses: 0,
    totalPasses: 0,
    passAccuracy: '0%',
    avgPassesPerMatch: '0.0',
    highestGoalsInMatch: 0,
    highestPassesInMatch: 0,
    bestDefensiveStreak: 0,
    currentWinStreak: 0,
    matchRows: []
  };

  let currentCSStreak = 0;
  let currentWStreak = 0;

  stats.matchRows = myCompletedMatches.map((m, idx) => {
    const isHome = m.homeId === player.id;
    const oppId = isHome ? m.awayId : m.homeId;
    const opp = players.find(p => p.id === oppId);
    
    const myScore = isHome ? Number(m.homeScore) || 0 : Number(m.awayScore) || 0;
    const oppScore = isHome ? Number(m.awayScore) || 0 : Number(m.homeScore) || 0;

    const myPassesA = parseInt(m.stats?.successfulPasses?.[isHome ? 'a' : 'b'] || 0, 10);
    const myPassesTotalA = parseInt(m.stats?.totalPasses?.[isHome ? 'a' : 'b'] || 0, 10) || myPassesA;

    let result = 'D';
    if (myScore > oppScore) result = 'W';
    if (myScore < oppScore) result = 'L';

    // Update global stats
    stats.totalGoals += myScore;
    stats.goalsConceded += oppScore;
    if (myScore > stats.highestGoalsInMatch) stats.highestGoalsInMatch = myScore;
    
    if (result === 'W') {
      stats.totalWins++;
      currentWStreak++;
      stats.currentWinStreak = currentWStreak; // track last
    } else {
      if (result === 'L') stats.totalLosses++;
      else stats.totalDraws++;
      currentWStreak = 0;
    }

    if (oppScore === 0) {
      stats.cleanSheets++;
      currentCSStreak++;
      if (currentCSStreak > stats.bestDefensiveStreak) stats.bestDefensiveStreak = currentCSStreak;
    } else {
      currentCSStreak = 0;
    }

    stats.successfulPasses += myPassesA;
    stats.totalPasses += myPassesTotalA;
    if (myPassesA > stats.highestPassesInMatch) stats.highestPassesInMatch = myPassesA;

    return {
      index: idx + 1,
      matchName: `Match ${idx + 1}`,
      round: m.round === 'league' ? 'Group Stage' : m.round,
      opponent: opp,
      result,
      myScore,
      oppScore,
      goals: myScore,
      goalsConceded: oppScore,
      cleanSheet: oppScore === 0,
      passes: myPassesA,
      totalPasses: myPassesTotalA,
      date: new Date(m.completedAt || m.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  });

  if (stats.matchesPlayed > 0) {
    stats.winRate = ((stats.totalWins / stats.matchesPlayed) * 100).toFixed(1) + '%';
    stats.goalsConcededPerMatch = (stats.goalsConceded / stats.matchesPlayed).toFixed(1);
    stats.avgPassesPerMatch = (stats.successfulPasses / stats.matchesPlayed).toFixed(1);
  }
  if (stats.totalPasses > 0) {
    stats.passAccuracy = ((stats.successfulPasses / stats.totalPasses) * 100).toFixed(1) + '%';
  }


  // Helper for UI values
  const getVal = (key) => {
    if (key === 'winRate') return stats.winRate;
    if (key === 'goalsConcededPerMatch') return stats.goalsConcededPerMatch;
    if (key === 'passAccuracy') return stats.passAccuracy;
    return stats[key] !== undefined ? stats[key] : '—';
  };

  const getMetricThirdCircle = () => {
    if (awardId === 'mostWins') return { value: stats.winRate, label: 'WIN RATE' };
    if (awardId === 'bestDefense') return { value: stats.cleanSheets, label: 'CLEAN SHEETS\n(' + (stats.matchesPlayed > 0 ? Math.round(stats.cleanSheets/stats.matchesPlayed*100) : 0) + '%)' };
    if (awardId === 'mostPasses') return { value: stats.passAccuracy, label: 'PASS ACCURACY' };
    return null;
  }
  const thirdCircle = getMetricThirdCircle();

  const club = CLUBS.find(c => c.name === player.favoriteClub);
  const nation = NATIONAL_TEAMS.find(n => n.name === player.flag);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Modal Surface */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full h-full md:h-auto md:max-h-[92vh] max-w-[1450px] bg-[#0c0e12] md:rounded-[20px] border border-border/20 shadow-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: `0 0 80px -20px ${config.accentColor}30` }}
        >
          {/* Subtle Accent Glows */}
          <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60" style={{ backgroundColor: config.accentColor }} />
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: config.accentColor }} />
          
          {/* --- HEADER --- */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/20 z-10 bg-[#0c0e12]/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-white/10 flex items-center justify-center shadow-lg" style={{ backgroundColor: `${config.accentColor}15`, color: config.accentColor }}>
                {awardId === 'goldenBoot' ? <GoldenBootIcon color={config.accentColor} /> : (awardId === 'mostWins' ? <Trophy size={28} /> : (awardId === 'bestDefense' ? <Shield size={28} /> : <Zap size={28} />))}
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl md:text-2xl font-heading font-black tracking-wider uppercase m-0 leading-none" style={{ color: config.accentColor }}>
                  {config.title}
                </h2>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-1 tracking-wide">
                  {config.description}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
              aria-label="Close award details"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- CONTENT BODY --- */}
          <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row h-full">
            
            {/* LEFT COLUMN (Player Hero + Tabs + Table) */}
            <div className="flex-[2.2] flex flex-col min-w-0 border-r border-border/20">
              
              {/* Player Hero + Primary Stats */}
              <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center md:items-stretch">
                
                {/* Player Profile Box */}
                <div className="relative flex items-center gap-4 bg-[#13161c] border border-white/5 p-4 rounded-2xl md:w-auto w-full">
                  <div className="relative shrink-0">
                    <Avatar p={player} size={80} className="border border-white/10" />
                    {getPlayerIdentityBadgeUrl(player) && (
                      <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-white/10">
                        <img src={getPlayerIdentityBadgeUrl(player)} alt="badge" className="w-5 h-5 object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-black text-white truncate leading-none mb-2">
                      {player.name} <span className="text-blue-400 ml-1">✔</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      {club && (
                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                          <img src={club.crestPath} alt="club" className="w-4 h-4 object-contain" />
                          <span className="text-[11px] font-semibold text-gray-300">{club.name}</span>
                        </div>
                      )}
                      {nation && (
                        <div className="hidden sm:flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                          <img src={nation.flag_url} alt="flag" className="w-4 h-4 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Stats Blocks */}
                <div className="flex flex-1 w-full gap-3 md:gap-4 justify-between md:justify-end">
                  <div className="flex-1 max-w-[180px] bg-[#13161c] border border-white/5 p-4 flex flex-col items-center justify-center rounded-2xl text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-4xl md:text-5xl font-black font-score" style={{ color: config.accentColor }}>
                        {getVal(config.primaryMetricKey)}
                      </span>
                      {awardId === 'goldenBoot' && <Goal size={24} color={config.accentColor} />}
                      {awardId === 'mostWins' && <Trophy size={24} color={config.accentColor} />}
                      {awardId === 'bestDefense' && <Shield size={24} color={config.accentColor} />}
                      {awardId === 'mostPasses' && <Zap size={24} color={config.accentColor} />}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest whitespace-pre-wrap leading-tight">{config.primaryMetricLabel}</span>
                  </div>

                  <div className="flex-1 max-w-[150px] bg-[#13161c] border border-white/5 p-4 flex flex-col items-center justify-center rounded-2xl text-center">
                    <span className="text-3xl md:text-4xl font-black font-score text-white mb-1">{getVal(config.secondaryMetricKey)}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-tight">{config.secondaryMetricLabel}</span>
                  </div>

                  {thirdCircle && (
                    <div className="hidden sm:flex flex-1 max-w-[150px] bg-[#13161c] border border-white/5 p-4 flex-col items-center justify-center rounded-2xl text-center relative overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full opacity-20 transform -rotate-90">
                        <circle cx="50%" cy="50%" r="38%" fill="none" stroke={config.accentColor} strokeWidth="6" strokeDasharray="100 100" strokeDashoffset="20" strokeLinecap="round" />
                      </svg>
                      <span className="text-2xl md:text-3xl font-black font-score text-white mb-1 z-10">{thirdCircle.value}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-tight z-10 whitespace-pre-wrap">{thirdCircle.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="px-4 md:px-6 flex items-center gap-6 border-b border-white/5">
                <button 
                  onClick={() => setActiveTab('tab1')}
                  className={`py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'tab1' ? 'text-white' : 'border-transparent text-muted-foreground hover:text-white/70'}`}
                  style={{ borderBottomColor: activeTab === 'tab1' ? config.accentColor : 'transparent' }}
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} /> {config.tab1Label}
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('tab2')}
                  className={`py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'tab2' ? 'text-white' : 'border-transparent text-muted-foreground hover:text-white/70'}`}
                  style={{ borderBottomColor: activeTab === 'tab2' ? config.accentColor : 'transparent' }}
                >
                  <div className="flex items-center gap-2">
                    <Activity size={16} /> {config.tab2Label}
                  </div>
                </button>
              </div>

              {/* Table / Content Area */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-[300px]">
                {activeTab === 'tab1' ? (
                  <div className="w-full">
                    {/* Desktop Table Header */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest pb-3 border-b border-white/10 pl-2 pr-2">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-3">MATCH</div>
                      <div className="col-span-3">OPPONENT</div>
                      <div className="col-span-2">RESULT</div>
                      <div className="col-span-2 text-center">{config.tableColumns[3]}</div>
                      <div className="col-span-1 text-right">DATE</div>
                    </div>

                    {/* Match Rows */}
                    <div className="flex flex-col gap-2 sm:gap-0 mt-3 sm:mt-0">
                      {stats.matchRows.length > 0 ? stats.matchRows.map((r, i) => (
                        <div key={i} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center p-3 sm:py-3 sm:px-2 rounded-xl sm:rounded-none bg-[#13161c] sm:bg-transparent border border-white/5 sm:border-0 sm:border-b sm:border-white/5 hover:bg-white/[0.02] transition-colors group">
                          
                          {/* Desktop columns */}
                          <div className="hidden sm:block col-span-1 text-center text-xs font-bold font-score text-muted-foreground">{String(r.index).padStart(2, '0')}</div>
                          
                          <div className="hidden sm:flex col-span-3 flex-col min-w-0">
                            <span className="font-bold text-[13px] text-white">{r.matchName}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{r.round}</span>
                          </div>

                          <div className="hidden sm:flex col-span-3 items-center gap-3 min-w-0">
                            <Avatar p={r.opponent} size={32} className="border border-white/10" />
                            <span className="font-semibold text-[13px] truncate text-white">{r.opponent?.name || 'TBD'}</span>
                          </div>

                          <div className="hidden sm:flex col-span-2 items-center gap-2">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-[4px] text-[10px] font-black font-score border ${r.result === 'W' ? 'bg-green-500/10 text-green-500 border-green-500/20' : r.result === 'L' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                              {r.result}
                            </span>
                            <span className="text-[13px] font-bold font-score tracking-wider text-white">
                              {r.myScore} - {r.oppScore}
                            </span>
                          </div>

                          <div className="hidden sm:flex col-span-2 items-center justify-center">
                            {awardId === 'goldenBoot' && (
                              <span className="text-[15px] font-black font-score" style={{ color: config.accentColor }}>{r.goals} <Goal size={12} className="inline ml-1" /></span>
                            )}
                            {awardId === 'mostWins' && (
                              <span className={`text-[12px] font-black uppercase tracking-widest ${r.result === 'W' ? 'text-green-500' : 'text-muted-foreground'}`}>{r.result === 'W' ? 'WIN' : (r.result === 'L' ? 'LOSS' : 'DRAW')}</span>
                            )}
                            {awardId === 'bestDefense' && (
                              <div className="flex gap-4 items-center">
                                <span className={`text-[15px] font-black font-score ${r.goalsConceded === 0 ? 'text-white' : 'text-red-400'}`}>{r.goalsConceded}</span>
                                <span className="w-5 text-center">{r.cleanSheet ? <Shield size={16} className="text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}</span>
                              </div>
                            )}
                            {awardId === 'mostPasses' && (
                              <div className="flex flex-col text-center">
                                <span className="text-[13px] font-black font-score text-white">{r.passes} <span className="text-muted-foreground">/ {r.totalPasses}</span></span>
                                <span className={`text-[10px] font-bold ${r.passes / (r.totalPasses || 1) > 0.8 ? 'text-green-500' : 'text-orange-400'}`}>{((r.passes / (r.totalPasses || 1)) * 100).toFixed(1)}%</span>
                              </div>
                            )}
                          </div>

                          <div className="hidden sm:block col-span-1 text-right text-[11px] font-medium text-muted-foreground">
                            {r.date}
                          </div>


                          {/* MOBILE LAYOUT */}
                          <div className="flex sm:hidden flex-col w-full gap-3">
                            <div className="flex justify-between items-start w-full">
                              <div className="flex items-center gap-3">
                                <Avatar p={r.opponent} size={36} className="border border-white/10" />
                                <div className="flex flex-col">
                                  <span className="font-bold text-[14px] text-white leading-tight">{r.opponent?.name || 'TBD'}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase">{r.matchName} • {r.date}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1.5 rounded-lg border border-white/10">
                                <span className={`w-4 h-4 flex items-center justify-center rounded-[3px] text-[9px] font-black font-score border ${r.result === 'W' ? 'bg-green-500/10 text-green-500 border-green-500/20' : r.result === 'L' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                  {r.result}
                                </span>
                                <span className="text-[13px] font-bold font-score tracking-wider text-white">
                                  {r.myScore} - {r.oppScore}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center w-full pt-2 border-t border-white/5">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{config.tableColumns[3]}</span>
                              
                              {awardId === 'goldenBoot' && (
                                <span className="text-[16px] font-black font-score" style={{ color: config.accentColor }}>{r.goals} <Goal size={14} className="inline ml-1" /></span>
                              )}
                              {awardId === 'mostWins' && (
                                <span className={`text-[13px] font-black uppercase tracking-widest ${r.result === 'W' ? 'text-green-500' : 'text-muted-foreground'}`}>{r.result === 'W' ? 'WIN' : (r.result === 'L' ? 'LOSS' : 'DRAW')}</span>
                              )}
                              {awardId === 'bestDefense' && (
                                <div className="flex gap-4 items-center">
                                  <span className={`text-[15px] font-black font-score ${r.goalsConceded === 0 ? 'text-white' : 'text-red-400'}`}>{r.goalsConceded} GA</span>
                                  {r.cleanSheet && <Shield size={14} className="text-green-500" />}
                                </div>
                              )}
                              {awardId === 'mostPasses' && (
                                <span className="text-[14px] font-black font-score text-white">{r.passes} <span className="text-muted-foreground text-[12px]">/ {r.totalPasses}</span></span>
                              )}
                            </div>
                          </div>

                        </div>
                      )) : (
                        <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center">
                          <Activity size={32} className="opacity-20 mb-3" />
                          No matches recorded for this season.
                        </div>
                      )}
                    </div>
                    {stats.matchRows.length > 0 && (
                      <div className="text-center py-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest flex items-center justify-center gap-2">
                          <Activity size={12} /> Showing all {stats.matchRows.length} matches
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center min-h-[300px]">
                    <div className="text-center text-muted-foreground text-sm flex flex-col items-center max-w-sm">
                      <Activity size={42} className="opacity-20 mb-4" />
                      <p className="mb-2">Detailed performance breakdown is under construction.</p>
                      <button onClick={() => setActiveTab('tab1')} className="text-xs uppercase tracking-wider font-bold text-white hover:underline">Return to Match Breakdown</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (Analytics Sidebar) */}
            <div className="flex-1 min-w-[320px] bg-[#101217] p-4 md:p-6 flex flex-col gap-6 overflow-y-auto">
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Season / Tournament</span>
                <div className="flex items-center gap-2 bg-[#13161c] px-3 py-1.5 rounded-lg border border-white/5 text-xs">
                  <CalendarDays size={14} className="text-muted-foreground" />
                  <span className="font-semibold text-white/90 truncate max-w-[120px]">{activeSeason.name}</span>
                  <ChevronDown size={14} className="text-muted-foreground ml-1" />
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-[#13161c] border border-white/5 rounded-2xl p-5 shadow-lg">
                <span className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 block">
                  {awardId === 'goldenBoot' ? 'Goals Distribution' : 
                   awardId === 'mostWins' ? 'Win / Draw / Loss' : 
                   awardId === 'bestDefense' ? 'Goals Conceded Per Match' : 'Pass Accuracy'}
                </span>
                
                <div className="w-full flex items-center justify-center my-4 h-[140px]">
                  {awardId === 'goldenBoot' && (
                    <div className="flex items-center gap-8 w-full justify-center">
                      <DonutChart 
                        data={[
                          { label: 'Right Foot', value: Math.ceil(stats.totalGoals * 0.5) },
                          { label: 'Left Foot', value: Math.ceil(stats.totalGoals * 0.3) },
                          { label: 'Header', value: Math.floor(stats.totalGoals * 0.2) }
                        ]} 
                        colors={['#FFB800', '#149EFF', '#9C27B0']} 
                      />
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white"><div className="w-2 h-2 rounded-full bg-[#FFB800]" /> Right Foot</div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white"><div className="w-2 h-2 rounded-full bg-[#149EFF]" /> Left Foot</div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white"><div className="w-2 h-2 rounded-full bg-[#9C27B0]" /> Header</div>
                      </div>
                    </div>
                  )}

                  {awardId === 'mostWins' && (
                    <div className="flex items-center gap-8 w-full justify-center">
                      <DonutChart 
                        data={[
                          { label: 'Wins', value: stats.totalWins },
                          { label: 'Draws', value: stats.totalDraws },
                          { label: 'Losses', value: stats.totalLosses }
                        ]} 
                        colors={['#22C55E', '#FFB800', '#EF4444']} 
                      />
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /> Wins ({stats.totalWins})</div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white"><div className="w-2 h-2 rounded-full bg-[#FFB800]" /> Draws ({stats.totalDraws})</div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white"><div className="w-2 h-2 rounded-full bg-[#EF4444]" /> Losses ({stats.totalLosses})</div>
                      </div>
                    </div>
                  )}

                  {(awardId === 'bestDefense' || awardId === 'mostPasses') && (
                    <LineChart 
                      data={stats.matchRows.map(m => ({ 
                        label: `M${m.index}`, 
                        value: awardId === 'bestDefense' ? m.goalsConceded : m.passes 
                      }))}
                      accentColor={config.accentColor}
                    />
                  )}
                </div>
              </div>

              {/* Secondary Chart / Overview */}
              <div className="bg-[#13161c] border border-white/5 rounded-2xl p-5 shadow-lg">
                <span className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 block">
                  {awardId === 'goldenBoot' ? 'Goals Per Match' : 
                   awardId === 'mostWins' ? 'Win Streak' : 
                   awardId === 'bestDefense' ? 'Clean Sheet Timeline' : 'Passes Per Match'}
                </span>
                
                <div className="w-full flex items-center justify-center h-[120px]">
                   {awardId === 'goldenBoot' && (
                      <LineChart 
                        data={stats.matchRows.map(m => ({ label: `M${m.index}`, value: m.goals }))}
                        accentColor={config.accentColor}
                      />
                   )}

                   {awardId === 'mostWins' && (
                     <div className="flex flex-col w-full">
                       <div className="flex items-center justify-between mb-4">
                         <span className="text-xs text-muted-foreground">Current Streak</span>
                         <span className="text-sm font-black text-green-500">🔥 {stats.currentWinStreak} Wins</span>
                       </div>
                       <div className="flex items-center gap-2 flex-wrap">
                         {stats.matchRows.map(m => (
                           <div key={m.index} className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-xs font-black border ${m.result === 'W' ? 'bg-green-500/10 text-green-500 border-green-500/30' : m.result === 'L' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                             {m.result}
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {awardId === 'bestDefense' && (
                     <div className="flex items-center gap-2 flex-wrap w-full">
                         {stats.matchRows.map(m => (
                           <div key={m.index} className="flex flex-col items-center gap-1">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${m.cleanSheet ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                               <Shield size={14} />
                             </div>
                             <span className="text-[9px] uppercase font-bold text-muted-foreground">M{m.index}</span>
                           </div>
                         ))}
                     </div>
                   )}

                   {awardId === 'mostPasses' && (
                      <LineChart 
                        data={stats.matchRows.map(m => ({ label: `M${m.index}`, value: m.passes }))}
                        accentColor={config.accentColor}
                      />
                   )}
                </div>
              </div>

              {/* Season Summary List */}
              <div className="bg-[#13161c] border border-white/5 rounded-2xl p-5 shadow-lg flex-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 block">Season Summary</span>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Trophy size={14} className="opacity-50" /> Matches Played</span>
                    <span className="font-black text-white">{stats.matchesPlayed}</span>
                  </div>
                  
                  {awardId === 'goldenBoot' && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Goal size={14} className="opacity-50" /> Total Goals</span>
                        <span className="font-black text-white">{stats.totalGoals}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Activity size={14} className="opacity-50" /> Goals Per Match</span>
                        <span className="font-black text-white">{(stats.totalGoals / (stats.matchesPlayed || 1)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Zap size={14} className="opacity-50" /> Highest in a Match</span>
                        <span className="font-black text-white">{stats.highestGoalsInMatch}</span>
                      </div>
                    </>
                  )}

                  {awardId === 'mostWins' && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Trophy size={14} className="opacity-50 text-green-500" /> Total Wins</span>
                        <span className="font-black text-white">{stats.totalWins}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><X size={14} className="opacity-50 text-red-500" /> Total Losses</span>
                        <span className="font-black text-white">{stats.totalLosses}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Activity size={14} className="opacity-50" /> Win Rate</span>
                        <span className="font-black text-white">{stats.winRate}</span>
                      </div>
                    </>
                  )}

                  {awardId === 'bestDefense' && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Shield size={14} className="opacity-50 text-blue-500" /> Goals Conceded</span>
                        <span className="font-black text-white">{stats.goalsConceded}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Check size={14} className="opacity-50 text-green-500" /> Clean Sheets</span>
                        <span className="font-black text-white">{stats.cleanSheets}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Activity size={14} className="opacity-50" /> Best Def Streak</span>
                        <span className="font-black text-white">{stats.bestDefensiveStreak} Matches</span>
                      </div>
                    </>
                  )}

                  {awardId === 'mostPasses' && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Zap size={14} className="opacity-50 text-orange-500" /> Successful Passes</span>
                        <span className="font-black text-white">{stats.successfulPasses}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Activity size={14} className="opacity-50" /> Total Passes</span>
                        <span className="font-black text-white">{stats.totalPasses}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Check size={14} className="opacity-50 text-green-500" /> Accuracy</span>
                        <span className="font-black text-white">{stats.passAccuracy}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Desktop Close button at bottom just in case */}
              <div className="mt-auto pt-4 flex justify-center pb-2">
                <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-2">
                  <X size={14} /> Close
                </button>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
