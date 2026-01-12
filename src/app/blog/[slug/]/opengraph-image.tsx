import { ImageResponse } from 'next/og';
import { blogPosts } from '@/content/blog/posts';

export const runtime = 'edge';

export const alt = 'Bài viết - GiaUSDT.vn';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
    const post = blogPosts.find((p) => p.slug === params.slug);
    const title = post?.title || 'Bài viết - GiaUSDT.vn';
    const displayTitle = title.length > 80 ? title.substring(0, 80) + '...' : title;

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(38, 161, 123, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 40%)',
                        zIndex: 0,
                    }}
                />

                {/* Content Container */}
                <div style={{ padding: '60px 80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', width: '100%', height: '100%', zIndex: 10 }}>
                    {/* Brand Tag */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 30,
                        background: 'linear-gradient(to right, #22d3ee, #26A17B)',
                        padding: '8px 16px',
                        borderRadius: 20,
                    }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>GIAUSDT.VN BLOG</span>
                    </div>

                    {/* Title */}
                    <div style={{
                        fontSize: 64,
                        fontWeight: 800,
                        background: 'linear-gradient(to bottom right, #1e293b, #334155)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        lineHeight: 1.1,
                        marginBottom: 20,
                        letterSpacing: '-0.02em',
                    }}>
                        {displayTitle}
                    </div>

                    {/* Author / Date */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginRight: 12,
                            fontWeight: 700,
                            color: '#26A17B',
                            border: '2px solid #e2e8f0'
                        }}>G</div>
                        <div style={{ color: '#64748b', fontSize: 20, fontWeight: 500 }}>
                            {post?.author || 'Giausdt Team'} • {post?.date || '2026'}
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 300, height: 300, background: 'linear-gradient(45deg, transparent 40%, rgba(38, 161, 123, 0.05) 100%)', borderRadius: '100% 0 0 0' }} />
            </div>
        ),
        {
            ...size,
        }
    );
}
