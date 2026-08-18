import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await prisma.match.deleteMany({
      where: {
        round: { in: ['semiA', 'semiB', 'challenger', 'final'] }
      }
    });
    return NextResponse.json({ success: true, count: result.count });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
