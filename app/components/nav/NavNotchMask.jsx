export function NavNotchMask() {
  return (
    <svg 
      viewBox="0 0 800 110" 
      className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-[110px] pointer-events-none" 
      style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="nav-bg" x1="0" y1="0" x2="800" y2="0">
          <stop offset="0%" stopColor="#11161D" />
          <stop offset="50%" stopColor="#151B25" />
          <stop offset="100%" stopColor="#11161D" />
        </linearGradient>
        <linearGradient id="nav-border" x1="0" y1="0" x2="800" y2="0">
          <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="65%" stopColor="#22c55e" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path 
        d="M 0 40 L 330 40 C 355 40, 360 80, 400 80 C 440 80, 445 40, 470 40 L 800 40 L 800 110 L 0 110 Z" 
        fill="url(#nav-bg)" 
        stroke="url(#nav-border)" 
        strokeWidth="1.5" 
      />
    </svg>
  );
}
