import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateProductDescription } from '@/lib/gemini';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const slug = searchParams.get('slug');

    let whereClause: any = {};

    if (businessId) {
      whereClause = { businessId };
    } else if (slug) {
      const business = await prisma.business.findUnique({ where: { slug } });
      if (!business) return NextResponse.json({ products: [] });
      whereClause = { businessId: business.id };
    } else {
      return NextResponse.json({ error: 'businessId or slug required' }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Parse FormData instead of JSON
    const formData = await req.formData();
    const businessId = formData.get('businessId') as string;
    const name = formData.get('name') as string;
    const price = formData.get('price');
    const description = formData.get('description') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!businessId || !name || price === null || price === undefined) {
      return NextResponse.json({ error: 'businessId, name, price required' }, { status: 400 });
    }

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId },
    });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Generate description if not provided
    let finalDescription = description;
    if (!finalDescription) {
      finalDescription = await generateProductDescription({
        name,
        price: parseFloat(price.toString()),
        businessName: business.name,
        category: business.category || 'General',
      });
    }

    // Handle Image Upload to Cloudinary
    let finalImageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        finalImageUrl = await uploadImageToCloudinary(buffer, `dukaanhai/products/${businessId}`);
      } catch (uploadError) {
        console.error('Cloudinary Upload Failed specifically:', uploadError);
        return NextResponse.json({ error: 'Image upload failed. Check Cloudinary keys.' }, { status: 500 });
      }
    }

    const product = await prisma.product.create({
      data: {
        businessId,
        name,
        price: parseFloat(price.toString()),
        description: finalDescription,
        imageUrl: finalImageUrl,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
