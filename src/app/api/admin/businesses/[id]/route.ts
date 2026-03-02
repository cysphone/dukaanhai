import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const businessId = params.id;

        if (!businessId) {
            return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
        }

        // Delete business (associated products will be deleted via cascading relation)
        await prisma.business.delete({
            where: { id: businessId }
        });

        return NextResponse.json({ message: "Business deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Business deletion error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
