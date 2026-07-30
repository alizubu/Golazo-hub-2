import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // 1. Fetch the original match to get pairing and season
    const originalMatch = await prisma.match.findUnique({
      where: { id }
    });

    if (!originalMatch) {
      return NextResponse.json({ success: false, error: 'Original match not found.' }, { status: 404 });
    }

    const { homeId, awayId, seasonId } = originalMatch;

    if (!homeId || !awayId || !seasonId) {
      return NextResponse.json({ success: false, error: 'Original match data is incomplete.' }, { status: 400 });
    }

    // 2. Check for an existing scheduled rematch for this exact pairing in the same season
    const existingRematch = await prisma.match.findFirst({
      where: {
        seasonId,
        status: 'scheduled',
        OR: [
          { homeId: homeId, awayId: awayId },
          { homeId: awayId, awayId: homeId }
        ]
      }
    });

    if (existingRematch) {
      return NextResponse.json({ 
        success: true, 
        message: 'A scheduled rematch already exists.', 
        match: existingRematch 
      });
    }

    // 3. Create a clean new match record (don't clone the original)
    const newMatch = await prisma.match.create({
      data: {
        seasonId,
        homeId,
        awayId,
        status: 'scheduled',
        round: 'league',
        matchday: 1, // Defaulting to 1 for rematches outside typical generator
      }
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({ success: true, match: newMatch });
  } catch (error) {
    console.error('[API] Error creating rematch:', error);
    return NextResponse.json({ success: false, error: 'Failed to create rematch.' }, { status: 500 });
  }
}
