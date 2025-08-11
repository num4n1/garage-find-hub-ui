
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="px-4 py-8 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Contact Info Section */}
          <div className="space-y-6 md:space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900 mb-4">Get in Touch</h1>
              <p className="text-base md:text-lg text-gray-700">
                Have questions about YallaFinder? We're here to help you connect with the best local garages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
              <div className="flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 md:p-3 rounded-lg flex-shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm md:text-base">24/7 Support</h3>
                  <p className="text-gray-600 text-sm md:text-base">+971 (56) 862-2370</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 md:p-3 rounded-lg flex-shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm md:text-base">Email Us</h3>
                  <p className="text-gray-600 text-sm md:text-base break-all">support@YallaFinder.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 md:p-3 rounded-lg flex-shrink-0">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm md:text-base">WhatsApp</h3>
                  <p className="text-gray-600 text-sm md:text-base">Quick response guaranteed</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 md:p-3 rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm md:text-base">Locations</h3>
                  <p className="text-gray-600 text-sm md:text-base">Serving garages nationwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-center lg:text-left">Send us a Message</h2>
            <form className="space-y-4 md:space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm md:text-base">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your full name" 
                  className="mt-1 h-10 md:h-11 text-sm md:text-base" 
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  className="mt-1 h-10 md:h-11 text-sm md:text-base" 
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm md:text-base">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+971-5X-XXX-XXXX" 
                  className="mt-1 h-10 md:h-11 text-sm md:text-base" 
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-sm md:text-base">Message</Label>
                <textarea 
                  id="message" 
                  placeholder="How can we help you?"
                  className="w-full mt-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
                  rows={4}
                />
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-base md:text-lg py-3 md:py-3.5 transition-colors">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
