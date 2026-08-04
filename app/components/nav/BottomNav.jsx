'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { NavItem } from './NavItem';
import { NavFab } from './NavFab';
import { NavNotchBackground } from './NavNotchBackground';

export const BottomNav = ({ items, pathname, isActive, handleNav, hasLiveMatch }) => {
  const shouldReduceMotion = useReducedMotion();

  // Find the Dashboard (FAB) item and the side items
  const fabItem = items.find(item => item.id === 'dashboard');
  const otherItems = items.filter(item => item.id !== 'dashboard');
  
  // Split into left (2) and right (2)
  const leftItems = otherItems.slice(0, 2);
  const rightItems = otherItems.slice(2, 4);

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pointer-events-none"
    >
      <div className="relative w-full max-w-[500px] mx-auto h-[72px] rounded-[32px] pointer-events-auto shadow-nav-ambient">
        
        {/* SVG Notch Background */}
        <NavNotchBackground />

        {/* FAB (Dashboard) */}
        {fabItem && (
          <NavFab 
            item={fabItem} 
            active={isActive(fabItem.href, fabItem.matchRoot)} 
            onClick={handleNav} 
          />
        )}

        {/* Flex container for the side tabs */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {/* Left Items */}
          <div className="flex items-center justify-evenly w-[40%] h-full">
            {leftItems.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                active={isActive(item.href, item.matchRoot)} 
                onClick={handleNav}
                hasLive={item.href.includes('matches') && hasLiveMatch}
              />
            ))}
          </div>
          
          {/* Center gap for FAB */}
          <div className="w-[20%]" />

          {/* Right Items */}
          <div className="flex items-center justify-evenly w-[40%] h-full">
            {rightItems.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                active={isActive(item.href, item.matchRoot)} 
                onClick={handleNav}
              />
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
