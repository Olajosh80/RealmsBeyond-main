'use client';

import React, { useState } from 'react';
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
    parent?: string;
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
        <div className="bg-gray-50 min-h-screen">
            <main className="p-6 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="font-heading text-3xl font-bold text-gray-900">Product Categories</h1>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 text-gray-900 placeholder-gray-400"
                            />
                        </div>
                    </div>
        
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add New Category Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Category</h2>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Crystals"
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rare-primary/50 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The name is how it appears on your site.</p>
                                    </div>
        
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                        <input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="e.g. crystals"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rare-primary/50 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The &quot;slug&quot; is the URL-friendly version of the name.</p>
                                    </div>
        
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                        <select
                                            value={parent}
                                            onChange={(e) => setParent(e.target.value)}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 text-gray-900"
                                        >
                                            <option value="">None</option>
                                            {categories.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Assign a parent term to create a hierarchy.</p>
                                    </div>
        
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 min-h-[100px] text-gray-900 placeholder-gray-400"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The description is not prominent by default; however, some themes may show it.</p>
                                    </div>
        
                                    <Button type="submit" variant="primary" className="w-full shadow-lg shadow-rare-primary/20">
                                        Add New Category
                                    </Button>
                                </form>
                            </div>
                        </div>
        
                        {/* Category List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold tracking-wider">
                                            <tr>
                                                <th className="p-4 w-10"><input type="checkbox" className="rounded bg-white border-gray-300" /></th>
                                                <th className="p-4">Name</th>
                                                <th className="p-4">Description</th>
                                                <th className="p-4">Slug</th>
                                                <th className="p-4 text-center">Count</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {categories.map(cat => (
                                                <tr key={cat._id} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="p-4"><input type="checkbox" className="rounded bg-white border-gray-300" /></td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-900 hover:text-rare-primary cursor-pointer transition-colors">{cat.name}</div>
                                                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                                            <button className="text-rare-primary hover:underline">Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-rare-primary hover:underline">Quick Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-600 hover:underline">Delete</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-gray-500 hover:text-gray-700 hover:underline">View</button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                                                    <td className="p-4 text-sm text-gray-500">{cat.slug}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-rare-primary hover:text-white transition-colors cursor-pointer">
                                                            {cat.count || 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {categories.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-500">
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
