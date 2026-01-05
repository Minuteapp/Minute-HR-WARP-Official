import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Leaf } from 'lucide-react';

export const EmissionsCategoryDonut = () => {
  // Lade echte Emissionsdaten aus der Datenbank
  const { data: emissionsData = [], isLoading } = useQuery({
    queryKey: ['emissions-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_emissions')
        .select('category, scope, amount')
        .order('amount', { ascending: false });

      if (error) throw error;

      // Gruppiere nach Kategorie
      const categoryMap = new Map<string, { value: number; scope: string }>();
      (data || []).forEach((item: any) => {
        const key = item.category || 'Sonstige';
        const existing = categoryMap.get(key) || { value: 0, scope: item.scope };
        existing.value += Number(item.amount) || 0;
        categoryMap.set(key, existing);
      });

      const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
      
      return Array.from(categoryMap.entries()).map(([name, data], index) => ({
        name: `${name} (${data.scope})`,
        value: Math.round(data.value * 10) / 10,
        color: COLORS[index % COLORS.length]
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Emissionen nach Kategorie</CardTitle>
          <p className="text-sm text-muted-foreground">Verteilung in Tonnen CO₂e</p>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse w-32 h-32 rounded-full bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emissionsData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Emissionen nach Kategorie</CardTitle>
          <p className="text-sm text-muted-foreground">Verteilung in Tonnen CO₂e</p>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <Leaf className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Emissionsdaten vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie Ihre ersten CO₂-Emissionen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Emissionen nach Kategorie</CardTitle>
        <p className="text-sm text-muted-foreground">Verteilung in Tonnen CO₂e</p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emissionsData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {emissionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${value.toLocaleString('de-DE')} t`}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          {emissionsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium">{item.value.toLocaleString('de-DE')} t</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
