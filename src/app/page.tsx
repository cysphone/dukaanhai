import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">D</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">DukaanHai</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-surface-300 hover:text-white transition-colors font-medium text-sm px-4 py-2">
            Sign In
          </Link>
          <Link href="/register" className="bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-surface-900 border border-surface-800 text-brand-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse-slow" />
            WhatsApp-First AI Store Builder
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Apni Dukaan,<br />
            <span className="text-brand-400">Online Karo</span><br />
            <span className="text-surface-400 text-3xl md:text-5xl font-bold">WhatsApp pe baat karo</span>
          </h1>

          <p className="text-surface-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Just send a WhatsApp message. Our AI creates your complete online store — 
            with product catalog, AI content, and a professional website. No coding needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/20">
              Create Your Store Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://wa.me/+919999999999?text=Hi, I want to create my store on DukaanHai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-base px-8 py-3.5 rounded-2xl transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Setup via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">How it works</h2>
          <p className="text-surface-400 text-lg">Three steps to your online store</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: '💬',
              title: 'WhatsApp pe Message Karo',
              desc: 'Simply message our WhatsApp number. Our AI will ask you everything about your business.',
            },
            {
              step: '02',
              icon: '🤖',
              title: 'AI Website Banata Hai',
              desc: 'AI generates your complete store — professional design, product descriptions, and all content automatically.',
            },
            {
              step: '03',
              icon: '🚀',
              title: 'Share Karo & Sell Karo',
              desc: 'Get your unique store link instantly. Share it on WhatsApp, Instagram, wherever your customers are.',
            },
          ].map((item) => (
            <div key={item.step} className="bg-surface-900 border border-surface-800 rounded-2xl p-8 hover:border-brand-500/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <span className="text-4xl">{item.icon}</span>
                <span className="text-brand-500/40 font-black text-4xl font-mono">{item.step}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-surface-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-800 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Stores Created', value: '10,000+' },
            { label: 'Products Listed', value: '50,000+' },
            { label: 'Orders via WhatsApp', value: '1L+' },
            { label: 'Cities', value: '500+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-brand-400 mb-1">{stat.value}</div>
              <div className="text-surface-400 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Beautiful Templates</h2>
          <p className="text-surface-400 text-lg">Professional designs for every kind of business</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Minimal Artisan', tag: 'Clean & Elegant', color: 'from-stone-800 to-stone-900', accent: 'bg-amber-400' },
            { name: 'Bold Visual Brand', tag: 'Vibrant & Energetic', color: 'from-rose-900 to-orange-900', accent: 'bg-rose-400' },
            { name: 'Mobile Catalog', tag: 'WhatsApp-Optimized', color: 'from-emerald-900 to-teal-900', accent: 'bg-emerald-400' },
          ].map((t) => (
            <div key={t.name} className={`bg-gradient-to-br ${t.color} border border-surface-700 rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300`}>
              <div className={`${t.accent} w-10 h-1.5 rounded-full mb-4`} />
              <div className="h-32 bg-surface-950/30 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-surface-500 text-sm">Template Preview</span>
              </div>
              <h3 className="font-bold text-lg mb-1">{t.name}</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-950/40 text-surface-300`}>{t.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Aaj shuru karo, free mein</h2>
          <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of local sellers who are already selling online with DukaanHai. 
            No credit card required.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-lg px-10 py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl">
            Abhi Banao Apni Dukaan
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
            <span className="text-white font-black text-xs">D</span>
          </div>
          <span className="font-bold">DukaanHai</span>
        </div>
        <p className="text-surface-500 text-sm">© 2024 DukaanHai. Made with ❤️ for Indian sellers.</p>
        <div className="flex items-center gap-6 text-surface-500 text-sm">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
