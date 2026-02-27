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
                <div key={product.id} className="flex gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-xl overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 truncate">{product.name}</h4>
                    {product.description && (
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-extrabold text-base">{formatPrice(product.price)}</span>
                      {waNumber && (
                        <a
                          href={waLink(product.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-all"
                        >
                          Order
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About */}
        {business.about && (
          <div className="mx-5 mb-8 bg-teal-50 border border-teal-100 rounded-2xl p-5">
            <h4 className="font-extrabold text-teal-800 mb-2 text-sm">About Us 🙏</h4>
            <p className="text-teal-700 text-xs leading-relaxed">{business.about}</p>
          </div>
        )}

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
