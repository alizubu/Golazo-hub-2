import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seasons = await prisma.season.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: {
      matches: true
    }
  });

  const activeSeason = seasons[0];
  console.log("Active Season:", activeSeason.name);
  console.log("Matches:");
  activeSeason.matches.forEach(m => {
    console.log(`- [${m.round}] ${m.label} | home: ${m.homeId} away: ${m.awayId} status: ${m.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
