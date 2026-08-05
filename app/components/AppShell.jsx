'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PlayerViews from './PlayerViews';
import AdminOverviewDashboard from './AdminOverviewDashboard';
import { AdminSeason, AdminPlayers, AdminMatches, AdminTrophies, AdminAnnouncements, AdminSettings } from './AdminConsole';
import HallOfFame from './HallOfFame';
import { useAppContext } from './AppContextProvider';
import SportsTicker from './SportsTicker';
import CelebrationBanner from './CelebrationBanner';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import PlayerProfileDrawer from './PlayerProfileDrawer';
import AdminBroadcast from './AdminBroadcast';

export default function AppShell({ 
  initialTab, 
  session, 
  me, 
  players = [], 
  matches = [], 
  seasons = [], 
  announcements = [], 
  trophies = [], 
  notifications = [],
  history = [],
  activeCelebrations = []
}) {
  const { showToast } = useAppContext();
  const [tickerConfig, setTickerConfig] = useState(null);
  
  // Resolve default tab based on session
  const defaultTab = session?.type === 'admin' ? 'admin' : 'dashboard';
  
  // Clean initial tab
  const getCleanTab = useCallback((tabStr) => {
    if (!tabStr) return defaultTab;
    if (tabStr.startsWith('/')) return tabStr.substring(1);
    return tabStr;
  }, [defaultTab]);
  
  const [currentTab, setCurrentTab] = useState(getCleanTab(initialTab));
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Sync initialTab with currentTab on server navigation
  useEffect(() => {
    setCurrentTab(getCleanTab(initialTab));
  }, [initialTab, getCleanTab]);

  // Load ticker config from DB on mount
  useEffect(() => {
    fetch('/api/admin/ticker-config')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.config) setTickerConfig(data.config); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, '');
      setCurrentTab(getCleanTab(path));
    };
    
    const handleCustomTabChange = (e) => {
      if (e.detail) {
        setCurrentTab(getCleanTab(e.detail));
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('tab-change', handleCustomTabChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('tab-change', handleCustomTabChange);
    };
  }, [session, getCleanTab]);

  const setTab = (newTab) => {
    // Map internal hyphen-separated tabs from AdminConsole to URL paths
    let tabPath = newTab;
    if (newTab.startsWith('admin-')) {
       tabPath = newTab.replace('-', '/');
    }
    
    setCurrentTab(tabPath);
    // Push the state to browser history
    window.history.pushState(null, '', `/${tabPath}`);
    // Also trigger the event so other components (like FloatingNav) can sync if they need to
    window.dispatchEvent(new CustomEvent('tab-change', { detail: tabPath }));
  };

  const activeSeason = seasons?.find((t) => !t.isArchived) || null;
  const adminProps = { players, activeSeason, matches, announcements, notifications, trophies, seasons, history, showToast, setTab };
  const playerProps = { me, players, activeSeason, matches, announcements, notifications, trophies, seasons, history, setTab, tab: currentTab };

  // ══════════════════════════════════════════════════════════════
  // ADMIN SESSION — Command Center layout with persistent sidebar
  // ══════════════════════════════════════════════════════════════
  if (session?.type === 'admin') {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Persistent sidebar — handles desktop rail/full + mobile drawer */}
        <AdminSidebar
          currentTab={currentTab}
          setTab={setTab}
          activeSeason={activeSeason}
          matches={matches}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded(prev => !prev)}
        />

        {/* Main content area — offset by sidebar width */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarExpanded ? 'md:ml-[260px]' : 'md:ml-16'}`}>
          {/* Sticky top bar with hamburger (mobile), section title, season chip */}
          <AdminTopBar
            currentTab={currentTab}
            activeSeason={activeSeason}
          />

          {/* Content wrapper */}
          <div className="flex-1 overflow-auto">
            {/* SportsTicker still visible for admin */}
            <div className="w-full">
              <SportsTicker
                matches={matches}
                announcements={announcements}
                players={players}
                tickerConfig={tickerConfig}
              />
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-8">
              <CelebrationBanner initialCelebrations={activeCelebrations} />

              {currentTab === 'hall-of-fame' ? (
                <HallOfFame trophies={trophies} players={players} />
              ) : currentTab === 'admin/players' ? (
                <div className="pt-2"><AdminPlayers {...adminProps} /></div>
              ) : currentTab === 'admin/season' ? (
                <div className="pt-2"><AdminSeason {...adminProps} /></div>
              ) : currentTab === 'admin/matches' ? (
                <div className="pt-2"><AdminMatches {...adminProps} /></div>
              ) : currentTab === 'admin/trophies' ? (
                <div className="pt-2"><AdminTrophies {...adminProps} /></div>
              ) : currentTab === 'admin/announcements' ? (
                <div className="pt-2"><AdminAnnouncements {...adminProps} onTickerConfigSaved={setTickerConfig} /></div>
              ) : currentTab === 'admin/broadcast' ? (
                <div className="pt-2"><AdminBroadcast {...adminProps} onTickerConfigSaved={setTickerConfig} /></div>
              ) : currentTab === 'admin/settings' ? (
                <div className="pt-2"><AdminSettings {...adminProps} /></div>
              ) : (
                <AdminOverviewDashboard {...adminProps} />
              )}
            </div>
          </div>
        </div>
        <PlayerProfileDrawer session={session} players={players} matches={matches} seasons={seasons} announcements={announcements} trophies={trophies} notifications={notifications} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // PLAYER SESSION — unchanged existing layout
  // ══════════════════════════════════════════════════════════════
  return (
    <>
      <div className="w-full">
        <SportsTicker
          matches={matches}
          announcements={announcements}
          players={players}
          tickerConfig={tickerConfig}
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <CelebrationBanner initialCelebrations={activeCelebrations} />
        {currentTab === 'hall-of-fame' ? (
        <HallOfFame trophies={trophies} players={players} />
      ) : (
        <PlayerViews {...playerProps} />
      )}
      </div>
      <PlayerProfileDrawer session={session} players={players} matches={matches} seasons={seasons} announcements={announcements} trophies={trophies} notifications={notifications} />
    </>
  );
}
