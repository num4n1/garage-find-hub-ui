import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsVerified(!!user); // true if user exists
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      {isVerified ? (
        <Dashboard />
      ) : (
        <HeroSection onVerificationComplete={() => setIsVerified(true)} isVerified={false} />
      )}
    </div>
  );
};

export default Index;
