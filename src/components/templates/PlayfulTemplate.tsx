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

export default function PlayfulTemplate({ business, products }: TemplateProps) {
    const waNumber = business.whatsappNumber?.replace(/[^0-9]/g, '');
    const waLink = (productName?: string) =>
        `https://wa.me/${waNumber}?text=${encodeURIComponent(
            productName
                ? `Hey there! 🌟 I want to grab "${productName}" from ${business.name}.`
                : `Hey! 👋 I'm super interested in what ${business.name} has to offer.`
        )}`;

    return (
        <div className="min-h-screen bg-[#FFF4E6] text-[#2D3142] font-sans selection:bg-[#FFB1B1] selection:text-white overflow-hidden">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        .playful-display { font-family: 'Fredoka', sans-serif; }
        .playful-body { font-family: 'Nunito', sans-serif; }
        .brutal-shadow { box-shadow: 6px 6px 0px 0px #2D3142; }
        .brutal-shadow-hover:hover { box-shadow: 2px 2px 0px 0px #2D3142; transform: translate(4px, 4px); }
        .brutal-border { border: 3px solid #2D3142; }
        .blob-bg { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        .squiggle-underline { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 4'%3E%3Cpath fill='none' stroke='%23FF6B6B' stroke-width='2' stroke-linecap='round' d='M0 2 Q 5 4 10 2 T 20 2'/%3E%3C/svg%3E"); background-repeat: repeat-x; background-position: bottom; padding-bottom: 6px; }
      `}</style>

            {/* Shapes Background */}
            <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-[#FF6B6B] rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-48 h-48 bg-[#4ECDC4] blob-bg mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-[#FFE66D] rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 w-full z-50 px-4 py-4 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto bg-white brutal-border brutal-shadow rounded-2xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFD93D] rounded-full flex items-center justify-center text-xl brutal-border shadow-[2px_2px_0px_#2D3142] rotate-12">
                            ✨
                        </div>
                        <h1 className="playful-display text-2xl font-bold tracking-tight text-[#2D3142]">
                            {business.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {business.location && (
                            <span className="playful-body font-bold text-[#FF6B6B] bg-[#FFF4E6] px-3 py-1 rounded-full text-sm border-2 border-[#FFB1B1] hidden md:block">
                                📍 {business.location}
                            </span>
                        )}
                        {waNumber && (
                            <a
                                href={waLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="playful-body bg-[#4ECDC4] text-[#2D3142] font-black text-sm px-5 py-2.5 rounded-xl brutal-border brutal-shadow brutal-shadow-hover transition-all flex items-center gap-2"
                            >
                                Let's Chat!
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative pt-20 pb-32 px-6 max-w-6xl mx-auto z-10 text-center">
                {business.tagline && (
                    <div className="inline-block px-6 py-2 bg-[#FFE66D] text-[#2D3142] font-bold playful-body text-lg rounded-full brutal-border shadow-[4px_4px_0px_#2D3142] -rotate-2 mb-10">
                        {business.tagline} 🚀
                    </div>
                )}
                <h2 className="playful-display text-5xl md:text-7xl lg:text-8xl font-black text-[#2D3142] leading-[1.1] mb-8 max-w-4xl mx-auto drop-shadow-[3px_3px_0px_#FFD93D]">
                    {business.headline || business.name}
                </h2>
                {business.marketingDesc && (
                    <p className="playful-body text-xl md:text-2xl text-[#2D3142] font-bold max-w-2xl mx-auto leading-relaxed squiggle-underline inline-block">
                        {business.marketingDesc}
                    </p>
                )}
            </section>

            {/* Vibes (About/Mission/Vision) */}
            {(business.about || business.mission || business.vision) && (
                <section className="py-24 px-6 relative z-10 bg-[#FF6B6B]/10 border-y-4 border-[#2D3142]">
                    <div className="max-w-6xl mx-auto">
                        <h3 className="playful-display text-5xl text-[#2D3142] font-black mb-16 text-center">
                            <span className="bg-white px-6 py-2 rounded-xl brutal-border shadow-[4px_4px_0px_#2D3142]">The Vibes 🌈</span>
                        </h3>

                        <div className="grid md:grid-cols-3 gap-8">
                            {business.about && (
                                <div className="bg-[#4ECDC4] p-8 rounded-[2rem] brutal-border brutal-shadow transform hover:-rotate-1 transition-transform">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-6 brutal-border shadow-[2px_2px_0px_#2D3142]">
                                        📖
                                    </div>
                                    <h4 className="playful-display text-3xl text-[#2D3142] font-bold mb-4">Our Story</h4>
                                    <p className="playful-body text-[#2D3142] font-semibold text-lg leading-relaxed">{business.about}</p>
                                </div>
                            )}
                            {business.mission && (
                                <div className="bg-[#FFE66D] p-8 rounded-[2rem] brutal-border brutal-shadow md:-translate-y-8 transform hover:-translate-y-10 transition-transform">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-6 brutal-border shadow-[2px_2px_0px_#2D3142]">
                                        🎯
                                    </div>
                                    <h4 className="playful-display text-3xl text-[#2D3142] font-bold mb-4">Mission</h4>
                                    <p className="playful-body text-[#2D3142] font-semibold text-lg leading-relaxed">{business.mission}</p>
                                </div>
                            )}
                            {business.vision && (
                                <div className="bg-[#FF9F1C] p-8 rounded-[2rem] brutal-border brutal-shadow transform hover:rotate-1 transition-transform">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-6 brutal-border shadow-[2px_2px_0px_#2D3142]">
                                        🚀
                                    </div>
                                    <h4 className="playful-display text-3xl text-white font-bold mb-4 text-shadow-sm">Vision</h4>
                                    <p className="playful-body text-white font-semibold text-lg leading-relaxed">{business.vision}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* The Goods (Products) */}
            {products.length > 0 && (
                <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <h3 className="playful-display text-5xl text-[#2D3142] font-black">
                            The <span className="text-[#FF6B6B]">Goods</span> 🎁
                        </h3>
                        <div className="bg-white px-6 py-3 rounded-full brutal-border shadow-[4px_4px_0px_#2D3142]">
                            <span className="playful-body font-black text-[#2D3142] text-xl">
                                {products.length} Awesome Items
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map((product, i) => {
                            const colors = ['bg-[#FF6B6B]', 'bg-[#4ECDC4]', 'bg-[#FFE66D]', 'bg-[#FF9F1C]', 'bg-[#FFB1B1]'];
                            const color = colors[i % colors.length];
                            return (
                                <div key={product.id} className="bg-white rounded-[2rem] p-4 brutal-border brutal-shadow hover:brutal-shadow-hover transition-all duration-300 flex flex-col h-full group">
                                    <div className={`${color} rounded-3xl p-2 mb-6 aspect-square bg-opacity-20 relative`}>
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-2xl brutal-border group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-white rounded-2xl brutal-border flex items-center justify-center text-6xl shadow-[2px_2px_0px_#2D3142]">
                                                🎁
                                            </div>
                                        )}
                                        <div className="absolute -top-4 -right-4 bg-white p-2 rounded-full brutal-border shadow-[4px_4px_0px_#2D3142] rotate-12 group-hover:rotate-0 transition-transform">
                                            <span className="playful-display text-2xl font-black text-[#2D3142] px-2">
                                                {formatPrice(product.price)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-2 flex-grow flex flex-col">
                                        <h4 className="playful-display text-2xl font-bold text-[#2D3142] mb-3">{product.name}</h4>
                                        {product.description && (
                                            <p className="playful-body text-[#6B7280] font-semibold text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">{product.description}</p>
                                        )}

                                        <a
                                            href={`/store/${business.slug}/product/${product.id}`}
                                            className="mt-auto w-full text-center playful-body font-black text-xl bg-[#2D3142] text-white py-4 rounded-xl hover:bg-[#FF6B6B] hover:-translate-y-1 transition-all duration-300"
                                        >
                                            Check it Out!
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )
            }

            {/* Say Hi (Contact) */}
            <section className="py-24 px-6 max-w-4xl mx-auto relative z-10">
                <div className="bg-[#FFE66D] rounded-[3rem] p-8 md:p-16 brutal-border brutal-shadow">
                    <div className="text-center mb-12">
                        <h3 className="playful-display text-5xl text-[#2D3142] font-black mb-4">Say Hi! 👋</h3>
                        <p className="playful-body text-[#2D3142] font-bold text-xl">We don't bite. Send us a message.</p>
                    </div>

                    <form className="max-w-2xl mx-auto space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Yay! Message sent! 🎉"); }}>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="playful-body block text-[#2D3142] font-black text-lg mb-2">Your Name</label>
                                <input type="text" required className="w-full bg-white border-4 border-[#2D3142] rounded-2xl px-6 py-4 text-lg font-bold text-[#2D3142] focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/50 transition-all placeholder-gray-400" placeholder="Captain Awesome" />
                            </div>
                            <div>
                                <label className="playful-body block text-[#2D3142] font-black text-lg mb-2">Your Email</label>
                                <input type="email" required className="w-full bg-white border-4 border-[#2D3142] rounded-2xl px-6 py-4 text-lg font-bold text-[#2D3142] focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/50 transition-all placeholder-gray-400" placeholder="captain@awesome.com" />
                            </div>
                        </div>
                        <div>
                            <label className="playful-body block text-[#2D3142] font-black text-lg mb-2">What's up?</label>
                            <textarea required rows={4} className="w-full bg-white border-4 border-[#2D3142] rounded-2xl px-6 py-4 text-lg font-bold text-[#2D3142] focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/50 transition-all resize-none placeholder-gray-400" placeholder="I just wanted to say that..."></textarea>
                        </div>
                        <button type="submit" className="w-full playful-display text-3xl font-black bg-[#FF6B6B] text-white py-5 rounded-2xl brutal-border shadow-[4px_4px_0px_#2D3142] hover:shadow-[2px_2px_0px_#2D3142] hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
                            Send it! 🚀
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#2D3142] text-white py-12 px-6 border-t-8 border-[#FF6B6B] relative z-20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl rotate-12">🎪</span>
                        <span className="playful-display text-2xl font-bold">{business.name}</span>
                    </div>

                    <div className="flex gap-4">
                        {business.category && <span className="bg-[#4ECDC4] text-[#2D3142] font-black px-4 py-1 rounded-full text-sm border-2 border-[#2D3142]">{business.category}</span>}
                        {business.location && <span className="bg-[#FFE66D] text-[#2D3142] font-black px-4 py-1 rounded-full text-sm border-2 border-[#2D3142]">{business.location}</span>}
                    </div>

                    <div className="playful-body font-bold text-[#FFB1B1]">
                        Made with 💖 by <a href="/" className="text-white hover:text-[#FF6B6B] transition-colors underline decoration-wavy decoration-[#4ECDC4] underline-offset-4">DukaanHai</a>
                    </div>
                </div>
            </footer>
        </div >
    );
}
