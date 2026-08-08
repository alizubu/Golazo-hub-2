'use client';

import React from 'react';
import { Avatar } from '@/app/components/shared/UI';
import { useAppContext } from '@/app/components/shared/AppContextProvider';

/**
 * A reusable component to render a player's name and avatar that can be clicked
 * from anywhere in the app to open the global Player Profile Drawer.
 */
export default function PlayerTag({ player, showAvatar = true, size = 24, className = '' }) {
  const { openProfile } = useAppContext();

  if (!player) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openProfile(player.id);
      }}
      className={`group flex items-center gap-2 hover:bg-secondary/50 p-1 -m-1 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${className}`}
      title={`View ${player.name}'s profile`}
    >
      {showAvatar && (
        <div className="shrink-0 group-hover:scale-105 transition-transform">
          <Avatar p={player} size={size} />
        </div>
      )}
      <span className="font-semibold text-foreground group-hover:text-brand-green transition-colors text-left truncate">
        {player.name}
      </span>
      {player.flag && <span className="text-sm shrink-0">{player.flag}</span>}
    </button>
  );
}
