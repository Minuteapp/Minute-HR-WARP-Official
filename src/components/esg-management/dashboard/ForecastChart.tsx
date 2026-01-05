import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Sparkles, Leaf, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { toast } from 'sonner';

export const ForecastChart = () => {
  const { companyId } = useCompanyId();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);

  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['esg-forecast-data'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*')
        .order('year', { ascending: true });

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Jahr
      const yearlyData = new Map<number, number>();
      emissions.forEach((e: any) => {
        const year = e.year || new Date(e.created_at).getFullYear();
        const current = yearlyData.get(year) || 0;
        yearlyData.set(year, current + (Number(e.amount) || 0));
      });

      // Lade Ziele
      const { data: targets } = await supabase
        .from('esg_targets')
        .select('*')
        .order('year', { ascending: true });

      const targetMap = new Map<number, number>();
      targets?.forEach((t: any) => {
        targetMap.set(t.year, Number(t.target_value) || 0);
      });

      return Array.from(yearlyData.entries()).map(([year, actual]) => ({
        year: year.toString(),
        actual: Math.round(actual),
        target: targetMap.get(year) || null,
      }));
    }
  });

  const handleForecastAnalysis = async () => {
    if (!companyId) {
      toast.error('Keine Unternehmens-ID gefunden');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('esg-ai-analysis', {
        body: { companyId, analysisType: 'forecast' }
      });

      if (error) throw error;
      setForecastResult(data.analysis);
      toast.success('Forecast-Analyse abgeschlossen');
    } catch (error) {
      console.error('Forecast-Analyse Fehler:', error);
      toast.error('Fehler bei der Forecast-Analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Zielerreichung & Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Zielerreichung & Forecast
              </CardTitle>
              <p className="text-sm text-muted-foreground">Klimaneutralität Roadmap</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex flex-col items-center justify-center text-center">
            <Leaf className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Emissionsdaten für Forecast vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie historische Daten, um Prognosen zu erstellen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Zielerreichung & Forecast
            </CardTitle>
            <p className="text-sm text-muted-foreground">Basierend auf erfassten Daten</p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleForecastAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            KI-Forecast
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                formatter={(value: number) => value ? `${value.toLocaleString('de-DE')} t CO₂e` : '-'}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
                name="Ist-Werte"
                connectNulls={false}
              />
              {chartData.some(d => d.target) && (
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#9ca3af" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Ziel"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center gap-6 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500 rounded" />
            <span className="text-muted-foreground">Ist-Werte</span>
          </div>
          {chartData.some(d => d.target) && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400 rounded" style={{ borderStyle: 'dashed' }} />
              <span className="text-muted-foreground">Ziel</span>
            </div>
          )}
        </div>
        
        {forecastResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">KI-Forecast</p>
                <p className="text-xs text-blue-700">
                  {typeof forecastResult === 'object' 
                    ? forecastResult.message || forecastResult.recommendation || JSON.stringify(forecastResult)
                    : forecastResult}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
