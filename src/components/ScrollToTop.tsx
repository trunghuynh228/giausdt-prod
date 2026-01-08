"use client";

import { useEffect } from "react";

export function ScrollToTop() {
    useEffect(() => {
        // Disable browser's default scroll restoration
        if (typeof window !== "undefined" && window.history) {
            window.history.scrollRestoration = "manual";
        }

        // Force scroll to top
        window.scrollTo(0, 0);
    }, []);

    return null;
}
