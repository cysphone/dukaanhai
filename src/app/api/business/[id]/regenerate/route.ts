import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateBusinessContent } from '@/lib/gemini';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const business = await prisma.business.findFirst({
      where: { id: params.id, userId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const aiContent = await generateBusinessContent({
      name: business.name,
      description: business.description || '',
      category: business.category || 'General',
      location: business.location || 'India',
    });

    const updated = await prisma.business.update({
      where: { id: params.id },
      data: {
        headline: aiContent.headline,
        tagline: aiContent.tagline,
        about: aiContent.about,
        marketingDesc: aiContent.marketingDesc,
      },
    });

    return NextResponse.json({ content: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to regenerate content' }, { status: 500 });
  }
}
