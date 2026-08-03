import { NextResponse } from 'next/server';
import webpush from 'web-push';
import prisma from '@/lib/db';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@golazohub.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys not set. Push notifications will not work.');
}

export async function POST(req) {
  try {
    const { subscription, playerId, type, payload } = await req.json();

    if (type === 'subscribe') {
      const { endpoint, keys } = subscription;
      
      const existing = await prisma.pushSubscription.findUnique({
        where: { endpoint }
      });

      if (!existing) {
        await prisma.pushSubscription.create({
          data: {
            playerId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth
          }
        });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'notify') {
      if (!process.env.VAPID_PRIVATE_KEY) {
        return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
      }

      const subs = await prisma.pushSubscription.findMany({
        where: { playerId }
      });

      const notifications = subs.map(sub => {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        return webpush.sendNotification(pushSub, JSON.stringify(payload)).catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('Subscription has expired or is no longer valid: ', err);
            return prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            throw err;
          }
        });
      });

      await Promise.all(notifications);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Web push error:', error);
    return NextResponse.json({ error: 'Failed to process web push request' }, { status: 500 });
  }
}
