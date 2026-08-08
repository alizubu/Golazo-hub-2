'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import MatchCard from '@/app/components/shared/MatchCard';

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[120px] w-full p-4 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
      <div className="text-muted-foreground font-medium text-sm animate-pulse">{text}</div>
    </div>
  );
}

function MatchNode({ label, labelColor, m, players, onClick, delay = 0, isFinal = false, innerRef }) {
  return (
    <div className="relative w-full z-10 pointer-events-auto flex flex-col gap-2" ref={innerRef}>
      <div className={`text-[10px] md:text-xs uppercase tracking-wider font-bold ${labelColor} pl-2`}>
        {label}
      </div>
      <motion.div 
        className="w-full h-full flex"
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {m ? <MatchCard m={m} players={players} onClick={onClick} /> : <EmptyState text="TBD" />}
      </motion.div>
    </div>
  );
}

export default function PlayoffBracket({ matches, players, onMatchClick }) {
  const byRound = Object.fromEntries(matches.map((m) => [m.round, m]));
  const { semiA, semiB, challenger, final } = byRound;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  
  const matchWinnerId = (m) => {
    if (!m || m.status !== "completed") return null;
    if (m.homeScore > m.awayScore) return m.homeId;
    if (m.awayScore > m.homeScore) return m.awayId;
    if (m.penaltyWinner) return m.penaltyWinner === "home" ? m.homeId : m.awayId;
    return null;
  };

  const containerRef = useRef(null);
  const qRef = useRef(null);
  const eRef = useRef(null);
  const cRef = useRef(null);
  const gfRef = useRef(null);
  
  const [lines, setLines] = useState(null);

  useEffect(() => {
    const updateLines = () => {
      if (!qRef.current || !eRef.current || !cRef.current || !gfRef.current || !containerRef.current) return;
      
      // Ensure we only draw lines on desktop (md breakpoint and up)
      if (window.innerWidth < 768) {
        setLines(null);
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      
      const getCenter = (ref, edge = 'right') => {
        const rect = ref.current.getBoundingClientRect();
        return {
          x: (edge === 'right' ? rect.right : edge === 'left' ? rect.left : rect.left + rect.width / 2) - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        };
      };

      // Set the path coordinates and states
      const qIsDone = semiA?.status === 'completed';
      const eIsDone = semiB?.status === 'completed';
      const cIsDone = challenger?.status === 'completed';
      
      const qR = getCenter(qRef, 'right');
      const eR = getCenter(eRef, 'right');
      const cL = getCenter(cRef, 'left');
      const cR = getCenter(cRef, 'right');
      const gfTopL = { x: getCenter(gfRef, 'left').x, y: gfRef.current.getBoundingClientRect().top + gfRef.current.getBoundingClientRect().height * 0.25 - containerRect.top };
      const gfBotL = { x: getCenter(gfRef, 'left').x, y: gfRef.current.getBoundingClientRect().top + gfRef.current.getBoundingClientRect().height * 0.75 - containerRect.top };

      // Trunks in the gaps
      const trunk1X = eR.x + (cL.x - eR.x) / 2;
      const trunk2X = cR.x + (gfBotL.x - cR.x) / 2;

      setLines({
        pathA: {
          d: `M ${eR.x} ${eR.y} L ${trunk1X} ${eR.y} L ${trunk1X} ${cL.y} L ${cL.x} ${cL.y}`,
          isDone: eIsDone,
          color: '#ef4444' // red
        },
        pathB: {
          d: `M ${cR.x} ${cR.y} L ${trunk2X} ${cR.y} L ${trunk2X} ${gfBotL.y} L ${gfBotL.x} ${gfBotL.y}`,
          isDone: cIsDone,
          color: '#22c55e' // green
        },
        pathC: {
          d: `M ${qR.x} ${qR.y} L ${trunk2X} ${qR.y} L ${trunk2X} ${gfTopL.y} L ${gfTopL.x} ${gfTopL.y}`,
          isDone: qIsDone,
          color: '#eab308' // gold
        },
        dots: [
          { x: eR.x, y: eR.y, isDone: eIsDone, color: '#ef4444' },
          { x: cL.x, y: cL.y, isDone: eIsDone, color: eIsDone ? '#ef4444' : '#94a3b8' },
          { x: cR.x, y: cR.y, isDone: cIsDone, color: cIsDone ? '#22c55e' : '#94a3b8' },
          { x: gfBotL.x, y: gfBotL.y, isDone: cIsDone, color: cIsDone ? '#22c55e' : '#94a3b8' },
          { x: qR.x, y: qR.y, isDone: qIsDone, color: '#eab308' },
          { x: gfTopL.x, y: gfTopL.y, isDone: qIsDone, color: qIsDone ? '#eab308' : '#94a3b8' }
        ]
      });
    };

    updateLines();
    // Delay slightly to ensure fonts/layout have settled
    const timeout = setTimeout(updateLines, 100);
    window.addEventListener('resize', updateLines);
    return () => {
      window.removeEventListener('resize', updateLines);
      clearTimeout(timeout);
    };
  }, [matches]);

  const drawAnim = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.2, ease: "easeInOut" }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="w-full relative py-2 md:py-8 min-w-[750px] px-4 md:px-0" ref={containerRef}>
        
        {/* MAIN GRID VIEW */}
        <div className="grid grid-cols-3 grid-rows-[auto_auto_auto_auto] gap-x-12 gap-y-6 relative w-full items-center">
        
        {/* SVG Connector Canvas */}
        {lines && (
          <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-visible">
            {/* Path A */}
            {lines.pathA.isDone ? (
              <motion.path d={lines.pathA.d} fill="none" stroke={lines.pathA.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...drawAnim} transition={{...drawAnim.transition, delay: 0.2}} />
            ) : (
              <path d={lines.pathA.d} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            
            {/* Path B */}
            {lines.pathB.isDone ? (
              <motion.path d={lines.pathB.d} fill="none" stroke={lines.pathB.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...drawAnim} transition={{...drawAnim.transition, delay: 0.6}} />
            ) : (
              <path d={lines.pathB.d} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            
            {/* Path C */}
            {lines.pathC.isDone ? (
              <motion.path d={lines.pathC.d} fill="none" stroke={lines.pathC.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...drawAnim} transition={{...drawAnim.transition, delay: 0.4}} />
            ) : (
              <path d={lines.pathC.d} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            
            {/* Junction Dots */}
            {lines.dots.map((dot, i) => (
              dot.isDone ? (
                <motion.circle 
                  key={i} cx={dot.x} cy={dot.y} r="5" 
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ delay: 1.0 + (i * 0.1), type: 'spring' }}
                  fill={dot.color}
                />
              ) : (
                <circle key={i} cx={dot.x} cy={dot.y} r="4" fill="none" stroke={dot.color} strokeWidth="2" opacity="0.6" />
              )
            ))}
          </svg>
        )}

        {/* Row 1: Qualifier */}
        <div className="col-start-1 row-start-1 z-10 w-full relative">
          <MatchNode innerRef={qRef} label="Qualifier (1st vs 2nd)" labelColor="text-amber-500" m={semiA} players={players} onClick={onMatchClick} delay={0.1} />
        </div>

        {/* Row 1 & 2 Span: Grand Final */}
        <div className="col-start-3 row-start-1 row-span-2 z-10 w-full relative pt-16">
          <MatchNode innerRef={gfRef} label="Grand Final" labelColor="text-green-500" m={final} players={players} onClick={onMatchClick} delay={0.4} isFinal={true} />
          
          {/* Winner Banner */}
          {final?.status === "completed" && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.5, type: 'spring' }}
              className="mt-6 w-full p-4 text-center bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.1)]"
            >
              <Trophy className="mx-auto mb-2 text-amber-400 drop-shadow-md" size={28} />
              <div className="text-lg font-bold font-heading text-amber-400">
                {byId[matchWinnerId(final)]?.name} is the Champion! 🏆
              </div>
            </motion.div>
          )}
        </div>

        {/* Row 2 & 3 Span: Challenger */}
        <div className="col-start-2 row-start-2 row-span-2 z-10 w-full relative">
          <MatchNode innerRef={cRef} label="Challenger" labelColor="text-slate-400" m={challenger} players={players} onClick={onMatchClick} delay={0.3} />
        </div>

        {/* Row 4: Eliminator */}
        <div className="col-start-1 row-start-4 z-10 w-full relative">
          <MatchNode innerRef={eRef} label="Eliminator (3rd vs 4th)" labelColor="text-rose-500" m={semiB} players={players} onClick={onMatchClick} delay={0.2} />
        </div>

      </div>
      </div>
    </div>
  );
}
