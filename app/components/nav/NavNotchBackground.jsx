import React from 'react';

export const NavNotchBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
      {/* 
        We use an oversized 800px wide SVG centered to ensure the notch remains
        perfectly in the middle without stretching the curve on different screen sizes.
      */}
      <svg 
        viewBox="0 0 800 72" 
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-[72px]" 
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="nav-border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" /> {/* sky-400 */}
            <stop offset="100%" stopColor="#34D399" /> {/* emerald-400 */}
          </linearGradient>
          
          {/* Subtle translucent fill to match the backdrop-blur glass effect */}
          <linearGradient id="nav-fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(24, 24, 27, 0.85)" /> {/* zinc-900 */}
            <stop offset="100%" stopColor="rgba(9, 9, 11, 0.95)" /> {/* zinc-950 */}
          </linearGradient>
        </defs>

        <path 
          d="
            M 0 1 
            H 350 
            C 362 1, 362 38, 400 38 
            C 438 38, 438 1, 450 1 
            H 800 
            V 72 
            H 0 
            Z
          " 
          fill="url(#nav-fill-gradient)"
          stroke="url(#nav-border-gradient)"
          strokeWidth="1.5"
          /* We don't want the stroke to draw on the bottom or sides inside the container, 
             so the path starts at Y=1. The bottom and sides overflow the container slightly or are hidden by rounded-[32px] */
        />
      </svg>
    </div>
  );
};
