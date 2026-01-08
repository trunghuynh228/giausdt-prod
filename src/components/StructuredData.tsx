import { ExchangeRate } from '@/types/rates';

interface StructuredDataProps {
    rate?: ExchangeRate;
}

export function StructuredData({ rate }: StructuredDataProps) {
    if (!rate) return null;

    // Giá User Mua vào (Ask Price) -> Hiển thị là giá "Offer" của chúng ta
    const currentPrice = rate.sell;

    // Create JSON-LD data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Tỷ giá USDT/VND Real-time",
        "description": "Cập nhật tỷ giá USDT hôm nay tại Việt Nam. Mua bán USDT giá rẻ, uy tín, nhanh chóng.",
        "image": "https://giausdt.vn/tether-logo.svg",
        "brand": {
            "@type": "Brand",
            "name": "GiaUSDT.vn"
        },
        "offers": {
            "@type": "Offer",
            "url": "https://giausdt.vn",
            "priceCurrency": "VND",
            "price": currentPrice,
            "priceValidUntil": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid for 24h (dynamic in real world, but okay for snapshot)
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "GiaUSDT"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
