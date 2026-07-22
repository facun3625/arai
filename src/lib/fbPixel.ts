declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
    }
}

export function trackPixelEvent(event: string, data?: Record<string, any>) {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    window.fbq("track", event, data);
}
