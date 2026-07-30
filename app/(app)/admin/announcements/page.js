import prisma from '@/lib/db';
import AdminAnnouncementsClient from './AdminAnnouncementsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsRoute() {
  let announcements = [];

  try {
    announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    console.error('Failed to load admin announcements:', error);
  }

  return (
    <AdminAnnouncementsClient 
      announcements={announcements}
    />
  );
}
