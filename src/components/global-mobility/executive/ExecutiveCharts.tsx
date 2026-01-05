
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { GlobalMobilityRequest } from '@/types/global-mobility';

interface ExecutiveChartsProps {
  requests: GlobalMobilityRequest[];
}

export const ExecutiveCharts = ({ requests }: ExecutiveChartsProps) => {
  // Calculate region distribution
  const calculateRegionData = () => {
    const regionMap: Record<string, number> = { 'EMEA': 0, 'APAC': 0, 'Americas': 0 };
    
    const emeaCountries = ['germany', 'uk', 'france', 'spain', 'italy', 'netherlands', 'london', 'frankfurt', 'paris', 'berlin', 'munich', 'amsterdam'];
    const apacCountries = ['china', 'japan', 'singapore', 'hong kong', 'india', 'australia', 'shanghai', 'tokyo', 'sydney'];
    const americasCountries = ['usa', 'united states', 'canada', 'brazil', 'new york', 'san francisco', 'los angeles'];

    requests.forEach(request => {
      const location = (request.destination_location || '').toLowerCase();
      if (emeaCountries.some(c => location.includes(c))) regionMap['EMEA']++;
      else if (apacCountries.some(c => location.includes(c))) regionMap['APAC']++;
      else if (americasCountries.some(c => location.includes(c))) regionMap['Americas']++;
    });

    return Object.entries(regionMap).map(([name, value]) => ({ name, value }));
  };

  // Calculate type distribution
  const calculateTypeData = () => {
    const typeMap: Record<string, number> = {};
    requests.forEach(request => {
      const type = request.request_type || 'Sonstige';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    
    const typeLabels: Record<string, string> = {
      'relocation': 'Relocation',
      'assignment': 'Entsendung',
      'transfer': 'Transfer',
      'visa_support': 'Visa',
      'remote_work': 'Remote'
    };

    return Object.entries(typeMap).map(([key, value]) => ({
      name: typeLabels[key] || key,
      value
    }));
  };

  // Calculate monthly cost trend
  const calculateCostTrend = () => {
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthRequests = requests.filter(r => {
        const date = new Date(r.created_at);
        return date.getMonth() === index;
      });
      const cost = monthRequests.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost || 0), 0);
      return { month, kosten: Math.round(cost / 1000) };
    });
  };

  const regionData = calculateRegionData();
  const typeData = calculateTypeData();
  const costTrendData = calculateCostTrend();

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pie Chart - Region Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Verteilung nach Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {regionData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {regionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Keine Daten verfügbar
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Type Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Verteilung nach Typ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Keine Daten verfügbar
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Chart - Cost Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Kostenentwicklung (in Tsd. €)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {costTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="kosten" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Keine Daten verfügbar
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
