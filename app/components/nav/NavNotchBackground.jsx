import React, { useRef, useState, useEffect } from 'react';

export const NavNotchBackground = () => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(350); // fallback for SSR/initial render

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // W is total width. The bar is 90px tall. The flat part starts at Y=18. 
  // Corner radius is 32px.
  const W = width;
  const cx = W / 2;
  
  // Wave path: 110px wide total (from cx-55 to cx+55). Peak is at Y=2.
  const pathData = `
    M 32 18
    H ${cx - 55}
    C ${cx - 25} 18, ${cx - 35} 2, ${cx} 2
    C ${cx + 35} 2, ${cx + 25} 18, ${cx + 55} 18
    H ${W - 32}
    A 32 32 0 0 1 ${W} 50
    V 58
    A 32 32 0 0 1 ${W - 32} 90
    H 32
    A 32 32 0 0 1 0 58
    V 50
    A 32 32 0 0 1 32 18
    Z
  `;

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-[90px] pointer-events-none drop-shadow-2xl">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${W} 90`}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="nav-border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.8)" /> {/* sky-400 */}
            <stop offset="100%" stopColor="rgba(52, 211, 153, 0.8)" /> {/* emerald-400 */}
          </linearGradient>
          
          <linearGradient id="nav-fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(24, 24, 27, 0.75)" />
            <stop offset="100%" stopColor="rgba(9, 9, 11, 0.95)" />
          </linearGradient>

          <filter id="glass-blur">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Backdrop Blur layer (since SVG path doesn't natively support backdrop-filter well across all mobile browsers, we simulate a dark glass by using a solid translucent fill, but let's try a backdrop filter on the container if we can. For now, solid translucent fill works on iOS/Android safely) */}
        <path 
          d={pathData} 
          fill="url(#nav-fill-gradient)"
          stroke="url(#nav-border-gradient)"
          strokeWidth="1.5"
          className="backdrop-blur-xl"
        />
      </svg>
    </div>
  );
};
