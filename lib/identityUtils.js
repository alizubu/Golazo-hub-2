import nationalTeamsData from '@/lib/data/national_teams.json';
import { CLUBS } from '@/lib/data/clubs';

export const getPlayerIdentityBadgeUrl = (player) => {
  if (!player) return null;
  const pref = player.displayBadgePreference || 'club';
  if (pref === 'club' && player.favoriteClub) {
    const club = CLUBS.find(c => c.name === player.favoriteClub);
    if (club) return club.crestPath;
  }
  if (pref === 'nation' && player.flag) {
    const nt = nationalTeamsData.find(n => n.name === player.flag);
    if (nt) return nt.flag_url;
  }
  if (player.flag) {
    const nt = nationalTeamsData.find(n => n.name === player.flag);
    if (nt) return nt.flag_url;
  }
  return null;
};
