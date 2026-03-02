'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminStats {
    totalUsers: number;
    totalBusinesses: number;
    users: Array<{
        id: string;
        name: string | null;
        email: string;
        createdAt: string;
        businesses: Array<{
            id: string;
            name: string;
            slug: string;
            whatsappNumber: string | null;
            createdAt: string;
            products: Array<{
                id: string;
                name: string;
                price: number;
                description: string | null;
                imageUrl: string | null;
            }>;
        }>;
    }>;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI State for Products
    const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ name: '', price: '', description: '' });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const loadStats = () => {
        setLoading(true);
        fetch('/api/admin/stats')
            .then(async (res) => {
                if (!res.ok) {
                    if (res.status === 403) throw new Error("Forbidden: You aren't an admin");
                    throw new Error('Failed to load stats');
                }
                return res.json();
            })
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (status === 'authenticated') {
            loadStats();
        }
    }, [status]);

    const handleDeleteBusiness = async (businessId: string, name: string) => {
        if (!confirm(`Are you absolutely sure you want to delete the business "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/businesses/${businessId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error("Failed to delete business");
            }

            alert('Business deleted successfully.');
            loadStats(); // Reload to refresh list
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (userId: string, name: string) => {
        if (!confirm(`Are you absolutely sure you want to completely delete the user "${name}"? This will delete ALL their stores and products. This action CANNOT be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete user");
            }

            alert('User deleted successfully.');
            loadStats(); // Reload to refresh list
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEditProductClick = (product: any) => {
        setEditingProduct(product.id);
        setEditForm({
            name: product.name,
            price: product.price.toString(),
            description: product.description || ''
        });
    };

    const handleSaveProduct = async (productId: string) => {
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editForm.name,
                    price: parseFloat(editForm.price),
                    description: editForm.description
                })
            });

            if (!res.ok) throw new Error("Failed to update product");

            setEditingProduct(null);
            loadStats();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteProduct = async (productId: string, name: string) => {
        if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

        try {
            const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete product");

            loadStats();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="max-w-6xl mx-auto py-12 px-4 space-y-6 animate-pulse">
                <div className="h-8 bg-surface-200 rounded-xl w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                    <div className="h-32 bg-surface-200 rounded-2xl" />
                    <div className="h-32 bg-surface-200 rounded-2xl" />
                </div>
                <div className="h-[400px] bg-surface-200 rounded-2xl mt-8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-3xl font-black text-surface-900 mb-2">Access Denied</h1>
                <p className="text-surface-600">{error}</p>
                <Link href="/" className="btn-primary mt-6 inline-block">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-surface-200 pb-5">
                <div>
                    <h1 className="text-3xl font-black text-surface-900">Admin Dashboard 👑</h1>
                    <p className="text-surface-500 mt-1">Manage users and sites across the platform.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="card p-6 border-brand-200 bg-brand-50 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-brand-600 mb-1">Total Users</p>
                        <p className="text-4xl font-black text-surface-900">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="text-4xl">👥</div>
                </div>
                <div className="card p-6 border-blue-200 bg-blue-50 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-blue-600 mb-1">Total Live Sites</p>
                        <p className="text-4xl font-black text-surface-900">{stats?.totalBusinesses || 0}</p>
                    </div>
                    <div className="text-4xl">🏪</div>
                </div>
            </div>

            {/* Users & Businesses Table */}
            <div className="card overflow-hidden">
                <div className="p-5 border-b border-surface-100 bg-surface-50">
                    <h2 className="text-xl font-bold text-surface-900">User Sites Directory</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-50 text-surface-500 text-sm border-b border-surface-200">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Stores</th>
                                <th className="p-4 font-semibold">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {stats?.users.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-50/50 transition-colors">
                                    <td className="p-4 align-top">
                                        <p className="font-bold text-surface-900">{user.name || 'No Name'}</p>
                                        <p className="text-sm text-surface-500 mb-2">{user.email}</p>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                            className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-semibold hover:bg-red-100 transition-colors"
                                        >
                                            Delete User
                                        </button>
                                    </td>
                                    <td className="p-4 align-top">
                                        {user.businesses.length === 0 ? (
                                            <span className="text-sm text-surface-400 italic">No stores created yet</span>
                                        ) : (
                                            <div className="space-y-4">
                                                {user.businesses.map(b => (
                                                    <div key={b.id} className="bg-white border border-surface-200 rounded-xl overflow-hidden">
                                                        <div className="p-3 text-sm flex sm:flex-row flex-col sm:items-center justify-between gap-3">
                                                            <div>
                                                                <p className="font-bold text-brand-600">{b.name} <span className="text-surface-400 font-normal text-xs ml-2">{b.products?.length || 0} Products</span></p>
                                                                <p className="text-surface-500 text-xs">Slug: <span className="font-mono bg-surface-100 px-1 py-0.5 rounded text-surface-700">{b.slug}</span></p>
                                                                {b.whatsappNumber && <p className="text-surface-500 text-xs mt-1">WA: {b.whatsappNumber}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <button
                                                                    onClick={() => setExpandedBusinessId(expandedBusinessId === b.id ? null : b.id)}
                                                                    className="px-3 py-1.5 bg-surface-100 text-surface-700 rounded-lg text-xs font-semibold hover:bg-surface-200 transition-colors"
                                                                >
                                                                    {expandedBusinessId === b.id ? 'Hide Products' : 'View Products'}
                                                                </button>
                                                                <a href={`/store/${b.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors text-center">
                                                                    View Store
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDeleteBusiness(b.id, b.name)}
                                                                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                                                                >
                                                                    Delete Store
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {expandedBusinessId === b.id && (
                                                            <div className="bg-surface-50 border-t border-surface-200 p-4">
                                                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Products Library</h4>
                                                                {b.products?.length === 0 ? (
                                                                    <p className="text-sm text-surface-500 italic">No products yet.</p>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {b.products.map(p => (
                                                                            <div key={p.id} className="bg-white border border-surface-200 rounded p-3 text-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                                                                {editingProduct === p.id ? (
                                                                                    <div className="flex-1 w-full space-y-2">
                                                                                        <input type="text" className="w-full text-sm border-surface-300 rounded" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                                                                                        <input type="number" className="w-full text-sm border-surface-300 rounded" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price" />
                                                                                        <textarea className="w-full text-sm border-surface-300 rounded" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" rows={2}></textarea>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex-1">
                                                                                        <p className="font-semibold text-surface-900">{p.name} <span className="text-brand-600 ml-2">₹{p.price}</span></p>
                                                                                        {p.description && <p className="text-xs text-surface-500 mt-1">{p.description}</p>}
                                                                                    </div>
                                                                                )}

                                                                                <div className="flex gap-2">
                                                                                    {editingProduct === p.id ? (
                                                                                        <>
                                                                                            <button onClick={() => handleSaveProduct(p.id)} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold">Save</button>
                                                                                            <button onClick={() => setEditingProduct(null)} className="px-3 py-1 bg-surface-200 text-surface-700 rounded text-xs font-semibold">Cancel</button>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <button onClick={() => handleEditProductClick(p)} className="px-3 py-1 bg-surface-100 text-surface-700 rounded text-xs font-semibold hover:bg-surface-200">Edit</button>
                                                                                            <button onClick={() => handleDeleteProduct(p.id, p.name)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-semibold hover:bg-red-100">Delete</button>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-top text-sm text-surface-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}

                            {stats?.users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-surface-500">
                                        No users found in the database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
