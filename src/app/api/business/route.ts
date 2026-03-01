import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateBusinessContent } from '@/lib/gemini';
import { generateSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const business = await prisma.business.findFirst({
      where: { userId },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ business });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, description, whatsappNumber, location, category, templateType } = body;

    if (!name) {
      return NextResponse.json({ error: 'Business name required' }, { status: 400 });
    }

    // Generate unique slug
    let slug = generateSlug(name);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Generate AI content
    const aiContent = await generateBusinessContent({
      name,
      description: description || '',
      category: category || 'General',
      location: location || 'India',
    });

    const business = await prisma.business.create({
      data: {
        userId,
        name,
        slug,
        description,
        whatsappNumber,
        location,
        category,
        templateType: templateType || 'minimal',
        headline: aiContent.headline,
        tagline: aiContent.tagline,
        about: aiContent.about,
        vision: aiContent.vision,
        mission: aiContent.mission,
        marketingDesc: aiContent.marketingDesc,
      },
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    console.error('Create business error:', error);
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 });
  }
}
