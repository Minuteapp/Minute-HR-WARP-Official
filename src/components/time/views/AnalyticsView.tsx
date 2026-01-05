import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, LineChart, Line, Tooltip } from "recharts";
import { TrendingUp, Activity, AlertTriangle, CheckSquare, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AnalyticsView = () => {
  // Leere Datenstrukturen für spätere Datenbindung
  const kpiCards = [
    { 
      label: 'Produktivität', 
      value: '--', 
      change: '--', 
      changeColor: 'text-muted-foreground',
      bgColor: 'bg-blue-50',
      icon: TrendingUp
    },
    { 
      label: 'Auslastung', 
      value: '--', 
      change: '--', 
      changeColor: 'text-muted-foreground',
      bgColor: 'bg-green-50',
      icon: Activity
    },
    { 
      label: 'Überstunden', 
      value: '--', 
      change: '--', 
      changeColor: 'text-muted-foreground',
      bgColor: 'bg-orange-50',
      icon: AlertTriangle
    },
    { 
      label: 'Compliance', 
      value: '--', 
      change: '--', 
      changeColor: 'text-muted-foreground',
      bgColor: 'bg-yellow-50',
      icon: CheckSquare
    },
  ];

  const weekActivity: { day: string; hours: number }[] = [];

  const complianceMetrics: { label: string; value: number }[] = [];

  const departmentComparison: { department: string; utilization: number }[] = [];

  const locationPerformance: { location: string; performance: number }[] = [];

  const trendData: { month: string; hours: number; productivity: number }[] = [];

  const weekStats = {
    avgPerDay: '--',
    totalWeek: '--',
    peakDay: '--'
  };

  const trendStats = {
    avgPerMonth: '--',
    growth: '--',
    avgProductivity: '--',
    trend: '--'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analysen & KPIs</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className={`p-6 ${kpi.bgColor}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">{kpi.value}</div>
              <div className={`text-sm ${kpi.changeColor}`}>{kpi.change}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wochenaktivität */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Wochenaktivität</h3>
            <Select defaultValue="this-week">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Zeitraum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">Diese Woche</SelectItem>
                <SelectItem value="last-week">Letzte Woche</SelectItem>
                <SelectItem value="this-month">Dieser Monat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {weekActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Durchschnitt/Tag</div>
              <div className="text-lg font-bold">{weekStats.avgPerDay}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Gesamt Woche</div>
              <div className="text-lg font-bold">{weekStats.totalWeek}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Peak-Tag</div>
              <div className="text-lg font-bold">{weekStats.peakDay}</div>
            </div>
          </div>
        </Card>

        {/* Compliance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Compliance</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          {complianceMetrics.length > 0 ? (
            <div className="space-y-5">
              {complianceMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{metric.label}</span>
                    <span className="text-sm font-medium">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-foreground h-2 rounded-full transition-all"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex items-center gap-2 text-orange-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">-- Verstöße diese Woche</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abteilungsvergleich */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Abteilungsvergleich</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          {departmentComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 12 }} width={100} />
                <Bar dataKey="utilization" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Höchste Auslastung:</span>
            <span className="text-sm font-medium">--</span>
          </div>
        </Card>

        {/* Standort Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Standort Performance</h3>
          
          {locationPerformance.length > 0 ? (
            <div className="space-y-4">
              {locationPerformance.map((loc, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{loc.location}</span>
                    <span className="text-sm font-medium">{loc.performance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-foreground h-2 rounded-full transition-all"
                      style={{ width: `${loc.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Best Performer:</span>
            <span className="text-sm font-medium text-green-600">--</span>
          </div>
        </Card>
      </div>

      {/* 6-Monats Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">6-Monats Trend</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line yAxisId="right" type="monotone" dataKey="productivity" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Daten verfügbar
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Durchschn. Stunden/Monat</div>
            <div className="text-lg font-bold">{trendStats.avgPerMonth}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Wachstum (6 Monate)</div>
            <div className="text-lg font-bold text-green-600">{trendStats.growth}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Ø Produktivität</div>
            <div className="text-lg font-bold">{trendStats.avgProductivity}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Trend</div>
            <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {trendStats.trend}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsView;
