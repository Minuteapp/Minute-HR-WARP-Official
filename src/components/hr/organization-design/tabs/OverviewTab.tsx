import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertTriangle, Target, Network } from "lucide-react";
import { useOrganizationKPIs } from "@/hooks/useOrganizationKPIs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useNavigate } from "react-router-dom";

export const OverviewTab = () => {
  const { kpis, isLoading } = useOrganizationKPIs();
  const { companyId } = useCompanyId();
  const navigate = useNavigate();

  // Organisationseinheiten für Vorschau laden
  const { data: orgUnits = [] } = useQuery({
    queryKey: ['org-units-preview', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('organizational_units')
        .select('id, name, abbreviation, level, parent_id')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('level', { ascending: true });
      return data || [];
    },
    enabled: !!companyId
  });

  // Szenarien aus Datenbank laden
  const { data: scenarios = [] } = useQuery({
    queryKey: ['organization-scenarios-overview', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('organization_scenarios')
        .select('id, title, name, status, description')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!companyId
  });

  if (isLoading) {
    return <div>Lade Daten...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* KPI-Karten */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Mitarbeiter</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.totalEmployees || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aktive Mitarbeiter in der Organisation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organisationsebenen</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.organizationLevels || 0}</div>
              <p className="text-xs text-muted-foreground">
                {kpis?.totalVacancies || 0} offene Positionen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organisations-Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.orgScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Basierend auf Struktur und Besetzung
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Schnellübersicht */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellübersicht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Durchschn. Leitungsspanne</div>
                <div className="text-2xl font-bold">1:{kpis?.avgSpanOfControl || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Nachfolgeabdeckung</div>
                <div className="text-2xl font-bold text-green-600">{kpis?.successionCoverage || 0}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Budget gesamt</div>
                <div className="text-2xl font-bold">€{(kpis?.totalBudget || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Abteilungen</div>
                <div className="text-2xl font-bold">{kpis?.totalDepartments || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Kritische Positionen</div>
                <div className={`text-2xl font-bold ${(kpis?.criticalVacancies || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {kpis?.criticalVacancies || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Aktive Szenarien</div>
                <div className="text-2xl font-bold">{scenarios.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organigramm Vorschau */}
        <Card>
          <CardHeader>
            <CardTitle>Organigramm-Vorschau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 bg-muted/10">
              {orgUnits.length > 0 ? (
                <div className="flex flex-col items-center space-y-4">
                  {/* Level 0 - CEO / Top Level */}
                  {orgUnits.filter(u => u.level === 0 || !u.parent_id).slice(0, 1).map(unit => (
                    <div key={unit.id} className="flex flex-col items-center">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
                        {unit.abbreviation || unit.name}
                      </div>
                      <div className="w-px h-4 bg-primary/50" />
                    </div>
                  ))}
                  
                  {/* Level 1 - Direct Reports */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {orgUnits.filter(u => u.level === 1 || (u.parent_id && orgUnits.find(p => p.id === u.parent_id && p.level === 0))).slice(0, 6).map(unit => (
                      <div key={unit.id} className="bg-primary/80 text-primary-foreground px-3 py-1.5 rounded text-xs font-medium">
                        {unit.abbreviation || unit.name.substring(0, 10)}
                      </div>
                    ))}
                  </div>

                  {/* Connecting lines */}
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: Math.min(6, orgUnits.filter(u => u.level === 1).length) }).map((_, i) => (
                      <div key={i} className="w-px h-3 bg-primary/30" />
                    ))}
                  </div>

                  {/* Level 2+ - Teams (simplified boxes) */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {Array.from({ length: Math.min(12, Math.max(6, orgUnits.filter(u => u.level >= 2).length || kpis?.totalDepartments || 6)) }).map((_, i) => (
                      <div key={i} className="w-6 h-5 bg-primary/40 rounded-sm" />
                    ))}
                  </div>

                  {/* Info Text */}
                  <div className="text-center mt-4 space-y-1">
                    <p className="font-semibold text-foreground">Interaktive Hierarchieansicht</p>
                    <p className="text-sm text-muted-foreground">
                      {kpis?.totalEmployees || 0} Mitarbeiter • {kpis?.totalDepartments || orgUnits.length} Abteilungen • {kpis?.organizationLevels || orgUnits.reduce((max, u) => Math.max(max, u.level || 0), 0) + 1} Ebenen
                    </p>
                  </div>

                  {/* Button */}
                  <Button className="mt-2" onClick={() => navigate('/hr/organization-design?tab=orgchart')}>
                    <Network className="h-4 w-4 mr-2" />
                    Organigramm öffnen
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <p className="text-muted-foreground">Noch keine Organisationsstruktur vorhanden</p>
                  <Button variant="outline" onClick={() => navigate('/hr/organization-design?tab=orgchart')}>
                    Struktur anlegen
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aktuelle Simulationen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktuelle Simulationen</CardTitle>
            <Button variant="outline" size="sm">Alle Szenarien anzeigen</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {scenarios.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine aktiven Szenarien vorhanden
              </p>
            ) : (
              scenarios.map((scenario: any) => (
                <div key={scenario.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">{scenario.title || scenario.name}</div>
                    <div className="text-sm text-muted-foreground">{scenario.description}</div>
                  </div>
                  <Badge variant={scenario.status === 'approved' ? 'secondary' : 'default'}>
                    {scenario.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* KI-Analyse Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">KI-gestützte Analyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nachfolgeabdeckung</span>
                <span className="font-medium">{kpis?.successionCoverage || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Durchschn. Leitungsspanne</span>
                <span className="font-medium">1:{kpis?.avgSpanOfControl || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kritische Vakanzen</span>
                <span className={`font-medium ${(kpis?.criticalVacancies || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {kpis?.criticalVacancies || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Organisationseffizienz</span>
                <span className="font-medium text-green-600">{kpis?.orgScore || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktuelle Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(kpis?.criticalVacancies || 0) > 0 ? (
              <div className="p-3 border rounded-lg space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm">Offene Positionen</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {kpis?.criticalVacancies} Position(en) sind derzeit unbesetzt
                </p>
                <Badge variant="destructive" className="text-xs">Prüfung empfohlen</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine kritischen Insights. Die Organisation ist gut aufgestellt.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
