
import { Phone, MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">GarageFinder</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Contact
            </a>
          </nav>

          {/* Contact Info */}
          <div className="flex items-center space-x-2 text-blue-600">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:block text-sm font-medium">24/7 Support</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
