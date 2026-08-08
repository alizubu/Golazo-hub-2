'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Calendar, Award, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Progress } from '@/app/components/ui/progress';
import { Badge, Btn } from '@/app/components/shared/UI';

export default function TrophyDetailModal({
  open,
  onOpenChange,
  trophy,
  unlocked,
  count = 0,
  instances = []
}) {
  useEffect(() => {
    if (open && unlocked) {
      // Check for prefers-reduced-motion
      const prefersReducedMotion = typeof window !== 'undefined' && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        const runConfetti = async () => {
          try {
            const confetti = (await import('canvas-confetti')).default;
            const duration = 1.5 * 1000;
            const animationEnd = Date.now() + duration;

            const frame = () => {
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#E8B34C', '#3DDC84', '#F4F6F8', '#D9A93B']
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#E8B34C', '#3DDC84', '#F4F6F8', '#D9A93B']
              });

              if (Date.now() < animationEnd) {
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
    }
  }, [open, unlocked]);

  if (!trophy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-stadium-surface border-stadium-subtle text-stadium-primary shadow-2xl rounded-2xl">
        {/* Hero Banner Area */}
        <div className={`relative p-8 flex flex-col items-center justify-center text-center overflow-hidden ${
          unlocked 
            ? 'bg-gradient-to-b from-amber-500/20 via-stadium-raised to-stadium-surface border-b border-amber-500/30' 
            : 'bg-gradient-to-b from-stadium-raised via-stadium-surface to-stadium-base border-b border-stadium-subtle'
        }`}>
          {/* Background Glow */}
          {unlocked && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,179,76,0.25)_0%,transparent_70%)] animate-pulse pointer-events-none" />
          )}

          {/* Trophy Artwork with 3D Float Effect */}
          <motion.div 
            initial={{ scale: 0.8, rotateY: -15, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-36 h-36 flex items-center justify-center mb-4 my-2 z-10"
          >
            <img 
              src={trophy.image || trophy.icon} 
              alt={trophy.name} 
              className={`w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transition-all duration-500 ${
                !unlocked ? 'grayscale opacity-40 brightness-75' : 'scale-105'
              }`}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 items-center justify-center text-7xl opacity-50 select-none">
              🏆
            </div>

            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="p-3 rounded-full bg-stadium-base/80 border border-stadium-subtle backdrop-blur-md shadow-xl">
                  <Lock className="text-stadium-secondary w-8 h-8" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Title & Badge */}
          <div className="relative z-10">
            <h2 className="text-2xl font-black font-heading tracking-tight text-stadium-primary mb-1">
              {trophy.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              {unlocked ? (
                <Badge variant="gold" className="px-3 py-1 font-score text-xs shadow-md border border-amber-400/50 flex items-center gap-1.5 bg-amber-500/20 text-amber-300">
                  <CheckCircle2 size={14} className="text-amber-400" />
                  {count > 1 ? `UNLOCKED ×${count}` : 'UNLOCKED ACHIEVEMENT'}
                </Badge>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stadium-base border border-stadium-subtle text-stadium-secondary font-score text-xs font-semibold uppercase tracking-wider">
                  <Lock size={12} className="text-stadium-muted" /> Locked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 bg-stadium-surface">
          {/* Requirement Section */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-stadium-secondary flex items-center gap-1.5">
              <Award size={14} className="text-amber-400" /> Qualification Rule
            </div>
            <p className="text-sm font-medium text-stadium-primary bg-stadium-base/60 p-3.5 rounded-xl border border-stadium-subtle leading-relaxed">
              Awarded manually by administrators to outstanding players.
            </p>
          </div>

          {/* Lock Section (If Locked) */}
          {!unlocked ? (
            <div className="space-y-2.5 bg-stadium-raised/60 p-4 rounded-xl border border-stadium-subtle flex flex-col items-center justify-center text-center">
              <Lock className="text-stadium-muted mb-1" size={20} />
              <div className="text-sm font-semibold text-stadium-secondary">
                Locked Achievement
              </div>
              <div className="text-xs text-stadium-muted max-w-xs">
                This honor is awarded manually by administrators to players who meet the criteria. Keep playing to earn your spot!
              </div>
            </div>
          ) : (
            /* Unlocked History Section */
            <div className="space-y-3 bg-stadium-raised/40 p-4 rounded-xl border border-stadium-subtle">
              <div className="text-xs font-semibold uppercase tracking-wider text-stadium-secondary flex items-center gap-1.5">
                <Calendar size={14} className="text-turf" /> Achievement History
              </div>
              <div className="space-y-2 font-score text-xs">
                {instances && instances.length > 0 ? (
                  instances.map((inst, idx) => (
                    <div key={inst.id || idx} className="flex items-center justify-between py-1.5 border-b border-stadium-subtle/50 last:border-0 text-stadium-primary">
                      <span className="font-medium text-amber-300"># {inst.season || `Season ${idx + 1}`}</span>
                      <span className="text-stadium-secondary">
                        {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified Earned'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between py-1 text-stadium-primary">
                    <span className="text-amber-300">Official Honors</span>
                    <span className="text-stadium-secondary">Active Champion</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close Action */}
          <div className="pt-2">
            <Btn 
              variant={unlocked ? "gold" : "secondary"} 
              className="w-full py-2.5 font-heading tracking-wide font-bold text-sm shadow-md"
              onClick={() => onOpenChange(false)}
            >
              {unlocked ? "Celebrate & Close" : "Keep Grinding"}
            </Btn>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
