const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function progressPlayoffBracket(matchId) {
  try {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || !match.seasonId || match.status !== 'completed') return;

    if (match.round === 'semiA' || match.round === 'semiB') {
      const semis = await prisma.match.findMany({
        where: { seasonId: match.seasonId, round: { in: ['semiA', 'semiB'] } }
      });
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
            if (!existingChallenger.homeId || !existingChallenger.awayId) {
              const updated = await prisma.match.update({
                where: { id: existingChallenger.id },
                data: { homeId: semiALoser, awayId: semiBWinner },
                include: { home: true, away: true }
              });
              console.log("Updated challenger");
            }
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
            console.log("Updated final");
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  const activeSeason = await prisma.season.findFirst({ orderBy: { createdAt: 'desc' }});
  if (!activeSeason) return;

  const matches = await prisma.match.findMany({
    where: { seasonId: activeSeason.id, round: { in: ['semiA', 'semiB', 'challenger'] }, status: 'completed' },
    orderBy: { createdAt: 'asc' }
  });
  
  for (const match of matches) {
    console.log(`Progressing bracket from match ${match.round}`);
    await progressPlayoffBracket(match.id);
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  process.exit(0);
});
