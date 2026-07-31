'use client';
import React, { useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { motion, useInView } from 'framer-motion';
import { WinRateRing } from '@/app/components/ui/win-rate-ring';

export function StatTile({
  icon: Icon,
  label,
  value,
  loaded = true,
  colorAccent = 'neutral',
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
  
  const isHero = size === 'hero';
  const isMedium = size === 'medium';
  
  // Interactive states
  const interactable = !!onClick;
  const cursorClass = interactable ? 'cursor-pointer' : 'cursor-default';

  // Motion - Hover only applies to tiles with real data
  const hoverY = !isEmpty && interactable ? -2 : (!isEmpty ? -2 : 0);
  
  const motionProps = {
    whileHover: { 
      y: hoverY,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  // Base typography based on optical hierarchy design spec
  const getNumberStyles = () => {
    if (isHero) return 'text-[64px] font-[800] tracking-[-0.02em] text-amber-400';
    if (isMedium) return 'text-[40px] font-[700] tracking-[-0.01em] text-white';
    return 'text-[28px] font-[700] tracking-normal text-white'; // small
  };

  const getLabelStyles = () => {
    return 'text-[11px] font-[600] tracking-[0.08em] uppercase text-[#6b7280]';
  };

  // Surface treatment and Elevation based on design spec
  const baseCardClasses = `relative flex flex-col justify-start p-4 sm:p-5 rounded-[14px] overflow-hidden transition-shadow duration-300 w-full h-full bg-[#12151b] border-t border-t-white/[0.06] border-r-0 border-l-0 border-b-0 ${cursorClass} ${className}`;
  
  const shadowClasses = 'shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.5)]';
  const heroShadowClasses = 'shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.5),0_0_32px_-8px_rgba(234,179,8,0.15)]';
  const hoverShadowClasses = !isEmpty ? 'hover:shadow-[0_1px_4px_rgba(0,0,0,0.5),0_12px_32px_-8px_rgba(0,0,0,0.6)]' : '';
  const hoverHeroShadowClasses = !isEmpty ? 'hover:shadow-[0_1px_4px_rgba(0,0,0,0.5),0_12px_32px_-8px_rgba(0,0,0,0.6),0_0_48px_-8px_rgba(234,179,8,0.25)]' : '';

  const renderValue = () => {
    if (!loaded) return <Skeleton className="h-8 w-20 rounded-md bg-white/10" />;
    
    if (isPercentage) {
      return (
        <div className={isEmpty ? 'opacity-65' : ''}>
          <WinRateRing 
            value={value} 
            isEmpty={isEmpty} 
            emptyStateText={emptyStateText} 
            accentColor={colorAccent === 'green' ? 'emerald-500' : 'blue-500'}
          />
        </div>
      );
    }
    
    if (isEmpty && emptyStateText) {
      return (
        <div className="flex flex-col items-center justify-center gap-1.5 py-2">
          <span className="text-[28px] font-bold text-[#4b5563]">—</span>
          <span className="text-[11px] tracking-tight text-[#4b5563] text-center leading-tight">{emptyStateText}</span>
        </div>
      );
    }

    const valueStyles = getNumberStyles();

    if (isCountUp && !isEmpty && typeof value === 'number') {
      return (
        <div className={`w-full tabular-nums leading-none ${valueStyles} ${isHero ? 'text-left' : 'text-center'}`}>
          {isInView ? <NumberTicker value={value} duration={0.8} /> : '0'}
        </div>
      );
    }
    
    return (
      <div className={`w-full tabular-nums leading-none ${valueStyles} ${isHero ? 'text-left' : 'text-center'}`}>
        {value}
      </div>
    );
  };

  // Content opacity for empty state
  const contentOpacity = isEmpty ? 'opacity-65' : 'opacity-100';
  
  // Icon containment
  const iconBadgeBg = isHero && !isEmpty ? 'bg-amber-500/10' : (isEmpty ? 'bg-white/[0.02]' : 'bg-white/[0.04]');
  const iconColor = isHero && !isEmpty ? 'text-amber-400' : 'text-white/70';

  const CardContent = (
    <Card className={`${baseCardClasses} ${isHero ? heroShadowClasses : shadowClasses} ${isHero ? hoverHeroShadowClasses : hoverShadowClasses}`}>
      {/* Hero Ambient Glow - Continuous breathing animation */}
      {isHero && !isEmpty && (
        <motion.div 
          className="absolute inset-0 rounded-[14px] pointer-events-none"
          animate={{ boxShadow: ['0 0 32px -8px rgba(234,179,8,0.15)', '0 0 32px -8px rgba(234,179,8,0.25)', '0 0 32px -8px rgba(234,179,8,0.15)'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className={`flex w-full z-10 ${contentOpacity} ${isHero ? 'flex-col items-start gap-3 mb-2' : 'flex-col items-center gap-2 mb-2'}`}>
        <div className={`flex items-center w-full ${isHero ? 'gap-3' : 'gap-2 justify-center'}`}>
          <div className={`w-[32px] h-[32px] rounded-lg ${iconBadgeBg} flex items-center justify-center shrink-0`}>
            {Icon && <Icon size={16} strokeWidth={1.5} className={iconColor} />}
          </div>
          {!isHero && (
            <span className={`${getLabelStyles()} truncate cursor-default`}>
              {label}
            </span>
          )}
        </div>
        {isHero && (
          <span className={`${getLabelStyles()} cursor-default`}>
            {label}
          </span>
        )}
      </div>

      <div className={`flex items-center overflow-visible z-10 w-full ${isHero ? 'justify-start mt-2' : 'justify-center'} ${contentOpacity}`}>
        {renderValue()}
      </div>
      
      {isHero && subtext && !isEmpty && (
        <div className="mt-4 flex items-center gap-2 text-[11px] font-[600] text-[#22c55e] bg-[#22c55e]/10 px-2.5 py-1 rounded-md w-fit z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          {subtext}
        </div>
      )}
    </Card>
  );

  // Pop-in animation for Hero, standard child stagger item for the rest
  if (isHero && !isEmpty) {
    return (
      <motion.div 
        ref={ref} 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={isInView ? { scale: [0.8, 1.05, 1], opacity: 1 } : {}} 
        transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
        className="w-full h-full" 
        {...motionProps} 
        onClick={onClick}
      >
        {CardContent}
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={ref} 
      className="w-full h-full" 
      {...motionProps} 
      onClick={onClick}
      variants={{
        hidden: { scale: 0.95, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
      }}
    >
      {CardContent}
    </motion.div>
  );
}

