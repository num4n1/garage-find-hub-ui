import { useState, useEffect, useMemo, useRef } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Users, MousePointer, RefreshCw, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { db } from "@/lib/firebase";
import {
  collection, getDocs, query, where, Timestamp, orderBy,
  doc, getDoc
} from "firebase/firestore";

type Period = "week" | "month";
interface AnalyticsData { day: string; clicks: number; dateKey?: string; }
interface Garage { id: string; name: string; service: string; }

const SERVICES = ["Mechanical", "Wrapping", "Electrical", "PPF", "Painting", "Ceramic", "Upholstery", "Tinting"] as const;
const makeKey = (g: Garage) => `${g.service}|${g.id}`;
const parseKey = (key: string) => { const [service, id] = key.split("|"); return { service, id }; };

function startOfWeek(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate()-x.getDay()); return x; }
function startOfMonth(d = new Date()) { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x; }
function daysInMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }

const STORAGE_KEY = "yf_analytics_auth_ok";

const AdminAnalytics = () => {
  const { toast } = useToast();

  // ---------- auth gate ----------
  const [authorized, setAuthorized] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [pw, setPw] = useState("");
  const [checkingPw, setCheckingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const verifyPassword = async () => {
    setPwError("");
    setCheckingPw(true);
    try {
      const snap = await getDoc(doc(db, "Password", "Analytics"));
      const expected = snap.exists() ? (snap.data() as any)?.password : undefined;
      if (!expected) throw new Error("Password not configured");
      if (pw === expected) {
        localStorage.setItem(STORAGE_KEY, "1");
        setAuthorized(true);
        setPw("");
        toast({ title: "Access granted" });
      } else {
        setPwError("Incorrect password");
      }
    } catch (e: any) {
      setPwError(e?.message || "Failed to verify");
    } finally {
      setCheckingPw(false);
    }
  };

  const signOutGate = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthorized(false);
  };

  // ---------- analytics state ----------
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [garages, setGarages] = useState<Garage[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(false);
  const midnightTimer = useRef<number | null>(null);

  // fetch garages once (only when authorized)
  useEffect(() => {
    if (!authorized) return;
    (async () => {
      const list: Garage[] = [];
      for (const service of SERVICES) {
        const snap = await getDocs(collection(db, service));
        snap.forEach((docu) => {
          const data = docu.data() as any;
          list.push({ id: docu.id, name: data.name, service });
        });
      }
      list.sort((a,b)=> (a.name+a.service).localeCompare(b.name+b.service));
      setGarages(list);
      if (!selectedKey && list.length) setSelectedKey(makeKey(list[0]));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  const selectedGarage = useMemo(() => {
    if (!selectedKey) return undefined;
    const { id, service } = parseKey(selectedKey);
    return garages.find((g) => g.id === id && g.service === service);
  }, [selectedKey, garages]);

  const fetchAnalytics = async () => {
    if (!authorized || !selectedGarage) return;
    setLoading(true);
    try {
      const start = period === "week" ? startOfWeek() : startOfMonth();
      const col = collection(db, selectedGarage.service, selectedGarage.id, "analytics");
      const qy = query(col, where("timestamp", ">=", Timestamp.fromDate(start)), orderBy("timestamp","asc"));
      const snap = await getDocs(qy);

      const map: Record<string, number> = {};
      snap.forEach(d => {
        const dt = (d.data() as any).timestamp?.toDate?.();
        if (!dt) return;
        const key = dt.toISOString().slice(0,10);
        map[key] = (map[key] || 0) + 1;
      });

      const rows: AnalyticsData[] = [];
      if (period === "week") {
        const labels = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const s = startOfWeek();
        for (let i=0;i<7;i++){
          const d = new Date(s); d.setDate(s.getDate()+i);
          const key = d.toISOString().slice(0,10);
          rows.push({ day: labels[i], clicks: map[key] || 0, dateKey: key });
        }
      } else {
        const s = startOfMonth();
        const n = daysInMonth(s);
        for (let i=1;i<=n;i++){
          const d = new Date(s.getFullYear(), s.getMonth(), i);
          const key = d.toISOString().slice(0,10);
          rows.push({ day: String(i), clicks: map[key] || 0, dateKey: key });
        }
      }
      setAnalyticsData(rows);
    } finally {
      setLoading(false);
    }
  };

  // re-fetch when selection/period change (only when authorized)
  useEffect(() => { if (authorized) fetchAnalytics(); }, [authorized, selectedGarage, period]);

  // schedule a fetch at local midnight (only when authorized)
  useEffect(() => {
    if (!authorized) return;
    const scheduleMidnight = () => {
      if (midnightTimer.current) window.clearTimeout(midnightTimer.current);
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0,0,5,0);
      const ms = next.getTime() - now.getTime();
      midnightTimer.current = window.setTimeout(async () => {
        await fetchAnalytics();
        scheduleMidnight();
      }, ms);
    };
    scheduleMidnight();
    return () => { if (midnightTimer.current) window.clearTimeout(midnightTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, selectedGarage, period]);

  const totalClicks = analyticsData.reduce((s,r)=>s+r.clicks,0);
  const averageDaily = analyticsData.length ? Math.round(totalClicks/analyticsData.length) : 0;
  const selectedGarageName = selectedGarage ? selectedGarage.name : "All Garages";

  const exportCSV = () => {
    const header = ["Date","Label","Clicks"];
    const rows = analyticsData.map(r=>[r.dateKey ?? "", r.day, String(r.clicks)]);
    const csv = [header, ...rows].map(a=>a.map(x=>`"${x}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedGarageName.replace(/\s+/g,"_")}_${period}_analytics.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---------- AUTH SCREEN ----------
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-[#1E3A8A]">
                <Lock className="h-5 w-5 text-[#1E3A8A]" />
                Admin Analytics Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Enter the analytics password to view this dashboard.
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !checkingPw && verifyPassword()}
                />
                <Button disabled={checkingPw} onClick={verifyPassword} className="bg-[#2F6BFF] hover:bg-[#1E5BFF]">
                  {checkingPw ? "Checking..." : "Unlock"}
                </Button>
              </div>
              {pwError && <p className="mt-3 text-sm text-red-600">{pwError}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Admin Analytics Dashboard</h1>
            <p className="text-gray-600">
              {period === "week" ? "Weekly" : "Monthly"} click analytics for garage listings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" onClick={signOutGate} title="Lock dashboard">
              Sign out
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Garage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger className="w-full md:w-[420px]">
                <SelectValue placeholder="Choose a garage to view analytics" />
              </SelectTrigger>
              <SelectContent>
                {garages.map((g) => {
                  const value = makeKey(g);
                  return (
                    <SelectItem key={value} value={value}>
                      {g.name} - {g.service}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/** Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks ({period === "week" ? "7 Days" : "This Month"})
              </CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{analyticsData.reduce((s,r)=>s+r.clicks,0)}</div>
              <p className="text-xs text-muted-foreground">Manual or midnight refresh only</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {analyticsData.length ? Math.round(analyticsData.reduce((s,r)=>s+r.clicks,0)/analyticsData.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">clicks per day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">Today</div>
              <p className="text-xs text-muted-foreground">Auto at local 00:00</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {period === "week" ? `Daily Click Analytics - ${selectedGarageName}`
                                 : `Monthly Click Analytics - ${selectedGarageName}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="clicks" radius={[4,4,0,0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed {period === "week" ? "Daily" : "Monthly"} Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{period === "week" ? "Day" : "Date"}</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.map((r, i) => (
                  <TableRow key={r.dateKey ?? i}>
                    <TableCell className="font-medium">{r.day}</TableCell>
                    <TableCell>{r.clicks}</TableCell>
                    <TableCell>
                      <Badge
                        variant={r.clicks >= (analyticsData.length ? Math.round(analyticsData.reduce((s,t)=>s+t.clicks,0)/analyticsData.length) : 0) ? "default" : "secondary"}
                        className={r.clicks >= (analyticsData.length ? Math.round(analyticsData.reduce((s,t)=>s+t.clicks,0)/analyticsData.length) : 0) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      >
                        {r.clicks >= (analyticsData.length ? Math.round(analyticsData.reduce((s,t)=>s+t.clicks,0)/analyticsData.length) : 0) ? "Above Average" : "Below Average"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
