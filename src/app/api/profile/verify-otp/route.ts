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

        const { type, code } = await req.json();

        if (!type || !code || !['PHONE', 'EMAIL'].includes(type) || code.length !== 6) {
            return NextResponse.json({ error: 'Invalid verification data' }, { status: 400 });
        }

        const verification = await prisma.otpVerification.findFirst({
            where: {
                userId: session.user.id,
                type,
                code,
                used: false,
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!verification) {
            return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
        }

        // Apply
        const updateData: any = {};
        if (type === 'PHONE') {
            updateData.phoneNumber = verification.target;
        } else {
            updateData.email = verification.target;
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        // Mark Used
        await prisma.otpVerification.update({
            where: { id: verification.id },
            data: { used: true }
        });

        return NextResponse.json({ success: true, message: 'Verified successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
