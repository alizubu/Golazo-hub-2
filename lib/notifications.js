import prisma from '@/lib/db';

export async function sendAutoNotification(text, type = 'info') {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'global' }
    });
    
    // If auto notifications are explicitly disabled, don't send
    if (settings && settings.autoNotificationsEnabled === false) {
      return null;
    }
    
    const notification = await prisma.notification.create({
      data: { text, type }
    });
    return notification;
  } catch (error) {
    console.error("Failed to send auto notification:", error);
    return null;
  }
}
