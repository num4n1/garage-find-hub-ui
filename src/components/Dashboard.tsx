
import { useState } from "react";
import { useEffect } from "react";
import HeroSection from "./HeroSection";
import ServiceTabs from "./ServiceTabs";
import GarageCard from "./GarageCard";
import { fetchGaragesByService } from "@/lib/fetchGaragesByService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Dashboard = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [selectedService, setSelectedService] = useState("Detailing");
  const [garages, setGarages] = useState([]);

  // Keep user signed in across navigation
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch garages whenever service changes and user is verified
  useEffect(() => {
    if (isVerified) {
      fetchGaragesByService(selectedService).then(setGarages);
    }
  }, [selectedService, isVerified]);

  return (
    <div className="min-h-screen">
      <HeroSection 
        onVerificationComplete={() => setIsVerified(true)}
        isVerified={isVerified}
      />

      {isVerified && (
        <>
          <ServiceTabs 
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
          />

          <div id="garage-cards-section" className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-2">
                  Top Garages for {selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}
                </h2>
                <p className="text-gray-600">
                  Contact garages directly via WhatsApp or phone
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {garages.map((garage) => (
                  <GarageCard key={garage.id} garage={garage} service={selectedService} />
                ))}
              </div>

              {garages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No garages found for this service. Try another category!
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

