import Link from 'next/link';

export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 text-center">
      <div>
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="text-2xl font-black text-surface-900 mb-3">Store Not Found</h1>
        <p className="text-surface-500 mb-8">This store doesn't exist yet, or the link may be wrong.</p>
        <Link href="/" className="btn-primary">
          Create Your Own Store →
        </Link>
      </div>
    </div>
  );
}
