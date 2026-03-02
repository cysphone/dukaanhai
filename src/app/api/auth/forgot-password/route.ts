import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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

export async function POST(req: NextRequest) {
    try {
        const { identifier } = await req.json();

        if (!identifier) {
            return NextResponse.json({ error: 'Email or Phone Number required' }, { status: 400 });
        }

        let searchIdentifier = identifier.trim();

        // Auto-prepend +91 for exactly 10 digit Indian phone numbers
        if (/^\d{10}$/.test(searchIdentifier)) {
            searchIdentifier = `+91${searchIdentifier}`;
        }

        // Find the user by email or phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: searchIdentifier },
                    { phoneNumber: searchIdentifier }
                ]
            }
        });

        // If no user is found, we STILL return success to prevent user enumeration
        if (!user) {
            return NextResponse.json({ success: true });
        }

        // Determine where to send the reset link
        // Default to WhatsApp if a phone number exists, since the app is WhatsApp-centric.
        if (!user.phoneNumber) {
            // If we had an email provider (like Resend/SendGrid) set up, we would email the link here.
            // For now, if they don't have a phone number, we'll return a gentle error letting the frontend know.
            return NextResponse.json(
                { error: 'No WhatsApp number attached to this account. Please contact support.' },
                { status: 400 }
            );
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Save token
        await prisma.loginToken.create({
            data: {
                phoneNumber: user.phoneNumber,
                email: user.email,
                token,
                expiresAt
            }
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
        const messageText = `🔒 *Password Reset Request*\n\nYou requested to reset your password for DukaanHai.\n\nClick this secure link to set a new password:\n\n${appUrl}/dashboard-access?token=${token}\n\nThis link expires in 10 minutes. If you didn't request this, ignore this message.`;

        await sendWhatsAppMessage(user.phoneNumber, messageText);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Forgot Password error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
