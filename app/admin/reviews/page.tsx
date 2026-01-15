'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FiSearch, FiStar, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

// Mock Data
const MOCK_REVIEWS = [
    { _id: '1', author: 'Jane Doe', product: 'Amethyst Cluster', rating: 5, content: 'Absolutely beautiful crystals! The energy is amazing.', status: 'pending', date: '2023-10-25' },
    { _id: '2', author: 'John Smith', product: 'Sage Bundle', rating: 4, content: 'Great quality, but took a while to arrive.', status: 'approved', date: '2023-10-24' },
    { _id: '3', author: 'Alice W.', product: 'Tarot Deck', rating: 5, content: 'The artwork is stunning. Highly recommend.', status: 'approved', date: '2023-10-23' },
];

export default function ReviewsPage() {
    const [reviews, setReviews] = useState(MOCK_REVIEWS);

    const handleApprove = (id: string) => {
        setReviews(reviews.map(r => r._id === id ? { ...r, status: 'approved' } : r));
    };

    const handleUnapprove = (id: string) => {
        setReviews(reviews.map(r => r._id === id ? { ...r, status: 'pending' } : r));
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this review?')) {
            setReviews(reviews.filter(r => r._id !== id));
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="p-6 lg:p-10">
                <div className="mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl text-rare-primary shadow-sm border border-gray-200">
                                <FiStar className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-gray-900">Reviews</h1>
                                <p className="text-gray-500 mt-1">Manage customer reviews and feedback.</p>
                            </div>
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rare-primary"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4 w-10"><input type="checkbox" className="rounded border-gray-300 bg-white text-rare-primary focus:ring-rare-primary" /></th>
                                        <th className="p-4 w-48 font-heading font-normal">Author</th>
                                        <th className="p-4 font-heading font-normal">Comment</th>
                                        <th className="p-4 w-32 font-heading font-normal">Rating</th>
                                        <th className="p-4 w-48 font-heading font-normal">In Response To</th>
                                        <th className="p-4 w-32 font-heading font-normal">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reviews.map(review => (
                                        <tr key={review._id} className={`group hover:bg-gray-50 transition-colors ${review.status === 'pending' ? 'bg-amber-50' : ''}`}>
                                            <td className="p-4"><input type="checkbox" className="rounded border-gray-300 bg-white text-rare-primary focus:ring-rare-primary" /></td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{review.author}</div>
                                                <div className="text-xs text-gray-500">user@example.com</div>
                                            </td>
                                            <td className="p-4 max-w-lg">
                                                <div className="text-sm text-gray-700 mb-2 font-body">{review.content}</div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs border-t border-gray-100 pt-2 mt-2">
                                                    {review.status === 'pending' ? (
                                                        <button onClick={() => handleApprove(review._id)} className="text-green-600 hover:underline font-bold">Approve</button>
                                                    ) : (
                                                        <button onClick={() => handleUnapprove(review._id)} className="text-amber-600 hover:underline">Unapprove</button>
                                                    )}
                                                    <span className="text-gray-300">|</span>
                                                    <button className="text-rare-primary hover:underline">Reply</button>
                                                    <span className="text-gray-300">|</span>
                                                    <button className="text-rare-primary hover:underline">Quick Edit</button>
                                                    <span className="text-gray-300">|</span>
                                                    <button onClick={() => handleDelete(review._id)} className="text-red-500 hover:text-red-600 hover:underline">Trash</button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar key={i} className={i < review.rating ? "fill-current" : "text-gray-300"} size={14} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <a href="#" className="text-rare-primary hover:underline font-medium text-sm">{review.product}</a>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {review.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
