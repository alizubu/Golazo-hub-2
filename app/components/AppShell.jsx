'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PlayerViews from './PlayerViews';
import AdminOverviewDashboard from './AdminOverviewDashboard';
import { AdminSeason, AdminPlayers, AdminMatches, AdminTrophies, AdminAnnouncements, AdminSettings } from './AdminConsole';
import HallOfFame from './HallOfFame';
import { useAppContext } from './AppContextProvider';
import SportsTicker from './SportsTicker';
import CelebrationBanner from './CelebrationBanner';

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
  history = []
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

  return (
    <>
      <div className="w-full">
        <CelebrationBanner />
        <SportsTicker
          matches={matches}
          announcements={announcements}
          players={players}
          tickerConfig={tickerConfig}
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 pt-4">
        {currentTab === 'hall-of-fame' ? (
        <HallOfFame trophies={trophies} players={players} />
      ) : session?.type === 'admin' ? (
        <>
          {currentTab === 'admin/players' ? <div className="pt-4"><AdminPlayers {...adminProps} /></div> :
           currentTab === 'admin/season' ? <div className="pt-4"><AdminSeason {...adminProps} /></div> :
           currentTab === 'admin/matches' ? <div className="pt-4"><AdminMatches {...adminProps} /></div> :
           currentTab === 'admin/trophies' ? <div className="pt-4"><AdminTrophies {...adminProps} /></div> :
           currentTab === 'admin/announcements' ? <div className="pt-4"><AdminAnnouncements {...adminProps} onTickerConfigSaved={setTickerConfig} /></div> :
           currentTab === 'admin/settings' ? <div className="pt-4"><AdminSettings {...adminProps} /></div> :
           <AdminOverviewDashboard {...adminProps} />}
        </>
      ) : (
        <PlayerViews {...playerProps} />
      )}
      </div>
    </>
  );
}
