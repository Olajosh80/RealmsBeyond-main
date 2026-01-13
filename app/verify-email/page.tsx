'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { MdMarkEmailRead } from 'react-icons/md';

export default function VerifyEmailPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-rare-background">
                <Section background="gradient-soft" padding="lg" withTexture>
                    <div className="container mx-auto px-4 flex items-center justify-center min-h-[70vh]">
                        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-rare-primary/10 rounded-full text-rare-primary">
                                    <MdMarkEmailRead size={48} />
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-rare-primary">Check Your Email</h1>

                            <div className="space-y-4 text-rare-text">
                                <p>
                                    We've sent a verification link to your email address.
                                    Please check your inbox (and spam folder) to activate your account.
                                </p>
                                <p className="text-sm text-rare-text-light">
                                    Once verified, you'll be able to sign in and start exploring.
                                </p>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button href="/signin" variant="outline" className="min-w-[140px]">
                                    Back to Sign In
                                </Button>
                                <Button href="/" variant="ghost" className="min-w-[140px]">
                                    Go Home
                                </Button>
                            </div>
                        </div>
                    </div>
                </Section>
            </main>
            <Footer />
        </>
    );
}
