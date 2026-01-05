import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Loader2, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ESRSArea {
  id: string;
  name: string;
  progress: number;
}

const getProgressColor = (progress: number): string => {
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-orange-500';
  return 'bg-red-500';
};

const getProgressTextColor = (progress: number): string => {
  if (progress >= 75) return 'text-blue-600';
  if (progress >= 50) return 'text-orange-600';
  return 'text-red-600';
};

export const ESRSProgressSection = () => {
  const { data: esrsAreas = [], isLoading } = useQuery({
    queryKey: ['esrs-progress'],
    queryFn: async () => {
      // Prüfe vorhandene Daten für jeden ESRS-Bereich
      const { count: emissionsCount } = await supabase
        .from('esg_emissions')
        .select('*', { count: 'exact', head: true });

      const { count: measuresCount } = await supabase
        .from('esg_measures')
        .select('*', { count: 'exact', head: true });

      const { count: targetsCount } = await supabase
        .from('esg_targets')
        .select('*', { count: 'exact', head: true });

      const hasEmissions = (emissionsCount || 0) > 0;
      const hasMeasures = (measuresCount || 0) > 0;
      const hasTargets = (targetsCount || 0) > 0;

      // Berechne Fortschritt basierend auf vorhandenen Daten
      // E1 Klimawandel: Emissionen + Ziele + Maßnahmen
      const e1Progress = [hasEmissions, hasTargets, hasMeasures].filter(Boolean).length / 3 * 100;
      
      // Andere Bereiche haben noch keine spezifischen Datenquellen
      return [
        { id: 'e1', name: 'ESRS E1 - Klimawandel', progress: Math.round(e1Progress) },
        { id: 'e2', name: 'ESRS E2 - Umweltverschmutzung', progress: 0 },
        { id: 'e3', name: 'ESRS E3 - Wasser', progress: 0 },
        { id: 'e4', name: 'ESRS E4 - Biodiversität', progress: 0 },
        { id: 'e5', name: 'ESRS E5 - Kreislaufwirtschaft', progress: 0 },
        { id: 'taxonomy', name: 'EU-Taxonomie', progress: 0 },
        { id: 'materiality', name: 'Wesentlichkeitsanalyse', progress: 0 },
      ] as ESRSArea[];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fortschritt nach ESRS-Bereichen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAnyProgress = esrsAreas.some(a => a.progress > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fortschritt nach ESRS-Bereichen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAnyProgress && (
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Erfassen Sie Daten in den verschiedenen Bereichen, um den ESRS-Fortschritt zu sehen.
            </p>
          </div>
        )}
        {esrsAreas.map((area) => (
          <div
            key={area.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{area.name}</span>
                <span className={`text-sm font-bold ${getProgressTextColor(area.progress)}`}>
                  {area.progress}%
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(area.progress)}`}
                  style={{ width: `${area.progress}%` }}
                />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
