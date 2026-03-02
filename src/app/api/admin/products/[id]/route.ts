import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

function checkAdminAuth(session: any) {
    if (!session || !session.user || !session.user.email) return false;
    return ADMIN_EMAILS.includes(session.user.email);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!checkAdminAuth(session)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const productId = params.id;
        const body = await request.json();
        const { name, price, description } = body;

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                ...(name && { name }),
                ...(price && { price: parseFloat(price) }),
                ...(description !== undefined && { description }), // Description could be cleared
            }
        });

        return NextResponse.json({ product: updatedProduct }, { status: 200 });
    } catch (error: any) {
        console.error("Admin Product update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!checkAdminAuth(session)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const productId = params.id;

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id: productId }
        });

        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Admin Product deletion error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
