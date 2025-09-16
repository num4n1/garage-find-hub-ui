// For Meta tracking
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Optional: add a type so TS is happy without a global .d.ts
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export default function TrackPageViews() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Fire Meta Pixel PageView on every SPA route change
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, search]);

  return null;
}
