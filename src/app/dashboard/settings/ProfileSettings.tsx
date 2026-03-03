'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfileSettings() {
    const { data: session, update } = useSession();

    // Name state
    const [name, setName] = useState(session?.user?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);

    // OTP Flow State
    const [activeFlow, setActiveFlow] = useState<'PHONE' | 'EMAIL' | null>(null);
    const [target, setTarget] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'INPUT' | 'VERIFY'>('INPUT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userEmail = session?.user?.email?.startsWith('wa_') ? null : session?.user?.email;
    const userPhone = session?.user?.phoneNumber;

    const [localAddedPhone, setLocalAddedPhone] = useState<string | null>(null);
    const [localAddedEmail, setLocalAddedEmail] = useState<string | null>(null);

    const displayEmail = localAddedEmail || userEmail;
    const displayPhone = localAddedPhone || userPhone;

    const isWhatsappLogin = session?.user?.email?.startsWith('wa_');
    const missingPhone = !displayPhone;
    const missingEmail = !displayEmail;

    const handleSaveName = async () => {
        setIsSavingName(true);
        try {
            const res = await fetch('/api/profile/update-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                setIsEditingName(false);
                await update({ name }); // Update NextAuth session
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/profile/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeFlow, target }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStep('VERIFY');
        } catch (err: any) {
            setError(err.message || 'Failed to send code.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/profile/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeFlow, code }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Success
            if (activeFlow === 'PHONE') {
                setLocalAddedPhone(target);
                await update({ phoneNumber: target });
            } else {
                setLocalAddedEmail(target);
                await update({ email: target });
            }

            setActiveFlow(null);
            setStep('INPUT');
            setTarget('');
            setCode('');
        } catch (err: any) {
            setError(err.message || 'Invalid code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-8">
            <h2 className="font-bold text-surface-900 mb-6">Account Info</h2>

            <div className="space-y-6">
                {/* Name Field */}
                <div>
                    <label className="label">Name</label>
                    <div className="flex gap-2">
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={!isEditingName || isSavingName}
                            className={`input-field flex-1 ${!isEditingName ? 'bg-surface-50 text-surface-500' : 'bg-white text-surface-900'}`}
                        />
                        {!isEditingName ? (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="px-4 py-2 text-sm font-semibold text-brand-500 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveName}
                                    disabled={isSavingName}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isSavingName ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingName(false);
                                        setName(session?.user?.name || '');
                                    }}
                                    disabled={isSavingName}
                                    className="px-4 py-2 text-sm font-semibold text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Field */}
                <div>
                    <label className="label">Email Address</label>
                    {displayEmail ? (
                        <div className="flex items-center gap-2">
                            <input value={displayEmail} disabled className="input-field flex-1 bg-surface-50 text-surface-500" />
                            <span className="px-3 py-2 text-xs font-bold text-green-700 bg-green-100 rounded-lg whitespace-nowrap">✓ Verified</span>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={() => { setActiveFlow('EMAIL'); setStep('INPUT'); setError(''); }}
                                className="w-full py-4 px-4 border border-dashed border-surface-300 rounded-xl text-surface-500 font-medium hover:bg-surface-50 hover:text-brand-600 hover:border-brand-300 transition-all flex items-center justify-center gap-2"
                            >
                                <span>+ Add Email Address</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Phone Field */}
                <div>
                    <label className="label">WhatsApp Number</label>
                    {displayPhone ? (
                        <div className="flex items-center gap-2">
                            <input value={displayPhone} disabled className="input-field flex-1 bg-surface-50 text-surface-500" />
                            <span className="px-3 py-2 text-xs font-bold text-green-700 bg-green-100 rounded-lg whitespace-nowrap">✓ Verified</span>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={() => { setActiveFlow('PHONE'); setStep('INPUT'); setError(''); }}
                                className="w-full py-4 px-4 border border-dashed border-surface-300 rounded-xl text-surface-500 font-medium hover:bg-[#25D366]/10 hover:text-[#20bd5a] hover:border-[#25D366]/40 transition-all flex items-center justify-center gap-2"
                            >
                                <span>+ Add WhatsApp Number</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Dynamic OTP Flow Modal for Email/Phone */}
            {activeFlow && (
                <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-surface-900">
                                Secure Verification
                            </h3>
                            <button
                                onClick={() => { setActiveFlow(null); setTarget(''); setCode(''); }}
                                className="text-surface-400 hover:text-surface-700 p-2 font-bold text-lg leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 mb-6 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {step === 'INPUT' ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="label">
                                        {activeFlow === 'PHONE' ? 'WhatsApp Number' : 'Email Address'}
                                    </label>
                                    <input
                                        type={activeFlow === 'PHONE' ? 'tel' : 'email'}
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        placeholder={activeFlow === 'PHONE' ? '+919999999999' : 'you@example.com'}
                                        className="input-field w-full text-surface-900"
                                        required
                                        autoFocus
                                    />
                                    {activeFlow === 'PHONE' && (
                                        <p className="text-xs text-surface-400 mt-2 font-medium">Please include your country code (e.g., +91)</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-colors disabled:opacity-50 ${activeFlow === 'PHONE' ? 'bg-[#25D366] hover:bg-[#20bd5a]' : 'bg-brand-500 hover:bg-brand-600'}`}
                                >
                                    {loading ? 'Sending Code...' : `Send Code to ${activeFlow === 'PHONE' ? 'WhatsApp' : 'Email'}`}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <p className="text-sm text-surface-600 mb-6 bg-surface-50 p-3 rounded-lg border border-surface-100">
                                    We sent a 6-digit code to <span className="font-bold text-surface-900 block mt-1">{target}</span>
                                </p>
                                <div>
                                    <label className="label">Verification Code</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="• • • • • •"
                                        className="input-field w-full text-center tracking-[1em] font-mono text-xl text-surface-900"
                                        maxLength={6}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || code.length !== 6}
                                    className="w-full btn-primary py-3.5 rounded-xl disabled:opacity-50 mt-2"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Save'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
