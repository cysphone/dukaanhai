'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatPrice, getStoreUrl } from '@/lib/utils';

interface DashboardData {
  business: {
    id: string;
    name: string;
    slug: string;
    templateType: string;
    headline: string;
    _count: { products: number };
  } | null;
  productCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/business/me')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const business = data?.business;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-surface-900">
          Namaste, {session?.user?.name?.split(' ')[0] || 'Seller'} 👋
        </h1>
        <p className="text-surface-500 mt-1">
          {business ? `Managing ${business.name}` : 'Get started by creating your business'}
        </p>
      </div>

      {!business ? (
        /* No business yet */
        <div className="card p-12 text-center">
          <div className="text-6xl mb-6">🏪</div>
          <h2 className="text-xl font-bold text-surface-900 mb-3">Apni Dukaan Banao!</h2>
          <p className="text-surface-500 mb-8 max-w-sm mx-auto">
            Create your business profile and we'll generate a beautiful online store with AI content automatically.
          </p>
          <Link href="/dashboard/business" className="btn-primary">
            Create Business Profile
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                label: 'Total Products',
                value: business._count?.products ?? 0,
                icon: '📦',
                href: '/dashboard/products',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                label: 'Store Template',
                value: business.templateType || 'minimal',
                icon: '🎨',
                href: '/dashboard/templates',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                label: 'Store Status',
                value: 'Live',
                icon: '🟢',
                href: `${getStoreUrl(business.slug)}`,
                color: 'bg-green-50 text-green-600',
                external: true,
              },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                target={stat.external ? '_blank' : undefined}
                className="card p-6 hover:shadow-md transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${stat.color} text-xl mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-sm font-semibold text-surface-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-surface-900 capitalize">{stat.value}</p>
              </Link>
            ))}
          </div>

          {/* Store link */}
          <div className="card p-6">
            <h3 className="font-bold text-surface-900 mb-4">Your Store Link</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 font-mono text-sm text-surface-700 truncate">
                {getStoreUrl(business.slug)}
              </div>
              <a
                href={getStoreUrl(business.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-shrink-0"
              >
                View Store
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="font-bold text-surface-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Add Product', href: '/dashboard/products', icon: '➕' },
                { label: 'Edit Business', href: '/dashboard/business', icon: '✏️' },
                { label: 'Change Template', href: '/dashboard/templates', icon: '🎨' },
                { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="card p-5 text-center hover:border-brand-300 hover:shadow-sm transition-all"
                >
                  <span className="text-2xl block mb-2">{action.icon}</span>
                  <span className="text-sm font-semibold text-surface-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* AI Content Preview */}
          {business.headline && (
            <div className="card p-6 bg-gradient-to-br from-brand-50 to-orange-50 border-brand-200">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-surface-900">AI Generated Content</h3>
                  <p className="text-sm text-surface-500">Your store content, powered by Gemini AI</p>
                </div>
              </div>
              <blockquote className="border-l-4 border-brand-400 pl-4 italic text-surface-700">
                "{business.headline}"
              </blockquote>
            </div>
          )}
        </>
      )}
    </div>
  );
}
