import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Users, MousePointer } from "lucide-react";

interface AnalyticsData {
  day: string;
  clicks: number;
}

interface Garage {
  id: string;
  name: string;
  service: string;
}

const AdminAnalytics = () => {
  const [selectedGarage, setSelectedGarage] = useState<string>("");
  const [garages] = useState<Garage[]>([
    { id: "1", name: "Bilal's Garage", service: "Polishing" },
    { id: "2", name: "Ahmed's Auto", service: "Oil Change" },
    { id: "3", name: "Hamza's Garage", service: "Tire Services" },
    { id: "4", name: "Ali's Workshop", service: "Car Wash" },
    { id: "5", name: "Hassan Motors", service: "General Repair" },
  ]);

  // Mock analytics data
  const [analyticsData] = useState<AnalyticsData[]>([
    { day: "Monday", clicks: 12 },
    { day: "Tuesday", clicks: 19 },
    { day: "Wednesday", clicks: 8 },
    { day: "Thursday", clicks: 15 },
    { day: "Friday", clicks: 22 },
    { day: "Saturday", clicks: 30 },
    { day: "Sunday", clicks: 18 },
  ]);

  const totalClicks = analyticsData.reduce((sum, data) => sum + data.clicks, 0);
  const averageDaily = Math.round(totalClicks / 7);
  const selectedGarageName = garages.find(g => g.id === selectedGarage)?.name || "All Garages";

  useEffect(() => {
    // Auto refresh logic - check if it's Sunday 11:59 PM
    const checkForRefresh = () => {
      const now = new Date();
      if (now.getDay() === 0 && now.getHours() === 23 && now.getMinutes() === 59) {
        // Refresh analytics data
        console.log("Auto-refreshing analytics data...");
      }
    };

    const interval = setInterval(checkForRefresh, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Admin Analytics Dashboard</h1>
          <p className="text-gray-600">Weekly click analytics for garage listings</p>
        </div>

        {/* Garage Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Garage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGarage} onValueChange={setSelectedGarage}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a garage to view analytics" />
              </SelectTrigger>
              <SelectContent>
                {garages.map((garage) => (
                  <SelectItem key={garage.id} value={garage.id}>
                    {garage.name} - {garage.service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedGarage && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks (7 Days)</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{totalClicks}</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{averageDaily}</div>
                  <p className="text-xs text-muted-foreground">
                    clicks per day
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">Today</div>
                  <p className="text-xs text-muted-foreground">
                    Auto-refresh: Sunday 11:59 PM
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Daily Click Analytics - {selectedGarageName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Table View */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Daily Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{data.day}</TableCell>
                        <TableCell>{data.clicks}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={data.clicks >= averageDaily ? "default" : "secondary"}
                            className={data.clicks >= averageDaily ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                          >
                            {data.clicks >= averageDaily ? "Above Average" : "Below Average"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;