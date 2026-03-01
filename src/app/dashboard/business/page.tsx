'use client';

import { useEffect, useState } from 'react';
import { getStoreUrl } from '@/lib/utils';

const CATEGORIES = [
  'Food & Beverages', 'Clothing & Fashion', 'Electronics', 'Home & Kitchen',
  'Health & Beauty', 'Grocery', 'Books & Stationery', 'Sports & Fitness',
  'Toys & Games', 'Jewelry', 'Handicrafts', 'Other'
];

const TEMPLATES = [
  { id: 'minimal', name: 'Minimal Artisan', desc: 'Clean and elegant', emoji: '🤍' },
  { id: 'bold', name: 'Bold Visual Brand', desc: 'Vibrant and energetic', emoji: '🔥' },
  { id: 'catalog', name: 'Mobile Catalog', desc: 'WhatsApp optimized', emoji: '📱' },
  { id: 'futuristic', name: 'Sci-Fi Cyber', desc: 'Neon and glowing', emoji: '🚀' },
  { id: 'elegant', name: 'Luxury Class', desc: 'Serif and smooth', emoji: '✨' },
  { id: 'playful', name: 'Fun Brutalist', desc: 'Vibrant and thick', emoji: '🎨' },
];

export default function BusinessPage() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', whatsappNumber: '', location: '', category: '', vision: '', mission: '', templateType: 'minimal',
  });

  useEffect(() => {
    fetch('/api/business/me')
      .then(r => r.json())
      .then(d => {
        if (d.business) {
          setBusiness(d.business);
          setForm({
            name: d.business.name || '',
            description: d.business.description || '',
            whatsappNumber: d.business.whatsappNumber || '',
            location: d.business.location || '',
            category: d.business.category || '',
            vision: d.business.vision || '',
            mission: d.business.mission || '',
            templateType: d.business.templateType || 'minimal',
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const method = business ? 'PUT' : 'POST';
    const url = business ? `/api/business/${business.id}` : '/api/business';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setBusiness(data.business);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleRegenerateAI = async () => {
    if (!business) return;
    setGenerating(true);
    const res = await fetch(`/api/business/${business.id}/regenerate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setBusiness({ ...business, ...data.content });
    }
    setGenerating(false);
  };

  if (loading) {
    return <div className="space-y-4 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface-200 rounded-xl" />)}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-surface-900">Business Info</h1>
        <p className="text-surface-500 mt-1">
          {business ? 'Update your business profile' : 'Create your business profile to get started'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">Business Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Sharma Kirana Store"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
              className="input-field"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Business Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Tell us about your business..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">WhatsApp Number</label>
            <input
              type="tel"
              value={form.whatsappNumber}
              onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="+91 98765 43210"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Location / City</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Lajpat Nagar, Delhi"
              className="input-field"
            />
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="label">Store Template</label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm({ ...form, templateType: t.id })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${form.templateType === t.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-surface-200 hover:border-surface-300'
                  }`}
              >
                <span className="text-2xl block mb-2">{t.emoji}</span>
                <span className="text-xs font-bold text-surface-800 block">{t.name}</span>
                <span className="text-xs text-surface-400">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : business ? 'Save Changes' : 'Create Business & Generate AI Content'}
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              ✓ Saved successfully
            </span>
          )}
        </div>
      </form>

      {/* AI Content Section */}
      {business && (
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-surface-900">AI Generated Content</h2>
              <p className="text-sm text-surface-500">Generated by Gemini AI for your store</p>
            </div>
            <button
              onClick={handleRegenerateAI}
              disabled={generating}
              className="btn-secondary text-sm"
            >
              {generating ? '⏳ Generating...' : '🤖 Regenerate'}
            </button>
          </div>

          <div className="space-y-5">
            {[
              { label: 'Headline', value: business.headline, icon: '💬' },
              { label: 'Tagline', value: business.tagline, icon: '✨' },
              { label: 'About', value: business.about, icon: '📖' },
              { label: 'Vision', value: business.vision, icon: '🚀' },
              { label: 'Mission', value: business.mission, icon: '🎯' },
              { label: 'Marketing Description', value: business.marketingDesc, icon: '📢' },
            ].map(item => item.value && (
              <div key={item.label}>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">
                  {item.icon} {item.label}
                </p>
                <p className="text-surface-800 bg-surface-50 px-4 py-3 rounded-xl text-sm leading-relaxed">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {business.slug && (
            <div className="mt-6 pt-6 border-t border-surface-100">
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Store URL</p>
              <a
                href={getStoreUrl(business.slug)}
                target="_blank"
                className="font-mono text-sm text-brand-600 hover:text-brand-700 transition-colors"
              >
                {getStoreUrl(business.slug)}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
