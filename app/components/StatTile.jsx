'use client';
import React, { useRef } from 'react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { motion, useInView } from 'framer-motion';

export function StatTile({
  icon: Icon,
  label,
  value,
  loaded = true,
  isHero = false,
  isPercentage = false,
  isCountUp = false,
  emptyStateText,
  onClick,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const isEmpty = value === null || value === undefined || value === '' || value === 0;

  const interactable = !!onClick;
  const cursorClass = interactable ? 'cursor-pointer' : 'cursor-default';

  const hoverY = !isEmpty && interactable ? -2 : 0;
  const motionProps = {
    whileHover: { 
      y: hoverY,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  const getLabelStyles = () => 'text-xs font-semibold uppercase tracking-wider text-slate-400';
  
  const baseCardClasses = `relative flex flex-col justify-start p-5 rounded-[14px] transition-shadow duration-300 w-full h-full bg-[#12151b] border-t border-t-white/[0.06] border-r-0 border-l-0 border-b-0 ${cursorClass} ${className}`;
  const shadowClasses = 'shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.5)]';
  const heroShadowClasses = 'shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.5),0_0_32px_-8px_rgba(234,179,8,0.15)]';

  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : (value || 0);
  
  let numberColorClass = 'text-foreground';
  if (isHero) {
    numberColorClass = 'text-amber-400';
  } else if (isPercentage && !isEmpty) {
    numberColorClass = numValue >= 50 ? 'text-[#22c55e]' : 'text-amber-500';
  }
  
  const numberStyles = `text-2xl md:text-3xl lg:text-4xl font-bold font-score tabular-nums tracking-normal ${numberColorClass}`;
  const contentOpacity = isEmpty ? 'opacity-65' : 'opacity-100';
  const iconBadgeBg = isHero && !isEmpty ? 'bg-amber-500/10' : (isEmpty ? 'bg-white/[0.02]' : 'bg-white/[0.04]');
  const iconColor = isHero && !isEmpty ? 'text-amber-400' : 'text-foreground/70';

  const renderValue = () => {
    if (!loaded) return <Skeleton className="h-8 w-20 rounded-md bg-white/10" />;
    
    if (isEmpty && emptyStateText) {
      return (
        <div className="flex flex-col gap-1 py-1">
          <span className={`text-2xl md:text-3xl lg:text-4xl font-bold font-score text-[#4b5563]`}>—</span>
          <span className="text-[10px] tracking-tight text-[#4b5563] leading-tight">{emptyStateText}</span>
        </div>
      );
    }

    if (isCountUp && !isEmpty && typeof numValue === 'number') {
      return (
        <div className={`w-full leading-none ${numberStyles}`}>
          {isInView ? <NumberTicker value={numValue} duration={0.8} /> : '0'}
          {isPercentage && '%'}
        </div>
      );
    }
    
    return (
      <div className={`w-full leading-none ${numberStyles}`}>
        {value}
      </div>
    );
  };

  const CardContent = (
    <div className={`${baseCardClasses} ${isHero ? heroShadowClasses : shadowClasses}`}>
      {isHero && !isEmpty && (
        <>
          <motion.div 
            className="absolute inset-0 rounded-[14px] pointer-events-none"
            animate={{ boxShadow: ['0 0 32px -8px rgba(234,179,8,0.15)', '0 0 32px -8px rgba(234,179,8,0.25)', '0 0 32px -8px rgba(234,179,8,0.15)'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className={`flex flex-col items-start gap-3 w-full z-10 ${contentOpacity} mb-3`}>
        <div className={`w-[32px] h-[32px] rounded-lg ${iconBadgeBg} flex items-center justify-center shrink-0`}>
          {Icon && <Icon size={16} strokeWidth={1.5} className={iconColor} />}
        </div>
        <span className={`${getLabelStyles()} cursor-default`}>
          {label}
        </span>
      </div>

      <div className={`flex items-center overflow-visible z-10 w-full justify-start mt-auto pt-1 ${contentOpacity}`}>
        {renderValue()}
      </div>
    </div>
  );

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
