'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

interface Tag {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    count: number;
}

// Mock Data
const MOCK_TAGS: Tag[] = [
    { _id: '1', name: 'Healing', slug: 'healing', count: 42, description: 'Products for healing' },
    { _id: '2', name: 'Meditation', slug: 'meditation', count: 28, description: 'Meditation aids' },
    { _id: '3', name: 'Protection', slug: 'protection', count: 15, description: 'Protection items' },
    { _id: '4', name: 'Love', slug: 'love', count: 35, description: 'Love related items' },
    { _id: '5', name: 'New Arrival', slug: 'new-arrival', count: 10, description: 'Newly arrived items' },
];

export default function ProductTagsPage() {
    const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const newTag: Tag = {
            _id: Math.random().toString(),
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            description,
            count: 0
        };
        setTags([...tags, newTag]);
        setName('');
        setSlug('');
        setDescription('');
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this tag?')) {
            setTags(tags.filter(t => t._id !== id));
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="p-6 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="font-heading text-3xl font-bold text-gray-900">Product Tags</h1>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search tags..."
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>
        
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add New Tag Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Tag</h2>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Healing"
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rare-primary/50 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The name is how it appears on your site.</p>
                                    </div>
        
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                        <input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="e.g. healing"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rare-primary/50 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The &quot;slug&quot; is the URL-friendly version of the name.</p>
                                    </div>
        
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rare-primary/50 min-h-[100px] text-gray-900 placeholder-gray-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">The description is not prominent by default; however, some themes may show it.</p>
                                    </div>
        
                                    <Button type="submit" variant="primary" className="w-full shadow-lg shadow-rare-primary/20">
                                        Add New Tag
                                    </Button>
                                </form>
                            </div>
                        </div>
        
                        {/* Tag List */}
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
                                            {tags.map(tag => (
                                                <tr key={tag._id} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="p-4"><input type="checkbox" className="rounded bg-white border-gray-300" /></td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-900 hover:text-rare-primary cursor-pointer transition-colors">{tag.name}</div>
                                                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                                            <button className="text-rare-primary hover:underline">Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-rare-primary hover:underline">Quick Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button onClick={() => handleDelete(tag._id)} className="text-red-500 hover:text-red-600 hover:underline">Delete</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-gray-500 hover:text-gray-700 hover:underline">View</button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{tag.description || '—'}</td>
                                                    <td className="p-4 text-sm text-gray-500">{tag.slug}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-rare-primary hover:text-white transition-colors cursor-pointer">
                                                            {tag.count || 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {tags.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                                        No tags found. Start by adding one.
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
