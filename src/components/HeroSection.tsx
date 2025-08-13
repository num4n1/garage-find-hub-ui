import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ScanSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { CountrySelector, type CountryIso2 } from "react-international-phone";
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

  // NEW: country selector state (UAE default)
  const [countryIso2, setCountryIso2] = useState<CountryIso2>("ae");
  const [countryCode, setCountryCode] = useState("971");

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
        /* ignore; will be retried on send */
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
  };

  const handleSendCode = async () => {
    // validate only the national part (no country code here)
    if (!/^\d{7,15}$/.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter your number without country code (e.g., 5XXXXXXXX).",
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

      const formattedNumber = `+${countryCode}${phoneNumber}`;
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

              {/* Country selector + phone input */}
              <div className="flex items-center gap-3 mb-6">
                {/* Country Code Selector (ISO2 in, sets dial code) */}
                <div className="flex-shrink-0">
                  <CountrySelector
                    selectedCountry={countryIso2}
                    onSelect={(country) => {
                      setCountryIso2(country.iso2 as CountryIso2);
                      setCountryCode(country.dialCode);
                    }}
                    buttonStyle={{
                      height: "44px",
                      minWidth: "80px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                    dropdownStyleProps={{
                      style: {
                        zIndex: 1000,
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        boxShadow:
                          "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                        maxHeight: "280px",
                        overflow: "auto",
                      },
                    }}
                  />
                </div>

                {/* National number only */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="5XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 text-lg"
                  />
                </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Verification Code</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
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
