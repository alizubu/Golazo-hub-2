'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

export function Meteors({
  number = 20,
  className,
}) {
  const [meteorStyles, setMeteorStyles] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const styles = [...new Array(number)].map(() => ({
        top: Math.floor(Math.random() * 100) + '%',
        left: Math.floor(Math.random() * 100) + '%',
        animationDelay: Math.random() * 1 + 0.2 + 's',
        animationDuration: Math.floor(Math.random() * 8 + 2) + 's',
      }));
      setMeteorStyles(styles);
    }, 0);
    return () => clearTimeout(timeout);
  }, [number]);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]',
            className,
          )}
          style={style}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-slate-500 to-transparent" />
        </span>
      ))}
    </div>
  );
}
