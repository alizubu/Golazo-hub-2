const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const matchWinnerId = (m) => {
  if (!m || m.status !== 'completed') return null;
  if (m.homeScore > m.awayScore) return m.homeId;
  if (m.awayScore > m.homeScore) return m.awayId;
  if (m.penaltyWinner) return m.penaltyWinner === 'home' ? m.homeId : m.awayId;
  return null;
};

async function main() {
  console.log("Starting debug script...");
  const activeSeason = await prisma.season.findFirst({ orderBy: { createdAt: 'desc' }});
  if (!activeSeason) {
    console.log("No active season found");
    return;
  }
  console.log("Active season ID:", activeSeason.id);

  const finalMatch = await prisma.match.findFirst({
    where: { seasonId: activeSeason.id, round: 'final' }
  });
  console.log("Final match:", finalMatch ? `${finalMatch.id} | Home: ${finalMatch.homeId} | Away: ${finalMatch.awayId}` : "Not found");

  const challenger = await prisma.match.findFirst({
    where: { seasonId: activeSeason.id, round: 'challenger', status: 'completed' }
  });
  console.log("Challenger:", challenger ? `${challenger.id} | ${challenger.homeScore}-${challenger.awayScore}` : "Not found or not completed");

  const semiA = await prisma.match.findFirst({
    where: { seasonId: activeSeason.id, round: 'semiA', status: 'completed' },
    orderBy: { createdAt: 'desc' }
  });
  console.log("SemiA:", semiA ? `${semiA.id} | ${semiA.homeScore}-${semiA.awayScore}` : "Not found or not completed");

  if (semiA && challenger) {
    const semiAWinner = matchWinnerId(semiA);
    const challengerWinner = matchWinnerId(challenger);
    console.log("Calculated SemiA Winner:", semiAWinner);
    console.log("Calculated Challenger Winner:", challengerWinner);

    if (semiAWinner && challengerWinner && finalMatch) {
      console.log("UPDATING FINAL...");
      const updated = await prisma.match.update({
        where: { id: finalMatch.id },
        data: { homeId: semiAWinner, awayId: challengerWinner },
      });
      console.log("SUCCESSFULLY UPDATED FINAL:", updated.id);
    } else {
      console.log("Missing data to update final!");
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
