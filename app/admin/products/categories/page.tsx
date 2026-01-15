'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

// Mock Data
interface Category {
    _id: string;
    name: string;
    slug: string;
    count?: number;
    description?: string;
    parent?: any;
}

export default function ProductCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [parent, setParent] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/products/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/products/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug, parent: parent || null, description })
            });

            if (res.ok) {
                const data = await res.json();
                setCategories([...categories, data.category]);
                setName('');
                setSlug('');
                setParent('');
                setDescription('');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this category?')) {
            try {
                const res = await fetch(`/api/products/categories?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setCategories(categories.filter(c => c._id !== id));
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            <main className="flex-grow p-6 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="font-heading text-3xl font-bold text-white">Product Categories</h1>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 text-white placeholder-slate-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add New Category Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Add New Category</h2>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Crystals"
                                            required
                                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary/50 transition-all"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">The name is how it appears on your site.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
                                        <input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="e.g. crystals"
                                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary/50 transition-all"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">The “slug” is the URL-friendly version of the name.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Parent Category</label>
                                        <select
                                            value={parent}
                                            onChange={(e) => setParent(e.target.value)}
                                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 text-white"
                                        >
                                            <option value="">None</option>
                                            {categories.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1">Assign a parent term to create a hierarchy.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 min-h-[100px] text-white placeholder-slate-500"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">The description is not prominent by default; however, some themes may show it.</p>
                                    </div>

                                    <Button type="submit" variant="primary" className="w-full shadow-lg shadow-rare-primary/20">
                                        Add New Category
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Category List */}
                        <div className="lg:col-span-2">
                            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase text-slate-400 font-bold tracking-wider">
                                            <tr>
                                                <th className="p-4 w-10"><input type="checkbox" className="rounded bg-slate-700 border-slate-600" /></th>
                                                <th className="p-4">Name</th>
                                                <th className="p-4">Description</th>
                                                <th className="p-4">Slug</th>
                                                <th className="p-4 text-center">Count</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {categories.map(cat => (
                                                <tr key={cat._id} className="group hover:bg-slate-700/30 transition-colors">
                                                    <td className="p-4"><input type="checkbox" className="rounded bg-slate-700 border-slate-600" /></td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-white hover:text-rare-accent cursor-pointer transition-colors">{cat.name}</div>
                                                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                                            <button className="text-rare-accent hover:underline">Edit</button>
                                                            <span className="text-slate-600">|</span>
                                                            <button className="text-rare-accent hover:underline">Quick Edit</button>
                                                            <span className="text-slate-600">|</span>
                                                            <button onClick={() => handleDelete(cat._id)} className="text-red-400 hover:text-red-300 hover:underline">Delete</button>
                                                            <span className="text-slate-600">|</span>
                                                            <button className="text-slate-400 hover:text-slate-200 hover:underline">View</button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-400 max-w-xs truncate">{cat.description || '—'}</td>
                                                    <td className="p-4 text-sm text-slate-400">{cat.slug}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-slate-700 px-2 py-1 rounded border border-slate-600 text-xs font-bold text-slate-300 hover:bg-rare-primary hover:text-white transition-colors cursor-pointer">
                                                            {cat.count || 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {categories.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                                        No categories found. Start by adding one.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
