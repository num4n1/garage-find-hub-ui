// For Google analytics tracking
import { useLocation } from "react-router-dom";
import { useLayoutEffect, useEffect } from "react";

function getTitle(pathname: string) {
  const m = pathname.match(/^\/services\/([^/]+)/);
  const slug = m?.[1]?.toLowerCase();
  const map: Record<string, string> = {
    mechanical: "Mechanical",
    wrapping: "Wrapping",
    electrical: "Electrical",
    ppf: "PPF",
    painting: "Auto Painting",
    ceramic: "Ceramic",
    upholstery: "Upholstery",
    tinting: "Window Tinting",
  };
  if (slug && map[slug]) return `YallaFinder | ${map[slug]}`;
  if (pathname === "/about") return "YallaFinder | About";
  if (pathname === "/contact") return "YallaFinder | Contact";
  if (pathname === "/adminanalytics") return "YallaFinder | Admin Analytics";
  if (pathname === "/partner") return "YallaFinder | Garage Partner";
  return "YallaFinder";
}

declare global { interface Window { gtag?: (...args:any[]) => void } }

export default function TitleAndGA() {
  const { pathname, search } = useLocation();

  // set title before paint so GA reads the new one
  useLayoutEffect(() => {
    document.title = getTitle(pathname);
  }, [pathname]);

  // send GA4 page_view on every route change
  useEffect(() => {
    const page_title = getTitle(pathname);
    const page_path = pathname + search;
    const page_location = window.location.href;

    window.gtag?.("event", "page_view", {
      page_title,
      page_path,
      page_location,
      // makes events appear in DebugView from localhost
      debug_mode: location.hostname === "localhost" || location.hostname === "127.0.0.1",
    });
  }, [pathname, search]);

  return null;
}
