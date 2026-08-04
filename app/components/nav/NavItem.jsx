'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function NavItem({ href, icon: Icon, label, active, iconColor = "text-muted-foreground", onClick, hasLive }) {
  // If this is the Hall of Fame item, we style it specially with gold
  const isSpecial = label === "Hall of Fame";

  return (
    <Link
      href={href}
      onClick={(e) => onClick(e, href)}
      className={`relative flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors outline-none group pointer-events-auto ${
        active 
          ? (isSpecial ? 'text-gold drop-shadow-[0_0_8px_rgba(217,169,59,0.5)]' : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]')
          : (isSpecial ? 'text-gold/70 hover:text-gold' : 'text-muted-foreground hover:text-white/80')
      }`}
    >
      <div className="relative">
        <motion.div 
          whileTap={{ scale: 0.85 }} 
          animate={{ scale: active ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Icon 
            size={isSpecial ? 24 : 22} 
            className={`transition-transform duration-300 ${active ? '' : `group-hover:scale-110`} ${isSpecial && !active ? 'text-gold/70' : iconColor}`} 
          />
        </motion.div>
        
        {hasLive && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#151B25] animate-pulse" />
        )}
      </div>
      
      <span className={`text-[10px] font-semibold transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
      
      {active && (
        <motion.div 
          layoutId="mobile-nav-glow" 
          className={`absolute inset-0 rounded-2xl pointer-events-none ${isSpecial ? 'bg-gold/10' : 'bg-white/5'}`} 
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}
