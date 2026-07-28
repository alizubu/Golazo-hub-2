import React from 'react';
import { UserCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card as ShadcnCard } from './ui/card';
import { Input as ShadcnInput } from './ui/input';
import { Label as ShadcnLabel } from './ui/label';
import { Badge as ShadcnBadge } from './ui/badge';
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return 'TBD';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
};

export const Card = ({ children, className = "", ...rest }) => (
  <ShadcnCard className={`overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg transition-all hover:border-border/80 hover:shadow-xl ${className}`} {...rest}>
    {children}
  </ShadcnCard>
);

export const Btn = ({ children, variant = "primary", className = "", disabled, loading, icon: Icon, ...rest }) => {
  let variantClasses = "";
  switch(variant) {
    case 'primary': variantClasses = "bg-pitch hover:bg-pitch-bright text-white shadow-md shadow-pitch/20"; break;
    case 'gold': variantClasses = "bg-gold hover:bg-gold-dim text-black shadow-md shadow-gold/20"; break;
    case 'claret': variantClasses = "bg-claret hover:bg-claret-dim text-white shadow-md shadow-claret/20"; break;
    case 'ghost': variantClasses = "bg-transparent border border-border/60 text-foreground hover:bg-secondary/80 hover:border-border"; break;
    case 'danger': variantClasses = "bg-transparent border border-destructive/60 text-destructive hover:bg-destructive hover:text-white"; break;
    case 'outline': variantClasses = "bg-transparent border border-border text-foreground hover:bg-secondary/60"; break;
    default: variantClasses = "bg-pitch hover:bg-pitch-bright text-white"; break;
  }

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.03, y: -1.5 }}
      whileTap={disabled || loading ? {} : { scale: 0.92 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch cursor-pointer select-none",
        variantClasses,
        disabled || loading ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="animate-spin text-current shrink-0" size={16} />
      ) : Icon ? (
        <Icon className="shrink-0" size={16} />
      ) : null}
      {children}
    </motion.button>
  );
};

export const Input = ({ className = "", ...props }) => (
  <ShadcnInput {...props} className={`bg-secondary border-border focus-visible:ring-pitch ${className}`} />
);



export const Label = ({ children }) => (
  <ShadcnLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">
    {children}
  </ShadcnLabel>
);

export const Badge = ({ children, color = 'var(--pitch)', bg, pulse }) => (
  <ShadcnBadge variant="outline" className="text-[10px] font-bold uppercase tracking-wide gap-1.5 px-2 py-0.5 rounded-full border-none" style={{ color, backgroundColor: bg || `${color}22` }}>
    {pulse && (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }}></span>
      </span>
    )}
    {children}
  </ShadcnBadge>
);



export const Avatar = ({ p, size = 40, ring, glow, className = "" }) => {
  const [failedSrc, setFailedSrc] = React.useState(null);

  const isError = failedSrc && failedSrc === p?.avatarImage;
  const hasValidImage = p?.avatarImage && 
    p.avatarImage !== '/default-avatar.png' && 
    p.avatarImage !== '/default-avatar.svg' && 
    !isError;

  return (
    <ShadcnAvatar 
      className={cn("shrink-0 relative overflow-hidden rounded-full bg-secondary/80", glow ? 'animate-pulse' : '', className)} 
      style={{ width: size, height: size, border: ring ? `2px solid ${ring}` : `1px solid var(--border)` }}
    >
      {hasValidImage ? (
        <AvatarImage 
          src={p.avatarImage} 
          alt={p?.name || "Player"} 
          className="object-cover w-full h-full" 
          onError={() => setFailedSrc(p.avatarImage)} 
        />
      ) : null}
      <AvatarFallback className="w-full h-full flex items-center justify-center bg-transparent relative overflow-hidden">
        {p?.avatar ? (
          <span style={{ fontSize: size * 0.55 }} className="relative z-10 select-none flex items-center justify-center w-full h-full bg-secondary">{p.avatar}</span>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b] w-full h-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-shimmer pointer-events-none" 
              style={{ backgroundSize: '200% 100%' }} 
            />
            <svg viewBox="0 0 24 24" fill="none" className="w-[62%] h-[62%] text-zinc-500/70 relative z-10 drop-shadow" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
            </svg>
          </div>
        )}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};

export const PlayerChip = ({ p, size = 8 }) => (
  <div className="flex items-center gap-2 min-w-0">
    <Avatar p={p} size={Math.max(24, size)} />
    <span className="font-semibold truncate">{p?.name || "TBD"}</span>
    <span className="opacity-60 text-xs">{p?.teamLogo}</span>
  </div>
);

export const SectionTitle = ({ icon: Icon, children, right }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      {Icon && <Icon size={20} className="text-pitch-bright shrink-0" />}
      <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-foreground">{children}</h2>
    </div>
    {right && <div className="flex items-center gap-2">{right}</div>}
  </div>
);

export const EmptyState = ({ text }) => (
  <div className="text-sm text-center py-6 text-muted-foreground">
    {text}
  </div>
);

// Framer motion wrappers
export const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.2, 0.8, 0.2, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export const MagicCard = ({ children, className = "", ...rest }) => (
  <motion.div
    whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
    transition={{ duration: 0.2 }}
    className={`overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md transition-colors relative ${className}`}
    {...rest}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    {children}
  </motion.div>
);

export const ShinyButton = ({ children, onClick, className = "", disabled, loading, ...rest }) => (
  <motion.button
    whileHover={disabled || loading ? {} : { scale: 1.03, y: -2 }}
    whileTap={disabled || loading ? {} : { scale: 0.92 }}
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "relative overflow-hidden rounded-xl bg-pitch px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-pitch-bright cursor-pointer select-none",
      disabled || loading ? "opacity-50 cursor-not-allowed" : "",
      className
    )}
    {...rest}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">
      {loading && <Loader2 className="animate-spin text-white shrink-0" size={18} />}
      {children}
    </span>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none" />
  </motion.button>
);
