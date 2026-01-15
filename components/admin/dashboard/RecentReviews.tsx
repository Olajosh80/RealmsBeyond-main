
'use client';

import React, { useEffect, useState } from 'react';
import { FiStar, FiMessageSquare } from 'react-icons/fi';

interface Review {
    _id: string;
    product_id: { name: string };
    rating: number;
    comment: string;
    user_id: { full_name: string };
    created_at: string;
}

export function RecentReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('/api/reviews?limit=3');
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Failed to fetch reviews', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
                <div className="h-6 w-1/3 bg-gray-100 rounded mb-6"></div>
                <div className="space-y-6">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-gray-50 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all hover:shadow-md duration-300">
            <h3 className="font-heading font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                Latest Reviews
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-body font-normal">{reviews.length} new</span>
            </h3>

            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0 group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-gray-900 group-hover:text-rare-primary transition-colors">{review.product_id?.name || 'Unknown Product'}</span>
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, starIndex) => (
                                        <FiStar key={starIndex} className={`w-3 h-3 ${starIndex < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 italic mb-2 line-clamp-2">&quot;{review.comment}&quot;</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-bold">- {review.user_id?.full_name || 'Anonymous'}</p>
                                <span className="text-[10px] text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                        <FiMessageSquare className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No reviews yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
