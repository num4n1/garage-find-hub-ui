
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Garage {
  id: string;
  name: string;
  description: string;
  rating: number;
  location: string;
  services: string[];
  whatsapp: string;
  specialties: string[];
}

interface GarageCardProps {
  garage: Garage;
}

const GarageCard = ({ garage }: GarageCardProps) => {
  const { toast } = useToast();

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Hi! I found your garage on GarageFinder and I'm interested in your services. Could you please provide more information?`);
    window.open(`https://wa.me/${garage.whatsapp}?text=${message}`, '_blank');
    
    // Log the contact attempt
    console.log(`User contacted ${garage.name} via WhatsApp`);
    toast({
      title: "Opening WhatsApp",
      description: `Connecting you with ${garage.name}`,
    });
  };

  const handlePhoneContact = () => {
    window.open(`tel:${garage.whatsapp}`, '_self');
    console.log(`User called ${garage.name}`);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 bg-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-blue-900">
            {garage.name}
          </CardTitle>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {garage.rating}
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {garage.location}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {garage.description}
        </p>

        {/* Specialties */}
        <div>
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Specialties:</h4>
          <div className="flex flex-wrap gap-1">
            {garage.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* All Services */}
        <div>
          <h4 className="text-sm font-semibold text-blue-800 mb-2">All Services:</h4>
          <div className="flex flex-wrap gap-1">
            {garage.services.map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-600">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex space-x-2 pt-3">
          <Button 
            onClick={handleWhatsAppContact}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button 
            onClick={handlePhoneContact}
            variant="outline" 
            className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GarageCard;
