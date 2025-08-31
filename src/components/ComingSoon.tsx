import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

const LAUNCH_TS = Date.UTC(2025, 9, 1, 0, 0, 0); // Oct 1, 2025 (UTC)
const BYPASS_KEY = "yf_admin_bypass";
const API_BASE = import.meta.env.VITE_API_BASE; // e.g. https://...cloudfunctions.net/api

type Left = { days: number; hours: number; minutes: number; seconds: number };

export default function ComingSoon() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [left, setLeft] = useState<Left>(() => diff());

  // Admin UI
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminErr, setAdminErr] = useState("");

  function diff(): Left {
    const ms = Math.max(0, LAUNCH_TS - Date.now());
    const days = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);
    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const id = setInterval(() => setLeft(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const launched = useMemo(() => Date.now() >= LAUNCH_TS, []);

  const subscribe = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const norm = email.trim().toLowerCase();

      // Upsert into Firestore (doc id = email) — matches your screenshot's "Waitlist" (capital W)
      await setDoc(
        doc(db, "Waitlist", norm),
        {
          email: norm,
          createdAt: serverTimestamp(),
          notified: false,
        },
        { merge: true }
      );

      setEmail("");
      toast({
        title: "Subscribed!",
        description: "You’ll be notified the moment we launch.",
      });
    } catch (e: any) {
      // Most common cause is Firestore security rules blocking unauth writes
      const msg = e?.message?.includes("Missing or insufficient permissions")
        ? "Permissions error: update your Firestore rules to allow creating docs in the Waitlist collection."
        : e?.message ?? "Please try again.";
      toast({
        title: "Failed to subscribe",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const tryAdmin = async () => {
    setAdminErr("");
    try {
      const snap = await getDoc(doc(db, "Password", "Admin"));
      const expected = snap.exists()
        ? (snap.data() as any)?.password
        : undefined;
      if (!expected) throw new Error("Password not configured");

      if (adminPwd === expected) {
        localStorage.setItem(BYPASS_KEY, "1");
        window.location.reload();
      } else {
        setAdminErr("Incorrect password");
      }
    } catch (e: any) {
      setAdminErr(e?.message || "Failed to verify");
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background tuned to your logo blue (#2563eb ~ Tailwind blue-600) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#132347] to-[#0b1432]" />
      <div className="absolute -left-20 top-20 w-64 h-64 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute right-0 top-10 w-72 h-72 rounded-full bg-blue-400/30 blur-3xl" />
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[120vw] h-[50vh] bg-gradient-to-t from-blue-600/20 to-transparent rounded-t-[50%] blur-2xl" />

      {/* Admin (top-right) */}
      <div className="relative z-20">
        <div className="absolute top-4 right-4">
          {!adminOpen ? (
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur rounded-xl"
              onClick={() => setAdminOpen(true)}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/15 flex items-center gap-2">
              <Input
                type="password"
                value={adminPwd}
                onChange={(e) => setAdminPwd(e.target.value)}
                placeholder="Enter password"
                className="bg-white/80 text-gray-900 placeholder:text-gray-600 h-9"
                onKeyDown={(e) => e.key === "Enter" && tryAdmin()}
                autoFocus
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700 h-9"
                onClick={tryAdmin}
              >
                Go
              </Button>
              <Button
                variant="ghost"
                className="h-9 text-blue-100"
                onClick={() => setAdminOpen(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          {adminErr && (
            <div className="mt-2 text-xs text-red-300">{adminErr}</div>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-3xl text-center">
          {/* LOGO from /public/assets */}
          <div className="mx-auto mb-6 h-20 w-20">
            {/* Since it's in /public, reference by absolute path: */}
            <img
              src="/assets/yallafinder_logo_square.svg"
              alt="YallaFinder"
              className="h-full w-full object-contain block"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="text-sm md:text-base text-blue-200/90 mb-3">
            Something great is on the way
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.08em] mb-4">
            COMING&nbsp;SOON
          </h1>

          {!launched && (
            <div className="mt-4 mb-10 flex items-center justify-center gap-3 md:gap-4 font-medium">
              {[
                ["Days", left.days],
                ["Hours", left.hours],
                ["Mins", left.minutes],
                ["Secs", left.seconds],
              ].map(([label, val]) => (
                <div
                  key={label as string}
                  className="w-20 md:w-24 px-3 py-3 rounded-2xl bg-white/5 backdrop-blur border border-white/10"
                >
                  <div className="text-2xl md:text-3xl tabular-nums">
                    {String(val as number).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] md:text-xs text-blue-200/80 mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Waitlist */}
          <div className="mx-auto max-w-xl bg-white/5 backdrop-blur rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <Mail className="h-5 w-5 text-blue-200" />
              <p className="text-blue-100 text-sm md:text-base">
                Get notified the moment we launch.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/90 text-gray-900 placeholder:text-gray-500"
              />
              <Button
                onClick={subscribe}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Joining..." : "Notify me"}
              </Button>
            </div>
            <p className="text-xs text-blue-200/80 mt-3">
              No spam. Unsubscribe any time.
            </p>
          </div>

          <div className="mt-12 text-blue-200/80 text-xs">
            Launching on{" "}
            <span className="font-semibold">October 1st, 2025</span>
          </div>
        </div>
      </main>
    </div>
  );
}
