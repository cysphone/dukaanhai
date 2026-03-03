import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            email: { startsWith: 'wa_' }
        },
        include: {
            businesses: true
        }
    });

    const output = users.map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phoneNumber,
        businessCount: u.businesses.length
    }));

    fs.writeFileSync('b_output.json', JSON.stringify(output, null, 2));
}

main().finally(() => prisma.$disconnect());
