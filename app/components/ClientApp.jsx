'use client';

import React, { useState } from 'react';
import AuthGate from './AuthGate';
import TopBar from './TopBar';
import PlayerViews from './PlayerViews';
import AdminConsole from './AdminConsole';
import { Home, ListOrdered, Calendar, Swords, Users, Archive, Bell, UserCircle2, Settings, Trophy } from 'lucide-react';

export default function ClientApp({ initialPlayers, initialTournaments, initialMatches, initialNotifications, adminConfig }) {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  // Fallbacks if server didn't provide
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
    <div className="min-h-screen">
      {toast && (
        <div className="toast-anim fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold" style={{ background: 'var(--pitch)', color: '#fff' }}>
          {toast}
        </div>
      )}
      
      <TopBar session={session} me={me} onLogout={() => { setSession(null); setTab('dashboard'); }} />
      
      <div className="layout-container pt-4">
        <div className="flex gap-1 overflow-x-auto pt-4 pb-1 -mx-1 px-1 hide-scrollbar">
          {items.map((it) => {
            const Icon = it.icon; 
            const active = tab === it.id;
            return (
              <button key={it.id} onClick={() => setTab(it.id)} className="transition-all-fast flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0"
                style={{ background: active ? 'var(--surface3)' : "transparent", color: active ? 'var(--pitchBright)' : 'var(--textDim)', border: `1px solid ${active ? 'var(--borderLight)' : "transparent"}` }}>
                <Icon size={15} /> {it.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {session.type === 'admin' 
            ? <AdminConsole {...ctx} tab={tab} /> 
            : <PlayerViews {...ctx} me={me} tab={tab} setTab={setTab} />
          }
        </div>
      </div>
    </div>
  );
}
