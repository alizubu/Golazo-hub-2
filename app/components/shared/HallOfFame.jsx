'use client';

import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Avatar, MagicCard, FadeIn } from '@/app/components/shared/UI';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Ambient smoke layer — slow morphing radial gradients
// ---------------------------------------------------------------------------
function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {/* Blob 1 — lower-left amber glow */}
      <motion.div
        animate={{ x: [0, 30, -15, 0], y: [0, -20, 40, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(217,169,59,0.10) 0%, transparent 70%)' }}
      />
      {/* Blob 2 — upper-right deep amber */}
      <motion.div
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -20, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(180,100,20,0.09) 0%, transparent 70%)' }}
      />
      {/* Blob 3 — center subtle gold mist */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.05) 0%, transparent 70%)' }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating ember particles
// ---------------------------------------------------------------------------
const EMBER_COUNT = typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 22;

function EmberParticles() {
  const [embers] = useState(() =>
    [...Array(EMBER_COUNT)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 8,
      size: 1 + Math.random() * 2.5,
      drift: (Math.random() - 0.5) * 60,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {embers.map(e => (
        <motion.div
          key={e.id}
          initial={{ y: '100vh', x: 0, opacity: 0 }}
          animate={{ y: -80, x: e.drift, opacity: [0, 0.6, 0.4, 0] }}
          transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size * 1.5,
            background: `radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(217,119,6,0.4) 100%)`,
            boxShadow: `0 0 ${e.size * 2}px rgba(251,191,36,0.5)`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function HeroSection() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="text-left space-y-2 pt-6 pb-8 relative z-10"
    >
      <motion.div variants={itemVariants}>
        <span className="text-[10px] font-bold tracking-[0.2em] text-amber-500/80 uppercase">
          Archive
        </span>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-amber-400 tracking-tight">
          Hall of Fame
        </h1>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-1">
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
          Honoring the greatest achievements, legendary seasons, and historic moments in Golazo Hub history.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-5">
        <div className="h-px w-full max-w-md bg-gradient-to-r from-amber-500/20 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Winner row
// ---------------------------------------------------------------------------
function WinnerRow({ award, players }) {
  const player = award.player || players.find(p => p.id === award.playerId);
  return (
    <motion.div
      whileHover={{ y: -1, backgroundColor: 'rgba(251,191,36,0.06)' }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border-l-2 border-amber-500/40 border border-border/20 group cursor-default"
    >
      <div className="flex items-center gap-3">
        <Avatar p={player} size={34} ring="rgba(251,191,36,0.35)" />
        <div className="min-w-0">
          <div className="font-bold text-sm leading-tight text-foreground truncate">{player?.name || 'Unknown'}</div>
          {award.description && (
            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[160px] mt-0.5">{award.description}</div>
          )}
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="text-xs font-bold font-score text-amber-400">{award.season}</div>
        <div className="text-[9px] text-muted-foreground font-score">{new Date(award.createdAt).getFullYear()}</div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Trophy category card
// ---------------------------------------------------------------------------
function TrophyCategoryCard({ group, players, index }) {
  return (
    <FadeIn delay={index * 0.08}>
      <MagicCard gradientColor="rgba(251, 191, 36, 0.12)" className="h-full">
        <div className="p-5 sm:p-6 flex flex-col h-full">
          {/* Card header */}
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-amber-500/15">
            <div className="relative shrink-0">
              {/* Icon glow */}
              <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full scale-150 pointer-events-none" />
              {group.icon && (group.icon.startsWith('/') || group.icon.startsWith('http')) ? (
                <img
                  src={group.icon}
                  className="w-14 h-14 object-contain drop-shadow-[0_0_18px_rgba(251,191,36,0.6)] relative z-10"
                  alt=""
                />
              ) : (
                <span className="text-5xl relative z-10 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                  {group.icon || '🏆'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold font-heading text-foreground leading-tight">{group.title}</h3>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {group.awards.length} {group.awards.length === 1 ? 'Winner' : 'Winners'}
                </span>
              </div>
            </div>
          </div>

          {/* Winner list */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[280px] pr-1 flex-1">
            {group.awards.map(award => (
              <WinnerRow key={award.id} award={award} players={players} />
            ))}
          </div>
        </div>
      </MagicCard>
    </FadeIn>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function HallOfFame({ trophies = [], players = [] }) {

  // Group trophies by title
  const groupedTrophies = {};
  trophies.forEach(t => {
    if (!groupedTrophies[t.title]) {
      groupedTrophies[t.title] = { title: t.title, icon: t.icon, awards: [] };
    }
    groupedTrophies[t.title].awards.push(t);
  });

  const groups = Object.values(groupedTrophies);

  return (
    <>
      <div className="relative max-w-6xl mx-auto p-4 sm:p-8 pb-28">
        {/* Ambient layers */}
        <AmbientBackground />
        <EmberParticles />

        {/* Hero */}
        <HeroSection />

        {/* Category grid */}
        {groups.length === 0 ? (
          <div className="relative z-10 flex flex-col items-center justify-center py-24 text-center">
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
            >
              <Trophy size={48} className="text-amber-400/60" />
            </motion.div>
            <p className="text-muted-foreground text-lg font-medium">No trophies awarded yet.</p>
            <p className="text-muted-foreground/60 text-sm mt-2">The first winners will be immortalized here.</p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {groups.map((group, i) => (
              <TrophyCategoryCard key={group.title} group={group} players={players} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
