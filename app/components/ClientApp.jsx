'use client';

import React, { useState } from 'react';
import AuthGate from './AuthGate';
import TopBar from './TopBar';
import PlayerViews from './PlayerViews';
import AdminConsole from './AdminConsole';
import { Home, ListOrdered, Calendar, Swords, Users, Archive, Bell, UserCircle2, Settings, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ClientApp({ initialPlayers, initialTournaments, initialMatches, initialNotifications, adminConfig }) {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const players = initialPlayers || [];
  const tournaments = initialTournaments || [];
  const matches = initialMatches || [];
  const notifications = initialNotifications || [];

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
        onPlayerLogin={(p) => { setSession({ type: 'player', playerId: p.id }); setTab('dashboard'); }}
        onAdminLogin={() => { setSession({ type: 'admin' }); setTab('admin'); }}
      />
    );
  }

  const me = session.type === 'player' ? players.find((p) => p.id === session.playerId) : null;
  const ctx = { players, tournaments, matches, notifications, activeTournament, history, showToast };

  const playerTabs = [
    { id: "dashboard", label: "Dashboard", icon: Home }, { id: "standings", label: "Standings", icon: ListOrdered },
    { id: "matches", label: "Matches", icon: Calendar }, { id: "playoffs", label: "Playoffs", icon: Swords },
    { id: "players", label: "Roster", icon: Users }, { id: "history", label: "History", icon: Archive },
    { id: "notifications", label: "Alerts", icon: Bell }, { id: "profile", label: "Profile", icon: UserCircle2 },
  ];
  const adminTabs = [
    { id: "admin", label: "Overview", icon: Home }, { id: "admin-players", label: "Players", icon: Users },
    { id: "admin-tournament", label: "Tournament", icon: Trophy }, { id: "admin-matches", label: "Matches", icon: Calendar },
    { id: "admin-playoffs", label: "Playoffs", icon: Swords }
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
      
      <TopBar session={session} me={me} onLogout={() => { setSession(null); setTab('dashboard'); }} />
      
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {items.map((it) => {
            const Icon = it.icon; 
            const active = tab === it.id;
            return (
              <button 
                key={it.id} 
                onClick={() => setTab(it.id)} 
                className={`snap-start transition-all flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 border ${
                  active 
                    ? 'bg-secondary text-pitch-bright border-border shadow-sm' 
                    : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Icon size={16} /> {it.label}
              </button>
            );
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
                ? <AdminConsole {...ctx} tab={tab} /> 
                : <PlayerViews {...ctx} me={me} tab={tab} setTab={setTab} />
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
