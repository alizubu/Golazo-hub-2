'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { X, Sparkles, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';

const StardustCanvas = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * -0.4 - 0.1,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FBBF24';
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-0" />;
};

export default function CelebrationBanner({ initialCelebrations = [] }) {
  const router = useRouter();
  const [celebrations, setCelebrations] = useState(initialCelebrations);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const [now, setNow] = useState(null);
  const [cheers, setCheers] = useState(0);
  const [cheerParticles, setCheerParticles] = useState([]);
  
  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
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
        if (res.ok) {
          const data = await res.json();
          setCelebrations(data.celebrations || []);
        }
      } catch (e) {
        console.error('Failed to load celebrations', e);
      }
    }
    
    const stored = sessionStorage.getItem('dismissedCelebrations');
    if (stored) {
      setTimeout(() => setDismissed(JSON.parse(stored)), 0);
    }
    
    fetchCelebrations();
  }, []);

  const activeCelebrations = useMemo(
    () => celebrations.filter(c => !dismissed.includes(c.id)),
    [celebrations, dismissed]
  );

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
      const played = JSON.parse(sessionStorage.getItem('confettiPlayed') || '[]');
      const unplayedIds = activeCelebrations.map(c => c.id).filter(id => !played.includes(id));
      
      if (unplayedIds.length === 0) return;

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
          sessionStorage.setItem('confettiPlayed', JSON.stringify([...played, ...unplayedIds]));
        } catch (e) {
          console.error("Failed to load confetti", e);
        }
      };
      runConfetti();
    }
  }, [activeCelebrations]);

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

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = offset.x;
    if (swipe < -50) {
      setCurrentIndex(prev => (prev + 1) % activeCelebrations.length);
    } else if (swipe > 50) {
      setCurrentIndex(prev => (prev - 1 + activeCelebrations.length) % activeCelebrations.length);
    }
  };

  const onCheer = (e) => {
    e.stopPropagation();
    setCheers(c => c + 1);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15]);
    }
    const id = Date.now() + Math.random();
    setCheerParticles(prev => [...prev, id]);
  };

  return (
    <div className="w-full mb-6 relative group" style={{ perspective: 1000 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="relative w-full rounded-2xl overflow-hidden bg-[#09090b] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7),0_0_35px_rgba(251,191,36,0.15)] cursor-grab active:cursor-grabbing"
        >
          {/* Animated Holographic Border Sheen */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none p-[1px] bg-gradient-to-br from-amber-500/50 via-zinc-800/50 to-amber-900/50" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(251,191,36,0.6)_360deg)] opacity-40"
            />
          </div>

          {/* Subtle animated background gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_50%)]"
            />
            {/* Volumetric Light Cone */}
            <motion.div
              animate={{ rotate: [-5, 5, -5], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 left-1/4 w-1/2 h-[200%] bg-[conic-gradient(from_180deg_at_50%_0%,rgba(251,191,36,0.15)_0deg,transparent_45deg,transparent_315deg,rgba(251,191,36,0.15)_360deg)] origin-top blur-2xl"
            />
          </div>

          <StardustCanvas />

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
                  <Image 
                    src={current.trophy.icon} 
                    alt={current.trophy.title || 'Trophy'} 
                    width={160}
                    height={160}
                    className="w-[90%] h-[90%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" 
                    unoptimized
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
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-3"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.25em]">League Announcement</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-[2.75rem] leading-tight font-black tracking-tight text-foreground mb-2 font-heading"
              >
                {current.trophy.season}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-sm">
                  {current.trophy.title}
                </span>
                {' '}Winner
              </motion.h2>

              <div className="flex flex-col sm:flex-row items-center gap-5 mt-6 w-full sm:w-auto">
                {/* Winner Pill */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new Event('trigger-install-prompt'));
                    router.push(`/player/${current.trophy.player.username || current.trophy.player.id}`);
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 bg-white/5 border border-amber-500/20 rounded-full pr-5 pl-2 py-2 transition-colors duration-300 backdrop-blur-md group shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
                >
                  {current.trophy.player.avatarImage ? (
                    <Image 
                      src={current.trophy.player.avatarImage} 
                      alt={current.trophy.player.name || "Player avatar"} 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover shadow-[0_0_15px_rgba(251,191,36,0.3)] border border-amber-500/50" 
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-foreground border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                      {current.trophy.player.name.substring(0,2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold text-sm text-foreground dark:text-zinc-200 group-hover:text-amber-400 transition-colors">
                    {current.trophy.player.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-500/70 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </motion.button>
                
                <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-700"></div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2 text-muted-foreground text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full border border-white/5"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin" style={{ animationDuration: '3s' }}>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#FBBF24" strokeWidth="3" strokeDasharray="62.8" strokeDashoffset="15" strokeLinecap="round" />
                  </svg>
                  Ends in {getHoursRemaining(current.expiresAt)}h
                </motion.div>
              </div>
            </div>

            {/* Right: Actions (Close & Cheer) */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-30">
              <button 
                onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-white/20 text-muted-foreground hover:text-white transition-colors border border-white/10 backdrop-blur-md"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cheer Button Floating */}
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex flex-col items-center">
              <div className="relative">
                <AnimatePresence>
                  {cheerParticles.map(id => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 1, y: 0, scale: 0.5 }}
                      animate={{ opacity: 0, y: -60, scale: 1.2, x: (Math.random() - 0.5) * 30 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      onAnimationComplete={() => setCheerParticles(prev => prev.filter(p => p !== id))}
                      className="absolute left-1/2 -top-4 pointer-events-none text-lg -translate-x-1/2"
                    >
                      👏
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.button
                  onClick={onCheer}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)] border border-amber-300"
                >
                  <Heart size={20} className="fill-black" />
                </motion.button>
              </div>
              {cheers > 0 && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs font-bold text-amber-400 drop-shadow-md"
                >
                  {cheers}
                </motion.span>
              )}
            </div>
          </div>

          {/* Progress Indicators */}
          {activeCelebrations.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
              {activeCelebrations.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentIndex ? 'bg-amber-400 w-8 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-white/20 w-2'
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

