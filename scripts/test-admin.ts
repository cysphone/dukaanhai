import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testAdminDelete() {
    console.log('1. Creating a dummy user with a dummy business and product...');
    const user = await prisma.user.create({
        data: {
            email: 'delete_me@example.com',
            name: 'To Be Deleted',
            businesses: {
                create: {
                    name: 'Dummy Store',
                    slug: 'dummy-store-' + Date.now(),
                    products: {
                        create: {
                            name: 'Dummy Product',
                            price: 100
                        }
                    }
                }
            }
        },
        include: { businesses: { include: { products: true } } }
    });

    console.log(`Created User ID: ${user.id}`);
    console.log(`Created Business ID: ${user.businesses[0].id}`);
    console.log(`Created Product ID: ${user.businesses[0].products[0].id}`);

    console.log('\n2. Simulating User Deletion as per /api/admin/users/[userId] logic...');
    await prisma.user.delete({
        where: { id: user.id }
    });
    console.log('User deleted successfully.');

    console.log('\n3. Verifying Cascade Deletion...');
    const checkUser = await prisma.user.findUnique({ where: { id: user.id } });
    const checkBusiness = await prisma.business.findUnique({ where: { id: user.businesses[0].id } });
    const checkProduct = await prisma.product.findUnique({ where: { id: user.businesses[0].products[0].id } });

    console.log('User still exists?', !!checkUser);
    console.log('Business still exists?', !!checkBusiness);
    console.log('Product still exists?', !!checkProduct);

    if (!checkUser && !checkBusiness && !checkProduct) {
        console.log('\n✅ SUCCESS: Cascade deletion works perfectly!');
    } else {
        console.log('\n❌ ERROR: Cascade deletion failed!');
    }
}

testAdminDelete().catch(console.error).finally(() => prisma.$disconnect());
