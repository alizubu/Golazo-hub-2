'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);
  const router = useRouter();
  const controls = useAnimation();
  const containerRef = useRef(null);

  const THRESHOLD = 100;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      const y = e.touches[0].clientY;
      const pullDistance = y - startY.current;
      
      if (pullDistance > 0 && window.scrollY === 0) {
        // Prevent default scrolling when pulling at the top
        if (e.cancelable) e.preventDefault();
        const progress = Math.min(pullDistance / THRESHOLD, 1.2);
        setPullProgress(progress);
        controls.set({ y: Math.min(pullDistance * 0.4, 60) });
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      setIsPulling(false);
      
      if (pullProgress > 0.8) {
        // Trigger refresh
        controls.start({ y: 50, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        router.refresh();
        // Wait a bit then snap back
        setTimeout(() => {
          controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
          setPullProgress(0);
        }, 800);
      } else {
        // Snap back immediately
        controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
        setPullProgress(0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isPulling, pullProgress, controls, router]);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center -z-10 pointer-events-none">
        <motion.div
          animate={{ rotate: pullProgress > 0.8 ? 360 : 0 }}
          transition={{ repeat: pullProgress > 0.8 ? Infinity : 0, duration: 1, ease: 'linear' }}
          style={{ opacity: pullProgress, scale: pullProgress }}
          className="bg-secondary p-2 rounded-full shadow-lg border border-border/50 text-pitch-bright"
        >
          <RefreshCw size={20} />
        </motion.div>
      </div>
      <motion.div animate={controls} className="w-full bg-background z-10 relative">
        {children}
      </motion.div>
    </div>
  );
}
