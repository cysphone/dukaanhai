'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

function MagicLinkContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center">
                <div className="text-6xl mb-4">🔗</div>
                <h2 className="text-2xl font-bold text-surface-900 mb-2">Invalid Access Link</h2>
                <p className="text-surface-600 mb-6">This link is missing a secure token.</p>
                <p className="text-sm text-surface-500">Please request a new link from WhatsApp by typing <span className="font-mono bg-surface-100 px-1 font-bold">DASHBOARD</span>.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong.');
            }

            setSuccess(true);

            // Auto-login logic using NextAuth
            // The token does not return the exact phone number directly here for security reasons,
            // but we inform the user to log in now with their phone number explicitly.
            setTimeout(() => {
                router.push('/login?message=password_set_success');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center animate-fade-in">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Password Set Successfully!</h2>
                <p className="text-surface-600 mb-6">Your dashboard access has been activated.</p>
                <p className="text-sm text-surface-500 mb-6">You can now always log in using your WhatsApp Number.</p>
                <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
                </div>
                <p className="text-xs text-surface-400 mt-4">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">🔐</div>
                <h1 className="text-2xl font-black text-surface-900">Secure Dashboard Access</h1>
                <p className="text-surface-600 mt-2">Create a password to activate your DukaanHai Dashboard account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-surface-700">New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        placeholder="Minimum 6 characters"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-surface-700">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        placeholder="Type password again"
                        disabled={loading}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? 'Activating Account...' : 'Set Password & Access Dashboard'}
                </button>
            </form>
        </div>
    );
}

export default function MagicLinkPage() {
    return (
        <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-surface-100 p-8 sm:p-10">
                <Suspense fallback={<div className="text-center font-medium text-surface-500">Loading secure link...</div>}>
                    <MagicLinkContent />
                </Suspense>
            </div>

            <div className="mt-8 text-center text-sm text-surface-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">
                    Return to DukaanHai Homepage
                </Link>
            </div>
        </div>
    );
}
