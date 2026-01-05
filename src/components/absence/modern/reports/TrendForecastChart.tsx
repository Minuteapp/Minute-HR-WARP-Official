import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { toast } from '@/hooks/use-toast';

interface ForecastItem {
  quarter: string;
  value: number;
  type: 'historical' | 'forecast';
}

interface ForecastResponse {
  historical: ForecastItem[];
  forecast: ForecastItem[];
  analysis: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export const TrendForecastChart = () => {
  const { companyId } = useCompanyId();
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);

  // Lade historische Daten aus der DB
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['absence-trend-historical', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const { data, error } = await supabase
        .from('absence_requests')
        .select('type, start_date, end_date, status')
        .eq('company_id', companyId)
        .gte('start_date', twoYearsAgo.toISOString().split('T')[0])
        .in('status', ['approved', 'pending']);

      if (error) throw error;

      // Gruppiere nach Quartalen
      const quarterlyData: Record<string, number> = {};
      
      data?.forEach(absence => {
        const startDate = new Date(absence.start_date);
        const quarter = Math.floor(startDate.getMonth() / 3) + 1;
        const year = startDate.getFullYear();
        const quarterKey = `Q${quarter} ${year}`;
        
        // Berechne Arbeitstage
        const start = new Date(absence.start_date);
        const end = new Date(absence.end_date);
        let days = 0;
        const current = new Date(start);
        while (current <= end) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) days++;
          current.setDate(current.getDate() + 1);
        }
        
        quarterlyData[quarterKey] = (quarterlyData[quarterKey] || 0) + days;
      });

      // Sortiere chronologisch
      const sortedQuarters = Object.keys(quarterlyData).sort((a, b) => {
        const [qA, yA] = a.split(' ');
        const [qB, yB] = b.split(' ');
        if (yA !== yB) return parseInt(yA) - parseInt(yB);
        return parseInt(qA.replace('Q', '')) - parseInt(qB.replace('Q', ''));
      });

      return sortedQuarters.map(quarter => ({
        quarter,
        value: quarterlyData[quarter],
        type: 'historical' as const
      }));
    },
    enabled: !!companyId
  });

  const generateAIForecast = async () => {
    if (!companyId) {
      toast({
        title: 'Fehler',
        description: 'Keine Firma gefunden.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('absence-trend-forecast', {
        body: { companyId }
      });

      if (error) throw error;

      setForecastData(data);
      toast({
        title: 'KI-Prognose erstellt',
        description: 'Die Trend-Analyse wurde erfolgreich generiert.'
      });
    } catch (error) {
      console.error('Fehler bei KI-Prognose:', error);
      toast({
        title: 'Fehler',
        description: 'KI-Prognose konnte nicht erstellt werden.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Kombiniere historische + Forecast Daten
  const displayData = forecastData 
    ? [...forecastData.historical, ...forecastData.forecast]
    : historicalData || [];

  const maxValue = Math.max(...displayData.map(d => d.value), 1);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Lade Daten...
      </div>
    );
  }

  if (!displayData.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Keine historischen Daten verfügbar.</p>
        <p className="text-sm">Abwesenheitsanträge werden benötigt für die Trendanalyse.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KI-Analyse anzeigen */}
      {forecastData?.analysis && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-700 dark:text-blue-300">KI-Analyse</span>
            {getTrendIcon(forecastData.trend)}
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">{forecastData.analysis}</p>
        </div>
      )}

      {/* Chart */}
      {displayData.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const isForecast = item.type === 'forecast';
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium w-20 ${isForecast ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                {item.quarter}
                {isForecast && <span className="text-xs ml-1">(Prognose)</span>}
              </span>
              <span className={`font-bold ${isForecast ? 'text-purple-600' : 'text-blue-600'}`}>
                {item.value} Tage
              </span>
            </div>
            
            <div className="relative h-8 bg-muted rounded overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all flex items-center justify-end pr-2 ${
                  isForecast 
                    ? 'bg-purple-500 bg-opacity-70 border-2 border-dashed border-purple-400' 
                    : 'bg-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              >
                {percentage > 15 && (
                  <span className="text-xs font-medium text-white">{item.value}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Legende */}
      <div className="flex items-center gap-4 pt-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Historisch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500 border-2 border-dashed border-purple-400" />
          <span>Prognose</span>
        </div>
      </div>

      {/* KI-Prognose Button */}
      <div className="pt-4">
        <Button 
          onClick={generateAIForecast} 
          disabled={isGenerating}
          className="w-full"
          variant={forecastData ? 'outline' : 'default'}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generiere KI-Prognose...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {forecastData ? 'Prognose aktualisieren' : 'KI-Prognose generieren'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
