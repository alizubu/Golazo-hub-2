'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Edit, Key } from 'lucide-react';
import { useAppContext } from './AppContextProvider';
import { PlayerDashboard } from './PlayerViews';
import { Btn, Avatar } from './UI';

export default function PlayerProfileDrawer({ players, matches, seasons, announcements, trophies, notifications, session }) {
  const { selectedProfileId, closeProfile } = useAppContext();

  const selectedPlayer = players?.find(p => p.id === selectedProfileId);
  const activeSeason = seasons?.find(s => !s.isArchived) || seasons?.[0];

  return (
    <AnimatePresence>
      {selectedProfileId && selectedPlayer && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[800px] bg-background border-l border-border/50 shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/30 shrink-0 sticky top-0 z-50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Avatar p={selectedPlayer} size={32} />
                <span className="font-heading font-bold text-lg">{selectedPlayer.name}&apos;s Profile</span>
              </div>
              <button 
                onClick={closeProfile}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Admin Quick Actions (Visible only to admins) */}
            {session?.type === 'admin' && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mr-auto">
                  <ShieldAlert size={14} /> Admin Tools
                </div>
                <Btn variant="outline" className="h-8 text-xs gap-1.5 border-amber-500/30 text-amber-500 hover:bg-amber-500/20">
                  <Edit size={12} /> Quick Edit
                </Btn>
                <Btn variant="outline" className="h-8 text-xs gap-1.5 border-amber-500/30 text-amber-500 hover:bg-amber-500/20">
                  <Key size={12} /> Reset Password
                </Btn>
              </div>
            )}

            {/* Scrollable Content (Player Dashboard) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
              <PlayerDashboard 
                me={selectedPlayer}
                players={players}
                matches={matches}
                seasons={seasons}
                activeSeason={activeSeason}
                announcements={announcements}
                trophies={trophies}
                notifications={notifications}
                viewOnly={true}
                setTab={() => {}} // No-op since we are viewing from drawer
                onMatchClick={() => {}} // Could be wired up to open match modal if needed
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
