import { useState } from "react";
import { Wrench, Layers, Zap, Car, Paintbrush, Sparkles, Gauge, Shield, MapPin, MessageCircle, PhoneIncoming  } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE;

type ServiceId =
  | "Mechanical" | "Wrapping" | "Electrical" | "PPF"
  | "Painting"   | "Ceramic"  | "Upholstery" | "Tinting";

const SERVICES: { id: ServiceId; name: string; icon: any }[] = [
  { id: "Mechanical", name: "Mechanical", icon: Wrench },
  { id: "Wrapping",   name: "Car Wrapping", icon: Layers },
  { id: "Electrical", name: "Electrical", icon: Zap },
  { id: "PPF",        name: "PPF", icon: Car },
  { id: "Painting",   name: "Auto Painting", icon: Paintbrush },
  { id: "Ceramic",    name: "Ceramic", icon: Sparkles },
  { id: "Upholstery", name: "Upholstery", icon: Gauge },
  { id: "Tinting",    name: "Window Tinting", icon: Shield },
];

export default function Partner() {
  const { toast } = useToast();

  const [garageName, setGarageName] = useState("");
  const [services, setServices] = useState<ServiceId[]>([]);
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");

  const [opts, setOpts] = useState({
    pickupDrop: false,
    mobileService: false,
    emergency24h: false,
    insuranceClaims: false,
    freeEstimates: true,
    warrantyMonths: 6,
  });

  const [sending, setSending] = useState(false);

  const toggleService = (id: ServiceId) =>
    setServices(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const valid = () =>
    garageName.trim().length >= 2 &&
    services.length > 0 &&
    about.trim().length >= 10 &&
    /^\+?[0-9\s-()]{7,}$/.test(whatsapp || "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE) {
      toast({ title: "Not configured", description: "VITE_API_BASE is missing", variant: "destructive" });
      return;
    }
    if (!valid()) {
      toast({ title: "Missing details", description: "Fill name, services, about, and a valid WhatsApp.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/partner/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageName,
          services,
          about,
          location,
          whatsapp,
          website,
          instagram,
          options: opts,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.error || `HTTP ${res.status}`);
      toast({ title: "Thanks! ✅", description: "We’ll review and contact you shortly." });
      // reset minimal
      setGarageName(""); setServices([]); setAbout(""); setLocation(""); setWhatsapp("");
      setWebsite(""); setInstagram("");
    } catch (err: any) {
      toast({ title: "Submit failed", description: err?.message || "Please try again later.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="px-4 py-8 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Pitch / Info */}
          <div className="space-y-6 md:space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
                List your garage on YallaFinder
              </h1>
              <p className="text-base md:text-lg text-gray-700">
                Join drivers near you looking for trusted services. No lock-ins. Grow with verified leads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Direct WhatsApp Leads</h3>
                  <p className="text-gray-600 text-sm">Customers contact you instantly.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Targeted by Location</h3>
                  <p className="text-gray-600 text-sm">Show up for drivers nearby.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                  <PhoneIncoming className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Direct Calling</h3>
                  <p className="text-gray-600 text-sm">Call option Available.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-center lg:text-left">
              Apply to join
            </h2>

            <form className="space-y-5 md:space-y-6" onSubmit={submit}>
              <div>
                <Label htmlFor="gname">Garage name</Label>
                <Input id="gname" placeholder="e.g., Numan's Auto Repair"
                  className="mt-1 h-10 md:h-11"
                  value={garageName} onChange={e => setGarageName(e.target.value)} />
              </div>

              {/* Services multi-select */}
              <div>
                <Label>Services (pick all that apply)</Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICES.map(s => {
                    const Icon = s.icon;
                    const active = services.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        aria-pressed={active}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                          "transition-colors",
                          active ? "border-blue-600 bg-blue-50 text-blue-900" : "hover:bg-gray-50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {s.name}
                      </button>
                    );
                  })}
                </div>
                {services.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Select at least one.</p>
                )}
              </div>

              <div>
                <Label htmlFor="about">About your garage (mention specialties)</Label>
                <textarea
                  id="about"
                  className="w-full mt-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Tell drivers why they should pick you. E.g., German cars, hybrid diagnostics, same-day brakes, paint booth, etc."
                  value={about} onChange={e => setAbout(e.target.value)}
                />
              </div>

              {/* Contact & location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wa">WhatsApp number</Label>
                  <Input id="wa" type="tel" placeholder="+971 50 123 4567"
                    className="mt-1 h-10 md:h-11"
                    value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ig">Instagram (optional)</Label>
                  <Input id="ig" placeholder="@yourgarage"
                    className="mt-1 h-10 md:h-11"
                    value={instagram} onChange={e => setInstagram(e.target.value)} />
                </div>
              </div>

              {/* Extra options
              <div>
                <Label>Options</Label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox"
                      checked={opts.pickupDrop}
                      onChange={e => setOpts(o => ({ ...o, pickupDrop: e.target.checked }))} />
                    Pickup & drop-off
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox"
                      checked={opts.mobileService}
                      onChange={e => setOpts(o => ({ ...o, mobileService: e.target.checked }))} />
                    Mobile service
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox"
                      checked={opts.emergency24h}
                      onChange={e => setOpts(o => ({ ...o, emergency24h: e.target.checked }))} />
                    24h emergency
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox"
                      checked={opts.insuranceClaims}
                      onChange={e => setOpts(o => ({ ...o, insuranceClaims: e.target.checked }))} />
                    Accepts insurance claims
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox"
                      checked={opts.freeEstimates}
                      onChange={e => setOpts(o => ({ ...o, freeEstimates: e.target.checked }))} />
                    Free estimates
                  </label>
                  <div className="flex items-center gap-2">
                    <span>Warranty</span>
                    <Input
                      type="number"
                      min={0}
                      className="h-9 w-20"
                      value={opts.warrantyMonths}
                      onChange={e => setOpts(o => ({ ...o, warrantyMonths: Number(e.target.value || 0) }))}
                    />
                    <span>months</span>
                  </div>
                </div>
              </div> */}

              <Button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700 text-base md:text-lg py-3 md:py-3.5">
                {sending ? "Submitting..." : "Submit application"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
