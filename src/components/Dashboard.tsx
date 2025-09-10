import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import ServiceTabs from "./ServiceTabs";
import GarageCard from "./GarageCard";
import { fetchGaragesByService } from "@/lib/fetchGaragesByService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSessionSeed } from "@/lib/sessionShuffle";

const SLUG_TO_ID: Record<string, string> = {
  mechanical: "Mechanical",
  wrapping: "Wrapping",
  electrical: "Electrical",
  ppf: "PPF",
  painting: "Painting",
  ceramic: "Ceramic",
  upholstery: "Upholstery",
  tinting: "Tinting",
};

const ID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_ID).map(([slug, id]) => [id, slug])
);

const DEFAULT_SERVICE = "Mechanical";

const Dashboard = () => {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const navigate = useNavigate();

  // Initialize from sessionStorage then URL (URL wins if valid)
  const [selectedService, setSelectedService] = useState<string>(() => {
    return sessionStorage.getItem("yf_last_service") || DEFAULT_SERVICE;
  });

  const [isVerified, setIsVerified] = useState(false);
  const [garages, setGarages] = useState<any[]>([]);
  const [seed, setSeed] = useState<number | null>(null);

  // Sync selectedService with URL slug
  useEffect(() => {
    if (!serviceId) return;

    const fromUrl = SLUG_TO_ID[serviceId.toLowerCase()];
    if (!fromUrl) {
      navigate(`/services/${ID_TO_SLUG[DEFAULT_SERVICE]}`, { replace: true });
      return;
    }

    if (fromUrl !== selectedService) {
      setSelectedService(fromUrl);
      sessionStorage.setItem("yf_last_service", fromUrl);
    }
  }, [serviceId, navigate, selectedService]);

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsVerified(true);
        setSeed(getSessionSeed(user.uid));
      } else {
        setIsVerified(false);
        setSeed(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Data fetch
  useEffect(() => {
    if (isVerified && seed !== null) {
      fetchGaragesByService(selectedService, seed).then(setGarages);
    }
  }, [selectedService, isVerified, seed]);

  // Per-route title
  useEffect(() => {
    if (serviceId && SLUG_TO_ID[serviceId.toLowerCase()]) {
      document.title = `YallaFinder | ${SLUG_TO_ID[serviceId.toLowerCase()]}`;
    } else {
      document.title = "YallaFinder";
    }
  }, [serviceId]);

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    sessionStorage.setItem("yf_last_service", service);

    // Keep URL in sync if user clicks a tab while already on /services/:slug
    if (serviceId) {
      const slug = ID_TO_SLUG[service] || service.toLowerCase().replace(/\s+/g, "-");
      if (slug !== serviceId.toLowerCase()) {
        navigate(`/services/${slug}`);
      }
    }
  };

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
            onServiceSelect={handleServiceSelect}
          />

          <div id="garage-cards-section" className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-2">
                  Top Garages for {selectedService}
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
                    No garages found for this service. Try another category.
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
