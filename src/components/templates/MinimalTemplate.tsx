'use client';

import { formatPrice } from '@/lib/utils';

interface TemplateProps {
  business: {
    name: string;
    slug: string;
    headline?: string | null;
    tagline?: string | null;
    about?: string | null;
    vision?: string | null;
    mission?: string | null;
    marketingDesc?: string | null;
    whatsappNumber?: string | null;
    location?: string | null;
    category?: string | null;
    logoUrl?: string | null;
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

export default function MinimalTemplate({ business, products }: TemplateProps) {
  const waNumber = business.whatsappNumber?.replace(/[^0-9]/g, '');
  const waLink = (productName?: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(
      productName
        ? `Hi! I'm interested in ordering "${productName}" from ${business.name}.`
        : `Hi! I'd like to know more about ${business.name}.`
    )}`;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .minimal-display { font-family: 'Cormorant Garamond', serif; }
        .minimal-body { font-family: 'Jost', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b border-stone-200 sticky top-0 bg-stone-50/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="minimal-display text-2xl font-semibold text-stone-900">{business.name}</h1>
            {business.tagline && (
              <p className="minimal-body text-xs tracking-widest text-stone-400 uppercase mt-0.5">{business.tagline}</p>
            )}
          </div>
          {waNumber && (
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="minimal-body flex items-center gap-2 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-full hover:bg-stone-700 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Order Now
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        {business.headline && (
          <h2 className="minimal-display text-4xl md:text-6xl font-semibold text-stone-900 leading-tight mb-6">
            {business.headline}
          </h2>
        )}
        <div className="flex items-center justify-center gap-4 text-stone-400 text-sm minimal-body">
          {business.category && <span>{business.category}</span>}
          {business.category && business.location && <span>·</span>}
          {business.location && <span>📍 {business.location}</span>}
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h3 className="minimal-display text-2xl font-semibold text-stone-900 mb-8 text-center">
            Our Collection
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group">
                {/* Image */}
                <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden mb-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </div>
                {/* Info */}
                <div>
                  <h4 className="minimal-display text-lg font-semibold text-stone-900 mb-1">{product.name}</h4>
                  {product.description && (
                    <p className="minimal-body text-stone-500 text-sm mb-3 leading-relaxed line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="minimal-body font-semibold text-stone-900 text-lg">{formatPrice(product.price)}</span>
                    <a
                      href={`/store/${business.slug}/product/${product.id}`}
                      className="minimal-body text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full hover:bg-stone-200 transition-all font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About & Mission/Vision */}
      {(business.about || business.mission || business.vision) && (
        <section className="bg-stone-900 py-24 text-stone-50">
          <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              {business.about && (
                <div>
                  <h3 className="minimal-display text-3xl font-semibold mb-4 text-white">Our Story</h3>
                  <p className="minimal-body text-stone-300 leading-relaxed text-sm">{business.about}</p>
                </div>
              )}
              {business.marketingDesc && (
                <div className="pl-6 border-l-2 border-stone-700">
                  <p className="minimal-body text-stone-400 italic text-sm">
                    "{business.marketingDesc}"
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-10">
              {business.mission && (
                <div>
                  <h3 className="minimal-display text-2xl font-semibold mb-3 text-stone-300">Mission</h3>
                  <p className="minimal-body text-stone-400 leading-relaxed text-sm">{business.mission}</p>
                </div>
              )}
              {business.vision && (
                <div>
                  <h3 className="minimal-display text-2xl font-semibold mb-3 text-stone-300">Vision</h3>
                  <p className="minimal-body text-stone-400 leading-relaxed text-sm">{business.vision}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section className="py-24 max-w-2xl mx-auto px-6 text-center">
        <h3 className="minimal-display text-3xl font-semibold text-stone-900 mb-2">Get in Touch</h3>
        <p className="minimal-body text-stone-500 mb-10 text-sm">We'd love to hear from you.</p>

        <form className="space-y-5 text-left" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We will get back to you soon."); }}>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="minimal-body block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Name</label>
              <input type="text" required className="w-full bg-transparent border-b border-stone-300 rounded-none px-0 py-2 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors minimal-body" placeholder="John Doe" />
            </div>
            <div>
              <label className="minimal-body block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Email</label>
              <input type="email" required className="w-full bg-transparent border-b border-stone-300 rounded-none px-0 py-2 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors minimal-body" placeholder="john@example.com" />
            </div>
          </div>
          <div>
            <label className="minimal-body block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Message</label>
            <textarea required rows={3} className="w-full bg-transparent border-b border-stone-300 rounded-none px-0 py-2 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors resize-none minimal-body" placeholder="How can we help?"></textarea>
          </div>
          <div className="pt-4 text-center">
            <button type="submit" className="minimal-display text-xl font-semibold bg-stone-900 hover:bg-stone-800 text-white px-10 py-3 rounded-full transition-all">
              Send Message
            </button>
          </div>
        </form>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-stone-200">
        <p className="minimal-body text-stone-400 text-sm">{business.name}</p>
        <p className="minimal-body text-stone-400 text-xs">
          Powered by{' '}
          <a href="/" className="text-stone-600 hover:text-stone-900 transition-colors">DukaanHai</a>
        </p>
      </footer>
    </div>
  );
}
