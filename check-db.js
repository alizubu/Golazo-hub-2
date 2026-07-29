const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const players = await prisma.player.findMany({ select: { name: true, flag: true, nationality: true, teamLogo: true }});
  console.log(players);
}

main().catch(console.error).finally(() => prisma.$disconnect());
