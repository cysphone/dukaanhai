const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Starting data wipe...");

    try {
        // Delete all records in the correct order (children first to avoid foreign key errors, though cascade should handle it)
        await prisma.product.deleteMany({});
        console.log("Deleted all Products.");

        await prisma.business.deleteMany({});
        console.log("Deleted all Businesses.");

        await prisma.user.deleteMany({});
        console.log("Deleted all Users.");

        await prisma.whatsappSession.deleteMany({});
        console.log("Deleted all WhatsappSessions.");

        console.log("Data wipe completed successfully.");
    } catch (error) {
        console.error("Error wiping data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
