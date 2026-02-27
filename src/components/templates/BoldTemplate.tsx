import { formatPrice } from '@/lib/utils';

interface TemplateProps {
  business: {
    name: string;
    slug: string;
    headline?: string | null;
    tagline?: string | null;
    about?: string | null;
    whatsappNumber?: string | null;
    location?: string | null;
    category?: string | null;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    description?: string | null;
    imageUrl?: string | null;
    inStock: boolean;
  }>;
}

export default function BoldTemplate({ business, products }: TemplateProps) {
  const waNumber = business.whatsappNumber?.replace(/[^0-9]/g, '');
  const waLink = (productName?: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(
      productName
        ? `Hi! I want to order "${productName}" from ${business.name}.`
        : `Hi! I'm interested in ${business.name}.`
    )}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        .bold-display { font-family: 'Bebas Neue', cursive; letter-spacing: 0.02em; }
        .bold-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            <h1 className="bold-display text-3xl text-white">{business.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {business.location && (
              <span className="bold-body text-zinc-400 text-sm hidden md:block">📍 {business.location}</span>
            )}
            {waNumber && (
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bold-body flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-400 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        {business.tagline && (
          <div className="bold-body inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
            ⚡ {business.tagline}
          </div>
        )}
        <h2 className="bold-display text-6xl md:text-8xl text-white leading-none mb-8 max-w-3xl">
          {business.headline || business.name}
        </h2>
        <div className="flex items-center gap-6">
          <span className="bold-body text-zinc-400">{business.category}</span>
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
          <span className="bold-body text-zinc-400">{products.length} Products</span>
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="flex items-end justify-between mb-10">
            <h3 className="bold-display text-5xl text-white">Products</h3>
            <div className="w-32 h-0.5 bg-orange-500 mb-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                <div className="aspect-square relative overflow-hidden bg-zinc-800">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bold-display text-6xl text-white/10">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="bold-display text-2xl text-white mb-2">{product.name}</h4>
                  {product.description && (
                    <p className="bold-body text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="bold-display text-2xl text-orange-400">{formatPrice(product.price)}</span>
                    {waNumber && (
                      <a
                        href={waLink(product.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bold-body bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                      >
                        Order Now
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      {business.about && (
        <section className="border-t border-zinc-800 py-20">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="bold-display text-5xl text-white mb-6">Our Story</h3>
              <p className="bold-body text-zinc-300 leading-relaxed text-lg">{business.about}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <div className="space-y-4">
                {[
                  { label: 'Business', value: business.name },
                  { label: 'Category', value: business.category },
                  { label: 'Location', value: business.location },
                  { label: 'Products', value: `${products.length} items` },
                ].filter(i => i.value).map(item => (
                  <div key={item.label} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                    <span className="bold-body text-zinc-500 text-sm">{item.label}</span>
                    <span className="bold-body text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800 max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <p className="bold-body text-zinc-500 text-sm">{business.name} © {new Date().getFullYear()}</p>
        <a href="/" className="bold-body text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
          Made with DukaanHai
        </a>
      </footer>
    </div>
  );
}
