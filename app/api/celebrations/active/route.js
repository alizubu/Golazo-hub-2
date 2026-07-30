import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeCelebrations = await prisma.trophyCelebration.findMany({
      where: {
        status: 'active',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        trophy: {
          include: {
            player: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    return NextResponse.json({ celebrations: activeCelebrations });
  } catch (error) {
    console.error('Failed to fetch active celebrations', error);
    return NextResponse.json({ celebrations: [] });
  }
}
