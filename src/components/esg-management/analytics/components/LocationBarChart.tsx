import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin } from 'lucide-react';

export const LocationBarChart = () => {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['esg-emissions-by-location-chart'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*');

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Standort und Scope
      const locationData = new Map<string, { scope1: number; scope2: number; scope3: number }>();
      
      emissions.forEach((e: any) => {
        const location = e.location || 'Unbekannt';
        const scope = e.scope || 'Scope 1';
        
        if (!locationData.has(location)) {
          locationData.set(location, { scope1: 0, scope2: 0, scope3: 0 });
        }
        
        const current = locationData.get(location)!;
        const amount = Number(e.amount) || 0;
        
        if (scope === 'Scope 1') current.scope1 += amount;
        else if (scope === 'Scope 2') current.scope2 += amount;
        else if (scope === 'Scope 3') current.scope3 += amount;
      });

      return Array.from(locationData.entries())
        .map(([location, data]) => ({
          location,
          scope1: Math.round(data.scope1 * 10) / 10,
          scope2: Math.round(data.scope2 * 10) / 10,
          scope3: Math.round(data.scope3 * 10) / 10,
        }))
        .sort((a, b) => (b.scope1 + b.scope2 + b.scope3) - (a.scope1 + a.scope2 + a.scope3));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Emissionen nach Standort</CardTitle>
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
          <CardTitle className="text-base font-semibold">Emissionen nach Standort</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Standortdaten vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie Emissionsdaten mit Standortangaben
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Emissionen nach Standort</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="location" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    scope1: 'Scope 1',
                    scope2: 'Scope 2',
                    scope3: 'Scope 3'
                  };
                  return [`${value} t CO₂e`, labels[name] || name];
                }}
              />
              <Legend 
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    scope1: 'Scope 1',
                    scope2: 'Scope 2',
                    scope3: 'Scope 3'
                  };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="scope1" stackId="a" fill="#f97316" name="scope1" />
              <Bar dataKey="scope2" stackId="a" fill="#3b82f6" name="scope2" />
              <Bar dataKey="scope3" stackId="a" fill="#8b5cf6" name="scope3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
