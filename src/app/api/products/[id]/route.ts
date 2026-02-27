import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Parse FormData
    const formData = await req.formData();
    const name = formData.get('name') as string | null;
    const price = formData.get('price');
    const description = formData.get('description') as string | null;
    const imageUrlInput = formData.get('imageUrl') as string | null;
    const imageFile = formData.get('image') as File | null;
    const inStock = formData.get('inStock');

    // Verify ownership through business
    const product = await prisma.product.findFirst({
      where: { id: params.id },
      include: { business: { select: { userId: true, id: true } } },
    });

    if (!product || product.business.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Handle Image Upload to Cloudinary if a new file is provided
    let finalImageUrl = imageUrlInput !== null ? imageUrlInput : undefined;

    if (imageFile && imageFile.size > 0) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        finalImageUrl = await uploadImageToCloudinary(buffer, `dukaanhai/products/${product.business.id}`);
      } catch (uploadError) {
        console.error('Cloudinary Upload Failed specifically on PUT:', uploadError);
        return NextResponse.json({ error: 'Image upload failed. Check Cloudinary keys.' }, { status: 500 });
      }
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name !== null && { name }),
        ...(price !== null && { price: parseFloat(price.toString()) }),
        ...(description !== null && { description }),
        ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl }),
        ...(inStock !== null && { inStock: inStock === 'true' }),
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Update error", error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const product = await prisma.product.findFirst({
      where: { id: params.id },
      include: { business: { select: { userId: true } } },
    });

    if (!product || product.business.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
