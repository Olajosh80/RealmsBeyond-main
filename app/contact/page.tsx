'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: submissionError } = await supabase
                .from('contact_submissions')
                .insert([formData]);

            if (submissionError) throw submissionError;

            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
            });

            // Auto-hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            console.error('Contact form submission error:', err);
            setError(err.message || 'Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const contactDetails = [
        {
            icon: FiMapPin,
            title: 'Our Location',
            details: ['123 Business Avenue, Suite 100', 'New York, NY 10001'],
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            icon: FiPhone,
            title: 'Phone Number',
            details: ['+1 (234) 567-890', '+1 (234) 567-891'],
            color: 'bg-rare-accent/10',
            iconColor: 'text-rare-primary',
        },
        {
            icon: FiMail,
            title: 'Email Address',
            details: ['beyondrealmsltd@gmail.com', 'info@beyondrealms.com'],
            color: 'bg-green-50',
            iconColor: 'text-green-600',
        },
    ];

    return (
        <>
            <Header />

            <main className="min-h-screen">
                {/* Hero Section */}
                <Section background="gradient-blue" padding="lg" className="text-white text-center">
                    <div className="container">
                        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                            Get in Touch
                        </h1>
                        <p className="font-body text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
                            Have a question, feedback, or inquiry? We&apos;re here to help you transcend boundaries and build your realm.
                        </p>
                    </div>
                </Section>

                {/* Contact Content */}
                <Section background="white" padding="lg">
                    <div className="container">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                            {/* Left Column: Contact info cards */}
                            <div className="lg:col-span-1 space-y-6">
                                <div>
                                    <h2 className="font-heading text-3xl font-bold text-rare-primary mb-4">
                                        Contact Information
                                    </h2>
                                    <p className="font-body text-rare-text-light mb-8">
                                        Connect with our dedicated team of experts across multiple sectors.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {contactDetails.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`p-6 rounded-2xl border border-rare-border/10 transition-all hover:shadow-lg hover:-translate-y-1 ${item.color}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`p-3 rounded-xl bg-white shadow-sm ${item.iconColor}`}>
                                                    <item.icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-heading text-lg font-bold text-rare-primary mb-2">
                                                        {item.title}
                                                    </h3>
                                                    {item.details.map((detail, idx) => (
                                                        <p key={idx} className="font-body text-sm text-rare-text-light">
                                                            {detail}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Contact Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-rare-background/50 p-8 md:p-10 rounded-3xl border border-rare-border/20 shadow-sm relative overflow-hidden">
                                    {/* Subtle Texture/Pattern Background */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-rare-accent/5 rounded-full -mr-16 -mt-16 pointer-events-none" />

                                    <h2 className="font-heading text-3xl font-bold text-rare-primary mb-8 relative z-10">
                                        Send Us a Message
                                    </h2>

                                    {success ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                                <FiCheckCircle className="h-10 w-10 text-green-600" />
                                            </div>
                                            <h3 className="font-heading text-2xl font-bold text-rare-primary">Message Sent Successfully!</h3>
                                            <p className="font-body text-gray-600 max-w-md">
                                                Thank you for reaching out. Our team has received your message and will get back to you within 24-48 hours.
                                            </p>
                                            <Button onClick={() => setSuccess(false)} variant="primary" size="md">
                                                Send Another Message
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Your Name"
                                                    name="name"
                                                    placeholder="John Doe"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    fullWidth
                                                />
                                                <Input
                                                    label="Email Address"
                                                    type="email"
                                                    name="email"
                                                    placeholder="john@example.com"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    fullWidth
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Phone Number (Optional)"
                                                    name="phone"
                                                    placeholder="+1 (234) 567-890"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    fullWidth
                                                />
                                                <Input
                                                    label="Subject"
                                                    name="subject"
                                                    placeholder="General Inquiry"
                                                    required
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    fullWidth
                                                />
                                            </div>

                                            <Textarea
                                                label="Your Message"
                                                name="message"
                                                placeholder="Tell us about your project or inquiry..."
                                                required
                                                value={formData.message}
                                                onChange={handleChange}
                                                fullWidth
                                            />

                                            {error && (
                                                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 italic">
                                                    {error}
                                                </p>
                                            )}

                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    disabled={loading}
                                                    className="w-full md:w-auto min-w-[200px]"
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Sending...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <FiSend className="h-4 w-4" />
                                                            Send Message
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </Section>

                {/* Simple Map / Final CTA Placeholder Section */}
                <Section background="gradient-soft" padding="lg">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="font-heading text-3xl font-bold text-rare-primary mb-6">
                                Connect Across Every Industry
                            </h2>
                            <p className="font-body text-gray-600 mb-8">
                                Beyond Realms LTD is more than just a company; it&apos;s a global presence.
                                Whether you&apos;re interested in fashion, agriculture, technology, or trade,
                                we have specialists ready to discuss how we can build excellence together.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button href="/about" variant="outline" size="md">Our Story</Button>
                                <Button href="/divisions" variant="outline" size="md">Our Divisions</Button>
                            </div>
                        </div>
                    </div>
                </Section>
            </main>

            <Footer />
        </>
    );
}
