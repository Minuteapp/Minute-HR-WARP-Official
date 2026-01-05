import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const companyStats = [
  { label: 'Gesamt Mitarbeiter', value: '--', subtext: '--', subtextColor: 'text-muted-foreground', bgColor: 'bg-white' },
  { label: 'Arbeitsstunden (Woche)', value: '--', subtext: 'Ø -- h pro MA', subtextColor: 'text-muted-foreground', bgColor: 'bg-blue-50' },
  { label: 'Abwesenheitsrate', value: '--', subtext: '--', subtextColor: 'text-muted-foreground', bgColor: 'bg-white' },
  { label: 'Compliance-Score', value: '--', subtext: '-- offene Probleme', subtextColor: 'text-muted-foreground', bgColor: 'bg-white' },
];

const departmentDistribution: Array<{ name: string; value: number; color: string }> = [];
const workHoursTrend: Array<{ name: string; hours: number }> = [];
const locations: Array<{ name: string; employees: string; weeklyHours: string; avgHours: string; score: number }> = [];
const departments: Array<{ name: string; employees: string; weeklyHours: string; score: number }> = [];

const getScoreBadgeColor = (score: number) => {
  if (score >= 98) return 'bg-gray-900 text-white hover:bg-gray-900';
  if (score >= 95) return 'bg-rose-500 text-white hover:bg-rose-500';
  return 'bg-rose-400 text-white hover:bg-rose-400';
};

const CustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  const color = departmentDistribution.find(d => d.name === name)?.color || '#000';
  
  return (
    <text 
      x={x} 
      y={y} 
      fill={color}
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} ${value}%`}
    </text>
  );
};

const HRCompanyOverviewView = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {companyStats.map((stat) => (
          <Card key={stat.label} className={stat.bgColor}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
              <p className={`text-sm mt-2 ${stat.subtextColor}`}>{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mitarbeiterverteilung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Mitarbeiterverteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={CustomLabel}
                    labelLine={false}
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Arbeitsstunden-Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Arbeitsstunden-Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workHoursTrend} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#60a5fa" 
                    strokeWidth={2}
                    dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations and Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standorte Übersicht */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Standorte Übersicht</CardTitle>
            <Button variant="link" className="text-muted-foreground p-0 h-auto">Details</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {locations.map((location) => (
              <div key={location.name} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">{location.employees}</p>
                    </div>
                  </div>
                  <Badge className={getScoreBadgeColor(location.score)}>{location.score}%</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Wochenstunden</p>
                    <p className="font-semibold">{location.weeklyHours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ø pro Mitarbeiter</p>
                    <p className="font-semibold">{location.avgHours}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Abteilungen Übersicht */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Abteilungen Übersicht</CardTitle>
            <Button variant="link" className="text-muted-foreground p-0 h-auto">Details</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">{dept.employees}</p>
                    <p className="text-sm mt-2">
                      <span className="text-muted-foreground">Wochenstunden: </span>
                      <span className="font-semibold">{dept.weeklyHours}</span>
                    </p>
                  </div>
                  <Badge className={getScoreBadgeColor(dept.score)}>{dept.score}%</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRCompanyOverviewView;
