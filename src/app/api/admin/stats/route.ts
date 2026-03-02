import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is logged in
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is an admin
        if (!ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch stats
        const totalUsers = await prisma.user.count();
        const totalBusinesses = await prisma.business.count();

        // Fetch detailed list of users and their businesses
        const users = await prisma.user.findMany({
            include: {
                businesses: {
                    include: {
                        products: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            totalUsers,
            totalBusinesses,
            users,
        });
    } catch (error: any) {
        console.error("Admin stats fetch error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
