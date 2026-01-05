import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Euro, Target, Loader2, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const PortfolioSummaryCard = () => {
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['esg-portfolio-summary'],
    queryFn: async () => {
      // Lade Maßnahmen
      const { data: measures } = await supabase
        .from('esg_measures')
        .select('*');

      // Lade Gesamtemissionen
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('amount');

      // Lade Ziele
      const { data: targets } = await supabase
        .from('esg_targets')
        .select('*')
        .order('year', { ascending: false })
        .limit(1);

      if (!measures || measures.length === 0) {
        return null;
      }

      const totalCO2Reduction = measures.reduce((sum: number, m: any) => sum + (Number(m.co2_reduction) || 0), 0);
      const totalCostSavings = measures.reduce((sum: number, m: any) => sum + (Number(m.cost_savings) || 0), 0);
      const totalInvestment = measures.reduce((sum: number, m: any) => sum + (Number(m.investment) || 0), 0);
      
      const totalEmissions = emissions?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0;
      const reductionPercentage = totalEmissions > 0 
        ? Math.round((totalCO2Reduction / totalEmissions) * 1000) / 10 
        : 0;

      const targetValue = targets?.[0]?.target_value || 0;
      const forecastEmissions = totalEmissions - totalCO2Reduction;
      const targetAchievement = targetValue > 0 
        ? Math.round((1 - forecastEmissions / totalEmissions) / (1 - targetValue / totalEmissions) * 100)
        : 0;

      return {
        totalCO2Reduction: Math.round(totalCO2Reduction * 10) / 10,
        reductionPercentage,
        totalCostSavings,
        totalInvestment,
        targetAchievement: Math.min(Math.max(targetAchievement, 0), 200),
        targetValue,
        forecastEmissions: Math.round(forecastEmissions),
      };
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summaryData) {
    return (
      <Card className="bg-gradient-to-r from-muted/30 to-muted/10 border-muted">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-4">
            <Leaf className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Portfolio-Zusammenfassung wird angezeigt, sobald Maßnahmen vorhanden sind
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio-Zusammenfassung</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">-{summaryData.totalCO2Reduction} t CO₂e/Jahr</p>
              <p className="text-sm text-muted-foreground">
                = -{summaryData.reductionPercentage}% der Gesamt-Emissionen
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Euro className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {summaryData.totalCostSavings > 0 ? '+' : ''}€{(summaryData.totalCostSavings / 1000).toFixed(0)}k/Jahr
              </p>
              <p className="text-sm text-muted-foreground">
                Kostenersparnis (Bei €{(summaryData.totalInvestment / 1000).toFixed(0)}k Investition)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {summaryData.targetValue > 0 ? `${summaryData.targetAchievement}%` : '-'}
              </p>
              <p className="text-sm text-muted-foreground">
                {summaryData.targetValue > 0 
                  ? `Zielerreichung (${summaryData.targetValue} t Ziel → ${summaryData.forecastEmissions} t Forecast)`
                  : 'Kein Ziel definiert'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
