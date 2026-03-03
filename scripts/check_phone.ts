import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        take: 10,
        select: {
            id: true,
            email: true,
            phoneNumber: true,
            password: true,
            createdVia: true
        }
    });

    console.log(users);
}
main().finally(() => prisma.$disconnect());
