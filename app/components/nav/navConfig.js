import {
  Home, Calendar, Users, History as HistoryIcon, Star, Bell,
  Trophy, Megaphone, TrendingUp
} from 'lucide-react';

export const playerTabs = [
  { id: 'matches', label: 'Matches', href: '/matches', icon: Calendar },
  { id: 'roster', label: 'Roster', href: '/players', icon: Users },
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home, matchRoot: true }, // FAB
  { id: 'history', label: 'History', href: '/history', icon: HistoryIcon },
  { id: 'ranking', label: 'Ranking', href: '/ranking', icon: TrendingUp },
  { id: 'hall-of-fame', label: 'Hall of Fame', href: '/hall-of-fame', icon: Star, variant: 'gold' },
];

export const adminTabs = [
  { id: 'matches', label: 'Matches', href: '/admin/matches', icon: Calendar },
  { id: 'players', label: 'Players', href: '/admin/players', icon: Users },
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home, matchRoot: true }, // FAB
  { id: 'tournament', label: 'Tournament', href: '/admin/season', icon: Trophy },
  { id: 'announcements', label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { id: 'history', label: 'History', href: '/admin/history', icon: HistoryIcon },
  { id: 'notifications', label: 'Notifications', href: '/admin/notifications', icon: Bell },
];
