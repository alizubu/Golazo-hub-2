'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const ConfettiPiece = ({ p }) => {
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
      className="absolute top-0 w-1 h-1.5 sm:w-1.5 sm:h-2"
      style={{
        backgroundColor: p.color,
        left: `${p.left}%`,
        borderRadius: p.isCircle ? '50%' : '1px',
        boxShadow: `0 0 6px ${p.color}40`,
      }}
    />
  );
};

const LoopingConfetti = () => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPieces([...Array(35)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 3,
        color: ['#FBBF24', '#FCD34D', '#FFFFFF'][Math.floor(Math.random() * 3)],
        isCircle: Math.random() > 0.5,
        drift: Math.random() * 20 - 10,
        rotations: Math.random() * 360 + 360,
      })));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14px] z-0 opacity-70">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} p={p} />
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
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [activeCelebrations.length]);

  useEffect(() => {
    if (activeCelebrations.length > 0) {
      const duration = 2500;
      const end = Date.now() + duration;

      const runConfetti = async () => {
        try {
          const confetti = (await import('canvas-confetti')).default;
          const frame = () => {
            confetti({
              particleCount: 4,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.8 },
              colors: ['#FBBF24', '#ffffff']
            });
            confetti({
              particleCount: 4,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.8 },
              colors: ['#FBBF24', '#ffffff']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        } catch (e) {
          console.error("Failed to load confetti", e);
        }
      };
      runConfetti();
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

  return (
    <div className="w-full mb-6 relative group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full rounded-2xl overflow-hidden bg-[#09090b] border border-amber-500/30 shadow-[0_0_30px_rgba(251,191,36,0.08)]"
        >
          {/* Subtle animated background gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.06),transparent_50%)]"
            />
          </div>

          <LoopingConfetti />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-6 sm:px-10 sm:py-8">
            
            {/* Left Side: Trophy */}
            <div className="flex-shrink-0 relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center">
              {/* Soft glow strictly behind trophy */}
              <div className="absolute inset-0 bg-amber-500/40 blur-[50px] rounded-full scale-125" />
              <div className="absolute inset-0 bg-yellow-400/20 blur-[30px] rounded-full" />
              
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full h-full flex items-center justify-center"
              >
                {current.trophy.icon && (current.trophy.icon.startsWith('http') || current.trophy.icon.startsWith('/')) ? (
                  <img 
                    src={current.trophy.icon} 
                    alt={current.trophy.title} 
                    className="w-[90%] h-[90%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" 
                  />
                ) : (
                  <div className="text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    {current.trophy.icon || '🏆'}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Middle: Content */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left mt-6 sm:mt-0 sm:pl-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.25em]">League Announcement</span>
              </div>
              
              <h2 className="text-3xl sm:text-[2.75rem] leading-tight font-black tracking-tight text-white mb-2 font-heading">
                {current.trophy.season}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-sm">
                  {current.trophy.title}
                </span>
                {' '}Winner
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-5 mt-6">
                {/* Winner Pill */}
                <motion.button
                  onClick={() => router.push(`/players/${current.trophy.player.id}`)}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pr-5 pl-2 py-2 transition-colors duration-300 backdrop-blur-md group"
                >
                  {current.trophy.player.avatarImage ? (
                    <img 
                      src={current.trophy.player.avatarImage} 
                      className="w-8 h-8 rounded-full object-cover shadow-md border border-white/20" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-white/20">
                      {current.trophy.player.name.substring(0,2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">
                    {current.trophy.player.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </motion.button>
                
                <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-700"></div>
                
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500/80 animate-pulse"></div>
                  Ends in {getHoursRemaining(current.expiresAt)}h
                </div>
              </div>
            </div>

            {/* Right: Close Button */}
            <button 
              onClick={handleDismiss} 
              className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 sm:self-start w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
            
          </div>

          {/* Progress Indicators */}
          {activeCelebrations.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {activeCelebrations.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === currentIndex ? 'bg-amber-400 w-6 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-white/20 w-2'
                  }`} 
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
