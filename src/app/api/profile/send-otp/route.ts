import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const WA_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID!;

async function sendWhatsAppMessage(to: string, text: string) {
    const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${WA_TOKEN}`,
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: text },
        }),
    });
}

function generateNumericOTP(length: number = 6): string {
    return Array.from({ length }, () => crypto.randomInt(0, 10)).join('');
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, target } = await req.json();

        if (!type || !target || !['PHONE', 'EMAIL'].includes(type)) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        let formattedTarget = target.trim();
        if (type === 'PHONE') {
            if (/^\d{10}$/.test(formattedTarget)) {
                formattedTarget = `+91${formattedTarget}`;
            } else if (/^\d{12}$/.test(formattedTarget) && formattedTarget.startsWith('91')) {
                formattedTarget = `+${formattedTarget}`;
            }

            // Validate conflict
            const conflict = await prisma.user.findUnique({ where: { phoneNumber: formattedTarget } });
            if (conflict) {
                return NextResponse.json({ error: 'This phone number is already attached to another account.' }, { status: 409 });
            }
        } else {
            // Email Conflict
            const conflict = await prisma.user.findUnique({ where: { email: formattedTarget } });
            if (conflict) {
                return NextResponse.json({ error: 'This email is already attached to another account.' }, { status: 409 });
            }
        }

        const code = generateNumericOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        await prisma.otpVerification.create({
            data: {
                userId: session.user.id,
                type,
                target: formattedTarget,
                code,
                expiresAt
            }
        });

        if (type === 'PHONE') {
            await sendWhatsAppMessage(
                formattedTarget,
                `🔐 *DukaanHai Security Code*\n\nYour verification code is: *${code}*\n\nDo not share this code with anyone. It expires in 10 minutes.`
            );
        } else if (type === 'EMAIL') {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: `"DukaanHai Security" <${process.env.SMTP_USER}>`,
                to: formattedTarget,
                subject: 'DukaanHai Verification Code',
                html: `
                    <h2>DukaanHai Security</h2>
                    <p>Your verification code is: <strong>${code}</strong></p>
                    <p>This code will expire in 10 minutes. Do not share it with anyone.</p>
                `
            });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
