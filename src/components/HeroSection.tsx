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
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {},
      }
    );
  }
  return window.recaptchaVerifier;
}

const HeroSection = ({
  onVerificationComplete,
  isVerified,
}: HeroSectionProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  // IMPORTANT: keep iso2 (country) separate from dial code
  const [countryIso2, setCountryIso2] = useState<CountryIso2>("ae"); // UAE
  const [countryCode, setCountryCode] = useState("971"); // dial code
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
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
  };

  const handleSendCode = async () => {
    if (!/^\d{7,15}$/.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter a valid phone number",
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
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        verifier
      );

      setConfirmationResult(confirmation);
      toast({
        title: "Code Sent!",
        description: `SMS sent to ${formattedNumber}`,
      });
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find the Perfect Garage for Your Car
          </h1>
          <p className="text-xl text-blue-100">
            Discover trusted local garages for all your automotive needs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white min-h-[100dvh] flex items-center justify-center px-4 py-8">
      {/* Center block; the 100dvh ensures true middle on mobile */}
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="space-y-8 sm:space-y-10">
          <ScanSearch className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto text-white" />
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Welcome to YallaFinder
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-md mx-auto leading-relaxed">
              Verify your phone number to access trusted garages
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-gray-900 max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
            {!confirmationResult ? (
              <div className="space-y-5">
                {/* Phone Number Input Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 text-left">
                    Phone Number
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    {/* Country Code Selector */}
                    <div className="flex-shrink-0">
                      <CountrySelector
                        selectedCountry={countryIso2}
                        onSelect={(country) => {
                          setCountryIso2(country.iso2 as CountryIso2);
                          setCountryCode(country.dialCode);
                        }}
                        buttonStyle={{
                          height: "44px",
                          minWidth: "75px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#374151",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                        }}
                        dropdownStyleProps={{
                          style: {
                            zIndex: 1000,
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            boxShadow:
                              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            maxHeight: "280px",
                            overflow: "auto",
                          },
                        }}
                      />
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex-1 relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="555XXXXXXX"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value.replace(/\D/g, ""))
                        }
                        className="pl-10 h-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Invisible reCAPTCHA anchor */}
                <div ref={recaptchaRef} id="recaptcha-container" />

                {/* Send Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleSendCode}
                    disabled={isSending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base font-semibold py-3 h-11 sm:h-12 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                  >
                    {isSending ? "Sending..." : "Send Verification Code"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 text-center">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ""))
                    }
                    className="text-center text-lg tracking-widest h-11 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    maxLength={6}
                  />
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={isVerifying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base font-semibold py-3 h-11 sm:h-12 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                  >
                    {isVerifying ? "Verifying..." : "Verify & Continue"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p className="text-blue-200 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Your privacy is protected. We only use your number for verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
