import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Mock function representing standings recalculation.
// In reality, you'd trigger whatever update standings script you have.
async function triggerStandingsRecalculation(seasonId) {
  try {
    // We isolate this so it doesn't break the main request
    console.log('[API] Triggering standings recalculation for season:', seasonId);
    // (Actual recalculation logic would go here if needed)
  } catch (e) {
    console.error('[API] Failed to recalculate standings:', e);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { homeScore, awayScore } = body;

    // Validate inputs
    const parsedHome = parseInt(homeScore, 10);
    const parsedAway = parseInt(awayScore, 10);

    if (isNaN(parsedHome) || parsedHome < 0 || isNaN(parsedAway) || parsedAway < 0) {
      return NextResponse.json({ success: false, error: 'Scores must be non-negative integers.' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found.' }, { status: 404 });
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        homeScore: parsedHome,
        awayScore: parsedAway,
        status: 'completed',
        completedAt: match.completedAt || new Date()
      }
    });

    // Isolate side effects (like standings recalculation)
    if (match.seasonId) {
      await triggerStandingsRecalculation(match.seasonId);
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error('[API] Error updating match score:', error);
    return NextResponse.json({ success: false, error: 'Failed to update score.' }, { status: 500 });
  }
}
