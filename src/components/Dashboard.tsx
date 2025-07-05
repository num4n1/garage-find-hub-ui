
import { useState } from "react";
import { useEffect } from "react";
import HeroSection from "./HeroSection";
import ServiceTabs from "./ServiceTabs";
import GarageCard from "./GarageCard";
import { fetchGaragesByService } from "@/lib/fetchGaragesByService";

// // Mock data for garages
// const mockGarages = {
//   tinting: [
//     {
//       id: "1",
//       name: "Crystal Clear Tinting",
//       description: "Professional window tinting with lifetime warranty. Specializing in ceramic and carbon films.",
//       rating: 4.8,
//       location: "Downtown Auto District",
//       services: ["Window Tinting", "Paint Protection", "Car Detailing"],
//       whatsapp: "1234567890",
//       specialties: ["Ceramic Tint", "Commercial Vehicles", "Lifetime Warranty"]
//     },
//     {
//       id: "2", 
//       name: "SolarShield Pro",
//       description: "Premium automotive tinting services with heat rejection technology.",
//       rating: 4.9,
//       location: "North Side Commercial",
//       services: ["Window Tinting", "Paint Protection", "Wrapping"],
//       whatsapp: "1234567891",
//       specialties: ["Heat Rejection", "UV Protection", "Custom Cuts"]
//     },
//     {
//       id: "3",
//       name: "TintMaster Express",
//       description: "Quick and reliable tinting services for all vehicle types.",
//       rating: 4.6,
//       location: "West End Plaza",
//       services: ["Window Tinting", "Headlight Tinting", "Tail Light Tinting"],
//       whatsapp: "1234567892",
//       specialties: ["Same Day Service", "Mobile Tinting", "Fleet Discounts"]
//     },
//     {
//       id: "4",
//       name: "Precision Tint Works",
//       description: "Expert installation with precision cutting and professional finish.",
//       rating: 4.7,
//       location: "Industrial Park",
//       services: ["Window Tinting", "Security Film", "Decorative Film"],
//       whatsapp: "1234567893",
//       specialties: ["Security Film", "Anti-Graffiti", "Privacy Tint"]
//     },
//     {
//       id: "5",
//       name: "Elite Window Films",
//       description: "High-end tinting solutions for luxury and exotic vehicles.",
//       rating: 5.0,
//       location: "Luxury Auto Row",
//       services: ["Window Tinting", "Paint Protection", "Ceramic Coating"],
//       whatsapp: "1234567894",
//       specialties: ["Luxury Vehicles", "Exotic Cars", "Custom Solutions"]
//     },
//     {
//       id: "6",
//       name: "AutoShade Specialists",
//       description: "Complete automotive tinting and sun protection services.",
//       rating: 4.5,
//       location: "Central Business District",
//       services: ["Window Tinting", "Sunroof Tinting", "Windshield Strips"],
//       whatsapp: "1234567895",
//       specialties: ["Sunroof Tinting", "Windshield Strips", "Custom Shades"]
//     },
//     {
//       id: "7",
//       name: "ClearVision Tinting",
//       description: "Professional tinting with focus on visibility and safety.",
//       rating: 4.4,
//       location: "Safety First Auto Center",
//       services: ["Window Tinting", "Safety Film", "Glare Reduction"],
//       whatsapp: "1234567896",
//       specialties: ["Safety Film", "Glare Reduction", "Legal Compliance"]
//     },
//     {
//       id: "8",
//       name: "Shadow Works Auto",
//       description: "Creative tinting solutions and custom automotive styling.",
//       rating: 4.8,
//       location: "Custom Auto District",
//       services: ["Window Tinting", "Custom Graphics", "Vehicle Wrapping"],
//       whatsapp: "1234567897",
//       specialties: ["Custom Graphics", "Artistic Designs", "Show Cars"]
//     }
//   ],
//   wrapping: [
//     {
//       id: "9",
//       name: "Wrap Artisans",
//       description: "Premium vehicle wrapping with custom designs and commercial branding.",
//       rating: 4.9,
//       location: "Creative Auto Hub",
//       services: ["Vehicle Wrapping", "Commercial Graphics", "Paint Protection"],
//       whatsapp: "1234567898",
//       specialties: ["Custom Designs", "Commercial Branding", "Color Changes"]
//     },
//     {
//       id: "10",
//       name: "Total Wrap Solutions",
//       description: "Complete vehicle transformation with high-quality vinyl wraps.",
//       rating: 4.7,
//       location: "Transform Auto Center",
//       services: ["Full Wraps", "Partial Wraps", "Chrome Delete"],
//       whatsapp: "1234567899",
//       specialties: ["Full Wraps", "Chrome Delete", "Matte Finishes"]
//     },
//     // Add more garage data for other services...
//   ],
//   detailing: [
//     {
//       id: "17",
//       name: "Pristine Auto Detailing",
//       description: "Full-service auto detailing with paint correction and ceramic coating.",
//       rating: 4.8,
//       location: "Premium Auto Care",
//       services: ["Auto Detailing", "Paint Correction", "Ceramic Coating"],
//       whatsapp: "1234567906",
//       specialties: ["Paint Correction", "Ceramic Coating", "Show Car Prep"]
//     },
//     // Add more detailing garages...
//   ],
//   painting: [
//     {
//       id: "25",
//       name: "ColorCraft Auto Paint",
//       description: "Professional automotive painting and collision repair services.",
//       rating: 4.6,
//       location: "Paint & Body Shop",
//       services: ["Auto Painting", "Collision Repair", "Custom Colors"],
//       whatsapp: "1234567914",
//       specialties: ["Custom Colors", "Collision Repair", "Frame Straightening"]
//     },
//     // Add more painting garages...
//   ],
//   mechanical: [
//     {
//       id: "33",
//       name: "Precision Mechanics",
//       description: "Expert mechanical repairs and maintenance for all vehicle types.",
//       rating: 4.7,
//       location: "Full Service Auto",
//       services: ["Engine Repair", "Transmission", "Brake Service"],
//       whatsapp: "1234567922",
//       specialties: ["Engine Diagnostics", "Transmission Repair", "Brake Systems"]
//     },
//     // Add more mechanical garages...
//   ],
//   bodywork: [
//     {
//       id: "41",
//       name: "Expert Body Works",
//       description: "Collision repair and bodywork specialists with insurance claims support.",
//       rating: 4.8,
//       location: "Collision Center",
//       services: ["Collision Repair", "Dent Removal", "Frame Alignment"],
//       whatsapp: "1234567930",
//       specialties: ["Collision Repair", "Insurance Claims", "Frame Alignment"]
//     },
//     // Add more bodywork garages...
//   ],
//   electrical: [
//     {
//       id: "49",
//       name: "Auto Electric Pro",
//       description: "Automotive electrical services and custom installations.",
//       rating: 4.5,
//       location: "Electric Auto Service",
//       services: ["Electrical Repair", "Audio Installation", "Lighting"],
//       whatsapp: "1234567938",
//       specialties: ["Audio Systems", "Custom Lighting", "Electrical Diagnostics"]
//     },
//     // Add more electrical garages...
//   ],
//   tuning: [
//     {
//       id: "57",
//       name: "Performance Tuning Co",
//       description: "Engine tuning and performance modifications for maximum power.",
//       rating: 4.9,
//       location: "Performance District",
//       services: ["Engine Tuning", "Turbo Installation", "ECU Mapping"],
//       whatsapp: "1234567946",
//       specialties: ["ECU Tuning", "Turbo Systems", "Performance Exhaust"]
//     },
//     // Add more tuning garages...
//   ]
// };

const Dashboard = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [selectedService, setSelectedService] = useState("Detailing");
  const [garages, setGarages] = useState([]);

  const handleVerificationComplete = () => {
    setIsVerified(true);
  };

  useEffect(() => {
    if (isVerified) {
      fetchGaragesByService(selectedService).then(setGarages);
    }
  }, [selectedService, isVerified]);
  

  return (
    <div className="min-h-screen">
      <HeroSection 
        onVerificationComplete={handleVerificationComplete}
        isVerified={isVerified}
      />
      
      {isVerified && (
        <>
          <ServiceTabs 
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
          />
          
          <div className="py-8 bg-gray-50">
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
                  <GarageCard key={garage.id} garage={garage} />
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
