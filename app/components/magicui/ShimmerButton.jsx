'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export function ShimmerButton({
  shimmerColor = '#ffffff',
  shimmerSize = '0.05em',
  shimmerDuration = '3s',
  borderRadius = '100px',
  background = 'rgba(0, 0, 0, 1)',
  className,
  children,
  ...props
}) {
  return (
    <button
      style={{
        '--spread': '90deg',
        '--shimmer-color': shimmerColor,
        '--radius': borderRadius,
        '--speed': shimmerDuration,
        '--cut': shimmerSize,
        '--bg': background,
      }}
      className={cn(
        'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black',
        'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          '-z-30 blur-[2px]',
          'absolute inset-0 overflow-visible [container-type:size]',
        )}
      >
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-[var(--speed)] bg-[conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
      </div>
      {children}
      <div
        className={cn(
          'insert-0 absolute -z-20 h-full w-full',
          'rounded-[calc(var(--radius)-var(--cut))] bg-[var(--bg)]',
        )}
      />
    </button>
  );
}
