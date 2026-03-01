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

export default function ElegantTemplate({ business, products }: TemplateProps) {
    const waNumber = business.whatsappNumber?.replace(/[^0-9]/g, '');
    const waLink = (productName?: string) =>
        `https://wa.me/${waNumber}?text=${encodeURIComponent(
            productName
                ? `Bonjour, I wish to inquire about "${productName}" from your collection.`
                : `Bonjour, I would love to explore the offerings at ${business.name}.`
        )}`;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2C2A29] font-serif selection:bg-[#E8DCC4]">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Lato:wght@300;400;700&display=swap');
        .elegant-display { font-family: 'Playfair Display', serif; }
        .elegant-body { font-family: 'Lato', sans-serif; }
        .gold-border { border-color: #D4AF37; }
        .gold-text { color: #D4AF37; }
        .bg-gold { background-color: #D4AF37; }
        .fade-in-up { animation: fadeInUp 1s ease-out forwards; opacity: 0; transform: translateY(20px); }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8DCC4] py-5">
                <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                    <div className="flex flex-col">
                        <h1 className="elegant-display text-2xl font-semibold tracking-wide text-[#2C2A29]">
                            {business.name}
                        </h1>
                        {business.tagline && (
                            <span className="elegant-body text-[10px] uppercase tracking-[0.3em] text-[#8B8682] mt-1">
                                {business.tagline}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        {business.location && (
                            <span className="elegant-body text-xs tracking-widest uppercase text-[#8B8682] hidden md:block">
                                {business.location}
                            </span>
                        )}
                        {waNumber && (
                            <a
                                href={waLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="elegant-body text-xs tracking-[0.2em] uppercase bg-[#2C2A29] text-[#FDFBF7] px-6 py-3 hover:bg-[#D4AF37] transition-colors duration-500"
                            >
                                Connect
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-8 max-w-5xl mx-auto text-center min-h-[85vh] flex flex-col justify-center">
                <div className="fade-in-up">
                    <span className="elegant-body text-xs tracking-[0.4em] uppercase gold-text mb-6 block">
                        {business.category || 'Luxury Collection'}
                    </span>
                    <h2 className="elegant-display text-5xl md:text-7xl lg:text-8xl font-normal leading-tight text-[#2C2A29] mb-10 max-w-4xl mx-auto">
                        {business.headline || business.name}
                    </h2>
                    <div className="w-px h-24 bg-[#D4AF37] mx-auto mt-12 mb-8 opacity-60"></div>
                    {business.marketingDesc && (
                        <p className="elegant-display italic text-xl md:text-2xl text-[#6D6A66] max-w-2xl mx-auto leading-relaxed">
                            "{business.marketingDesc}"
                        </p>
                    )}
                </div>
            </section>

            {/* Philosophy (About/Mission/Vision) */}
            {(business.about || business.mission || business.vision) && (
                <section className="py-32 px-8 bg-[#F5F2EA] border-y border-[#E8DCC4]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-24 fade-in-up">
                            <h3 className="elegant-display text-4xl text-[#2C2A29] mb-4">Our Philosophy</h3>
                            <div className="w-12 h-px bg-[#D4AF37] mx-auto"></div>
                        </div>

                        <div className="grid md:grid-cols-12 gap-16 items-start">
                            {business.about && (
                                <div className="md:col-span-5 md:col-start-2 fade-in-up delay-100">
                                    <span className="elegant-body text-xs tracking-[0.2em] uppercase gold-text mb-4 block">The Heritage</span>
                                    <p className="elegant-display text-2xl leading-relaxed text-[#2C2A29]">
                                        {business.about}
                                    </p>
                                </div>
                            )}

                            <div className="md:col-span-4 md:col-start-8 space-y-16 fade-in-up delay-200">
                                {business.mission && (
                                    <div>
                                        <span className="elegant-body text-xs tracking-[0.2em] uppercase text-[#8B8682] mb-3 block border-b border-[#E8DCC4] pb-2">The Mission</span>
                                        <p className="elegant-body text-sm leading-loose text-[#6D6A66]">
                                            {business.mission}
                                        </p>
                                    </div>
                                )}
                                {business.vision && (
                                    <div>
                                        <span className="elegant-body text-xs tracking-[0.2em] uppercase text-[#8B8682] mb-3 block border-b border-[#E8DCC4] pb-2">The Vision</span>
                                        <p className="elegant-body text-sm leading-loose text-[#6D6A66]">
                                            {business.vision}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Curated Collection (Products) */}
            {products.length > 0 && (
                <section className="py-32 px-8 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 fade-in-up">
                        <div>
                            <h3 className="elegant-display text-4xl text-[#2C2A29] mb-4">Curated Collection</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-px bg-[#D4AF37]"></div>
                                <span className="elegant-body text-xs tracking-[0.2em] uppercase text-[#8B8682]">
                                    Exquisite Selections
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 md:mt-0 text-right">
                            <span className="elegant-display text-2xl italic text-[#8B8682]">{products.length} Pieces</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                        {products.map((product, index) => (
                            <div key={product.id} className={`group fade-in-up delay-${(index % 2) * 100}`}>
                                <a href={`/store/${business.slug}/product/${product.id}`} className="block relative overflow-hidden mb-8 aspect-[3/4] bg-[#F5F2EA]">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-4xl opacity-20">No Image</span>
                                        </div>
                                    )}
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </a>

                                <div className="text-center px-4">
                                    <h4 className="elegant-display text-2xl text-[#2C2A29] mb-3 group-hover:text-[#D4AF37] transition-colors duration-500">
                                        {product.name}
                                    </h4>
                                    {product.description && (
                                        <p className="elegant-body text-sm text-[#8B8682] leading-relaxed mb-6 line-clamp-2 max-w-sm mx-auto">
                                            {product.description}
                                        </p>
                                    )}
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="elegant-body tracking-wider text-[#2C2A29]">
                                            {formatPrice(product.price)}
                                        </span>
                                        <a
                                            href={`/store/${business.slug}/product/${product.id}`}
                                            className="elegant-body text-[10px] uppercase tracking-[0.2em] border-b border-transparent hover:border-[#D4AF37] pb-1 transition-all text-[#6D6A66] hover:text-[#D4AF37]"
                                        >
                                            Discover More
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Inquiry Form */}
            <section className="py-32 bg-[#2C2A29] text-[#FDFBF7] px-8">
                <div className="max-w-xl mx-auto text-center fade-in-up">
                    <span className="elegant-body text-xs tracking-[0.3em] uppercase gold-text mb-6 block">Personal Service</span>
                    <h3 className="elegant-display text-4xl md:text-5xl mb-12">Submit an Inquiry</h3>

                    <form className="space-y-8 text-left" onSubmit={(e) => { e.preventDefault(); alert("Your inquiry has been received with thanks."); }}>
                        <div className="space-y-2 relative">
                            <input type="text" required id="name" className="elegant-body w-full bg-transparent border-b border-[#4A4846] py-3 text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] transition-colors peer placeholder-transparent" placeholder="Name" />
                            <label htmlFor="name" className="elegant-body absolute left-0 -top-3.5 text-[#8B8682] text-xs uppercase tracking-widest peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs transition-all pointer-events-none">Full Name</label>
                        </div>
                        <div className="space-y-2 relative pt-4">
                            <input type="email" required id="email" className="elegant-body w-full bg-transparent border-b border-[#4A4846] py-3 text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] transition-colors peer placeholder-transparent" placeholder="Email" />
                            <label htmlFor="email" className="elegant-body absolute left-0 0 text-[#8B8682] text-xs uppercase tracking-widest peer-placeholder-shown:text-sm peer-placeholder-shown:top-7 peer-focus:top-0 peer-focus:text-xs transition-all pointer-events-none">Email Address</label>
                        </div>
                        <div className="space-y-2 relative pt-6">
                            <textarea required id="message" rows={4} className="elegant-body w-full bg-transparent border-b border-[#4A4846] py-3 text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none peer placeholder-transparent" placeholder="Message"></textarea>
                            <label htmlFor="message" className="elegant-body absolute left-0 top-1 text-[#8B8682] text-xs uppercase tracking-widest peer-placeholder-shown:text-sm peer-placeholder-shown:top-9 peer-focus:top-1 peer-focus:text-xs transition-all pointer-events-none">Your Message</label>
                        </div>
                        <div className="pt-8 flex justify-center">
                            <button type="submit" className="elegant-body text-xs tracking-[0.2em] uppercase bg-[#D4AF37] text-white px-12 py-4 hover:bg-[#B5952F] transition-colors duration-500 w-full sm:w-auto">
                                Send Inquiry
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-8 bg-[#FDFBF7] border-t border-[#E8DCC4] text-center">
                <h2 className="elegant-display text-2xl text-[#2C2A29] mb-4">{business.name}</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-8">
                    {business.category && <span className="elegant-body text-[10px] uppercase tracking-widest text-[#8B8682]">{business.category}</span>}
                    {business.location && <span className="elegant-body text-[10px] uppercase tracking-widest text-[#8B8682]">{business.location}</span>}
                </div>
                <p className="elegant-body text-[10px] uppercase tracking-widest text-[#B4ADA5]">
                    Powered by <a href="/" className="gold-text hover:text-[#2C2A29] transition-colors">DukaanHai</a>
                </p>
            </footer>
        </div >
    );
}
