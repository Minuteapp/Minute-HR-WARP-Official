import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Users, Target, BarChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useOrganizationKPIs } from "@/hooks/useOrganizationKPIs";

export const OrgChartSidebar = () => {
  const { kpis, isLoading } = useOrganizationKPIs();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">KI-gestützte Analyse</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Echtzeit-Insights zur Organisationsstruktur
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Lädt...</p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span>Nachfolgeabdeckung</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-orange-600">
                    {kpis?.successionCoverage || 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Durchschn. Leitungsspanne</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-green-600">
                    1:{kpis?.avgSpanOfControl || 0}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Kritische Vakanzen</span>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${(kpis?.criticalVacancies || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {kpis?.criticalVacancies || 0}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Organisationseffizienz</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-green-600">
                    {kpis?.orgScore || 0}%
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Aktuelle Insights</CardTitle>
            <Badge variant="secondary">{kpis?.insightsCount || 0}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!kpis || kpis.insightsCount === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine aktiven Insights vorhanden. Die KI-Analyse generiert automatisch Empfehlungen basierend auf Ihren Organisationsdaten.
            </p>
          ) : (
            <>
              {(kpis?.criticalVacancies || 0) > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-sm">Vakanzen erkannt</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">Hoher Impact</Badge>
                  <p className="text-xs text-muted-foreground">
                    {kpis.criticalVacancies} Position(en) ohne Besetzung gefunden.
                  </p>
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                    Nachfolgeplanung öffnen →
                  </Button>
                </div>
              )}
              
              {(kpis?.avgSpanOfControl || 0) > 10 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-sm">Struktur-Optimierung möglich</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                    Mittlerer Impact
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Durchschnittliche Leitungsspanne über Benchmark.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
