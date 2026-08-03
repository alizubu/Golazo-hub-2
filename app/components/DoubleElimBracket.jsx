'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, ChevronRight, Shield, ShieldAlert, Zap } from 'lucide-react';
import MatchCard from './MatchCard';

function RoundGroup({ title, matches, players, onMatchClick, icon: Icon, colorClass }) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!matches || matches.length === 0) return null;

  return (
    <div className="mb-6">
      <div 
        className={`flex items-center justify-between p-3 rounded-t-xl cursor-pointer ${colorClass} bg-opacity-20 border-b border-border/20`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="opacity-80" />}
          <h3 className="font-heading font-bold text-sm tracking-widest uppercase">{title}</h3>
          <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-bold">{matches.length} matches</span>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-secondary/10 border border-t-0 border-border/30 rounded-b-xl"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {matches.map((m, i) => (
                <motion.div 
                  key={m.id || `m-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full"
                >
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5 pl-1">{m.label || m.round}</div>
                  <MatchCard m={m} players={players} onClick={onMatchClick} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DoubleElimBracket({ matches, players, onMatchClick }) {
  // Sort matches into Upper Bracket, Lower Bracket, Finals
  const upperRounds = ['W1', 'W2', 'W3', 'WF'];
  const lowerRounds = ['L1', 'L1A', 'L1B', 'L2', 'L2A', 'L2B', 'L3', 'L3A', 'L3B', 'L4', 'LF'];
  const finalRounds = ['GF', 'GF_RESET'];

  const upperMatches = matches.filter(m => upperRounds.includes(m.round)).sort((a,b) => a.round.localeCompare(b.round));
  const lowerMatches = matches.filter(m => lowerRounds.includes(m.round)).sort((a,b) => a.round.localeCompare(b.round));
  const finalMatches = matches.filter(m => finalRounds.includes(m.round)).sort((a,b) => a.round.localeCompare(b.round));

  return (
    <div className="w-full h-full flex flex-col gap-2 p-2 sm:p-4 pb-20">
      
      <div className="text-center mb-6 mt-4 relative">
        <div className="absolute inset-0 bg-pitch-bright/10 blur-3xl rounded-full" />
        <Trophy size={48} className="text-gold mx-auto mb-3 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] relative z-10" />
        <h2 className="text-2xl font-black font-heading tracking-widest uppercase relative z-10 drop-shadow-md">Tournament Bracket</h2>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold relative z-10">Double Elimination Stage</p>
      </div>

      <RoundGroup 
        title="🏆 Upper Bracket" 
        matches={upperMatches} 
        players={players} 
        onMatchClick={onMatchClick} 
        icon={Shield} 
        colorClass="bg-blue-500/20 text-blue-400"
      />
      
      <RoundGroup 
        title="🔥 Lower Bracket" 
        matches={lowerMatches} 
        players={players} 
        onMatchClick={onMatchClick} 
        icon={ShieldAlert} 
        colorClass="bg-orange-500/20 text-orange-400"
      />

      <RoundGroup 
        title="👑 Grand Finals" 
        matches={finalMatches} 
        players={players} 
        onMatchClick={onMatchClick} 
        icon={Zap} 
        colorClass="bg-gold/20 text-gold"
      />
      
    </div>
  );
}
