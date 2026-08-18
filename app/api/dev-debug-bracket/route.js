import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

const matchWinnerId = (m) => {
  if (!m || m.status !== 'completed') return null;
  if (m.homeScore > m.awayScore) return m.homeId;
  if (m.awayScore > m.homeScore) return m.awayId;
  if (m.penaltyWinner) return m.penaltyWinner === 'home' ? m.homeId : m.awayId;
  return null;
};

export async function GET() {
  try {
    const activeSeason = await prisma.season.findFirst({ orderBy: { createdAt: 'desc' }});
    if (!activeSeason) return NextResponse.json({ error: 'No active season' });
    
    const challenger = await prisma.match.findFirst({
      where: { seasonId: activeSeason.id, round: 'challenger' }
    });
    
    if (!challenger) return NextResponse.json({ error: 'No challenger match' });
    
    const existingFinal = await prisma.match.findFirst({
      where: { seasonId: activeSeason.id, round: 'final' }
    });
    
    const semiA = await prisma.match.findFirst({
      where: { seasonId: activeSeason.id, round: 'semiA', status: 'completed' },
      orderBy: { createdAt: 'desc' }
    });
    
    const semiAWinner = matchWinnerId(semiA);
    const challengerWinner = matchWinnerId(challenger);
    
    return NextResponse.json({
      seasonId: activeSeason.id,
      challenger: {
        id: challenger.id,
        status: challenger.status,
        homeScore: challenger.homeScore,
        awayScore: challenger.awayScore,
        winner: challengerWinner
      },
      semiA: semiA ? {
        id: semiA.id,
        status: semiA.status,
        homeScore: semiA.homeScore,
        awayScore: semiA.awayScore,
        winner: semiAWinner
      } : null,
      existingFinal: existingFinal ? existingFinal.id : null,
      willUpdate: !!(semiAWinner && challengerWinner && existingFinal)
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
