'use client';
import { cn } from '@/lib/utils';
import React from 'react';

export function AnimatedBorderTrail({
  className,
  duration = 3,
  trailColor = '#22c55e',
  borderWidth = 1,
  children,
}) {
  return (
    <div
      className={cn(
        'relative isolate inline-block overflow-hidden rounded-[inherit]',
        className,
      )}
    >
      <div
        className="absolute inset-0 -z-10 animate-spin"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 50%, ${trailColor} 100%)`,
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      />
      <div
        className="absolute inset-[var(--border-width)] -z-10 rounded-[inherit] bg-background"
        style={{ '--border-width': `${borderWidth}px` }}
      />
      {children}
    </div>
  );
}
