import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileText } from 'lucide-react';

export const ReportQualityCard = () => {
  const { data: qualityData, isLoading } = useQuery({
    queryKey: ['esg-report-quality'],
    queryFn: async () => {
      // Prüfe Datenvollständigkeit in verschiedenen Bereichen
      const { count: emissionsCount } = await supabase
        .from('esg_emissions')
        .select('*', { count: 'exact', head: true });

      const { count: measuresCount } = await supabase
        .from('esg_measures')
        .select('*', { count: 'exact', head: true });

      const { count: targetsCount } = await supabase
        .from('esg_targets')
        .select('*', { count: 'exact', head: true });

      // Berechne Vollständigkeit basierend auf vorhandenen Daten
      const areas = [
        { name: 'Emissionsdaten', complete: (emissionsCount || 0) > 0 },
        { name: 'Scope 1 Daten', complete: (emissionsCount || 0) > 0 },
        { name: 'Scope 2 Daten', complete: (emissionsCount || 0) > 0 },
        { name: 'Scope 3 Daten', complete: (emissionsCount || 0) > 0 },
        { name: 'Maßnahmenplan', complete: (measuresCount || 0) > 0 },
        { name: 'Zieldefinition', complete: (targetsCount || 0) > 0 },
        { name: 'Standortdaten', complete: (emissionsCount || 0) > 0 },
        { name: 'Dokumentation', complete: false }, // Erfordert manuelle Prüfung
      ];

      const completedAreas = areas.filter(a => a.complete).length;
      const percentage = Math.round((completedAreas / areas.length) * 100);

      return {
        percentage,
        completedAreas,
        totalAreas: areas.length,
        missingAreas: areas.filter(a => !a.complete).map(a => a.name),
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const qualityPercentage = qualityData?.percentage || 0;
  const progressColor = qualityPercentage >= 75 ? 'text-green-500' : qualityPercentage >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Percentage Circle */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${qualityPercentage * 2.51} 251`}
                className={progressColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${progressColor}`}>{qualityPercentage}%</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Berichtsqualität & Vollständigkeit
            </h3>
            <Progress value={qualityPercentage} className="h-2 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {qualityData?.completedAreas || 0} von {qualityData?.totalAreas || 8} Kernbereiche vollständig dokumentiert.
              {qualityData?.missingAreas && qualityData.missingAreas.length > 0 && (
                <> {qualityData.missingAreas.length} Bereiche ausstehend.</>
              )}
            </p>
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700">
                Fehlende Datenpunkte anzeigen
              </Button>
              <Button variant="outline">Prüfprotokoll erstellen</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
