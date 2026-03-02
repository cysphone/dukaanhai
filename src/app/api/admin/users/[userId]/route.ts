import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

export async function DELETE(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Delete the user. Given Prisma `onDelete: Cascade` rules, 
        // this will also cleanly remove their associated Businesses and Products.
        await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        return NextResponse.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Admin user delete error:", error);

        // Handle specific basic issues
        if (error.code === 'P2025') { // Prisma error when target doesn't exist
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
