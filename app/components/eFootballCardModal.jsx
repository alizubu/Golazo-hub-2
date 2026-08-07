'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Zap, Award, Sparkles, Activity } from 'lucide-react';
import { Avatar } from './UI';

export default function EFootballCardModal({ open, onClose, badge, player, match, homeTeam, awayTeam }) {
  if (!open || !badge) return null;

  const hScore = match?.homeScore ?? 2;
  const aScore = match?.awayScore ?? 1;
  const hName = homeTeam?.name || 'Home XI';
  const aName = awayTeam?.name || 'Away XI';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* 3D Flip Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotateY: -180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.7, rotateY: 180 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-amber-400/40 bg-[#0c0d12] shadow-[0_0_50px_rgba(245,158,11,0.3)] z-10 flex flex-col"
        >
          {/* Top Background Glow & Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-purple-900/10 to-black pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Card Header Tag */}
          <div className="pt-6 px-6 text-center relative z-20">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-amber-400/10 border border-amber-400/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles size={12} className="animate-spin text-amber-400" />
              eFootball Highlight Showcase
            </div>
          </div>

          {/* Card Dynamic Body */}
          <div className="p-6 relative z-20 flex flex-col items-center">
            {/* Holographic Badge Display */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative my-4 p-5 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden"
              style={badge.style}
            >
              <span className="text-5xl mb-2 filter drop-shadow-lg">{badge.emoji}</span>
              <h3 className="font-heading font-black text-lg tracking-wider uppercase text-white drop-shadow">
                {badge.name}
              </h3>
              <p className="text-[11px] opacity-90 mt-1 max-w-[220px] leading-tight font-medium">
                {badge.desc}
              </p>
            </motion.div>

            {/* Featured Player Section */}
            {player && (
              <div className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <Avatar p={player} size={44} ring="rgba(245,158,11,0.5)" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
                    {player.name}
                  </div>
                  <div className="text-[10px] text-amber-400/80 font-mono font-bold truncate mt-0.5">
                    {player.teamName || '@' + player.username}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Rating</span>
                  <span className="text-sm font-black font-score text-emerald-400">9.4</span>
                </div>
              </div>
            )}

            {/* Scoreboard Display with eFootball Momentum Bar */}
            <div className="w-full bg-black/60 rounded-2xl border border-white/10 p-3.5 flex flex-col items-center">
              <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Match Result
              </div>
              
              <div className="flex items-center justify-around w-full">
                <div className="flex-1 text-right font-bold text-xs text-white truncate px-1">
                  {hName}
                </div>
                <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-white/15 font-score font-black text-base text-pitch-bright">
                  {hScore} - {aScore}
                </div>
                <div className="flex-1 text-left font-bold text-xs text-white truncate px-1">
                  {aName}
                </div>
              </div>

              {/* Dynamic eFootball Momentum Bar */}
              <div className="w-full mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span className="text-cyan-400">Pressing 65%</span>
                  <span className="flex items-center gap-1"><Activity size={10} className="text-amber-400" /> Momentum HUD</span>
                  <span className="text-rose-400">35%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style={{ width: '65%' }} />
                  <div className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-zinc-950/80 border-t border-white/10 flex justify-between items-center relative z-20">
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
              Golazo Broadcast Highlight
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs tracking-wider uppercase hover:bg-amber-400 transition-colors shadow-md"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
