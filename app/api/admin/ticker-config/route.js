import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let config = await prisma.tickerConfig.findFirst();
    if (!config) {
      config = await prisma.tickerConfig.create({ data: {} });
    }
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Ticker config GET error:', error);
    // Return safe defaults if DB not ready yet
    return NextResponse.json({
      config: {
        enabled: true,
        source: 'live_recent',
        customMatchIds: [],
        scrollSpeed: 'normal',
        showAvatars: true,
        pauseOnHover: true,
      }
    });
  }
}
