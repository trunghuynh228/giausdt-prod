
"use client";

import Script from "next/script";
import { useEffect } from "react";

const GA_TRACKING_ID = "G-59EVHP5RM9";

export function GoogleAnalytics() {
    useEffect(() => {
        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Find the closest button or element with role="button"
            const button = target.closest("button") || target.closest('[role="button"]');

            if (!button) return;

            // Check if inside footer - we skip tracking for footer elements as requested
            if (button.closest("footer")) return;

            // Get meaningful text for the event name
            let buttonText =
                button.innerText ||
                button.getAttribute("aria-label") ||
                button.getAttribute("title") ||
                "unknown_button";

            // Clean up text: lowercase, replace non-alphanumeric with underscore, truncate
            const cleanName = buttonText
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "") // trim underscores
                .substring(0, 50); // limit length

            if (!cleanName) return;

            const eventName = `click_${cleanName}`;

            // Log for debugging
            if (process.env.NODE_ENV === "development") {
                console.log(`[GA] Tracked event: ${eventName}`, {
                    page_path: window.location.pathname,
                    button_text: buttonText,
                });
            }

            // Send to GA
            if (typeof window.gtag === "function") {
                window.gtag("event", eventName, {
                    event_category: "button_click",
                    event_label: buttonText,
                    page_path: window.location.pathname,
                });
            }
        };

        document.addEventListener("click", handleGlobalClick);

        return () => {
            document.removeEventListener("click", handleGlobalClick);
        };
    }, []);

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_TRACKING_ID}');
        `}
            </Script>
        </>
    );
}

// Add types for gtag
declare global {
    interface Window {
        gtag: (
            command: "config" | "event" | "js",
            targetId: string | Date,
            config?: Record<string, any>
        ) => void;
        dataLayer: any[];
    }
}
