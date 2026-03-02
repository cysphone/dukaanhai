'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-black">D</span>
                        </div>
                        <span className="text-white font-bold text-xl">DukaanHai</span>
                    </Link>
                    <h1 className="text-2xl font-black text-white mb-2">Reset Password</h1>
                    <p className="text-surface-400">Enter your registered Email or WhatsApp number</p>
                </div>

                <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
                    {success ? (
                        <div className="text-center animate-fade-in py-4">
                            <div className="text-5xl mb-4">📧</div>
                            <h2 className="text-xl font-bold text-green-500 mb-2">Reset Link Sent!</h2>
                            <p className="text-surface-300 text-sm mb-6">
                                If an account matches that information, a password reset link has been sent to your registered WhatsApp number.
                            </p>
                            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold text-sm">
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-surface-300 mb-2">Email or WhatsApp Number</label>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        placeholder="you@example.com or +91..."
                                        className="w-full bg-surface-950 border border-surface-700 text-white placeholder:text-surface-600 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                    />
                                    <p className="text-xs text-surface-500 mt-2">
                                        Note: A secure reset link will be sent directly to your registered WhatsApp number.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link href="/login" className="text-surface-400 hover:text-white text-sm font-semibold transition-colors">
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
