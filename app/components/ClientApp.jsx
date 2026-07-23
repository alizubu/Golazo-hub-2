'use client';

import React, { useState } from 'react';
import AuthGate from './AuthGate';
import FloatingNav from './FloatingNav';
import PlayerViews from './PlayerViews';
import AdminConsole from './AdminConsole';
import { AnimatePresence, motion } from 'framer-motion';

export default function ClientApp({ initialPlayers, initialSeasons, initialMatches, initialNotifications, initialAnnouncements, initialTrophies, adminConfig }) {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  let players = initialPlayers || [];
  if (session?.type === 'player' && session.player && !players.find(p => p.id === session.playerId)) {
    players = [...players, session.player];
  }
  const seasons = initialSeasons || [];
  const matches = initialMatches || [];
  const notifications = initialNotifications || [];
  const announcements = initialAnnouncements || [];
  const trophies = initialTrophies || [];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const activeSeason = seasons.find((t) => !t.isArchived) || null;
  const history = seasons.filter((t) => t.isArchived).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  if (!session) {
    return (
      <AuthGate
        players={players}
        showToast={showToast}
        onPlayerLogin={(p) => { setSession({ type: 'player', playerId: p.id, player: p }); setTab('dashboard'); }}
        onAdminLogin={() => { setSession({ type: 'admin' }); setTab('admin'); }}
      />
    );
  }

  const me = session.type === 'player' ? players.find((p) => p.id === session.playerId) : null;
  const ctx = { players, seasons, matches, notifications, announcements, trophies, activeSeason, history, showToast };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-4 right-4 z-[60] px-5 py-3 rounded-xl shadow-2xl bg-pitch text-white font-semibold flex items-center gap-2 border border-pitch-bright/50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Nav — replaces TopBar + old pill strip */}
      <FloatingNav
        session={session}
        me={me}
        tab={tab}
        setTab={setTab}
        onLogout={() => { setSession(null); setTab('dashboard'); }}
        players={players}
        notifications={notifications}
      />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {session.type === 'admin'
              ? <AdminConsole {...ctx} tab={tab} setTab={setTab} />
              : <PlayerViews {...ctx} me={me} tab={tab} setTab={setTab} />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
