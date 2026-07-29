import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Hard reset: we keep the match records but wipe the scores and status
    await prisma.match.updateMany({
      where: { seasonId: id },
      data: {
        status: 'scheduled',
        homeScore: null,
        awayScore: null,
        completedAt: null,
        wentToExtra: false,
        penaltyHome: null,
        penaltyAway: null,
        penaltyWinner: null,
        stats: null,
        liveState: null
      }
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset standings error:', error);
    return NextResponse.json({ error: 'Failed to reset standings' }, { status: 500 });
  }
}
