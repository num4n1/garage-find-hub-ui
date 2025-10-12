import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import "react-international-phone/style.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TitleAndGA from "@/hooks/TitleAndGA";
import TrackPageViews from "@/hooks/TrackPageViews";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import Partner from "@/pages/Partner";
import HeroSection from "@/components/HeroSection";
import ComingSoon from "@/components/ComingSoon";

const queryClient = new QueryClient();

// Launch date (UTC): Oct 10, 2025 00:00:00
const LAUNCH_TS = Date.UTC(2025, 10, 1, 0, 0, 0);
const BYPASS_KEY = "yf_admin_bypass";

function shouldShowComingSoon() {
  if (typeof window === "undefined") return true;
  const bypass = localStorage.getItem(BYPASS_KEY) === "1";
  return !bypass && Date.now() < LAUNCH_TS;
}

const App = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsVerified(!!user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="text-white text-center p-10">
        Checking authentication...
      </div>
    );
  }

  // Reusable element for "/" and "/services/:serviceId"
  const HomeElement = shouldShowComingSoon() ? (
    <ComingSoon />
  ) : isVerified ? (
    <Index />
  ) : (
    <HeroSection
      onVerificationComplete={() => setIsVerified(true)}
      isVerified={false}
    />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TrackPageViews />   {/* Meta Pixel route-change tracker */}
          <Routes>
            <Route path="/" element={HomeElement} />
            <Route path="/services/:serviceId" element={HomeElement} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/adminanalytics" element={<AdminAnalytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <TitleAndGA />   {/* GA4 route-change tracker */}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
