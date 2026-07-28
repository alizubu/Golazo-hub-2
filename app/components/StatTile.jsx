'use client';
import React, { useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/UI';
import { Skeleton } from '@/app/components/ui/skeleton';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { motion, useInView } from 'framer-motion';
import { ShineBorder } from '@/app/components/magicui/ShineBorder';

const accentColors = {
  gold: {
    border: 'border-t-amber-400',
    shadowHover: 'hover:shadow-[0_4px_24px_-8px_rgba(251,191,36,0.5)]',
    text: 'text-amber-400',
  },
  blue: {
    border: 'border-t-blue-500',
    shadowHover: 'hover:shadow-[0_4px_24px_-8px_rgba(59,130,246,0.5)]',
    text: 'text-blue-500',
  },
  slate: {
    border: 'border-t-slate-400',
    shadowHover: 'hover:shadow-[0_4px_24px_-8px_rgba(148,163,184,0.5)]',
    text: 'text-slate-400',
  },
  green: {
    border: 'border-t-emerald-500',
    shadowHover: 'hover:shadow-[0_4px_24px_-8px_rgba(16,185,129,0.5)]',
    text: 'text-emerald-500',
  },
  orange: {
    border: 'border-t-orange-500',
    shadowHover: 'hover:shadow-[0_4px_24px_-8px_rgba(249,115,22,0.5)]',
    text: 'text-orange-500',
  },
  purple: {
    border: 'border-t-purple-500',
    shadowHover: 'hover:shadow-[0_4px_24px_-8px_rgba(168,85,247,0.5)]',
    text: 'text-purple-500',
  },
};

export function StatTile({
  icon: Icon,
  label,
  value,
  loaded = true,
  colorAccent = 'slate',
  tier = 'standard',
  emptyStateText,
  isPercentage = false,
  isCountUp = false,
  onClick,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const isEmpty = value === null || value === undefined || value === '' || value === 0;
  const resolvedColorAccent = (colorAccent === 'green' && isEmpty) ? 'slate' : colorAccent;
  const accent = accentColors[resolvedColorAccent] || accentColors.slate;
  const isHero = tier === 'hero';

  const baseCardClasses = `relative flex flex-col justify-between p-4 rounded-xl border-x-border/30 border-b-border/30 overflow-visible min-h-[140px] transition-all w-full border-t-2 ${accent.border} ${className}`;

  // Interactive states
  const interactable = !!onClick;
  const cursorClass = interactable ? 'cursor-pointer' : 'cursor-default';

  const motionProps = interactable
    ? { whileHover: { y: -4 }, whileTap: { scale: 0.97 } }
    : { whileHover: { y: -4 } };

  // Render the value depending on type
  const renderValue = () => {
    if (!loaded) return <Skeleton className="h-8 w-20 rounded-md bg-white/10" />;
    if (isEmpty && emptyStateText) {
      return (
        <div className="flex flex-col items-center justify-center gap-1 py-2">
          <span className="text-2xl font-mono font-bold text-white/25">—</span>
          <span className="text-xs font-mono tracking-tight text-white/40 italic">{emptyStateText}</span>
        </div>
      );
    }
    if (isPercentage && !isEmpty) {
      return (
        <div className="relative w-16 h-16 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-white/10 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <motion.path 
              className={`${accent.text} stroke-current`} 
              strokeWidth="3" 
              strokeLinecap="round" 
              fill="none" 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              initial={{ strokeDasharray: "0, 100" }} 
              animate={isInView ? { strokeDasharray: `${value}, 100` } : { strokeDasharray: "0, 100" }} 
              transition={{ duration: 1.5, ease: "easeOut" }} 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono tabular-nums text-white">
            {isInView ? <NumberTicker value={value} /> : '0'}%
          </div>
        </div>
      );
    }
    if (isCountUp && !isEmpty && typeof value === 'number') {
      return (
        <div className="w-full text-center tabular-nums leading-none tracking-tight text-white font-extrabold text-3xl md:text-4xl">
          {isInView ? <NumberTicker value={value} className="text-white" /> : '0'}
        </div>
      );
    }
    
    // Default or hero value rendering
    return (
      <div className={`w-full text-center tabular-nums leading-none tracking-tight font-extrabold text-3xl md:text-4xl ${isHero ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]' : 'text-white'}`}>
        {value}
      </div>
    );
  };

  const CardContent = (
    <Card className={`${baseCardClasses} ${isHero ? 'bg-gradient-to-b from-amber-500/15 via-stadium-raised to-stadium-surface border-amber-400/50' : 'bg-stadium-surface/50'} ${cursorClass} ${!isHero ? accent.shadowHover : ''}`}>
      {/* Header: Muted Icon in Circle + Label */}
      <div className="flex flex-col items-center gap-3 w-full z-10 mb-2">
        <div className="flex items-center gap-2 w-full">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            {Icon && <Icon size={12} className="text-slate-400" />}
          </div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex-1 truncate cursor-default">
            {label}
          </Label>
        </div>
      </div>

      {/* Body: Value */}
      <div className="flex-1 flex items-center justify-center my-2 z-10 w-full overflow-visible">
        {renderValue()}
      </div>
    </Card>
  );

  if (isHero) {
    return (
      <motion.div ref={ref} initial={{ scale: 0.9, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-full h-full" {...motionProps} onClick={onClick}>
        <ShineBorder color={["#FBBF24", "#F59E0B", "#D97706"]} className="p-0 w-full h-full border-0 min-w-0 bg-transparent dark:bg-transparent">
          {CardContent}
        </ShineBorder>
      </motion.div>
    );
  }

  return (
    <motion.div ref={ref} className="w-full h-full" {...motionProps} onClick={onClick}>
      {CardContent}
    </motion.div>
  );
}
