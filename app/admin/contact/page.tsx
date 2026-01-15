'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Header } from '@/components/layout/Header';
import { FiMail, FiCalendar, FiUser, FiPhone, FiMessageSquare } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface ContactSubmission {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    created_at: string;
}

export default function AdminContactPage() {
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!user || profile?.role !== 'admin') {
                router.push('/');
                return;
            }
            fetchSubmissions();
        }
    }, [user, profile, isLoading, router]);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/contact');
            if (!res.ok) throw new Error('Failed to fetch submissions');
            const data = await res.json();
            setSubmissions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-rare-primary" />
            </div>
        );
    }

    return (
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            <main className="flex-grow p-6 lg:p-10">
                <div className="mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-800 rounded-xl text-white shadow-sm border border-slate-700">
                            <FiMessageSquare className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-white">
                                Contact Submissions
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Messages from the contact form.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 text-red-300 p-4 rounded-xl mb-6 border border-red-800 flex items-center gap-2">
                            <div className="p-1 bg-red-900/40 rounded-full"><FiMessageSquare className="h-4 w-4" /></div>
                            {error}
                        </div>
                    )}

                    {submissions.length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-sm flex flex-col items-center">
                            <div className="h-16 w-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 text-slate-500">
                                <FiMessageSquare size={32} />
                            </div>
                            <p className="font-body text-lg text-slate-400">
                                No submissions found.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {submissions.map((submission) => (
                                <div
                                    key={submission._id}
                                    className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 hover:border-slate-500 transition-all"
                                >
                                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4 border-b border-slate-700/50 pb-4">
                                        <div>
                                            <h3 className="font-heading text-xl font-bold text-white mb-2 flex items-center gap-2">
                                                {submission.subject}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded">
                                                    <FiUser className="h-3 w-3 text-rare-primary" /> {submission.name}
                                                </span>
                                                <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded">
                                                    <FiMail className="h-3 w-3 text-rare-primary" /> {submission.email}
                                                </span>
                                                {submission.phone && (
                                                    <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded">
                                                        <FiPhone className="h-3 w-3 text-rare-primary" /> {submission.phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded">
                                                    <FiCalendar className="h-3 w-3 text-rare-primary" />
                                                    {new Date(submission.created_at).toLocaleDateString()} <span className="text-slate-600">|</span> {new Date(submission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/50 p-4 rounded-xl text-slate-300 border border-slate-700/50 leading-relaxed font-body">
                                        <p className="whitespace-pre-wrap">{submission.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
