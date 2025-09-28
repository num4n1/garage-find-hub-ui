import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FaWhatsapp } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE; // e.g. https://<region>-<proj>.cloudfunctions.net

const WA_PHONE = "971509834498"; // E.164 without '+'

const Contact = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [bot, setBot] = useState(""); // honeypot
  const [sending, setSending] = useState(false);

  // Build WhatsApp link using the current `message` state
  const WA_TEXT  = encodeURIComponent("Support message from YallaFinder.com\n\nSubject: YallaFinder Support\n\n");
  const waHref = `https://wa.me/${WA_PHONE}?text=${WA_TEXT}`;

  const validate = () => {
    if (bot) return false;
    if (!name || name.trim().length < 2) return false;
    if (!/^\S+@\S+\.\S+$/.test(email)) return false;
    if (!message || message.trim().length < 5) return false;
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE) {
      toast({
        title: "Not configured",
        description: "VITE_API_BASE is missing",
        variant: "destructive",
      });
      return;
    }
    if (!validate()) {
      toast({
        title: "Check your info",
        description: "Please fill in required fields correctly.",
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false)
        throw new Error(data?.error || `HTTP ${res.status}`);
      toast({
        title: "Message sent ✅",
        description: "We’ll get back to you soon.",
      });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      toast({
        title: "Send failed",
        description: err?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="px-4 py-8 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Contact Info Section */}
          <div className="space-y-6 md:space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
                Get in Touch
              </h1>
              <p className="text-base md:text-lg text-gray-700">
                Have questions about YallaFinder? We're here to help you connect
                with the best local garages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
              <div className="flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 md:p-3 rounded-lg flex-shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm md:text-base">
                    24/7 Support
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Coming soon!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 md:p-3 rounded-lg flex-shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm md:text-base">
                    Email Us
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base break-all">
                    support@yallafinder.com
                  </p>
                </div>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp — Quick response guaranteed"
                className="block"
              >
                <div
                  className="group flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm 
                             ring-1 ring-gray-200 hover:ring-[#25D366] focus:ring-[#25D366] 
                             transition-colors cursor-pointer"
                >
                  <div className="rounded-lg flex-shrink-0 p-2 md:p-3 bg-[#25D366]">
                    <FaWhatsapp className="h-5 w-5 md:h-6 md:w-6 text-white" aria-hidden="true" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-blue-900 text-sm md:text-base">WhatsApp Support</h3>
                      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] md:text-xs
                                       border-[#25D366]/40 bg-[#25D366]/10 text-[#1a9a53]">
                        <FaWhatsapp className="h-3 w-3" />
                        WhatsApp
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">Quick response guaranteed</p>
                  </div>
                </div>
              </a>

              <div className="flex items-center space-x-3 md:space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 md:p-3 rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm md:text-base">
                    Locations
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Serving garages nationwide
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-center lg:text-left">
              Send us a Message
            </h2>

            <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
              {/* Honeypot (hidden) */}
              <input
                type="text"
                value={bot}
                onChange={(e) => setBot(e.target.value)}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Name (required) */}
              <div>
                <Label htmlFor="name" className="text-sm md:text-base">
                  Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  className="mt-1 h-10 md:h-11 text-sm md:text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-required
                />
              </div>

              {/* Email (required) */}
              <div>
                <Label htmlFor="email" className="text-sm md:text-base">
                  Email <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 h-10 md:h-11 text-sm md:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm md:text-base">
                  Phone Number (optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 555 5555"
                  className="mt-1 h-10 md:h-11 text-sm md:text-base"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Message (required) */}
              <div>
                <Label htmlFor="message" className="text-sm md:text-base">
                  Message <span className="text-red-600">*</span>
                </Label>
                <textarea
                  id="message"
                  placeholder="How can we help you?"
                  className="w-full mt-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-required
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-base md:text-lg py-3 md:py-3.5 transition-colors"
              >
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
