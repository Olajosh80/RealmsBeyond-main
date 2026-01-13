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
        <div className="min-h-screen bg-rare-background flex flex-col">
            <Header />
            <main className="flex-grow p-6 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="font-heading text-3xl font-bold text-rare-primary">Product Categories</h1>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add New Category Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Category</h2>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Crystals"
                                            fullWidth
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The name is how it appears on your site.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                        <Input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="e.g. crystals"
                                            fullWidth
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The “slug” is the URL-friendly version of the name.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                        <select
                                            value={parent}
                                            onChange={(e) => setParent(e.target.value)}
                                            className="w-full p-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/20"
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
                                            className="w-full p-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/20 min-h-[100px]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The description is not prominent by default; however, some themes may show it.</p>
                                    </div>

                                    <Button type="submit" variant="primary" className="w-full">
                                        Add New Category
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Category List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                            <tr>
                                                <th className="p-4 w-10"><input type="checkbox" className="rounded" /></th>
                                                <th className="p-4">Name</th>
                                                <th className="p-4">Description</th>
                                                <th className="p-4">Slug</th>
                                                <th className="p-4 text-center">Count</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50/50">
                                            {categories.map(cat => (
                                                <tr key={cat._id} className="group hover:bg-white/40 transition-colors">
                                                    <td className="p-4"><input type="checkbox" className="rounded" /></td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-rare-primary hover:text-rare-secondary cursor-pointer">{cat.name}</div>
                                                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                                            <button className="text-rare-primary hover:underline">Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-rare-primary hover:underline">Quick Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 hover:underline">Delete</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-gray-500 hover:text-gray-800 hover:underline">View</button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">—</td>
                                                    <td className="p-4 text-sm text-gray-600">{cat.slug}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-white px-2 py-1 rounded border border-gray-200 text-xs font-bold text-rare-primary hover:bg-rare-primary hover:text-white transition-colors cursor-pointer">
                                                            {cat.count}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
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
