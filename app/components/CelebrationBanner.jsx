'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShineBorder } from './magicui/ShineBorder';

export default function CelebrationBanner() {
  const [celebrations, setCelebrations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const hasShownConfetti = useRef(false);
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
    if (activeCelebrations.length > 0 && !hasShownConfetti.current) {
      const fired = sessionStorage.getItem('confettiFired');
      if (!fired) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.2 },
          colors: ['#FFD700', '#FDE047', '#FEF08A'],
          zIndex: 100,
        });
        sessionStorage.setItem('confettiFired', 'true');
      }
      hasShownConfetti.current = true;
    }
  }, [activeCelebrations.length]);

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
            className="w-full relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-background backdrop-blur-sm border border-amber-500/20 !rounded-[14px]"
            color={["#FBBF24", "#F59E0B", "#D97706"]}
            borderRadius={14}
            borderWidth={1.5}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 flex-1 min-w-0 w-full">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="shrink-0 self-center relative"
              >
                {/* Pulsing glow behind trophy */}
                <motion.div
                  animate={{ boxShadow: ['0px 0px 15px 5px rgba(251,191,36,0.2)', '0px 0px 35px 15px rgba(251,191,36,0.6)', '0px 0px 15px 5px rgba(251,191,36,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full z-0"
                />
                {/* Initial sparkle burst */}
                <motion.div
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute -inset-4 border-2 border-amber-400 rounded-full z-0 border-dashed"
                />
                
                <div className="relative z-10">
                  {current.trophy.icon && (current.trophy.icon.startsWith('http') || current.trophy.icon.startsWith('/')) ? (
                    <img src={current.trophy.icon} alt={current.trophy.title} className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
                  ) : (
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-amber-500/20 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-[inset_0_0_20px_rgba(251,191,36,0.4)] border border-amber-500/30">
                      {current.trophy.icon || '🏆'}
                    </div>
                  )}
                </div>
              </motion.div>
              <div className="flex flex-col items-center md:items-start min-w-0 w-full text-center md:text-left">
                <div className="text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-2">
                  <span>League Announcement</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black font-heading truncate text-foreground drop-shadow-sm w-full">
                  {current.trophy.season} {current.trophy.title} Winner
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <motion.div 
                    animate={{ boxShadow: ['0px 0px 0px rgba(251,191,36,0)', '0px 0px 15px rgba(251,191,36,0.4)', '0px 0px 0px rgba(251,191,36,0)'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/40 px-4 py-2 rounded-full border border-amber-500/30 shadow-lg backdrop-blur"
                  >
                    {current.trophy.player.avatarImage ? (
                      <img src={current.trophy.player.avatarImage} className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover border-2 border-amber-400" alt="" />
                    ) : (
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-500/80 flex items-center justify-center text-xs font-bold text-white border-2 border-amber-400 shadow-inner">
                        {current.trophy.player.name.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-extrabold text-sm md:text-lg text-white tracking-wide">{current.trophy.player.name}</span>
                  </motion.div>
                  
                  <div className="w-px h-6 bg-border/60"></div>
                  
                  <span className="text-[11px] md:text-sm text-muted-foreground font-medium">Ends in {getHoursRemaining(current.expiresAt)}h</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDismiss} 
              className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 rounded-full bg-black/20 hover:bg-white/10 text-muted-foreground hover:text-white transition-all shadow-sm backdrop-blur-sm z-20"
            >
              <X size={16} />
            </button>

            {activeCelebrations.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
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
