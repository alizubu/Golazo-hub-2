'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShineBorder } from './magicui/ShineBorder';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

const ConfettiPiece = ({ p, mouseX, mouseY }) => {
  const x = useTransform(mouseX, [0, 1000], [-(p.z), p.z]);
  const y = useTransform(mouseY, [0, 300], [-(p.z), p.z]);

  return (
    <motion.div
      initial={{ y: -50, rotate: 0, opacity: 0 }}
      animate={{ 
        y: [-50, 600],
        x: [0, p.drift],
        rotate: [0, p.rotations],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: p.duration,
        repeat: Infinity,
        delay: p.delay,
        ease: 'linear'
      }}
      className="absolute top-0 w-1.5 h-2 sm:w-2 sm:h-2.5"
      style={{
        backgroundColor: p.color,
        left: `${p.left}%`,
        borderRadius: p.isCircle ? '50%' : '1px',
        boxShadow: '0 0 8px rgba(251,191,36,0.4)',
        x,
        y
      }}
    />
  );
};

const LoopingConfetti = ({ mouseX, mouseY }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPieces([...Array(25)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 5,
        color: ['#FFD700', '#FDE047', '#FEF08A', '#ffffff', '#F59E0B'][Math.floor(Math.random() * 5)],
        isCircle: Math.random() > 0.5,
        drift: Math.random() * 20 - 10,
        rotations: Math.random() * 360 + 360,
        z: Math.random() * 50
      })));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14px] z-0">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} p={p} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
};

export default function CelebrationBanner() {
  const router = useRouter();
  const [celebrations, setCelebrations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const [now, setNow] = useState(null);
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 300], [15, -15]);
  const rotateY = useTransform(smoothMouseX, [0, 1000], [-15, 15]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  useEffect(() => {
    const timeout = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => { clearTimeout(timeout); clearInterval(timer); };
  }, []);

  useEffect(() => {
    async function fetchCelebrations() {
      try {
        const res = await fetch('/api/celebrations/active');
        const stored = sessionStorage.getItem('dismissedCelebrations');
        if (stored) setDismissed(JSON.parse(stored));
        if (res.ok) {
          const data = await res.json();
          setCelebrations(data.celebrations || []);
        }
      } catch (e) {
        console.error('Failed to load celebrations', e);
      }
    }
    fetchCelebrations();
  }, []);

  const activeCelebrations = celebrations.filter(c => !dismissed.includes(c.id));

  useEffect(() => {
    if (activeCelebrations.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeCelebrations.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [activeCelebrations.length]);

  useEffect(() => {
    if (activeCelebrations.length > 0) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#FBBF24', '#F59E0B', '#ffffff']
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#FBBF24', '#F59E0B', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [activeCelebrations.length]);

  if (activeCelebrations.length === 0) return null;
  const current = activeCelebrations[currentIndex] || activeCelebrations[0];
  if (!current) return null;

  const handleDismiss = () => {
    const newDismissed = [...dismissed, current.id];
    setDismissed(newDismissed);
    sessionStorage.setItem('dismissedCelebrations', JSON.stringify(newDismissed));
    if (currentIndex >= newDismissed.length) setCurrentIndex(0);
  };

  const getHoursRemaining = (expiresAt) => {
    if (!now) return '...';
    const diff = new Date(expiresAt).getTime() - now;
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
  };

  return (
    <div className="w-full mb-6 relative group" onMouseMove={handleMouseMove} ref={containerRef} style={{ perspective: '1000px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquid-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shine-sweep {
          0% { left: -100%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 200%; opacity: 0; }
        }
        .animate-liquid-text {
          background-size: 200% auto;
          animation: liquid-gradient 4s linear infinite;
        }
        .animate-shine {
          animation: shine-sweep 3s ease-in-out infinite;
        }
      `}} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative w-full rounded-[14px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <ShineBorder 
            className="w-full relative flex flex-col sm:flex-row items-center sm:items-center justify-between p-5 sm:p-8 bg-gradient-to-r from-neutral-900 via-neutral-900 to-black backdrop-blur-md border border-amber-500/30 !rounded-[14px] overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)]"
            color={["#FBBF24", "#F59E0B", "#D97706"]}
            borderRadius={14}
            borderWidth={2}
          >
            <motion.div 
              animate={{ x: [0, 50, -30, 0], y: [0, -30, 40, 0], scale: [1, 1.2, 0.9, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] z-0 pointer-events-none"
            />
            <motion.div 
              animate={{ x: [0, -60, 40, 0], y: [0, 50, -20, 0], scale: [1, 0.8, 1.1, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-500/10 rounded-full blur-[80px] z-0 pointer-events-none"
            />

            <motion.div
              className="absolute pointer-events-none z-0 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                width: '400px', height: '400px',
                background: 'rgba(251, 191, 36, 0.15)',
                x: smoothMouseX, y: smoothMouseY,
                translateX: '-50%', translateY: '-50%'
              }}
            />

            <LoopingConfetti mouseX={smoothMouseX} mouseY={smoothMouseY} />

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-10 flex-1 min-w-0 w-full z-10 relative">
              <motion.div variants={itemVariants} className="sm:hidden text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-2">
                <span>League Announcement</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                className="shrink-0 self-center relative w-24 h-24 sm:w-32 sm:h-32"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`wave-${i}`}
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-amber-500/50 z-0 pointer-events-none"
                  />
                ))}
                
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-full h-full"
                >
                  {current.trophy.icon && (current.trophy.icon.startsWith('http') || current.trophy.icon.startsWith('/')) ? (
                    <div className="relative w-full h-full overflow-hidden rounded-lg group-hover:drop-shadow-[0_0_35px_rgba(251,191,36,0.9)] transition-all duration-500 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] bg-black/20 backdrop-blur-sm flex items-center justify-center">
                      <img src={current.trophy.icon} alt={current.trophy.title} className="w-[85%] h-[85%] object-contain" />
                      <div className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-6xl shadow-[inset_0_0_25px_rgba(251,191,36,0.5)] border border-amber-400/40 relative z-10 bg-gradient-to-br from-amber-500/20 to-black/50 backdrop-blur-md overflow-hidden">
                      {current.trophy.icon || '🏆'}
                      <div className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine pointer-events-none" />
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <div className="flex flex-col items-center sm:items-start min-w-0 w-full text-center sm:text-left z-10 relative">
                <motion.div variants={itemVariants} className="hidden sm:flex text-amber-500 text-xs font-bold uppercase tracking-widest mb-2 items-center justify-start gap-2">
                  <span>League Announcement</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                </motion.div>

                <motion.h2 
                  variants={itemVariants}
                  className="text-2xl sm:text-4xl font-black font-heading tracking-tight w-full"
                >
                  <span className="bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent animate-liquid-text drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)] block">
                    {current.trophy.season} {current.trophy.title} Winner
                  </span>
                </motion.h2>
                
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-5 mt-4 sm:mt-6">
                  <motion.div 
                    onClick={() => router.push(`/players/${current.trophy.player.id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ boxShadow: ['0px 0px 0px rgba(251,191,36,0)', '0px 0px 20px rgba(251,191,36,0.5)', '0px 0px 0px rgba(251,191,36,0)'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="cursor-pointer group/pill flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-amber-600/40 hover:from-amber-500/40 hover:to-amber-600/60 px-5 py-2.5 rounded-full border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-md overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover/pill:bg-white/10 transition-colors duration-300 pointer-events-none" />
                    
                    {current.trophy.player.avatarImage ? (
                      <motion.img 
                        whileHover={{ rotateY: 180 }}
                        transition={{ duration: 0.4 }}
                        src={current.trophy.player.avatarImage} 
                        className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 relative z-10" 
                        alt="" 
                      />
                    ) : (
                      <motion.div 
                        whileHover={{ rotateY: 180 }}
                        transition={{ duration: 0.4 }}
                        className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold text-black border-2 border-amber-200 shadow-inner relative z-10"
                      >
                        {current.trophy.player.name.substring(0,2).toUpperCase()}
                      </motion.div>
                    )}
                    <span className="font-extrabold text-sm sm:text-lg text-white tracking-wide relative z-10">{current.trophy.player.name}</span>
                  </motion.div>
                  
                  <div className="hidden sm:block w-px h-8 bg-border/60"></div>
                  
                  <motion.div 
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm sm:bg-transparent px-4 py-1.5 sm:p-0 rounded-full sm:rounded-none border border-border/50 sm:border-none"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                    <span className="text-[11px] sm:text-sm text-muted-foreground font-semibold">Ends in {getHoursRemaining(current.expiresAt)}h</span>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            <button 
              onClick={handleDismiss} 
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-white/20 text-muted-foreground hover:text-white transition-all shadow-lg backdrop-blur-md z-40 border border-white/10 hover:rotate-90 hover:scale-110 duration-300"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>

            {activeCelebrations.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {activeCelebrations.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-amber-400 w-5 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-muted-foreground/40 w-2 hover:bg-muted-foreground/60'}`} />
                ))}
              </div>
            )}
          </ShineBorder>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
