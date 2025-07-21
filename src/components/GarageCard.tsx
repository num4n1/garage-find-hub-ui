import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

interface Garage {
  id: string;
  name: string;
  description: string;
  rating: number;
  location: string;
  services: string[];
  whatsapp: string;
  specialities: string[];
}

interface GarageCardProps {
  garage: Garage;
  service: string;
}

const GarageCard = ({ garage, service }: GarageCardProps) => {
  const { toast } = useToast();

  const logGarageClick = async (type: "whatsapp" | "call") => {
  try {
    await addDoc(
      collection(db, service, garage.id, "analytics"),  // 👈 now valid
      {
        type,
        timestamp: serverTimestamp(),
      }
    );
  } catch (err) {
    console.error("Failed to log click:", err);
  }
};


  const handleWhatsAppContact = () => {
    const intro = `Hi! I found your garage on GarageFinder and I'm interested in your services.`;
    const subject = `GarageFinder Inquiry`;
    const userMessage = prompt(
      "Enter your message or question for the garage:"
    );

    if (userMessage === null) return;

    const fullMessage = encodeURIComponent(
      `${intro}\n\nSubject: ${subject}\n\n${userMessage}`
    );
    window.open(
      `https://wa.me/${garage.whatsapp}?text=${fullMessage}`,
      "_blank"
    );

    toast({
      title: "Opening WhatsApp",
      description: `Connecting you with ${garage.name}`,
    });

    logGarageClick("whatsapp");
  };

  const handlePhoneContact = () => {
    window.open(`tel:${garage.whatsapp}`, "_self");
    logGarageClick("call");
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 bg-white h-full flex flex-col">
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

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-gray-700 text-sm leading-relaxed">
          {garage.description}
        </p>

        {/* specialities */}
        <div>
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            specialities:
          </h4>
          <div className="flex flex-wrap gap-1">
            {(garage.specialities || []).map((specialty, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-700"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* All Services */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            All Services:
          </h4>
          <div className="flex flex-wrap gap-1">
            {(garage.services || []).map((service, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-blue-200 text-blue-600"
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex space-x-2 pt-3 mt-auto">
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
