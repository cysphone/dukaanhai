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

export default function CatalogTemplate({ business, products }: TemplateProps) {
  const waNumber = business.whatsappNumber?.replace(/[^0-9]/g, '');
  const waLink = (productName?: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(
      productName
        ? `Hi ${business.name}! I'd like to order "${productName}". Please share more details.`
        : `Hi ${business.name}! I'd like to know more about your products.`
    )}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .cat-font { font-family: 'Nunito', sans-serif; }
      `}</style>

      <div className="cat-font max-w-lg mx-auto bg-white min-h-screen shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-5 pt-10 pb-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl">
                🛒
              </div>
              <div>
                <h1 className="text-xl font-900 leading-none">{business.name}</h1>
                {business.location && (
                  <p className="text-emerald-100 text-xs mt-0.5">📍 {business.location}</p>
                )}
              </div>
            </div>

            {business.headline && (
              <h2 className="text-2xl font-extrabold leading-tight mb-2">{business.headline}</h2>
            )}
            {business.tagline && (
              <p className="text-emerald-100 text-sm">{business.tagline}</p>
            )}
          </div>
        </div>

        {/* Sticky WhatsApp Button */}
        {waNumber && (
          <div className="px-5 -mt-6 mb-6 relative z-10">
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-[#20bd5a] transition-all text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat to Order on WhatsApp
            </a>
          </div>
        )}

        {/* Products */}
        <div className="px-5 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-extrabold text-gray-900 text-lg">Products</h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">🛍️</span>
              <p className="text-gray-500 text-sm font-semibold">Products coming soon!</p>
              {waNumber && (
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm font-bold mt-2 block">
                  Ask on WhatsApp →
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 relative group overflow-hidden">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-gray-900 text-base leading-tight mb-1 truncate group-hover:text-emerald-700 transition-colors">{product.name}</h4>
                    {product.description && (
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-emerald-600 font-extrabold text-lg">{formatPrice(product.price)}</span>
                      <div className="flex gap-2">
                        <a
                          href={`/store/${business.slug}/product/${product.id}`}
                          className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mission/Vision/About */}
        <div className="px-5 space-y-4 mb-8">
          {business.about && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 shadow-sm">
              <h4 className="font-extrabold text-teal-800 mb-3 text-lg flex items-center gap-2">
                <span className="text-2xl">👋</span> About Us
              </h4>
              <p className="text-teal-700 text-sm leading-relaxed">{business.about}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {business.mission && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <h4 className="font-extrabold text-emerald-800 mb-2 text-sm flex items-center gap-2">
                  <span>🎯</span> Mission
                </h4>
                <p className="text-emerald-700 text-xs leading-relaxed">{business.mission}</p>
              </div>
            )}

            {business.vision && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <h4 className="font-extrabold text-emerald-800 mb-2 text-sm flex items-center gap-2">
                  <span>🚀</span> Vision
                </h4>
                <p className="text-emerald-700 text-xs leading-relaxed">{business.vision}</p>
              </div>
            )}
          </div>

          {business.marketingDesc && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-1 shadow-md">
              <div className="bg-white rounded-xl p-5 h-full">
                <p className="text-gray-800 text-sm font-bold text-center italic">
                  "{business.marketingDesc}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="px-5 mb-10">
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-lg shadow-emerald-100/50">
            <div className="text-center mb-6">
              <h3 className="font-extrabold text-gray-900 text-xl mb-1">Send a Message</h3>
              <p className="text-gray-500 text-xs">We'd love to hear from you!</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We will get back to you soon."); }}>
              <div>
                <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="Your Name" />
              </div>
              <div>
                <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="Your Email" />
              </div>
              <div>
                <textarea required rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none" placeholder="Your Message"></textarea>
              </div>
              <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md">
                Submit
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-5 text-center">
          <p className="text-gray-400 text-xs">
            Powered by <a href="/" className="text-emerald-600 font-bold">DukaanHai</a>
          </p>
          <p className="text-gray-300 text-xs mt-1">
            Create your free store at {process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.com'}
          </p>
        </div>
      </div>
    </div>
  );
}
