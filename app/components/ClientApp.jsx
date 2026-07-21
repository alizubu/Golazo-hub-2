'use client';

import React, { useState } from 'react';
import AuthGate from './AuthGate';
import TopBar from './TopBar';
import PlayerViews from './PlayerViews';
import AdminConsole from './AdminConsole';
import { Home, ListOrdered, Calendar, Swords, Users, Archive, Bell, UserCircle2, Settings, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ClientApp({ initialPlayers, initialTournaments, initialMatches, initialNotifications, initialAnnouncements, initialTrophies, adminConfig }) {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  let players = initialPlayers || [];
  if (session?.type === 'player' && session.player && !players.find(p => p.id === session.playerId)) {
    players = [...players, session.player];
  }
  const tournaments = initialTournaments || [];
  const matches = initialMatches || [];
  const notifications = initialNotifications || [];
  const announcements = initialAnnouncements || [];
  const trophies = initialTrophies || [];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const activeTournament = tournaments.find((t) => t.status === 'active') || null;
  const history = tournaments.filter((t) => t.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

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
  const ctx = { players, tournaments, matches, notifications, announcements, trophies, activeTournament, history, showToast };

  const playerTabs = [
    { id: "dashboard", label: "Dashboard", icon: Home }, { id: "standings", label: "Standings", icon: ListOrdered },
    { id: "matches", label: "Matches", icon: Calendar }, { id: "playoffs", label: "Playoffs", icon: Swords },
    { id: "players", label: "Roster", icon: Users }, { id: "history", label: "History", icon: Archive },
    { id: "notifications", label: "Alerts", icon: Bell },
  ];
  const adminTabs = [
    { id: "admin", label: "Overview", icon: Home }, { id: "admin-players", label: "Players", icon: Users },
    { id: "admin-tournament", label: "Tournament", icon: Trophy }, { id: "admin-matches", label: "Matches", icon: Calendar },
    { id: "admin-playoffs", label: "Playoffs", icon: Swords }, { id: "admin-trophies", label: "Trophies", icon: Trophy },
    { id: "admin-announcements", label: "Announcements", icon: Bell }
  ];
  const items = session.type === "admin" ? adminTabs : playerTabs;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl bg-pitch text-white font-semibold flex items-center gap-2 border border-pitch-bright/50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      
      <TopBar session={session} me={me} setTab={setTab} onLogout={() => { setSession(null); setTab('dashboard'); }} />
      
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory relative">
          {items.map((it) => {
            const Icon = it.icon; 
            const active = tab === it.id;
            
            const btnContent = (
              <button 
                key={it.id} 
                onClick={() => setTab(it.id)} 
                className={`relative snap-start transition-all flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 ${
                  active 
                    ? 'text-pitch-bright' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="underline"
                    className="absolute inset-0 bg-secondary rounded-full -z-10 border border-border shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={16} className="relative z-10" /> 
                <span className="relative z-10">{it.label}</span>
              </button>
            );

            return btnContent;
          })}
        </div>

        <div className="mt-4">
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
    </div>
  );
}
