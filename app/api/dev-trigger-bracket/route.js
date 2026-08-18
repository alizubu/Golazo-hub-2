import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import { adminTriggerBracketProgress } from '@/app/actions/match';

export async function GET() {
  try {
    const activeSeason = await prisma.season.findFirst({ orderBy: { createdAt: 'desc' }});
    if (!activeSeason) return NextResponse.json({ error: 'No active season' });
    
    await adminTriggerBracketProgress(activeSeason.id);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
