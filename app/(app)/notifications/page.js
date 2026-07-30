import { getPlayers } from '@/app/actions/player';
import prisma from '@/lib/db';
import NotificationsClient from './NotificationsClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NotificationsRoute() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('golazo_user_id')?.value;
  
  if (!userId) redirect('/login');

  let players = [], notifications = [];
  try {
    players = await getPlayers();
    notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  } catch (error) {
    console.error('Failed to load notifications dependencies:', error);
  }

  const me = players.find(p => p.id === userId);

  return (
    <NotificationsClient 
      me={me}
      notifications={notifications}
    />
  );
}
