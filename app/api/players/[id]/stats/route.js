import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');

    if (!id || !seasonId) {
      return NextResponse.json({ error: 'Missing id or seasonId' }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const matchQuery = {
      status: 'completed',
    };
    if (seasonId !== 'overall') {
      matchQuery.seasonId = seasonId;
      matchQuery.round = 'league';
    }

    const allPlayers = await prisma.player.findMany();
    const seasonMatches = await prisma.match.findMany({
      where: matchQuery,
      orderBy: { completedAt: 'asc' }
    });

    // Compute standings for this season
    const table = {};
    allPlayers.forEach((p) => {
      table[p.id] = { ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });

    seasonMatches.forEach((m) => {
      const h = table[m.homeId];
      const a = table[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      const hs = m.homeScore || 0;
      const as = m.awayScore || 0;
      h.gf += hs; h.ga += as;
      a.gf += as; a.ga += hs;
      if (hs > as) {
        h.won++; a.lost++; h.pts += 2;
      } else if (hs < as) {
        a.won++; h.lost++; a.pts += 2;
      } else {
        h.drawn++; a.drawn++; h.pts += 1; a.pts += 1;
      }
    });

    // Sort to determine rank
    const sortedStandings = Object.values(table).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const bgd = b.gf - b.ga;
      const agd = a.gf - a.ga;
      if (bgd !== agd) return bgd - agd;
      return b.gf - a.gf;
    });

    const myRank = sortedStandings.findIndex((s) => s.id === id) + 1;
    const myRow = sortedStandings.find((s) => s.id === id);

    const played = myRow?.played || 0;
    const won = myRow?.won || 0;
    const goals = myRow?.gf || 0;
    const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
    const elo = 1200 + ((myRow?.pts || 0) * 15);
    const assists = player.assists || Math.round(goals * 0.4);

    return NextResponse.json({
      played,
      won,
      goals,
      winRate,
      elo,
      assists,
      rank: myRank > 0 ? myRank : null
    });
  } catch (error) {
    console.error('Error fetching player season stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
