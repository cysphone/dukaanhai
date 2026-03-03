import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SetPasswordForm from './SetPasswordForm';

export default async function MagicLinkPage({
    searchParams
}: {
    searchParams: { token?: string }
}) {
    const token = searchParams.token;

    if (!token) {
        return (
            <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-surface-100 p-8 sm:p-10 text-center">
                    <div className="text-6xl mb-4">🔗</div>
                    <h2 className="text-2xl font-bold text-surface-900 mb-2">Invalid Access Link</h2>
                    <p className="text-surface-600 mb-6">This link is missing a secure token.</p>
                    <p className="text-sm text-surface-500">Please request a new password reset link.</p>
                </div>
                <div className="mt-8 text-center text-sm text-surface-500">
                    <Link href="/" className="hover:text-brand-600 transition-colors">
                        Return to DukaanHai Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const loginToken = await prisma.loginToken.findUnique({
        where: { token },
    });

    if (!loginToken || loginToken.used || new Date() > loginToken.expiresAt) {
        return (
            <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-surface-100 p-8 sm:p-10 text-center">
                    <div className="text-6xl mb-4">⏱️</div>
                    <h2 className="text-2xl font-bold text-surface-900 mb-2">Link Expired or Used</h2>
                    <p className="text-surface-600 mb-6">This password reset link is no longer valid.</p>
                    <p className="text-sm text-surface-500">For security reasons, links expire after 5 minutes or once they have been used to set a password.</p>
                    <div className="mt-6">
                        <Link href="/forgot-password" className="inline-block bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-colors">
                            Request New Link
                        </Link>
                    </div>
                </div>
                <div className="mt-8 text-center text-sm text-surface-500">
                    <Link href="/" className="hover:text-brand-600 transition-colors">
                        Return to DukaanHai Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-surface-100 p-8 sm:p-10">
                <SetPasswordForm token={token} />
            </div>
            <div className="mt-8 text-center text-sm text-surface-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">
                    Return to DukaanHai Homepage
                </Link>
            </div>
        </div>
    );
}
