import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

function computeRating(playerStats, score) {
  let r = 6.0;
  r += score * 1.0;
  r += (playerStats.accuratePasses || 0) * 0.02;
  r += (playerStats.possession || 0) * 0.02;
  r += (playerStats.shotsOnTarget || 0) * 0.2;
  r += (playerStats.interceptions || 0) * 0.1;
  r += (playerStats.tackles || 0) * 0.1;
  r += (playerStats.saves || 0) * 0.3;
  r -= (playerStats.fouls || 0) * 0.1;
  return Math.min(10.0, Math.max(3.0, r)).toFixed(1);
}

function calculateEloDelta(eloA, eloB, scoreA, scoreB) {
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (eloA - eloB) / 400));

  let actualA = 0.5;
  let actualB = 0.5;
  if (scoreA > scoreB) { actualA = 1; actualB = 0; }
  else if (scoreA < scoreB) { actualA = 0; actualB = 1; }

  const deltaA = Math.round(K * (actualA - expectedA));
  const deltaB = Math.round(K * (actualB - expectedB));
  return { deltaA, deltaB };
}

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const { homeScore, awayScore, stats } = await req.json();

    const match = await prisma.match.findUnique({
      where: { id },
      include: { home: true, away: true }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Transform stats format
    // Input stats format: { possession: { a: 50, b: 50 }, shots: { a: 5, b: 2 } ... }
    const homeStats = {};
    const awayStats = {};
    Object.keys(stats).forEach(key => {
      homeStats[key] = stats[key].a;
      awayStats[key] = stats[key].b;
    });

    const homeRating = computeRating(homeStats, homeScore);
    const awayRating = computeRating(awayStats, awayScore);
    let motm = null;
    if (parseFloat(homeRating) > parseFloat(awayRating)) motm = 'home';
    else if (parseFloat(awayRating) > parseFloat(homeRating)) motm = 'away';
    else motm = 'none';

    const finalStatsObj = {
      ...stats,
      ratings: { a: homeRating, b: awayRating },
      motm
    };

    // Calculate ELO
    const { deltaA, deltaB } = calculateEloDelta(match.home.elo, match.away.elo, homeScore, awayScore);

    // Run transaction
    const [updatedMatch, homeUpdate, awayUpdate, notification] = await prisma.$transaction([
      prisma.match.update({
        where: { id },
        data: {
          status: 'completed',
          homeScore,
          awayScore,
          stats: finalStatsObj,
          completedAt: new Date()
        }
      }),
      prisma.player.update({
        where: { id: match.homeId },
        data: {
          elo: match.home.elo + deltaA,
          careerMatches: match.home.careerMatches + 1,
          careerGoals: match.home.careerGoals + homeScore,
          careerWins: match.home.careerWins + (homeScore > awayScore ? 1 : 0),
          careerDraws: match.home.careerDraws + (homeScore === awayScore ? 1 : 0),
          careerLosses: match.home.careerLosses + (homeScore < awayScore ? 1 : 0),
        }
      }),
      prisma.player.update({
        where: { id: match.awayId },
        data: {
          elo: match.away.elo + deltaB,
          careerMatches: match.away.careerMatches + 1,
          careerGoals: match.away.careerGoals + awayScore,
          careerWins: match.away.careerWins + (awayScore > homeScore ? 1 : 0),
          careerDraws: match.away.careerDraws + (awayScore === homeScore ? 1 : 0),
          careerLosses: match.away.careerLosses + (awayScore < homeScore ? 1 : 0),
        }
      }),
      prisma.notification.create({
        data: {
          text: `Result: ${match.home.name} ${homeScore}-${awayScore} ${match.away.name}`,
          type: 'result'
        }
      })
    ]);

    revalidatePath('/');
    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to complete match' }, { status: 500 });
  }
}
