import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertTriangle, FileCheck, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ComplianceSection = () => {
  const { data: complianceData, isLoading } = useQuery({
    queryKey: ['esg-compliance-status'],
    queryFn: async () => {
      // Lade Emissionsdaten für Compliance-Berechnung
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('scope, category');

      if (!emissions || emissions.length === 0) {
        return null;
      }

      const scope1Count = emissions.filter((e: any) => e.scope === 'Scope 1').length;
      const scope2Count = emissions.filter((e: any) => e.scope === 'Scope 2').length;
      const scope3Count = emissions.filter((e: any) => e.scope === 'Scope 3').length;
      const totalCount = emissions.length;

      // Berechne Fortschritt basierend auf erfassten Daten
      const scope12Progress = Math.min(100, Math.round((scope1Count + scope2Count) / 10 * 100));
      const scope3Progress = Math.min(100, Math.round(scope3Count / 15 * 100));

      return [
        {
          title: 'Scope 1+2 Erfassung',
          progress: scope12Progress,
          status: scope12Progress >= 100 ? 'complete' : scope12Progress >= 50 ? 'pending' : 'warning',
          details: `${scope1Count + scope2Count} Datenpunkte erfasst`,
        },
        {
          title: 'Scope 3 Kategorien',
          progress: scope3Progress,
          status: scope3Progress >= 100 ? 'complete' : scope3Progress >= 50 ? 'pending' : 'warning',
          details: `${scope3Count} Datenpunkte erfasst`,
        },
        {
          title: 'Datenqualität',
          progress: totalCount > 0 ? Math.min(100, Math.round(totalCount / 20 * 100)) : 0,
          status: totalCount >= 20 ? 'complete' : totalCount >= 10 ? 'pending' : 'warning',
          details: `${totalCount} Gesamtdatensätze`,
        },
      ];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'pending':
        return 'bg-amber-500';
      case 'warning':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">Compliance & Berichterstattung</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">Compliance & Berichterstattung</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Leaf className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Keine Daten für Compliance-Berechnung</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie Emissionsdaten, um den Fortschritt zu sehen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg font-semibold">Compliance & Berichterstattung</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complianceData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <span className="text-sm font-semibold">{item.progress}%</span>
              </div>
              <div className="relative">
                <Progress 
                  value={item.progress} 
                  className="h-2"
                />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(item.status)}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{item.details}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
