import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();

        if (typeof name !== 'string') {
            return NextResponse.json({ error: 'Name must be provided.' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { name: name.trim() }
        });

        return NextResponse.json({ success: true, message: 'Name updated successfully.' });
    } catch (error) {
        console.error('Update name error:', error);
        return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
    }
}
