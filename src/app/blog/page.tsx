import Link from 'next/link';
import { blogPosts } from '@/content/blog/posts';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog Kiến Thức USDT & Tiền Điện Tử | giausdt.vn',
    description: 'Tổng hợp kiến thức về USDT, hướng dẫn mua bán an toàn và cập nhật tin tức thị trường tiền điện tử mới nhất tại Việt Nam.',
};

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <header className="mb-12">
                    <Link href="/" className="text-primary hover:underline mb-4 inline-block">
                        ← Quay lại trang chủ
                    </Link>
                    <h1 className="text-4xl font-bold text-foreground mb-4">Blog Kiến Thức</h1>
                    <p className="text-muted-foreground text-lg">
                        Cung cấp thông tin chính xác và hướng dẫn chi tiết về thị trường USDT tại Việt Nam.
                    </p>
                </header>

                <div className="grid gap-8">
                    {blogPosts.map((post) => (
                        <article key={post.slug} className="group border border-border rounded-2xl p-6 bg-white hover:shadow-md transition-shadow">
                            <span className="text-sm text-muted-foreground">{post.date}</span>
                            <h2 className="text-2xl font-bold mt-2 mb-3 group-hover:text-primary transition-colors">
                                <Link href={`/blog/${post.slug}`}>
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                                {post.excerpt}
                            </p>
                            <Link href={`/blog/${post.slug}`} className="text-primary font-bold inline-flex items-center">
                                Đọc thêm <span className="ml-1">→</span>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
