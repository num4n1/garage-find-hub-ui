import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanSearch, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import logoUrl from "@/assets/yallafinder_logo_transparent.svg";

interface HeroSectionProps {
  onVerificationComplete: () => void;
  isVerified: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE; // e.g. https://us-central1-garagefinder-c36fa.cloudfunctions.net/api

const safeJson = async (res: Response) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { __raw: text }; }
};

const HeroSection = ({ onVerificationComplete, isVerified }: HeroSectionProps) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email.", variant: "destructive" });
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await safeJson(res);
      if (!res.ok || data?.ok === false) {
        const msg = data?.error || data?.__raw || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setSent(true);
      toast({ title: "Code sent!", description: `We emailed a 6-digit code to ${email}` });
    } catch (e: any) {
      toast({ title: "Send failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast({ title: "Invalid code", description: "Enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await safeJson(res);
      if (!res.ok || data?.ok === false) {
        const msg = data?.error || data?.__raw || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      await signInWithCustomToken(auth, data.customToken);
      toast({ title: "Verified", description: "You can now browse garages." });
      onVerificationComplete();
    } catch (e: any) {
      toast({ title: "Verification failed", description: e?.message || "Server error", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") (!sent ? handleSend() : handleVerify());
    };
    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [sent, email, code]);

  if (isVerified) {
    return (
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <ScanSearch className="h-16 w-16 mx-auto mb-6 text-white" />
          {/* <div className="mx-auto mb-6 h-20 w-20">
            <img
              src="/assets/yallafinder_logo_tight_square.svg"
              alt="YallaFinder"
              className="h-full w-full object-contain block"
              loading="eager"
              decoding="async"
            />
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find the Perfect Garage for Your Car</h1>
          <p className="text-xl text-blue-100">Discover trusted local garages for all your automotive needs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center mt-[-40px] sm:mt-0">
        {/* <ScanSearch className="h-20 w-20 mx-auto mb-6" /> */}
        <div className="mx-auto mb-6 h-20 w-20">
          <img
            src="/assets/yallafinder_logo_square.svg"
            alt="YallaFinder"
            className="h-full w-full object-contain block"
            loading="eager"
            decoding="async"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to YallaFinder</h1>
        <p className="text-xl text-blue-100 mb-8">Verify your email to access trusted garages</p>

        <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900 max-w-md mx-auto">
          {!sent ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative mb-6">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-lg"
                />
              </div>
              <Button onClick={handleSend} disabled={isSending} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                {isSending ? "Sending..." : "Send Verification Code"}
              </Button>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Verification Code</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest mb-4"
                maxLength={6}
              />
              <Button onClick={handleVerify} disabled={isVerifying} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </Button>
            </>
          )}
        </div>

        <p className="text-blue-200 text-sm mt-6">
          Your privacy is protected. We only use your email for verification.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
