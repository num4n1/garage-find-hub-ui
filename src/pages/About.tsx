import { MapPin, Shield, Users, Phone, Facebook, Twitter, Instagram } from "lucide-react";
import { FaFacebookF } from "react-icons/fa";
import { SiTiktok, SiInstagram } from "react-icons/si";
import Header from "@/components/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="px-4 py-8 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content Section */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-blue-900">About YallaFinder</h1>
            </div>

            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
              YallaFinder is your trusted platform for discovering the best local car service garages.
              We connect car owners with professional garages offering specialized services like tinting,
              wrapping, detailing, painting, and more.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1 lg:text-lg">Verified Garages</h3>
                  <p className="text-sm lg:text-base text-gray-600">All garages are verified and trusted by our community</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Local Network</h3>
                  <p className="text-sm lg:text-base text-gray-600">Find garages in your area with specialized services</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Direct Contact</h3>
                  <p className="text-sm lg:text-base text-gray-600">Connect directly with garage owners via WhatsApp</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Easy Discovery</h3>
                  <p className="text-sm lg:text-base text-gray-600">Browse by service type to find exactly what you need</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="flex justify-center lg:justify-end order-2 lg:order-2">
            <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
              <img
                src="/assets/Nissan-Patrol-Image-AboutPage.png"
                alt="YallaFinder map icon"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer — compact, bigger icons (mobile-first) */}
<footer className="bg-transparent">
  <div className="max-w-6xl mx-auto px-6">
    <hr className="border-blue-200/60" />
    <div className="flex items-center justify-between py-4">
      <p className="text-xs md:text-sm text-gray-500">
        © {new Date().getFullYear()} YallaFinder. All rights reserved.
      </p>

      <div className="flex items-center gap-2">
  <a
    href="https://facebook.com"
    target="_blank"
    rel="noreferrer"
    aria-label="Facebook"
    className="h-9 w-9 md:h-12 md:w-12 rounded-full border border-blue-200/70 bg-white/70 backdrop-blur-sm hover:bg-white transition-colors flex items-center justify-center shadow-sm"
  >
    {/* F-only glyph → no circular badge */}
    <FaFacebookF className="text-blue-700 text-[16px] md:text-[24px] leading-none" />
  </a>

  <a
    href="https://www.tiktok.com/@yallafinder"
    target="_blank"
    rel="noreferrer"
    aria-label="TikTok"
    className="h-9 w-9 md:h-12 md:w-12 rounded-full border border-blue-200/70 bg-white/70 backdrop-blur-sm hover:bg-white transition-colors flex items-center justify-center shadow-sm"
  >
    <SiTiktok className="text-blue-700 text-[16px] md:text-[24px] leading-none" />
  </a>

  <a
    href="https://www.instagram.com/yalla.finder"
    target="_blank"
    rel="noreferrer"
    aria-label="Instagram"
    className="h-9 w-9 md:h-12 md:w-12 rounded-full border border-blue-200/70 bg-white/70 backdrop-blur-sm hover:bg-white transition-colors flex items-center justify-center shadow-sm"
  >
    <SiInstagram className="text-blue-700 text-[16px] md:text-[24px] leading-none" />
  </a>
</div>



    </div>
  </div>
</footer>


    </div>
  );
};

export default About;
