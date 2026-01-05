import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plane, 
  Users,
  MapPin,
  AlertTriangle,
  Calendar
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const TravelAnalyticsDashboard = () => {
  // Fetch travel analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['travel-analytics'],
    queryFn: async () => {
      // Simulierte Analytics-Daten (später durch echte DB-Abfragen ersetzen)
      return {
        totalCost: 48420,
        totalTrips: 12,
        averageCost: 4035,
        pendingApprovals: 5,
        highRiskTrips: 2,
        monthlyTrend: [
          { month: 'Jan', cost: 32000, trips: 8 },
          { month: 'Feb', cost: 45000, trips: 12 },
          { month: 'Mar', cost: 38000, trips: 10 },
          { month: 'Apr', cost: 52000, trips: 15 },
          { month: 'Mai', cost: 48420, trips: 12 },
        ],
        departmentBreakdown: [
          { department: 'Sales', cost: 18500, trips: 5, color: '#3B82F6' },
          { department: 'Marketing', cost: 12300, trips: 3, color: '#10B981' },
          { department: 'Engineering', cost: 8900, trips: 2, color: '#F59E0B' },
          { department: 'Executive', cost: 8720, trips: 2, color: '#EF4444' },
        ],
        destinationBreakdown: [
          { destination: 'Deutschland', trips: 4, cost: 8900 },
          { destination: 'Frankreich', trips: 3, cost: 12400 },
          { destination: 'USA', trips: 2, cost: 15200 },
          { destination: 'UK', trips: 2, cost: 8520 },
          { destination: 'Spanien', trips: 1, cost: 3400 },
        ],
        costBreakdown: [
          { category: 'Flüge', amount: 28540, percentage: 59 },
          { category: 'Hotels', amount: 15230, percentage: 31 },
          { category: 'Mietwagen', amount: 3420, percentage: 7 },
          { category: 'Sonstiges', amount: 1230, percentage: 3 },
        ]
      };
    }
  });

  if (isLoading || !analyticsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { 
    totalCost, 
    totalTrips, 
    averageCost, 
    pendingApprovals, 
    highRiskTrips,
    monthlyTrend,
    departmentBreakdown,
    destinationBreakdown,
    costBreakdown
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gesamtkosten</p>
                <p className="text-2xl font-bold">€{totalCost.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -12% vs Budget
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktive Reisen</p>
                <p className="text-2xl font-bold">{totalTrips}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 seit letzter Woche
                </p>
              </div>
              <Plane className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ø Kosten/Reise</p>
                <p className="text-2xl font-bold">€{averageCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Monatsdurchschnitt
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingApprovals}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Warten auf Genehmigung
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hochrisiko</p>
                <p className="text-2xl font-bold">{highRiskTrips}</p>
                <p className="text-xs text-red-600 mt-1">
                  Erhöhte Aufmerksamkeit
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monatliche Entwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, 'Kosten']} />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Kosten nach Abteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, 'Kosten']} />
                <Bar dataKey="cost" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kostenaufschlüsselung</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {costBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">€{item.amount.toLocaleString()}</div>
                    <div className="text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Reiseziele</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {destinationBreakdown.map((destination, index) => (
                <div key={destination.destination} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{destination.destination}</p>
                      <p className="text-sm text-muted-foreground">{destination.trips} Reisen</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{destination.cost.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      €{Math.round(destination.cost / destination.trips).toLocaleString()}/Reise
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Hochrisiko</p>
                    <p className="text-sm text-red-700">Politische Unruhen</p>
                  </div>
                </div>
                <Badge variant="destructive">{highRiskTrips}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Mittleres Risiko</p>
                    <p className="text-sm text-yellow-700">Wetter/Gesundheit</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">3</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Niedrigrisiko</p>
                    <p className="text-sm text-green-700">Standard Business</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">7</Badge>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🤖 AI-Insights</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 23% Kosteneinsparung durch Direktbuchungen</li>
                  <li>• 89% pünktliche Genehmigungen</li>
                  <li>• Empfehlung: Frühbucher-Rabatte nutzen</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};