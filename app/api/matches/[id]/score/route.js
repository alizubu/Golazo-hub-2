import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Rebuilt from zero — exact error surfaced to client, dead standings stub removed
export async function PATCH(request, { params }) {
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { homeScore, awayScore } = body;
  const h = parseInt(homeScore, 10);
  const a = parseInt(awayScore, 10);

  if (isNaN(h) || h < 0 || isNaN(a) || a < 0) {
    return NextResponse.json(
      { success: false, error: 'Scores must be non-negative integers' },
      { status: 400 }
    );
  }

  try {
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        homeScore: h,
        awayScore: a,
        status: 'completed',
        completedAt: match.completedAt || new Date(),
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({ success: true, match: updated });
  } catch (error) {
    console.error('Edit score failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update score' },
      { status: 500 }
    );
  }
}
