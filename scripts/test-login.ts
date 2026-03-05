import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'zunnoorhassan@gmail.com'; // Trying to find a typical dev email if it exists
    const user = await prisma.user.findFirst({
        where: { email }
    });
    console.log('User found:', !!user);

    if (user && user.password) {
        console.log('Password hash starts with:', user.password.substring(0, 10));
        // Test a common password
        const testMatch = await bcrypt.compare('123456', user.password);
        console.log('Matches 123456?', testMatch);
    } else {
        // Let's create a test user to verify the flow
        const testPwd = 'password123';
        const hash12 = await bcrypt.hash(testPwd, 12);

        // Check if auth.ts uses 10 rounds maybe?
        // bcrypt handle salt rounds internally in the hash, so compare works cross-rounds.
        console.log('Generated test hash (rounds 12):', hash12.substring(0, 20));
        console.log('Test match:', await bcrypt.compare(testPwd, hash12));
    }
}

main().finally(() => prisma.$disconnect());
