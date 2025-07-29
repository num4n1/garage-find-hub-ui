
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  Scissors, 
  Sparkles, 
  Wrench, 
  Car, 
  Shield, 
  Zap, 
  Settings,
  Layers,
  Paintbrush,
  Gauge 
} from "lucide-react";

const services = [
  { id: "Mechanical", name: "Mechanical", icon: Wrench },
  { id: "Wrapping", name: "Car Wrapping", icon: Layers },
  { id: "Electrical", name: "Electrical", icon: Zap },
  { id: "PPF", name: "PPF", icon: Car },
  { id: "Painting", name: "Auto Painting", icon: Paintbrush },
  { id: "Ceramic", name: "Ceramic", icon: Sparkles },
  { id: "Upholstery", name: "Upholstery", icon: Gauge },
  { id: "Tinting", name: "Window Tinting", icon: Shield },
];

interface ServiceTabsProps {
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
}

const ServiceTabs = ({ selectedService, onServiceSelect }: ServiceTabsProps) => {
  const handleServiceSelect = (serviceId: string) => {
    onServiceSelect(serviceId);
    // Smooth scroll to garage cards section
    setTimeout(() => {
    if (window.matchMedia("(max-width: 768px)").matches) {  // mobile breakpoint
      const garageSection = document.getElementById('garage-cards-section');
      if (garageSection) {
        garageSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, 100);
  };

  return (
    <div className="bg-white shadow-sm border-b border-blue-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
          Select a Service
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {services.map((service) => {
            const Icon = service.icon;
            const isSelected = selectedService === service.id;
            
            return (
              <Button
                key={service.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleServiceSelect(service.id)}
                className={`h-auto py-4 px-3 flex flex-col items-center space-y-2 transition-all duration-200 ${
                  isSelected 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105" 
                    : "border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium text-center leading-tight">
                  {service.name}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceTabs;
