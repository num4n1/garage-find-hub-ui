
import { MapPin, Shield, Users, Phone } from "lucide-react";
import Header from "@/components/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="flex items-center justify-center px-4" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-blue-900">About GarageFinder</h1>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              GarageFinder is your trusted platform for discovering the best local car service garages. 
              We connect car owners with professional garages offering specialized services like tinting, 
              wrapping, detailing, painting, and more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Verified Garages</h3>
                  <p className="text-sm text-gray-600">All garages are verified and trusted by our community</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Local Network</h3>
                  <p className="text-sm text-gray-600">Find garages in your area with specialized services</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Direct Contact</h3>
                  <p className="text-sm text-gray-600">Connect directly with garage owners via WhatsApp</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Easy Discovery</h3>
                  <p className="text-sm text-gray-600">Browse by service type to find exactly what you need</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Professional garage workspace"
                className="rounded-2xl shadow-2xl w-full max-w-md h-80 object-cover"
              />
              <div className="absolute inset-0 bg-blue-600 bg-opacity-10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
