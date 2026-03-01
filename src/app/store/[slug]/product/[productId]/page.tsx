import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface ProductPageProps {
    params: { slug: string; productId: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
    const product = await prisma.product.findUnique({
        where: { id: params.productId },
        include: { business: true },
    });

    if (!product || product.business.slug !== params.slug) {
        return { title: 'Product Not Found | DukaanHai' };
    }

    return {
        title: `${product.name} - ${product.business.name} | DukaanHai`,
        description: product.description || `Buy ${product.name} from ${product.business.name}`,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await prisma.product.findUnique({
        where: { id: params.productId },
        include: {
            business: {
                include: {
                    products: {
                        where: {
                            id: { not: params.productId },
                            inStock: true,
                        },
                        take: 4,
                    },
                },
            },
        },
    });

    if (!product || product.business.slug !== params.slug) {
        notFound();
    }

    const { business, business: { products: relatedProducts } } = product;

    const waNumber = business.whatsappNumber?.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Hi! I want to order "${product.name}" from ${business.name}.`
    )}`;

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans">
            {/* Navbar */}
            <header className="border-b border-zinc-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href={`/store/${business.slug}`} className="text-xl font-bold tracking-tight text-zinc-900 hover:text-brand-600 transition-colors">
                        {business.name}
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href={`/store/${business.slug}`} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                            Back to Store
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Product Section */}
            <main className="max-w-6xl mx-auto px-6 py-12 md:py-24">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* Image */}
                    <div className="rounded-3xl overflow-hidden bg-zinc-100 aspect-square relative border border-zinc-200">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                <span className="text-8xl mb-4">📦</span>
                                <span className="text-sm font-medium">No Image Available</span>
                            </div>
                        )}
                        {!product.inStock && (
                            <div className="absolute top-6 right-6 bg-red-500/90 text-white backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                                Out of Stock
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col h-full justify-center">
                        <Link href={`/store/${business.slug}`} className="inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors mb-4">
                            ← {business.name}
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight mb-4">
                            {product.name}
                        </h1>
                        <div className="text-3xl font-bold text-zinc-900 mb-8">
                            {formatPrice(product.price)}
                        </div>

                        {product.description && (
                            <div className="prose prose-zinc prose-a:text-brand-600 mb-10">
                                <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-lg">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        <div className="pt-8 border-t border-zinc-200 space-y-4">
                            {waNumber ? (
                                <a
                                    href={product.inStock ? waLink : undefined}
                                    target={product.inStock ? "_blank" : undefined}
                                    rel={product.inStock ? "noopener noreferrer" : undefined}
                                    className={`block w-full text-center text-lg font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/20 ${product.inStock
                                        ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-brand-500/30 -translate-y-0.5 mt-0.5'
                                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed hidden'
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Order via WhatsApp
                                    </span>
                                </a>
                            ) : (
                                <div className="bg-zinc-50 border border-zinc-200 text-zinc-500 text-center py-4 rounded-xl text-sm font-medium">
                                    Ordering is currently unavailable.
                                </div>
                            )}

                            <div className="text-center">
                                <p className="text-zinc-500 text-sm">
                                    Safe & Secure Checkout
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            {/* Related Products Section */}
            {
                relatedProducts.length > 0 && (
                    <section className="bg-zinc-50 border-t border-zinc-200 py-16 md:py-24">
                        <div className="max-w-6xl mx-auto px-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-10 text-center">
                                More from {business.name}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {relatedProducts.map(rp => (
                                    <Link key={rp.id} href={`/store/${business.slug}/product/${rp.id}`} className="group relative block bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="aspect-square bg-zinc-100 overflow-hidden relative">
                                            {rp.imageUrl ? (
                                                <img
                                                    src={rp.imageUrl}
                                                    alt={rp.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-300 text-4xl">
                                                    📦
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-zinc-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1">
                                                {rp.name}
                                            </h3>
                                            <p className="text-sm font-medium text-zinc-500">
                                                {formatPrice(rp.price)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Footer */}
            <footer className="border-t border-zinc-200 bg-white py-12">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <Link href={`/store/${business.slug}`} className="text-xl font-bold tracking-tight text-zinc-900 block mb-4">
                        {business.name}
                    </Link>
                    <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
                        {business.category} • {business.location}
                    </p>
                    <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">
                        Powered by DukaanHai
                    </a>
                </div>
            </footer>
        </div >
    );
}
