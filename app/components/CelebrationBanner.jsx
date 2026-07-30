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
              <div className="shrink-0 self-center">
                {current.trophy.icon && (current.trophy.icon.startsWith('http') || current.trophy.icon.startsWith('/')) ? (
                  <img src={current.trophy.icon} alt={current.trophy.title} className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-500/20 rounded-full flex items-center justify-center text-5xl shadow-inner border border-amber-500/30">
                    {current.trophy.icon || '🏆'}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center md:items-start min-w-0 w-full text-center md:text-left">
                <div className="text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-2">
                  <span>League Announcement</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black font-heading truncate text-foreground drop-shadow-sm w-full">
                  {current.trophy.season} {current.trophy.title} Winner
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  <div className="flex items-center gap-2 bg-background/80 px-3.5 py-1.5 rounded-full border border-border/50 shadow-sm backdrop-blur">
                    {current.trophy.player.avatarImage ? (
                      <img src={current.trophy.player.avatarImage} className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {current.trophy.player.name.substring(0,2)}
                      </div>
                    )}
                    <span className="font-bold text-sm md:text-base">{current.trophy.player.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground ml-2 font-medium">Ends in {getHoursRemaining(current.expiresAt)}h</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDismiss} 
              className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-muted-foreground hover:text-white transition-colors"
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
