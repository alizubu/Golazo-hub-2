import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing match ID' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        home: {
          select: { id: true, name: true, avatarUrl: true, avatarImage: true, avatar: true, teamName: true }
        },
        away: {
          select: { id: true, name: true, avatarUrl: true, avatarImage: true, avatar: true, teamName: true }
        },
        season: {
          select: { id: true, name: true }
        }
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 });
  }
}
