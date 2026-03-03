import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            phoneNumber: null,
            email: { startsWith: 'wa_' }
        }
    });

    console.log(`Found ${users.length} users missing phone number but having wa_ email.`);

    for (const user of users) {
        if (user.email) {
            const match = user.email.match(/^wa_(\d+)@/);
            if (match && match[1]) {
                const phone = `+${match[1]}`;
                console.log(`Fixing user ${user.id} -> ${phone}`);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { phoneNumber: phone }
                });
            }
        }
    }
}

main().finally(() => prisma.$disconnect());
