'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function EditBlogPage() {
    const params = useParams();
    const id = params?.id as string;
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/blog/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch blog post');
                }
                const data = await res.json();
                setBlog(data);
            } catch (err: any) {
                console.error('Error fetching blog:', err);
                setError(err.message || 'Failed to load blog post');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlog();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-rare-primary" />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg m-6 border border-red-200">
                <p>{error || 'Blog post not found'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <BlogForm initialData={blog} isEditing />
        </div>
    );
}
