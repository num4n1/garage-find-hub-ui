
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeroSectionProps {
  onVerificationComplete: () => void;
  isVerified: boolean;
}

const HeroSection = ({ onVerificationComplete, isVerified }: HeroSectionProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { toast } = useToast();

  const handleSendCode = () => {
    if (phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    // Simulate SMS sending
    setTimeout(() => {
      setShowCodeInput(true);
      setIsVerifying(false);
      toast({
        title: "SMS Sent!",
        description: "Please check your phone for the verification code",
      });
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (verificationCode === "1234" || verificationCode.length === 4) {
      onVerificationComplete();
      toast({
        title: "Verified!",
        description: "Welcome to GarageFinder. You can now browse services.",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter the correct verification code",
        variant: "destructive",
      });
    }
  };

  if (isVerified) {
    return (
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <Shield className="h-12 w-12 mx-auto mb-4 text-blue-200" />
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
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <Shield className="h-16 w-16 mx-auto mb-6 text-blue-200" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Welcome to GarageFinder
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          Verify your phone number to access our network of trusted local garages
        </p>

        <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900 max-w-md mx-auto">
          {!showCodeInput ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 text-lg"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSendCode}
                disabled={isVerifying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                {isVerifying ? "Sending..." : "Send Verification Code"}
              </Button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  maxLength={4}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Code sent to {phoneNumber}
                </p>
              </div>
              <Button 
                onClick={handleVerifyCode}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                Verify & Continue
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowCodeInput(false)}
                className="w-full mt-2 text-blue-600"
              >
                Change Phone Number
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
