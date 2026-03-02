const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const businesses = await prisma.business.findMany();
    console.log("Businesses Count:", businesses.length);
    businesses.forEach(b => console.log(`- ${b.name} (${b.whatsappNumber})`));

    const sessions = await prisma.whatsappSession.findMany();
    console.log("\nSessions Count:", sessions.length);
    sessions.forEach(s => console.log(`- Step: ${s.step}, Phone: ${s.phoneNumber}, Data:`, s.collectedData));

    await prisma.$disconnect();
}
main();
