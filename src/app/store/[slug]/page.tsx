import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import BoldTemplate from '@/components/templates/BoldTemplate';
import CatalogTemplate from '@/components/templates/CatalogTemplate';
import FuturisticTemplate from '@/components/templates/FuturisticTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import PlayfulTemplate from '@/components/templates/PlayfulTemplate';

interface StorePageProps {
  params: { slug: string };
  searchParams: { template?: string };
}

export async function generateMetadata({ params }: StorePageProps) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
  });

  if (!business) {
    return { title: 'Store Not Found | DukaanHai' };
  }

  return {
    title: `${business.name} | DukaanHai`,
    description: business.tagline || business.description || `Shop from ${business.name} on DukaanHai`,
    openGraph: {
      title: business.name,
      description: business.tagline || business.description || '',
    },
  };
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const templateType = searchParams.template || business.templateType || 'minimal';

  const props = { business, products: business.products };

  switch (templateType) {
    case 'bold':
      return <BoldTemplate {...props} />;
    case 'catalog':
      return <CatalogTemplate {...props} />;
    case 'futuristic':
      return <FuturisticTemplate {...props} />;
    case 'elegant':
      return <ElegantTemplate {...props} />;
    case 'playful':
      return <PlayfulTemplate {...props} />;
    default:
      return <MinimalTemplate {...props} />;
  }
}
