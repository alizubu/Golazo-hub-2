'use server';

import prisma from '@/lib/db';
import { broadcastEvent } from '@/lib/broadcast';
import { revalidatePath } from 'next/cache';
import { sendAutoNotification } from '@/lib/notifications';
import { checkSessionPermission } from '@/lib/permissions';

export async function getMatches(seasonId) {
  return await prisma.match.findMany({
    where: seasonId ? { seasonId } : undefined,
    orderBy: [
      { status: 'desc' },
      { scheduledAt: 'asc' },
      { completedAt: 'desc' }
    ]
  });
}

export async function generateFixtures(seasonId, playerIds, doubleRound) {
  const auth = await checkSessionPermission('canManageMatches');
  if (!auth.authorized) return { error: auth.error };
  if (playerIds.length < 2) return { error: 'Need at least 2 players' };

  let allLegs = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      allLegs.push({ homeId: playerIds[i], awayId: playerIds[j] });
      if (doubleRound) {
        allLegs.push({ homeId: playerIds[j], awayId: playerIds[i] });
      }
    }
  }

  let bestLegs = [];
  let fewestBackToBacks = Infinity;

  // Monte Carlo approach: Try 50 random shuffles to find a schedule with minimal back-to-backs
  for (let attempt = 0; attempt < 50; attempt++) {
    let tempAllLegs = [...allLegs];
    
    // Fisher-Yates shuffle
    for (let i = tempAllLegs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tempAllLegs[i], tempAllLegs[j]] = [tempAllLegs[j], tempAllLegs[i]];
    }

    const currentLegs = [];
    let backToBackCount = 0;
    
    while (tempAllLegs.length > 0) {
      let selectedIdx = -1;
      for (let i = 0; i < tempAllLegs.length; i++) {
        const match = tempAllLegs[i];
        if (currentLegs.length === 0) {
          selectedIdx = i;
          break;
        }
        const lastMatch = currentLegs[currentLegs.length - 1];
        if (
          match.homeId !== lastMatch.homeId && match.homeId !== lastMatch.awayId &&
          match.awayId !== lastMatch.homeId && match.awayId !== lastMatch.awayId
        ) {
          selectedIdx = i;
          break;
        }
      }
      
      if (selectedIdx === -1) {
        selectedIdx = 0; // Forced to take a back-to-back
        backToBackCount++;
      }
      currentLegs.push(tempAllLegs.splice(selectedIdx, 1)[0]);
    }

    if (backToBackCount < fewestBackToBacks) {
      fewestBackToBacks = backToBackCount;
      bestLegs = currentLegs;
      if (backToBackCount === 0) break; // Perfect schedule found
    }
  }

  const legs = bestLegs;

  try {
    await prisma.match.createMany({
      data: legs.map((leg, index) => ({
        seasonId,
        round: 'league',
        homeId: leg.homeId,
        awayId: leg.awayId,
        status: 'scheduled',
        decisive: false,
        scheduledAt: new Date(Date.now() + index * 60000) // Stagger by 1 minute to preserve order
      }))
    });

    await sendAutoNotification(
      `${legs.length} league fixtures generated`,
      'fixtures'
    );

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, count: legs.length };
  } catch (error) {
    return { error: 'Failed to generate fixtures' };
  }
}

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

export async function updateMatchStatus(matchId, data) {
  const auth = await checkSessionPermission('canManageMatches');
  if (!auth.authorized) return { error: auth.error };
  try {
    let updatePayload = {
      where: { id: matchId },
      data: {
        status: data.status,
        liveState: data.liveState,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        wentToExtra: data.wentToExtra,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        penaltyHome: data.penaltyResult?.home ?? data.penaltyHome,
        penaltyAway: data.penaltyResult?.away ?? data.penaltyAway,
        penaltyWinner: data.penaltyResult?.winner ?? data.penaltyWinner,
      }
    };

    if (data.stats) {
      const stats = data.stats;
      const homeScore = data.homeScore ?? 0;
      const awayScore = data.awayScore ?? 0;
      
      const homeStats = {};
      const awayStats = {};
      Object.keys(stats).forEach(key => {
        if (key !== 'ratings' && key !== 'motm' && stats[key]) {
          homeStats[key] = stats[key].a;
          awayStats[key] = stats[key].b;
        }
      });

      const homeRating = computeRating(homeStats, homeScore);
      const awayRating = computeRating(awayStats, awayScore);
      let motm = null;
      if (parseFloat(homeRating) > parseFloat(awayRating)) motm = 'home';
      else if (parseFloat(awayRating) > parseFloat(homeRating)) motm = 'away';
      else motm = 'none';

      updatePayload.data.stats = {
        ...stats,
        ratings: { a: homeRating, b: awayRating },
        motm
      };
    }

    const match = await prisma.match.update(updatePayload);
    
    if (data.status === 'completed') {
      const home = await prisma.player.findUnique({ where: { id: match.homeId }});
      const away = await prisma.player.findUnique({ where: { id: match.awayId }});
      
      // Update Ranking Points
      if (home && away && match.homeScore !== null && match.awayScore !== null) {
        let homePointsDiff = 0;
        let awayPointsDiff = 0;

        if (match.homeScore > match.awayScore) {
          homePointsDiff = 3;
        } else if (match.awayScore > match.homeScore) {
          awayPointsDiff = 3;
        } else {
          if (match.penaltyWinner === 'home') homePointsDiff = 3;
          else if (match.penaltyWinner === 'away') awayPointsDiff = 3;
          else {
            homePointsDiff = 1;
            awayPointsDiff = 1;
          }
        }

        if (homePointsDiff > 0) {
          await prisma.player.update({ where: { id: home.id }, data: { rankingPoints: { increment: homePointsDiff } } });
        }
        if (awayPointsDiff > 0) {
          await prisma.player.update({ where: { id: away.id }, data: { rankingPoints: { increment: awayPointsDiff } } });
        }
      }
      
      const pens = match.penaltyWinner ? ` (${match.penaltyHome}-${match.penaltyAway} pens)` : '';
      await sendAutoNotification(
        `Result: ${home?.name} ${match.homeScore}-${match.awayScore} ${away?.name}${pens}`,
        'result'
      );

      // ── Auto-playoff trigger ──────────────────────────────────────────────
      // When a league match completes, check if ALL league matches for this
      // season are now done. If yes, and the season type includes Playoffs,
      // and no playoff bracket has been created yet → auto-generate it.
      if (match.seasonId) {
        const season = await prisma.season.findUnique({ where: { id: match.seasonId } });
        if (season && season.type && season.type.includes('Playoffs')) {
          const allLeagueMatches = await prisma.match.findMany({
            where: { seasonId: match.seasonId, round: 'league' }
          });
          const allCompleted = allLeagueMatches.length > 0 &&
            allLeagueMatches.every(m => m.status === 'completed');

          if (allCompleted) {
            // Check no playoff bracket exists yet
            const existingPlayoffs = await prisma.match.findFirst({
              where: { seasonId: match.seasonId, round: { not: 'league' } }
            });

            if (!existingPlayoffs) {
              // Compute standings from completed league matches
              const table = {};
              const players = await prisma.player.findMany({ select: { id: true } });
              players.forEach(p => { table[p.id] = { id: p.id, pts: 0, gd: 0, gf: 0 }; });

              allLeagueMatches.forEach(m => {
                const h = table[m.homeId], a = table[m.awayId];
                if (!h || !a) return;
                h.gf += (m.homeScore || 0); a.gf += (m.awayScore || 0);
                h.gd += ((m.homeScore || 0) - (m.awayScore || 0));
                a.gd += ((m.awayScore || 0) - (m.homeScore || 0));
                if (m.homeScore > m.awayScore) { h.pts += 3; }
                else if (m.awayScore > m.homeScore) { a.pts += 3; }
                else { h.pts++; a.pts++; }
              });

              const standings = Object.values(table)
                .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
              const top4 = standings.slice(0, 4).map(s => s.id);

              if (top4.length >= 4) {
                const [r1, r2, r3, r4] = top4;
                await prisma.match.createMany({
                  data: [
                    {
                      seasonId: match.seasonId,
                      round: 'semiA',
                      homeId: r1,
                      awayId: r2,
                      status: 'scheduled',
                      label: 'Top Match (1 vs 2)',
                      decisive: true
                    },
                    {
                      seasonId: match.seasonId,
                      round: 'semiB',
                      homeId: r3,
                      awayId: r4,
                      status: 'scheduled',
                      label: 'Bottom Match (3 vs 4)',
                      decisive: true
                    }
                  ]
                });

                await sendAutoNotification(
                  `🏆 Playoff bracket auto-generated for "${season.name}"! Top 4 seeded.`,
                  'info'
                );
              }
            }
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────────
      
      // ─────────────────────────────────────────────────────────────────────
      
      if (match.seasonId) {
        const season = await prisma.season.findUnique({ where: { id: match.seasonId } });
        if (season && (season.type === 'Double Elimination' || season.type === 'Single Elimination')) {
          await progressDynamicBracket(matchId);
        } else {
          // Check and progress playoff bracket if applicable
          await progressPlayoffBracket(matchId);
        }
      }
    }

    broadcastEvent('match_update', match);
    revalidatePath('/');
    revalidatePath('/admin');
    return { match };
  } catch (error) {
    return { error: 'Failed to update match status' };
  }
}

const matchWinnerId = (m) => {
  if (!m || m.status !== 'completed') return null;
  if (m.homeScore > m.awayScore) return m.homeId;
  if (m.awayScore > m.homeScore) return m.awayId;
  if (m.penaltyWinner) return m.penaltyWinner === 'home' ? m.homeId : m.awayId;
  return null;
};

const matchLoserId = (m) => {
  const w = matchWinnerId(m);
  if (!w) return null;
  return w === m.homeId ? m.awayId : m.homeId;
};

async function progressDynamicBracket(matchId) {
  try {
    const match = await prisma.match.findUnique({ where: { id: matchId }, include: { season: true } });
    if (!match || match.status !== 'completed') return;
    if (match.season?.type !== 'Double Elimination' && match.season?.type !== 'Single Elimination') return;

    const winnerId = matchWinnerId(match);
    const loserId = matchLoserId(match);
    if (!winnerId || !loserId) return;

    const bracket = match.season.bracket;
    if (!bracket) return;

    const matchKey = match.liveState?.key;
    if (!matchKey) return;

    // If this match was the Grand Final, check if we need to trigger or cancel the reset
    if (match.round === 'GF') {
      const gfResetMatch = await prisma.match.findFirst({
        where: { seasonId: match.seasonId, round: 'GF_RESET' }
      });
      if (gfResetMatch) {
        // In our bracket config, home is from WF (Winners Bracket), away is from LF (Losers Bracket)
        if (winnerId === match.homeId) {
          // Winners bracket champion won the GF -> Tournament is over, cancel GF_RESET
          await prisma.match.delete({ where: { id: gfResetMatch.id } });
        }
      }
    }

    // Find all pending matches in this season
    const pendingMatches = await prisma.match.findMany({
      where: { seasonId: match.seasonId, status: 'scheduled' }
    });

    for (const pending of pendingMatches) {
      if (!pending.liveState?.key) continue;
      const bracketNode = bracket.find(b => b.key === pending.liveState.key);
      if (!bracketNode || !bracketNode.dependsOn) continue;

      let updated = false;
      let updateData = {};

      if (bracketNode.dependsOn.home?.match === matchKey) {
        updateData.homeId = bracketNode.dependsOn.home.type === 'winner' ? winnerId : loserId;
        updated = true;
      }
      if (bracketNode.dependsOn.away?.match === matchKey) {
        updateData.awayId = bracketNode.dependsOn.away.type === 'winner' ? winnerId : loserId;
        updated = true;
      }

      if (updated) {
        await prisma.match.update({
          where: { id: pending.id },
          data: updateData
        });
        
        await sendAutoNotification(`Bracket updated: A player advanced in the tournament!`, 'info');
      }
    }
  } catch (error) {
    console.error('Failed to progress double elimination bracket:', error);
  }
}

export async function updateMatchScore(matchId, homeScore, awayScore) {
  const auth = await checkSessionPermission('canManageMatches');
  if (!auth.authorized) return { error: auth.error };
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore }
    });
    broadcastEvent('match_update', match);
    return { success: true, match };
  } catch (error) {
    return { error: 'Failed to update match score' };
  }
}



export async function generatePlayoffs(seasonId, top4PlayerIds) {
  const auth = await checkSessionPermission('canManageMatches');
  if (!auth.authorized) return { error: auth.error };
  if (top4PlayerIds.length < 4) return { error: 'Need 4 players for playoffs' };
  
  try {
    // Overwrite existing playoffs if the user clicks Generate again
    await prisma.match.deleteMany({
      where: { seasonId, round: { in: ['semiA', 'semiB', 'challenger', 'final'] } }
    });

    const [r1, r2, r3, r4] = top4PlayerIds;
    
    await prisma.match.createMany({
      data: [
        {
          seasonId,
          round: 'semiA',
          homeId: r1,
          awayId: r2,
          status: 'scheduled',
          label: 'Qualifier 1 (1st vs 2nd)',
          decisive: true
        },
        {
          seasonId,
          round: 'semiB',
          homeId: r3,
          awayId: r4,
          status: 'scheduled',
          label: 'Eliminator (3rd vs 4th)',
          decisive: true
        },
        {
          seasonId,
          round: 'challenger',
          homeId: null,
          awayId: null,
          status: 'scheduled',
          label: 'Qualifier 2',
          decisive: true
        },
        {
          seasonId,
          round: 'final',
          homeId: null,
          awayId: null,
          status: 'scheduled',
          label: 'Grand Final',
          decisive: true
        }
      ]
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to generate playoffs' };
  }
}

function matchWinnerId(m) {
  if (!m || m.status !== 'completed') return null;
  if (m.penaltyWinner) return m.penaltyWinner === 'home' ? m.homeId : m.awayId;
  const h = m.homeScore || 0;
  const a = m.awayScore || 0;
  if (h > a) return m.homeId;
  if (a > h) return m.awayId;
  return null;
}

function matchLoserId(m) {
  if (!m || m.status !== 'completed') return null;
  const winner = matchWinnerId(m);
  if (!winner) return null;
  return winner === m.homeId ? m.awayId : m.homeId;
}

export async function progressPlayoffBracket(matchId) {
  try {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || !match.seasonId || match.status !== 'completed') return;



    if (match.round === 'semiA' || match.round === 'semiB') {
      const semis = await prisma.match.findMany({
        where: { seasonId: match.seasonId, round: { in: ['semiA', 'semiB'] } }
      });
      // Find the most relevant matches (completed ones take priority, otherwise newest)
      const getRelevantMatch = (roundMatches) => {
        const completed = roundMatches.filter(m => m.status === 'completed');
        if (completed.length > 0) return completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        return roundMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      };

      const semiA = getRelevantMatch(semis.filter(m => m.round === 'semiA'));
      const semiB = getRelevantMatch(semis.filter(m => m.round === 'semiB'));

      if (semiA?.status === 'completed' && semiB?.status === 'completed') {
        const existingChallenger = await prisma.match.findFirst({
          where: { seasonId: match.seasonId, round: 'challenger' }
        });
        
        const semiALoser = matchLoserId(semiA);
        const semiBWinner = matchWinnerId(semiB);
        
        if (semiALoser && semiBWinner) {
          if (existingChallenger) {
            // Update the existing placeholder
            if (!existingChallenger.homeId || !existingChallenger.awayId) {
              const updated = await prisma.match.update({
                where: { id: existingChallenger.id },
                data: { homeId: semiALoser, awayId: semiBWinner },
                include: { home: true, away: true }
              });
              await sendAutoNotification(`Qualifier 2 auto-populated: ${updated.home.name} vs ${updated.away.name}`, 'info');
              broadcastEvent('match_update', updated);
            }
          } else {
            // Fallback create
            const challenger = await prisma.match.create({
              data: {
                seasonId: match.seasonId,
                round: 'challenger',
                homeId: semiALoser,
                awayId: semiBWinner,
                status: 'scheduled',
                label: 'Qualifier 2',
                decisive: true
              },
              include: { home: true, away: true }
            });
            await sendAutoNotification(`Qualifier 2 auto-created: ${challenger.home.name} vs ${challenger.away.name}`, 'info');
            broadcastEvent('match_update', challenger);
          }
        }
      }
    } else if (match.round === 'challenger') {
      const existingFinal = await prisma.match.findFirst({
        where: { seasonId: match.seasonId, round: 'final' }
      });
      
      const semiA = await prisma.match.findFirst({
        where: { seasonId: match.seasonId, round: 'semiA', status: 'completed' },
        orderBy: { createdAt: 'desc' }
      });
      const semiAWinner = matchWinnerId(semiA);
      const challengerWinner = matchWinnerId(match);
      
      if (semiAWinner && challengerWinner) {
        if (existingFinal) {
          if (!existingFinal.homeId || !existingFinal.awayId) {
            const updated = await prisma.match.update({
              where: { id: existingFinal.id },
              data: { homeId: semiAWinner, awayId: challengerWinner },
              include: { home: true, away: true }
            });
            await sendAutoNotification(`Grand Final auto-populated: ${updated.home.name} vs ${updated.away.name}`, 'info');
            broadcastEvent('match_update', updated);
          }
        } else {
          const finalMatch = await prisma.match.create({
            data: {
              seasonId: match.seasonId,
              round: 'final',
              homeId: semiAWinner,
              awayId: challengerWinner,
              status: 'scheduled',
              label: 'Grand Final',
              decisive: true
            },
            include: { home: true, away: true }
          });
          await sendAutoNotification(`Grand Final auto-created: ${finalMatch.home.name} vs ${finalMatch.away.name}`, 'info');
          broadcastEvent('match_update', finalMatch);
        }
      }
    }
  } catch (error) {
    console.error('Failed to progress playoff bracket:', error);
  }
}

export async function adminTriggerBracketProgress(seasonId) {
  const auth = await checkSessionPermission('canManageMatches');
  if (!auth.authorized) return { error: auth.error };
  try {
    // Find any completed semi matches that haven't triggered the challenger
    const matches = await prisma.match.findMany({
      where: { seasonId, round: { in: ['semiA', 'semiB', 'challenger'] }, status: 'completed' }
    });
    for (const match of matches) {
      await progressPlayoffBracket(match.id);
    }
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to trigger bracket progress' };
  }
}
