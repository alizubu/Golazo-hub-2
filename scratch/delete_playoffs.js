const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Deleting playoff matches...");
  const result = await prisma.match.deleteMany({
    where: {
      round: { in: ['semiA', 'semiB', 'challenger', 'final'] }
    }
  });
  console.log("Deleted", result.count, "playoff matches.");
  
  console.log("Success! You can now click Generate Playoffs again.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
