import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const player = await prisma.player.findUnique({
      where: { id }
    });

    if (!player) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Omit sensitive data
    const { passwordHash, salt, ...safePlayer } = player;

    return NextResponse.json({ player: safePlayer });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
