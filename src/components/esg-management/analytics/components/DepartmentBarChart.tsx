import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2 } from 'lucide-react';

const getBarColor = (value: number) => {
  if (value < 2.5) return '#22c55e';
  if (value < 3.5) return '#eab308';
  return '#ef4444';
};

export const DepartmentBarChart = () => {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['esg-emissions-by-department-chart'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*');

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Abteilung
      const departmentData = new Map<string, { total: number; count: number }>();
      
      emissions.forEach((e: any) => {
        const department = e.department || 'Unbekannt';
        
        if (!departmentData.has(department)) {
          departmentData.set(department, { total: 0, count: 0 });
        }
        
        const current = departmentData.get(department)!;
        current.total += Number(e.amount) || 0;
        current.count += 1;
      });

      // Berechne pro-Kopf-Werte (vereinfacht: pro Datensatz als Proxy)
      return Array.from(departmentData.entries())
        .map(([department, data]) => ({
          department,
          emissions: Math.round((data.total / Math.max(data.count, 1)) * 100) / 100,
        }))
        .sort((a, b) => b.emissions - a.emissions);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Emissionen nach Abteilung (t CO₂e pro Datensatz)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Emissionen nach Abteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Abteilungsdaten vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie Emissionsdaten mit Abteilungsangaben
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Emissionen nach Abteilung (t CO₂e pro Datensatz)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="department" 
                tick={{ fontSize: 12 }} 
                width={90}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value} t`, 'CO₂ pro Datensatz']}
              />
              <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.emissions)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
