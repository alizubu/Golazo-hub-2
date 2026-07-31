'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShineBorder } from './magicui/ShineBorder';
import { useRouter } from 'next/navigation';

const LoopingConfetti = () => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPieces([...Array(20)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 5,
        color: ['#FFD700', '#FDE047', '#FEF08A', '#ffffff'][Math.floor(Math.random() * 4)],
        isCircle: Math.random() > 0.5,
        drift: Math.random() * 20 - 10,
        rotations: Math.random() * 360 + 360
      })));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14px] z-0">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -30, rotate: 0, opacity: 0 }}
          animate={{ 
            y: [-30, 500],
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
            boxShadow: '0 0 4px rgba(251,191,36,0.3)',
          }}
        />
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
    const timeout = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    async function fetchCelebrations() {
      try {
        const res = await fetch('/api/celebrations/active');
        
        const stored = sessionStorage.getItem('dismissedCelebrations');
        if (stored) {
          setDismissed(JSON.parse(stored));
        }

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
      }, 5000); // 5 seconds rotation
      return () => clearInterval(timer);
    }
  }, [activeCelebrations.length]);

  if (activeCelebrations.length === 0) return null;

  const current = activeCelebrations[currentIndex] || activeCelebrations[0];
  if (!current) return null;

  const handleDismiss = () => {
    const newDismissed = [...dismissed, current.id];
    setDismissed(newDismissed);
    sessionStorage.setItem('dismissedCelebrations', JSON.stringify(newDismissed));
    if (currentIndex >= newDismissed.length) {
      setCurrentIndex(0);
    }
  };

  const getHoursRemaining = (expiresAt) => {
    if (!now) return '...';
    const diff = new Date(expiresAt).getTime() - now;
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  };

  return (
    <div className="w-full mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full rounded-[14px]"
        >
          <ShineBorder 
            className="w-full relative flex flex-col sm:flex-row items-center sm:items-center justify-between p-5 sm:p-8 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-background backdrop-blur-sm border border-amber-500/20 !rounded-[14px] overflow-hidden"
            color={["#FBBF24", "#F59E0B", "#D97706"]}
            borderRadius={14}
            borderWidth={1.5}
          >
            <LoopingConfetti />

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 flex-1 min-w-0 w-full z-10 relative">
              {/* Mobile Label */}
              <div className="sm:hidden text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-2">
                <span>League Announcement</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>

              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="shrink-0 self-center relative"
              >
                {/* Soft ambient glow behind trophy */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-amber-500/30 blur-[25px] rounded-full z-0 pointer-events-none"
                />
                
                <div className="relative z-10">
                  {current.trophy.icon && (current.trophy.icon.startsWith('http') || current.trophy.icon.startsWith('/')) ? (
                    <img src={current.trophy.icon} alt={current.trophy.title} className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]" />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-6xl shadow-[inset_0_0_20px_rgba(251,191,36,0.4)] border border-amber-500/30 relative z-10 bg-background/50 backdrop-blur-sm">
                      {current.trophy.icon || '🏆'}
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="flex flex-col items-center sm:items-start min-w-0 w-full text-center sm:text-left z-10 relative">
                {/* Desktop/Tablet Label */}
                <div className="hidden sm:flex text-amber-500 text-xs font-bold uppercase tracking-widest mb-2 items-center justify-start gap-2">
                  <span>League Announcement</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl font-black font-heading text-foreground drop-shadow-sm w-full">
                  {current.trophy.season} {current.trophy.title} Winner
                </h2>
                
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-3 sm:mt-5">
                  <motion.div 
                    onClick={() => router.push(`/players/${current.trophy.player.id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ boxShadow: ['0px 0px 0px rgba(251,191,36,0)', '0px 0px 15px rgba(251,191,36,0.4)', '0px 0px 0px rgba(251,191,36,0)'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="cursor-pointer flex items-center gap-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/40 hover:from-amber-500/30 hover:to-amber-600/50 px-4 py-2 rounded-full border border-amber-500/30 hover:border-amber-400 shadow-lg backdrop-blur"
                  >
                    {current.trophy.player.avatarImage ? (
                      <img src={current.trophy.player.avatarImage} className="w-8 h-8 rounded-full object-cover border-2 border-amber-400" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-500/80 flex items-center justify-center text-xs font-bold text-white border-2 border-amber-400 shadow-inner">
                        {current.trophy.player.name.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-extrabold text-sm sm:text-lg text-white tracking-wide">{current.trophy.player.name}</span>
                  </motion.div>
                  
                  <div className="hidden sm:block w-px h-6 bg-border/60"></div>
                  
                  <span className="text-[11px] sm:text-sm text-muted-foreground font-medium bg-background/40 sm:bg-transparent px-3 py-1 sm:p-0 rounded-full sm:rounded-none">Ends in {getHoursRemaining(current.expiresAt)}h</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDismiss} 
              className="absolute top-2 right-2 sm:top-3 sm:right-3 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-white/10 text-muted-foreground hover:text-white transition-all shadow-sm backdrop-blur-sm z-30"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>

            {activeCelebrations.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {activeCelebrations.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-amber-500 w-3' : 'bg-muted-foreground/30 w-1.5'}`} />
                ))}
              </div>
            )}
          </ShineBorder>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
