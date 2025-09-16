import { Phone, MapPin, Menu, ScanSearch } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const linkClasses = (path: string) =>
    location.pathname === path
      ? "text-blue-900 font-bold"
      : "text-muted-foreground hover:text-blue-900 font-medium transition-colors";

  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <div className="h-6 w-6 text-white">
                <img
                  src="/assets/yallafinder_icon_favicon_32.svg"
                  alt="YallaFinder"
                  className="h-full w-full object-contain block"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
            <span className="text-xl font-bold text-blue-900">YallaFinder</span>
          </Link>

          {/* Desktop nav (centered) */}
          <nav className="hidden md:flex space-x-8 absolute left-1/2 -translate-x-1/2">
            <Link to="/" className={linkClasses("/")}>Home</Link>
            <Link to="/about" className={linkClasses("/about")}>About</Link>
            <Link to="/contact" className={linkClasses("/contact")}>Contact</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* REPLACED: 24/7 Support → CTA */}
            <Link to="/partner" className="hidden sm:block">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Own a garage?
              </Button>
            </Link>

            {/* Mobile menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-accent rounded-md transition-colors">
                    <Menu className="h-6 w-6 text-blue-900" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col space-y-6 mt-8">
                    <Link to="/" className={`text-lg ${linkClasses("/")}`}>Home</Link>
                    <Link to="/about" className={`text-lg ${linkClasses("/about")}`}>About</Link>
                    <Link to="/contact" className={`text-lg ${linkClasses("/contact")}`}>Contact</Link>
                    <Link to="/partner" className="pt-4 border-t border-border">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Own a garage?</Button>
                    </Link>
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
