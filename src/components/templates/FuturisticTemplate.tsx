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

export default function FuturisticTemplate({ business, products }: TemplateProps) {
    const waNumber = business.whatsappNumber?.replace(/[^0-9]/g, '');
    const waLink = (productName?: string) =>
        `https://wa.me/${waNumber}?text=${encodeURIComponent(
            productName
                ? `Initiating order protocol for "${productName}" from ${business.name}.`
                : `Connecting to ${business.name} mainframe.`
        )}`;

    return (
        <div className="min-h-screen bg-black text-cyan-50 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        .cyber-display { font-family: 'Orbitron', sans-serif; }
        .cyber-body { font-family: 'Rajdhani', sans-serif; }
        .neon-border { box-shadow: 0 0 10px rgba(6, 182, 212, 0.5), inset 0 0 10px rgba(6, 182, 212, 0.2); border: 1px solid rgba(6, 182, 212, 0.5); }
        .neon-text { text-shadow: 0 0 5px rgba(6, 182, 212, 0.8); }
        .cyber-grid { background-image: linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px); background-size: 30px 30px; }
      `}</style>

            {/* Grid Background */}
            <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20 z-0"></div>

            {/* Header */}
            <header className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-cyan-500/30 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-cyan-400 rounded-sm animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
                        <h1 className="cyber-display text-xl md:text-2xl font-bold tracking-widest uppercase text-cyan-400">
                            {business.name}
                        </h1>
                    </div>
                    {waNumber && (
                        <a
                            href={waLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cyber-body uppercase tracking-widest flex items-center gap-2 bg-cyan-950/50 border border-cyan-500/50 text-cyan-400 text-xs font-bold px-5 py-2 hover:bg-cyan-500 hover:text-black transition-all duration-300"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            CONNECT
                        </a>
                    )}
                </div>
            </header>

            {/* Hero */}
            <section className="relative pt-40 pb-24 px-6 max-w-7xl mx-auto z-10 flex flex-col justify-center min-h-[80vh]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative">
                    {business.tagline && (
                        <div className="inline-block cyber-body border border-cyan-500/50 bg-cyan-950/30 text-cyan-300 px-4 py-1 uppercase tracking-[0.3em] text-xs mb-8">
              // SYS.INIT: {business.tagline}
                        </div>
                    )}

                    <h2 className="cyber-display text-5xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-700 leading-none mb-8 uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        {business.headline || business.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-6 cyber-body text-cyan-400 text-sm uppercase tracking-widest border-l-2 border-cyan-500 pl-4 mt-12">
                        {business.category && <span>[ CAT: {business.category} ]</span>}
                        {business.location && <span>[ LOC: {business.location} ]</span>}
                        <span>[ STATUS: ONLINE ]</span>
                    </div>
                </div>
            </section>

            {/* Core Systems (About/Vision/Mission) */}
            {(business.about || business.mission || business.vision) && (
                <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-cyan-900/50">
                    <div className="flex items-center gap-4 mb-16">
                        <h3 className="cyber-display text-3xl text-white uppercase tracking-wider">Core Systems</h3>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-12">
                            {business.about && (
                                <div className="neon-border bg-black/50 p-8 backdrop-blur-sm relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-20 opacity-50"></div>
                                    <h4 className="cyber-body text-cyan-400 text-lg uppercase tracking-widest mb-4 font-bold">// STORY.DAT</h4>
                                    <p className="cyber-body text-gray-300 text-lg leading-relaxed">{business.about}</p>
                                </div>
                            )}

                            {business.marketingDesc && (
                                <p className="cyber-display text-xl text-cyan-300 leading-relaxed italic border-l-4 border-cyan-500 pl-6 shadow-[inset_10px_0_20px_-10px_rgba(6,182,212,0.3)]">
                                    "{business.marketingDesc}"
                                </p>
                            )}
                        </div>

                        <div className="space-y-8">
                            {business.mission && (
                                <div className="border border-cyan-800 bg-cyan-950/20 p-8">
                                    <h4 className="cyber-body text-cyan-500 text-sm uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                                        <span className="w-2 h-2 bg-cyan-500"></span>
                                        DIRECTIVE: ALPHA (Mission)
                                    </h4>
                                    <p className="cyber-body text-gray-300 text-lg leading-relaxed">{business.mission}</p>
                                </div>
                            )}

                            {business.vision && (
                                <div className="border border-cyan-800 bg-cyan-950/20 p-8">
                                    <h4 className="cyber-body text-cyan-500 text-sm uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                                        <span className="w-2 h-2 bg-cyan-500"></span>
                                        DIRECTIVE: OMEGA (Vision)
                                    </h4>
                                    <p className="cyber-body text-gray-300 text-lg leading-relaxed">{business.vision}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Inventory Grid (Products) */}
            {products.length > 0 && (
                <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-cyan-900/50">
                    <div className="flex items-center gap-4 mb-16">
                        <h3 className="cyber-display text-3xl text-white uppercase tracking-wider">Inventory Protocol</h3>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                        <span className="cyber-body text-cyan-500 font-bold uppercase tracking-widest">{products.length} UNITS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group border border-cyan-900 bg-black hover:border-cyan-400 transition-colors duration-300 relative">
                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="aspect-[4/3] relative overflow-hidden bg-cyan-950/30 border-b border-cyan-900">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-cyan-700">
                                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                            </svg>
                                            <span className="cyber-body text-xs uppercase tracking-widest">NO IMAGE DATA</span>
                                        </div>
                                    )}
                                    {/* Glitch Overlay Effect on Hover */}
                                    <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>

                                <div className="p-6">
                                    <h4 className="cyber-display text-xl text-white mb-2 truncate neon-text">{product.name}</h4>
                                    {product.description && (
                                        <p className="cyber-body text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 h-10">{product.description}</p>
                                    )}

                                    <div className="flex items-end justify-between mt-4">
                                        <div>
                                            <span className="block cyber-body text-cyan-600 text-[10px] uppercase tracking-widest mb-1">CREDITS</span>
                                            <span className="cyber-display font-bold text-2xl text-cyan-300">{formatPrice(product.price)}</span>
                                        </div>

                                        <a
                                            href={`/store/${business.slug}/product/${product.id}`}
                                            className="cyber-body uppercase tracking-wider text-xs border border-cyan-500/50 bg-cyan-950/50 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] px-4 py-2 transition-all duration-300"
                                        >
                                            INITIALIZE
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Comm Link (Contact) */}
            <section className="py-24 px-6 max-w-3xl mx-auto relative z-10 border-t border-cyan-900/50">
                <div className="text-center mb-16">
                    <h3 className="cyber-display text-4xl text-white mb-4 uppercase tracking-widest neon-text">Comm_Link</h3>
                    <p className="cyber-body text-cyan-500 uppercase tracking-widest">Establish a direct connection</p>
                </div>

                <form className="neon-border bg-black/60 backdrop-blur-md p-8 sm:p-12 relative" onSubmit={(e) => { e.preventDefault(); alert("Transmission sent successfully."); }}>
                    <div className="grid gap-8">
                        <div className="relative group">
                            <input type="text" required className="w-full bg-transparent border-b-2 border-cyan-900 py-3 text-cyan-100 cyber-body text-lg focus:outline-none focus:border-cyan-400 transition-colors placeholder-transparent peer" placeholder="Designation" id="name" />
                            <label htmlFor="name" className="absolute left-0 -top-3.5 text-cyan-600 text-xs cyber-body uppercase tracking-widest peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-cyan-400 transition-all">Designation (Name)</label>
                        </div>

                        <div className="relative group">
                            <input type="email" required className="w-full bg-transparent border-b-2 border-cyan-900 py-3 text-cyan-100 cyber-body text-lg focus:outline-none focus:border-cyan-400 transition-colors placeholder-transparent peer" placeholder="Frequency" id="email" />
                            <label htmlFor="email" className="absolute left-0 -top-3.5 text-cyan-600 text-xs cyber-body uppercase tracking-widest peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-cyan-400 transition-all">Frequency (Email)</label>
                        </div>

                        <div className="relative group pt-4">
                            <textarea required rows={4} className="w-full bg-cyan-950/20 border-2 border-cyan-900 rounded-none p-4 text-cyan-100 cyber-body text-lg focus:outline-none focus:border-cyan-400 transition-colors resize-none placeholder-cyan-800" placeholder="Enter transmission data..."></textarea>
                        </div>

                        <button type="submit" className="w-full mt-4 cyber-display text-lg uppercase tracking-[0.2em] bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black py-4 transition-all duration-300 relative overflow-hidden group">
                            <span className="relative z-10 font-bold">Transmit Data</span>
                            <div className="absolute inset-0 bg-cyan-400 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
                        </button>
                    </div>
                </form>
            </section>

            {/* Footer */}
            <footer className="border-t border-cyan-900/50 bg-black py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="cyber-display text-xl text-cyan-600 font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                            {business.name}
                        </span>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="cyber-body text-cyan-800 text-xs uppercase tracking-[0.2em] mb-2">System Infrastructure Provided By</p>
                        <a href="/" className="cyber-display text-cyan-500 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all font-bold tracking-widest uppercase">
                            DukaanHai Network
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
