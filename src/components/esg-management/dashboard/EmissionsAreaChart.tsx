import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Leaf } from 'lucide-react';

export const EmissionsAreaChart = () => {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['emissions-area-chart'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*')
        .order('created_at', { ascending: true });

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Monat
      const monthlyData = new Map<string, { scope1: number; scope2: number; scope3: number }>();
      
      emissions.forEach((e: any) => {
        const date = new Date(e.created_at);
        const monthKey = date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
        
        const existing = monthlyData.get(monthKey) || { scope1: 0, scope2: 0, scope3: 0 };
        const amount = Number(e.amount) || 0;
        
        if (e.scope === 'Scope 1') existing.scope1 += amount;
        else if (e.scope === 'Scope 2') existing.scope2 += amount;
        else if (e.scope === 'Scope 3') existing.scope3 += amount;
        
        monthlyData.set(monthKey, existing);
      });

      return Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        scope1: Math.round(data.scope1 * 10) / 10,
        scope2: Math.round(data.scope2 * 10) / 10,
        scope3: Math.round(data.scope3 * 10) / 10,
      }));
    }
  });

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">CO₂-Emissionen Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">CO₂-Emissionen Verlauf</CardTitle>
          <p className="text-sm text-muted-foreground">Monatliche Entwicklung nach Scopes in Tonnen CO₂e</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <Leaf className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Emissionsdaten vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie Daten, um den Verlauf zu sehen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">CO₂-Emissionen Verlauf</CardTitle>
        <p className="text-sm text-muted-foreground">Monatliche Entwicklung nach Scopes in Tonnen CO₂e</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scope1Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="scope2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="scope3Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="scope1" 
                stackId="1" 
                stroke="#f97316" 
                fill="url(#scope1Gradient)" 
                name="Scope 1"
              />
              <Area 
                type="monotone" 
                dataKey="scope2" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="url(#scope2Gradient)" 
                name="Scope 2"
              />
              <Area 
                type="monotone" 
                dataKey="scope3" 
                stackId="1" 
                stroke="#8b5cf6" 
                fill="url(#scope3Gradient)" 
                name="Scope 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
