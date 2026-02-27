'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [customDomain, setCustomDomain] = useState('');
  const [domainSaving, setDomainSaving] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your account and store settings</p>
      </div>

      {/* Account Info */}
      <div className="card p-8">
        <h2 className="font-bold text-surface-900 mb-6">Account Info</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input value={session?.user?.email || ''} disabled className="input-field bg-surface-50 text-surface-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="label">Name</label>
            <input value={session?.user?.name || ''} disabled className="input-field bg-surface-50 text-surface-500 cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Custom Domain */}
      <div className="card p-8">
        <h2 className="font-bold text-surface-900 mb-2">Custom Domain</h2>
        <p className="text-sm text-surface-500 mb-6">
          Connect your own domain to your store. E.g.: <span className="font-mono text-surface-700">shop.yourbrand.com</span>
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={customDomain}
            onChange={e => setCustomDomain(e.target.value)}
            placeholder="shop.yourbrand.com"
            className="input-field flex-1"
          />
          <button className="btn-secondary flex-shrink-0" disabled>
            Connect (Soon)
          </button>
        </div>
        <p className="text-xs text-surface-400 mt-2">Custom domain connection coming soon. Your store is available at yourslug.dukaanhai.com</p>
      </div>

      {/* WhatsApp */}
      <div className="card p-8">
        <h2 className="font-bold text-surface-900 mb-2">WhatsApp Bot</h2>
        <p className="text-sm text-surface-500 mb-6">
          Create and manage your store via WhatsApp. Send a message to our bot number to get started.
        </p>
        <a
          href="https://wa.me/+919999999999?text=Hi DukaanHai!"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-5 py-2.5 rounded-xl transition-all w-fit"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat on WhatsApp
        </a>
      </div>

      {/* Danger Zone */}
      <div className="card p-8 border-red-200">
        <h2 className="font-bold text-red-700 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-surface-900 text-sm">Sign Out</p>
            <p className="text-surface-500 text-xs">Sign out from your account</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
