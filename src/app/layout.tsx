import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// We need to move the QueryClientProvider to a client component or use it here if we mark this as client?
// Layouts in Next.js 13+ app directory render on server by default.
// Context providers must be in a Client Component.
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
    title: "Giá USDT hôm nay | Tỷ giá USDT/VND theo thời gian thực - giausdt.vn",
    description: "Cập nhật tỷ giá USDT theo thời gian thực từ các sàn Binance, Remitano, Onus... So sánh giá mua bán USDT tốt nhất hôm nay.",
    icons: {
        icon: '/tether-logo.svg',
        shortcut: '/tether-logo.svg',
        apple: '/tether-logo.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>
                    <TooltipProvider>
                        {children}
                        <Toaster />
                        <Sonner />
                    </TooltipProvider>
                </Providers>
            </body>
        </html>
    );
}
