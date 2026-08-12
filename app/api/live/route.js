import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Force dynamic so it doesn't get statically cached at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const liveMatches = await prisma.match.findMany({
      where: {
        status: { in: ['live'] }
      },
      include: {
        home: { select: { id: true, name: true, avatar: true, teamLogo: true } },
        away: { select: { id: true, name: true, avatar: true, teamLogo: true } },
      }
    });

    return NextResponse.json({ matches: liveMatches });
  } catch (error) {
    console.error("Live polling error:", error);
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
