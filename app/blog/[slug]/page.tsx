import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import dbConnect from '@/lib/db';
import BlogPostModel from '@/lib/models/BlogPost';
import { Hero } from '@/components/ui/Hero';
import { Section } from '@/components/ui/Section';
import { FiCalendar, FiUser, FiClock, FiArrowLeft } from 'react-icons/fi';
import { MdLocalOffer as MdTag } from 'react-icons/md';
import Link from 'next/link';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    await dbConnect();
    const slug = (await params).slug;
    const post = await BlogPostModel.findOne({ slug, published: true }).lean();

    if (!post) {
        return {
            title: 'Blog Post Not Found',
        };
    }

    return {
        title: `${post.title} | Beyond Realms`,
        description: post.excerpt || post.content.substring(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.featured_image ? [post.featured_image] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    await dbConnect();
    const slug = (await params).slug;
    const post = await BlogPostModel.findOne({ slug, published: true }).lean();

    if (!post) {
        notFound();
    }

    // Parse JSON safe
    const postData = JSON.parse(JSON.stringify(post));

    return (
        <>
            <Header />
            <main>
                {/* Helper function to format date */}
                {/* Simple inline Hero or specific design */}
                <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-rare-secondary-darker">
                    {/* Background Image/Overlay */}
                    {postData.featured_image && (
                        <>
                            <div className="absolute inset-0 z-0">
                                <img src={postData.featured_image} alt="" className="w-full h-full object-cover opacity-30" />
                            </div>
                            <div className="absolute inset-0 z-0 bg-gradient-to-t from-rare-secondary-darker via-rare-secondary-darker/80 to-transparent"></div>
                        </>
                    )}

                    <div className="container relative z-10 max-w-4xl mx-auto px-6">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm font-medium">
                            <FiArrowLeft /> Back to Blog
                        </Link>

                        <div className="space-y-4">
                            <span className="inline-block px-3 py-1 bg-rare-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-md">
                                {postData.category || 'News'}
                            </span>

                            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight">
                                {postData.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <FiUser className="w-4 h-4" />
                                    </div>
                                    <span>{postData.author}</span>
                                </div>
                                {postData.published_at && (
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="w-4 h-4" />
                                        <span>{new Date(postData.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                )}
                                {/* 
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>5 min read</span>
                </div>
                */}
                            </div>
                        </div>
                    </div>
                </div>

                <Section background="default" padding="lg">
                    <div className="container max-w-3xl mx-auto">
                        <div className="prose prose-lg prose-headings:font-heading prose-headings:text-rare-primary prose-a:text-blue-600 hover:prose-a:text-blue-500 max-w-none">
                            {/* If users use Markdown or HTML, we should render accordingly. 
                    For now assuming plain text or simple HTML injected safely or handled by react. 
                    Ideally use a markdown renderer (like react-markdown). 
                    Here we'll just dump content with whitespace preserved if it's plain text,
                    or dangerouslySetInnerHTML if we trust admin input (common in simple CMS)
                */}
                            <div className="whitespace-pre-wrap font-body text-rare-text leading-relaxed">
                                {postData.content}
                            </div>
                        </div>

                        {/* Tags */}
                        {postData.tags && postData.tags.length > 0 && (
                            <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                                {postData.tags.map((tag: string) => (
                                    <span key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm">
                                        <MdTag className="w-3.5 h-3.5" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Section>
            </main>
            <Footer />
        </>
    );
}
