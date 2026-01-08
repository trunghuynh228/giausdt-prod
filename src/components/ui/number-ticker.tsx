
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
    value: number;
    from?: number;
    direction?: "up" | "down";
    delay?: number; // delay in seconds
    className?: string;
    decimalPlaces?: number;
    formatter?: (value: number) => string;
}

// Use useLayoutEffect in browser, useEffect in SSR to avoid warnings
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function NumberTicker({
    value,
    from = 0,
    direction = "up",
    delay = 0,
    className,
    decimalPlaces = 0,
    formatter,
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);

    // Format the initial value correctly
    const initialValue = from;
    const formattedInitialValue = formatter
        ? formatter(initialValue)
        : initialValue.toFixed(decimalPlaces);

    const [displayValue, setDisplayValue] = useState(formattedInitialValue);

    useIsomorphicLayoutEffect(() => {
        // If value is undefined or null, return
        if (value === undefined || value === null) return;

        const element = ref.current;
        if (!element) return;

        // Use a simple ease-out quadratic function for smooth animation
        const easeOutQuad = (t: number, b: number, c: number, d: number) => {
            t /= d;
            return -c * t * (t - 2) + b;
        };

        const duration = 1500; // Animation duration in ms
        const startValue = from;
        const endValue = value;
        const change = endValue - startValue;

        // Function to start the animation
        const startAnimation = () => {
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;

                if (elapsed < duration) {
                    const rawValue = easeOutQuad(elapsed, startValue, change, duration);

                    if (formatter) {
                        element.textContent = formatter(rawValue);
                    } else {
                        element.textContent = rawValue.toFixed(decimalPlaces);
                    }

                    requestAnimationFrame(animate);
                } else {
                    // Ensure we land exactly on the final value
                    if (formatter) {
                        element.textContent = formatter(endValue);
                    } else {
                        element.textContent = endValue.toFixed(decimalPlaces);
                    }
                }
            };

            requestAnimationFrame(animate);
        };

        // If delay is provided, use setTimeout, otherwise start immediately
        if (delay > 0) {
            const timeoutId = setTimeout(startAnimation, delay * 1000);
            return () => clearTimeout(timeoutId);
        } else {
            startAnimation();
        }
    }, [value, from, direction, delay, decimalPlaces, formatter]);

    return (
        <span
            ref={ref}
            className={cn("inline-block tabular-nums tracking-wider", className)}
        >
            {displayValue}
        </span>
    );
}
