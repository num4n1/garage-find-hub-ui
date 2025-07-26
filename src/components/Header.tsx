
import { Phone, MapPin, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const linkClasses = (path: string) =>
    location.pathname === path
      ? "text-primary font-medium"
      : "text-muted-foreground hover:text-primary font-medium transition-colors";
  
  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">GarageFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className={linkClasses("/")}>
              Home
            </Link>
            <Link to="/about" className={linkClasses("/about")}>
              About
            </Link>
            <Link to="/contact" className={linkClasses("/contact")}>
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Contact Info */}
            <div className="hidden sm:flex items-center space-x-2 text-primary">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>

            {/* Mobile Menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-accent rounded-md transition-colors">
                    <Menu className="h-6 w-6 text-primary" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col space-y-6 mt-8">
                    <Link 
                      to="/" 
                      className={`text-lg ${linkClasses("/")}`}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/about" 
                      className={`text-lg ${linkClasses("/about")}`}
                    >
                      About
                    </Link>
                    <Link 
                      to="/contact" 
                      className={`text-lg ${linkClasses("/contact")}`}
                    >
                      Contact
                    </Link>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center space-x-2 text-primary">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm font-medium">24/7 Support</span>
                      </div>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
