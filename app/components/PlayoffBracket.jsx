'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import MatchCard from './MatchCard';

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

      const qR = getCenter(qRef, 'right');
      const eR = getCenter(eRef, 'right');
      const cL = getCenter(cRef, 'left');
      const cR = getCenter(cRef, 'right');
      const gfL = getCenter(gfRef, 'left');

      const midX1 = qR.x + (cL.x - qR.x) / 2;
      const midX2 = cR.x + (gfL.x - cR.x) / 2;

      setLines({
        qToGf: `M ${qR.x} ${qR.y} L ${gfL.x} ${gfL.y}`,
        qToC: `M ${qR.x} ${qR.y} L ${midX1} ${qR.y} L ${midX1} ${cL.y} L ${cL.x} ${cL.y}`,
        eToC: `M ${eR.x} ${eR.y} L ${midX1} ${eR.y} L ${midX1} ${cL.y} L ${cL.x} ${cL.y}`,
        cToGf: `M ${cR.x} ${cR.y} L ${midX2} ${cR.y} L ${midX2} ${gfL.y} L ${gfL.x} ${gfL.y}`,
        dots: [
          { x: qR.x, y: qR.y, type: 'q' },
          { x: eR.x, y: eR.y, type: 'e' },
          { x: cL.x, y: cL.y, type: 'c-in' },
          { x: cR.x, y: cR.y, type: 'c-out' },
          { x: gfL.x, y: gfL.y, type: 'gf' }
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
    <div className="w-full relative py-2 md:py-8" ref={containerRef}>
      
      {/* DESKTOP VIEW (Hidden on Mobile) */}
      <div className="hidden md:grid grid-cols-3 gap-x-12 relative w-full">
        
        {/* SVG Connector Canvas */}
        {lines && (
          <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-visible">
            <defs>
              <linearGradient id="grad-q-gf" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={semiA?.status === 'completed' ? "0.8" : "0.3"} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={final?.status === 'completed' ? "0.8" : "0.3"} />
              </linearGradient>
              <linearGradient id="grad-q-c" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={semiA?.status === 'completed' ? "0.8" : "0.3"} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="grad-e-c" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#e11d48" stopOpacity={semiB?.status === 'completed' ? "0.8" : "0.3"} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="grad-c-gf" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={challenger?.status === 'completed' ? "0.8" : "0.3"} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Paths */}
            <motion.path d={lines.qToGf} fill="none" stroke="url(#grad-q-gf)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...drawAnim} transition={{...drawAnim.transition, delay: 0.5}} />
            <motion.path d={lines.qToC} fill="none" stroke="url(#grad-q-c)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...drawAnim} transition={{...drawAnim.transition, delay: 0.5}} />
            <motion.path d={lines.eToC} fill="none" stroke="url(#grad-e-c)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...drawAnim} transition={{...drawAnim.transition, delay: 0.7}} />
            <motion.path d={lines.cToGf} fill="none" stroke="url(#grad-c-gf)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...drawAnim} transition={{...drawAnim.transition, delay: 0.9}} />
            
            {/* Junction Dots */}
            {lines.dots.map((dot, i) => (
              <motion.circle 
                key={i} cx={dot.x} cy={dot.y} r="5" 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: 1.2 + (i * 0.1), type: 'spring' }}
                className={
                  dot.type === 'q' ? 'fill-amber-400' :
                  dot.type === 'e' ? 'fill-rose-500' :
                  dot.type === 'gf' ? 'fill-green-500' :
                  'fill-slate-400'
                }
              />
            ))}
          </svg>
        )}

        {/* Column 1: Round 1 */}
        <div className="flex flex-col justify-between gap-12 lg:gap-24 relative z-10 w-full">
          <MatchNode innerRef={qRef} label="Qualifier (1st vs 2nd)" labelColor="text-amber-500" m={semiA} players={players} onClick={onMatchClick} delay={0.1} />
          <MatchNode innerRef={eRef} label="Eliminator (3rd vs 4th)" labelColor="text-rose-500" m={semiB} players={players} onClick={onMatchClick} delay={0.2} />
        </div>

        {/* Column 2: Round 2 */}
        <div className="flex flex-col justify-center relative z-10 w-full">
          <MatchNode innerRef={cRef} label="Challenger" labelColor="text-slate-400" m={challenger} players={players} onClick={onMatchClick} delay={0.3} />
        </div>

        {/* Column 3: Round 3 */}
        <div className="flex flex-col justify-start relative z-10 w-full">
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

      </div>

      {/* MOBILE VIEW (Hidden on Desktop) */}
      <div className="flex md:hidden flex-col relative px-2 w-full max-w-sm mx-auto">
        <div className="flex flex-col gap-6 w-full">
          <MatchNode label="Qualifier (1st vs 2nd)" labelColor="text-amber-500" m={semiA} players={players} onClick={onMatchClick} delay={0.1} />
          <MatchNode label="Eliminator (3rd vs 4th)" labelColor="text-rose-500" m={semiB} players={players} onClick={onMatchClick} delay={0.2} />
        </div>
        
        <div className="w-[3px] h-10 bg-gradient-to-b from-amber-500/50 to-slate-400/50 mx-auto my-4 rounded-full" />
        
        <MatchNode label="Challenger" labelColor="text-slate-400" m={challenger} players={players} onClick={onMatchClick} delay={0.3} />
        
        <div className="w-[3px] h-10 bg-gradient-to-b from-slate-400/50 to-green-500/50 mx-auto my-4 rounded-full" />
        
        <MatchNode label="Grand Final" labelColor="text-green-500" m={final} players={players} onClick={onMatchClick} delay={0.4} isFinal={true} />
        
        {final?.status === "completed" && (
          <div className="mt-6 w-full p-4 text-center bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl">
            <Trophy className="mx-auto mb-2 text-amber-400" size={24} />
            <div className="text-base font-bold font-heading text-amber-400">
              {byId[matchWinnerId(final)]?.name} is the Champion!
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
