'use client';
import React from 'react';
import { NavNotchMask } from './NavNotchMask';
import { NavFab } from './NavFab';
import { NavItem } from './NavItem';
import { Trophy, Star } from 'lucide-react';

export function BottomNav({ items, pathname, isActive, handleNav, hasLiveMatch }) {
  // We want to split the items into left and right, excluding Dashboard (which is the FAB).
  // Assuming items: Dashboard, Matches, Roster, History, Hall of Fame, Settings
  
  // Dashboard is handled by FAB
  // Left items: index 1 and 2 (e.g., Matches, Roster)
  const leftItems = items.slice(1, 3);
  
  // Right items: index 3 and 4 (e.g., History, Hall of Fame, or Settings). 
  // Let's filter out Dashboard from items to place the remaining 4 items.
  const nonDashboardItems = items.filter(it => it.label !== 'Dashboard');
  
  // We need exactly 4 items for the sides if we are doing left/right. 
  // Let's take the first 4 non-dashboard items.
  // Wait, if Hall of Fame is one of them, it's just rendered as a NavItem (with gold styling inside NavItem).
  const sideItems = nonDashboardItems.slice(0, 4);
  const leftSide = sideItems.slice(0, 2);
  const rightSide = sideItems.slice(2, 4);

  return (
    <div className="md:hidden fixed bottom-1 left-0 right-0 z-[60] pb-[env(safe-area-inset-bottom)] pointer-events-none h-[110px]">
      <div className="relative w-full h-full max-w-[500px] mx-auto pointer-events-auto">
        
        {/* SVG Background Mask with single notch */}
        <NavNotchMask />

        {/* Left Side Buttons */}
        <div className="absolute left-2 right-[calc(50%+40px)] top-[40px] h-[70px] flex justify-evenly items-center">
          {leftSide.map((it) => {
            const Icon = it.icon;
            return (
              <NavItem
                key={it.href}
                href={it.href}
                icon={Icon}
                label={it.label}
                active={isActive(it.href, it.matchRoot)}
                iconColor={it.label === 'Matches' ? 'text-red-400' : 'text-white/60'}
                hasLive={hasLiveMatch && (it.label === 'Matches')}
                onClick={handleNav}
              />
            );
          })}
        </div>

        {/* Right Side Buttons */}
        <div className="absolute right-2 left-[calc(50%+40px)] top-[40px] h-[70px] flex justify-evenly items-center">
          {rightSide.map((it) => {
            const Icon = it.icon;
            return (
              <NavItem
                key={it.href}
                href={it.href}
                icon={Icon}
                label={it.label}
                active={isActive(it.href, it.matchRoot)}
                iconColor="text-white/60"
                onClick={handleNav}
              />
            );
          })}
        </div>

        {/* Center Top Floating Action Button */}
        <NavFab onClick={handleNav} />

      </div>
    </div>
  );
}
