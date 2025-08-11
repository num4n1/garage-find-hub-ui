import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ScanSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number | string;
    grecaptcha?: any;
  }
}

interface HeroSectionProps {
  onVerificationComplete: () => void;
  isVerified: boolean;
}

/** Create (or return existing) invisible reCAPTCHA */
function ensureRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {},
    });
  }
  return window.recaptchaVerifier;
}

const HeroSection = ({ onVerificationComplete, isVerified }: HeroSectionProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Render the invisible reCAPTCHA once on mount
  useEffect(() => {
    const init = async () => {
      try {
        const v = ensureRecaptcha();
        if (window.recaptchaWidgetId === undefined) {
          window.recaptchaWidgetId = await v.render();
        }
      } catch {
        // ignore; will be retried on send
      }
    };
    init();
  }, []);

  // Enter key handler (send or verify)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (!confirmationResult) {
          handleSendCode();
        } else {
          handleVerifyCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmationResult, phoneNumber, verificationCode]);

  const resetRecaptcha = () => {
    try {
      if (window.recaptchaWidgetId !== undefined && window.grecaptcha) {
        window.grecaptcha.reset(window.recaptchaWidgetId);
      }
    } catch {
      /* noop */
    }
    // force next call to recreate if needed
    // (not strictly necessary but helps if verifier got into a bad state)
    // delete window.recaptchaVerifier;
  };

  const handleSendCode = async () => {
    if (!/^\d{10,15}$/.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter a valid number incl. country code (e.g. 9715XXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const verifier = ensureRecaptcha();
      if (window.recaptchaWidgetId === undefined) {
        window.recaptchaWidgetId = await verifier.render();
      }

      const formattedNumber = `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, verifier);

      setConfirmationResult(confirmation);
      toast({ title: "Code Sent!", description: `SMS sent to ${formattedNumber}` });
    } catch (error: any) {
      resetRecaptcha();
      toast({
        title: "Failed to Send Code",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Enter the 6-digit code sent to your phone",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      await confirmationResult.confirm(verificationCode);
      toast({ title: "Verified", description: "You can now browse garages." });
      onVerificationComplete();
    } catch (err: any) {
      toast({
        title: "Incorrect Code",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <ScanSearch className="h-16 w-16 mx-auto mb-6 text-white" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find the Perfect Garage for Your Car</h1>
          <p className="text-xl text-blue-100">Discover trusted local garages for all your automotive needs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <ScanSearch className="h-20 w-20 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to YallaFinder</h1>
        <p className="text-xl text-blue-100 mb-8">Verify your phone number to access trusted garages</p>

        <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900 max-w-md mx-auto">
          {!confirmationResult ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative mb-6">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="9715XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 text-lg"
                />
              </div>

              {/* Invisible reCAPTCHA anchor */}
              <div ref={recaptchaRef} id="recaptcha-container" className="mb-4" />

              <Button
                onClick={handleSendCode}
                disabled={isSending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                {isSending ? "Sending..." : "Send Verification Code"}
              </Button>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-lg tracking-widest mb-4"
                maxLength={6}
              />
              <Button
                onClick={handleVerifyCode}
                disabled={isVerifying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </Button>
            </>
          )}
        </div>

        <p className="text-blue-200 text-sm mt-6">
          Your privacy is protected. We only use your number for verification.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
