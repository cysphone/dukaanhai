'use client';

import { useEffect, useState } from 'react';

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal Artisan',
    desc: 'Clean, elegant design with generous whitespace. Perfect for artisans, boutiques, and premium products.',
    colors: ['#fafaf9', '#1c1917', '#f97316'],
    tag: 'Popular',
    preview: '🤍',
  },
  {
    id: 'bold',
    name: 'Bold Visual Brand',
    desc: 'High-impact visuals with bold typography. Ideal for fashion, food, and lifestyle brands.',
    colors: ['#1c1917', '#f97316', '#fbbf24'],
    tag: 'Trending',
    preview: '🔥',
  },
  {
    id: 'catalog',
    name: 'Mobile Catalog',
    desc: 'Grid-first product display optimized for mobile browsing and WhatsApp sharing.',
    colors: ['#f0fdf4', '#166534', '#22c55e'],
    tag: 'Mobile First',
    preview: '📱',
  },
];

export default function TemplatesPage() {
  const [business, setBusiness] = useState<any>(null);
  const [selected, setSelected] = useState('minimal');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/business/me')
      .then(r => r.json())
      .then(d => {
        if (d.business) {
          setBusiness(d.business);
          setSelected(d.business.templateType || 'minimal');
        }
      });
  }, []);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    const res = await fetch(`/api/business/${business.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateType: selected }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-surface-900">Templates</h1>
        <p className="text-surface-500 mt-1">Choose a design for your online store</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`card p-6 text-left transition-all hover:shadow-md ${
              selected === template.id
                ? 'border-2 border-brand-500 shadow-md bg-brand-50/30'
                : 'border border-surface-200 hover:border-surface-300'
            }`}
          >
            {/* Preview */}
            <div className="h-40 rounded-xl mb-5 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-surface-100 to-surface-200">
              <span className="text-6xl">{template.preview}</span>
              <div className="absolute top-3 right-3 flex gap-1.5">
                {template.colors.map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              {selected === template.id && (
                <div className="absolute inset-0 bg-brand-500/10 flex items-end justify-end p-3">
                  <div className="bg-brand-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">✓</div>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-surface-900">{template.name}</h3>
              <span className="badge bg-brand-100 text-brand-700 text-xs ml-2 flex-shrink-0">{template.tag}</span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed">{template.desc}</p>

            {business && (
              <a
                href={`/store/${business.slug}?template=${template.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="mt-4 text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Preview →
              </a>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !business}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Apply Template'}
        </button>
        {saved && <span className="text-green-600 text-sm font-semibold">✓ Template updated!</span>}
        {!business && <span className="text-surface-400 text-sm">Create a business first to apply templates</span>}
      </div>
    </div>
  );
}
