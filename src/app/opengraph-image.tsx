import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'GiaUSDT.vn - Tỷ giá USDT/VND theo thời gian thực';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    color: 'white',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(56, 189, 248, 0.2) 0%, transparent 50%)',
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, zIndex: 10 }}>
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginRight: 20 }}
                    >
                        <circle cx="12" cy="12" r="12" fill="#26A17B" />
                        <path d="M12.9814 11.2371V7.93814H16.0962V5.56701H12.9814V3H10.9962V5.56701H7.90381V7.93814H10.9962V11.2483C7.57948 11.4589 5 12.3331 5 13.3643C5 14.5029 8.134 15.4412 12 15.4412C15.866 15.4412 19 14.5029 19 13.3643C19 12.3331 16.4205 11.4589 13.0038 11.2483H12.9814V11.2371ZM12 14.2887C9.35821 14.2887 7.04229 13.7854 6.34094 13.0368C7.04229 12.2881 9.35821 11.7849 12 11.7849C14.6418 11.7849 16.9577 12.2881 17.6591 13.0368C16.9577 13.7854 14.6418 14.2887 12 14.2887ZM17.7554 13.5654C17.2628 14.5499 14.8617 15.2289 12 15.2289C9.13829 15.2289 6.73715 14.5499 6.24463 13.5654C5.46112 13.3361 5 13.0336 5 12.7216V14.6667C5 15.8052 8.134 16.7436 12 16.7436C15.866 16.7436 19 15.8052 19 14.6667V12.7216C19 13.0336 18.5389 13.3361 17.7554 13.5654ZM17.7554 15.6892C17.2628 16.6737 14.8617 17.3526 12 17.3526C9.13829 17.3526 6.73715 16.6737 6.24463 15.6892C5.46112 15.4599 5 15.1574 5 14.8454V16.7904C5 17.929 8.134 18.8674 12 18.8674C15.866 18.8674 19 17.929 19 16.7904V14.8454C19 15.1574 18.5389 15.4599 17.7554 15.6892ZM17.7554 17.8129C17.2628 18.7974 14.8617 19.4764 12 19.4764C9.13829 19.4764 6.73715 18.7974 6.24463 17.8129C5.46112 17.5836 5 17.2811 5 16.9691V19C5 20.1386 8.134 21.077 12 21.077C15.866 21.077 19 20.1386 19 19V16.9691C19 17.2811 18.5389 17.5836 17.7554 17.8129Z" fill="white" />
                    </svg>
                    <div style={{ fontSize: 60, fontWeight: 900, background: 'linear-gradient(to right, #22d3ee, #26A17B)', backgroundClip: 'text', color: 'transparent' }}>
                        giausdt.vn
                    </div>
                </div>

                <div style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', maxWidth: '80%', lineHeight: 1.4, zIndex: 10 }}>
                    Tỷ Giá USDT/VND Theo Thời Gian Thực
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 40, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: 12 }}>
                        <span style={{ fontSize: 24, marginRight: 8 }}>🔥</span>
                        <span style={{ fontSize: 20 }}>So sánh 7+ sàn P2P</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: 12 }}>
                        <span style={{ fontSize: 24, marginRight: 8 }}>⚡</span>
                        <span style={{ fontSize: 20 }}>Cập nhật mỗi 30s</span>
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        fontSize: 18,
                        color: '#94a3b8',
                        zIndex: 10,
                    }}
                >
                    Holdstation Pay • Binance • Onramp • AlchemyPay • Bybit • MoonPay • OKX
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
