import { getPlayers } from '@/app/actions/player';
import AdminPlayersClient from './AdminPlayersClient';

export const dynamic = 'force-dynamic';

export default async function AdminPlayersRoute() {
  let players = [];
  try {
    players = await getPlayers();
  } catch (error) {
    console.error('Failed to load admin players data:', error);
  }

  return (
    <AdminPlayersClient 
      players={players}
    />
  );
}
