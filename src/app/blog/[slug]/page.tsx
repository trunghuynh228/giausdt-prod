import { blogPosts } from '@/content/blog/posts';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: { slug: string };
}

// Ensure all blog posts are pre-rendered for performance and SEO
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) return {};

    return {
        title: `${post.title} | giausdt.vn`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
    };
}

export default function BlogPostPage({ params }: Props) {
    const post = blogPosts.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <nav className="mb-8">
                    <Link href="/blog" className="text-primary hover:underline inline-flex items-center">
                        ← Tất cả bài viết
                    </Link>
                </nav>

                <article>
                    <header className="mb-10 text-center">
                        <span className="text-sm text-muted-foreground uppercase tracking-widest">{post.date}</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mt-4 leading-tight">
                            {post.title}
                        </h1>
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                G
                            </div>
                            <span className="text-sm font-medium">{post.author}</span>
                        </div>
                    </header>

                    <div
                        className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground hover:prose-a:text-primary transition-colors"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <footer className="mt-16 pt-8 border-t border-border">
                        <div className="bg-primary/5 rounded-2xl p-8 text-center">
                            <h3 className="text-xl font-bold mb-2">Bạn đang muốn mua USDT giá tốt nhất?</h3>
                            <p className="text-muted-foreground mb-6">
                                So sánh tỷ giá USDT/VND thời gian thực từ Binance, Bybit, OKX và more.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                            >
                                Xem bảng giá ngay
                            </Link>
                        </div>
                    </footer>
                </article>
            </div>
        </main>
    );
}
