'use client';
import React, { useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/UI';
import { Skeleton } from '@/app/components/ui/skeleton';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { motion, useInView } from 'framer-motion';
import { ShineBorder } from '@/app/components/magicui/ShineBorder';
import { WinRateRing } from '@/app/components/ui/win-rate-ring';

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
  size = 'small', // 'hero' | 'medium' | 'small'
  emptyStateText,
  isPercentage = false,
  isCountUp = false,
  subtext,
  onClick,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const isEmpty = value === null || value === undefined || value === '' || value === 0;
  
  // Force small tiles to be slate as per spec
  const resolvedColorAccent = size === 'small' || (colorAccent === 'green' && isEmpty) ? 'slate' : colorAccent;
  const accent = accentColors[resolvedColorAccent] || accentColors.slate;
  
  const isHero = size === 'hero';
  const isMedium = size === 'medium';
  const isSmall = size === 'small';

  const baseCardClasses = `relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-x-border/30 border-b-border/30 overflow-visible transition-all w-full h-full border-t-2 ${accent.border} ${className}`;

  // Interactive states
  const interactable = !!onClick;
  const cursorClass = interactable ? 'cursor-pointer' : 'cursor-default';

  const motionProps = interactable
    ? { whileHover: { y: -4 }, whileTap: { scale: 0.97 } }
    : { whileHover: { y: -4 } };

  // Typography scaling based on size
  const getNumberStyles = () => {
    if (isHero) return 'text-5xl md:text-6xl text-amber-400 font-extrabold drop-shadow-[0_2px_12px_rgba(251,191,36,0.25)]';
    if (isMedium) return 'text-4xl font-extrabold text-white';
    return 'text-2xl font-bold text-white'; // small
  };

  const getLabelStyles = () => {
    if (isHero) return 'text-sm uppercase tracking-widest text-amber-500/80 font-bold';
    return 'text-xs uppercase tracking-wide text-muted-foreground font-semibold';
  };

  const renderValue = () => {
    if (!loaded) return <Skeleton className="h-8 w-20 rounded-md bg-white/10" />;
    
    // WinRate specifically uses a ring when it's a percentage tile (as per prompt request for Win Rate)
    if (isPercentage) {
      return (
        <WinRateRing 
          value={value} 
          isEmpty={isEmpty} 
          emptyStateText={emptyStateText} 
          accentColor={colorAccent === 'green' ? 'emerald-500' : 'blue-500'}
        />
      );
    }
    
    if (isEmpty && emptyStateText) {
      return (
        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
          <span className="text-xl font-mono font-bold text-white/20">—</span>
          <span className="text-[10px] font-mono tracking-tight text-white/40 italic text-center leading-tight max-w-[120px]">{emptyStateText}</span>
        </div>
      );
    }

    const valueStyles = getNumberStyles();

    if (isCountUp && !isEmpty && typeof value === 'number') {
      return (
        <div className={`w-full tabular-nums leading-none tracking-tight ${valueStyles} ${isHero ? 'text-left' : 'text-center'}`}>
          {isInView ? <NumberTicker value={value} className="text-white" /> : '0'}
        </div>
      );
    }
    
    return (
      <div className={`w-full tabular-nums leading-none tracking-tight ${valueStyles} ${isHero ? 'text-left' : 'text-center'}`}>
        {value}
      </div>
    );
  };

  const CardContent = (
    <Card className={`${baseCardClasses} ${isHero ? 'bg-gradient-to-br from-amber-500/10 via-stadium-raised to-stadium-surface border-amber-400/40' : 'bg-stadium-surface/40 hover:bg-stadium-surface/60'} ${cursorClass} ${!isHero ? accent.shadowHover : ''}`}>
      {/* Header: Icon + Label */}
      <div className={`flex w-full z-10 ${isHero ? 'flex-col items-start gap-4 mb-4' : 'flex-col items-center gap-2.5 mb-2'}`}>
        <div className={`flex items-center w-full ${isHero ? 'gap-3' : 'gap-2 justify-center'}`}>
          <div className={`${isHero ? 'w-10 h-10' : 'w-6 h-6'} rounded-full bg-white/5 flex items-center justify-center shrink-0`}>
            {Icon && <Icon size={isHero ? 20 : 12} className={isHero ? 'text-amber-400' : 'text-slate-400'} />}
          </div>
          {!isHero && (
            <Label className={`${getLabelStyles()} truncate cursor-default flex-1`}>
              {label}
            </Label>
          )}
        </div>
        {isHero && (
          <Label className={`${getLabelStyles()} cursor-default`}>
            {label}
          </Label>
        )}
      </div>

      {/* Body: Value */}
      <div className={`flex-1 flex items-center overflow-visible z-10 w-full ${isHero ? 'justify-start' : 'justify-center'}`}>
        {renderValue()}
      </div>
      
      {/* Subtext (like "↑2 this season") for Hero tiles */}
      {isHero && subtext && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md w-fit">
          {subtext}
        </div>
      )}
    </Card>
  );

  if (isHero) {
    return (
      <motion.div ref={ref} initial={{ scale: 0.95, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 350, damping: 25 }} className="w-full h-full" {...motionProps} onClick={onClick}>
        <ShineBorder color={["#FBBF24", "#F59E0B", "#D97706"]} className="p-0 w-full h-full border-0 min-w-0 bg-transparent dark:bg-transparent rounded-2xl">
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
