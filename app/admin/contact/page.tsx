'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Section } from '@/components/ui/Section';
import { FiMail, FiCalendar, FiUser, FiPhone } from 'react-icons/fi';

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
            <div className="min-h-screen flex items-center justify-center bg-rare-background">
                <div className="animate-spin h-8 w-8 border-2 border-rare-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rare-background flex flex-col">
            <Header />
            <main className="min-h-screen bg-rare-background">
                <Section background="gradient-soft" padding="lg">
                    <div className="container mx-auto">
                        <h1 className="font-heading text-4xl md:text-5xl font-normal text-rare-primary mb-8 ml-1">
                            Contact Submissions
                        </h1>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100">
                                {error}
                            </div>
                        )}

                        {submissions.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                                <p className="font-body text-lg text-rare-text-light">
                                    No submissions found.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {submissions.map((submission) => (
                                    <div
                                        key={submission._id}
                                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-rare-border/10"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                                            <div>
                                                <h3 className="font-heading text-xl font-bold text-rare-primary mb-2">
                                                    {submission.subject}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-rare-text-light">
                                                    <span className="flex items-center gap-1">
                                                        <FiUser className="h-4 w-4" /> {submission.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FiMail className="h-4 w-4" /> {submission.email}
                                                    </span>
                                                    {submission.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <FiPhone className="h-4 w-4" /> {submission.phone}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <FiCalendar className="h-4 w-4" />
                                                        {new Date(submission.created_at).toLocaleDateString()} {new Date(submission.created_at).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-rare-background/50 p-4 rounded-xl text-rare-text border border-rare-border/10">
                                            <p className="whitespace-pre-wrap font-body">{submission.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Section>
            </main>
            <Footer />
        </div>
    );
}
