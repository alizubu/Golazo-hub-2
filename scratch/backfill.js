const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const seasons = await prisma.season.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { matches: true }
  });

  if (seasons.length === 0) {
    console.log("No seasons found.");
    return;
  }
  const season = seasons[0];
  
  const hasChallenger = season.matches.some(m => m.round === 'challenger');
  const hasFinal = season.matches.some(m => m.round === 'final');

  if (!hasChallenger) {
    await prisma.match.create({
      data: {
        seasonId: season.id,
        round: 'challenger',
        homeId: null,
        awayId: null,
        status: 'scheduled',
        label: 'Qualifier 2',
        decisive: true
      }
    });
    console.log("Created challenger placeholder.");
  }
  
  if (!hasFinal) {
    await prisma.match.create({
      data: {
        seasonId: season.id,
        round: 'final',
        homeId: null,
        awayId: null,
        status: 'scheduled',
        label: 'Grand Final',
        decisive: true
      }
    });
    console.log("Created final placeholder.");
  }
  
  console.log("Done checking and creating missing placeholders.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
