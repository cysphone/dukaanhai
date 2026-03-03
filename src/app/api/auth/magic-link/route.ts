import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // 1. Validate Token
        const loginToken = await prisma.loginToken.findUnique({
            where: { token },
        });

        if (!loginToken) {
            return NextResponse.json(
                { error: "This link is invalid or expired. Please request a new link from WhatsApp." },
                { status: 400 }
            );
        }

        if (loginToken.used) {
            return NextResponse.json(
                { error: "This link has already been used." },
                { status: 400 }
            );
        }

        if (new Date() > loginToken.expiresAt) {
            return NextResponse.json(
                { error: "This link has expired. Please request a new link from WhatsApp." },
                { status: 400 }
            );
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Find User
        const phoneNumber = loginToken.phoneNumber;
        const email = loginToken.email;

        let user;

        if (phoneNumber) {
            // Fallback Dummy email to find them if they exist from the old flow
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';
            const dummyEmail = `wa_${phoneNumber.replace('+', '')}@${rootDomain}`;

            user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phoneNumber },
                        { phoneNumber: phoneNumber.replace('+', '') },
                        { email: dummyEmail }
                    ]
                }
            });
        } else if (email) {
            user = await prisma.user.findFirst({
                where: {
                    email
                }
            });
        }

        if (user) {
            // Update existing user with phone number mapping and new password
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    phoneNumber,
                    password: hashedPassword,
                    createdVia: "whatsapp"
                }
            });
        } else {
            // Very Edge Case: Token exists but no User (e.g. data wipe)
            if (phoneNumber) {
                user = await prisma.user.create({
                    data: {
                        phoneNumber: phoneNumber,
                        email: `wa_${phoneNumber.replace('+', '')}@${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in'}`,
                        password: hashedPassword,
                        createdVia: "whatsapp",
                        name: "WhatsApp User"
                    }
                });
            } else if (email) {
                user = await prisma.user.create({
                    data: {
                        email: email,
                        password: hashedPassword,
                        createdVia: "web",
                        name: "Web User"
                    }
                });
            }
        }

        // 4. Invalidate Token immediately
        await prisma.loginToken.update({
            where: { id: loginToken.id },
            data: {
                used: true,
                expiresAt: new Date() // Expire immediately
            }
        });

        return NextResponse.json({ success: true, message: "Password set successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Magic link verification error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
