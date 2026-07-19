import React from 'react';
import { UserCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card as ShadcnCard } from './ui/card';
import { Input as ShadcnInput } from './ui/input';
import { Label as ShadcnLabel } from './ui/label';
import { Badge as ShadcnBadge } from './ui/badge';
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';

export const Card = ({ children, className = "", ...rest }) => (
  <ShadcnCard className={`overflow-hidden border-border bg-card shadow-md transition-all hover:shadow-lg ${className}`} {...rest}>
    {children}
  </ShadcnCard>
);

export const Btn = ({ children, variant = "primary", className = "", disabled, ...rest }) => {
  // Map our custom variants to Tailwind classes on top of Shadcn button
  let variantClasses = "";
  switch(variant) {
    case 'primary': variantClasses = "bg-pitch hover:bg-pitch-bright text-white"; break;
    case 'gold': variantClasses = "bg-gold hover:bg-gold-dim text-black"; break;
    case 'claret': variantClasses = "bg-claret hover:bg-claret-dim text-white"; break;
    case 'ghost': variantClasses = "bg-transparent border border-border text-foreground hover:bg-secondary"; break;
    case 'danger': variantClasses = "bg-transparent border border-destructive text-destructive hover:bg-destructive hover:text-white"; break;
  }

  return (
    <Button 
      disabled={disabled} 
      className={`${variantClasses} ${className} font-semibold rounded-xl shadow-sm transition-all hover:-translate-y-0.5`} 
      {...rest}
    >
      {children}
    </Button>
  );
};

export const Input = ({ className = "", ...props }) => (
  <ShadcnInput {...props} className={`bg-secondary border-border focus-visible:ring-pitch ${className}`} />
);

export const Select = ({ className = "", ...props }) => (
  <select {...props} className={`flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} />
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

export const Avatar = ({ p, size = 40, ring, glow }) => {
  return (
    <ShadcnAvatar className={`shrink-0 ${glow ? 'animate-pulse' : ''}`} style={{ width: size, height: size, border: ring ? `2px solid ${ring}` : `1px solid var(--border)` }}>
      {p?.avatarImage ? (
        <AvatarImage src={p.avatarImage} alt={p.name} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-secondary flex items-center justify-center">
        {p?.avatar ? (
          <span style={{ fontSize: size * 0.55 }}>{p.avatar}</span>
        ) : (
          <UserCircle2 size={size * 0.6} className="text-muted-foreground" />
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
    <div className="flex items-center gap-2">
      <Icon size={18} className="text-pitch-bright" />
      <h2 className="text-lg font-semibold">{children}</h2>
    </div>
    {right}
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
    whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
    transition={{ duration: 0.2 }}
    className={`overflow-hidden border border-border bg-card shadow-md transition-colors rounded-xl relative ${className}`}
    {...rest}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    {children}
  </motion.div>
);

export const ShinyButton = ({ children, onClick, className = "", disabled }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden rounded-xl bg-pitch px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-pitch-bright ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none" />
  </motion.button>
);
