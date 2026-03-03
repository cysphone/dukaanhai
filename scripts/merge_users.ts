import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting data consolidation...");

    const usersWithNullPhone = await prisma.user.findMany({
        where: {
            email: { startsWith: 'wa_' },
            phoneNumber: null
        },
        include: {
            businesses: true
        }
    });

    for (const oldUser of usersWithNullPhone) {
        if (!oldUser.email) continue;
        const match = oldUser.email.match(/^wa_(\d+)@/);
        if (!match || !match[1]) continue;

        const phoneToSet = `+${match[1]}`;
        console.log(`\nProcessing old user: ${oldUser.id} for phone: ${phoneToSet}`);

        // Check if there is already a user with this phone number
        const existingUserWithPhone = await prisma.user.findUnique({
            where: { phoneNumber: phoneToSet }
        });

        if (existingUserWithPhone) {
            console.log(`Conflict! User ${existingUserWithPhone.id} already has phone ${phoneToSet}.`);
            // Merge businesses
            if (oldUser.businesses.length > 0) {
                console.log(`Moving ${oldUser.businesses.length} businesses from ${oldUser.id} to ${existingUserWithPhone.id}`);
                await prisma.business.updateMany({
                    where: { userId: oldUser.id },
                    data: { userId: existingUserWithPhone.id }
                });
            }
            // Delete the old user
            console.log(`Deleting obsolete user ${oldUser.id}`);
            await prisma.user.delete({ where: { id: oldUser.id } });
        } else {
            console.log(`Safely updating user ${oldUser.id} to have phone ${phoneToSet}`);
            // No conflict, just update
            await prisma.user.update({
                where: { id: oldUser.id },
                data: { phoneNumber: phoneToSet }
            });
        }
    }

    // Also, some users might have phone number without the plus. Example: "919910929521"
    const usersWithBadPhone = await prisma.user.findMany({
        where: {
            phoneNumber: { startsWith: '91' },
            email: { startsWith: 'wa_' }
        }
    });

    for (const u of usersWithBadPhone) {
        if (u.phoneNumber && !u.phoneNumber.startsWith('+')) {
            const newPhone = `+${u.phoneNumber}`;
            const existingUserWithPhone = await prisma.user.findUnique({
                where: { phoneNumber: newPhone }
            });

            if (!existingUserWithPhone) {
                await prisma.user.update({
                    where: { id: u.id },
                    data: { phoneNumber: newPhone }
                });
                console.log(`Fixed missing + in phone for user ${u.id}`);
            }
        }
    }

    console.log("\nDone consolidation!");
}

main().finally(() => prisma.$disconnect());
