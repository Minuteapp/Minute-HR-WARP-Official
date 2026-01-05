import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, GitCompare, Info, Users, DollarSign, Zap, AlertTriangle, BarChart, Copy, FileText } from "lucide-react";
import { OrgChartSidebar } from "../components/OrgChartSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { EmptyState } from "@/components/ui/empty-state";

interface Scenario {
  id: string;
  title: string;
  status: string;
  description: string;
  created_by: string;
  created_at: string;
  changes: string[];
  metrics: {
    employees: number;
    budget: number;
    efficiency: number;
    risk: number;
  };
}

export const ScenariosTab = () => {
  const { companyId } = useCompanyId();

  // Echte Daten aus der Datenbank laden
  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['organization-scenarios', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('organization_scenarios')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading scenarios:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!companyId
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'entwurf':
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      case 'freigegeben':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'aktiv':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Lädt Szenarien...</div>;
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        {/* Info-Banner */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <span className="font-semibold">Simulationsmodus:</span> Alle Änderungen werden virtuell durchgeführt und haben 
            keine Auswirkung auf die Live-Struktur. Szenarien können jederzeit übernommen oder verworfen werden.
          </AlertDescription>
        </Alert>

        {/* Toolbar */}
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Szenario
          </Button>
          <Button variant="outline" disabled={scenarios.length < 2}>
            <GitCompare className="h-4 w-4 mr-2" />
            Vergleich
          </Button>
        </div>

        {/* Szenarien-Karten oder Empty State */}
        {scenarios.length === 0 ? (
          <EmptyState
            icon={GitCompare}
            title="Keine Szenarien vorhanden"
            description="Erstellen Sie ein neues Szenario, um Organisationsänderungen virtuell zu simulieren und deren Auswirkungen zu analysieren."
            action={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Szenario erstellen
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {scenarios.map((scenario: any) => (
              <Card key={scenario.id} className="overflow-hidden">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">{scenario.title || scenario.name}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(scenario.status)}>
                      {scenario.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Erstellt: {new Date(scenario.created_at).toLocaleDateString('de-DE')}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Metriken Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Betroffene Mitarbeiter</span>
                      </div>
                      <div className="text-lg font-bold">
                        {scenario.affected_employees || 0}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BarChart className="h-3 w-3" />
                        <span>Abteilungen</span>
                      </div>
                      <div className="text-lg font-bold">
                        {scenario.affected_departments || 0}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplizieren
                    </Button>
                    <Button variant="outline" className="flex-1 bg-black text-white hover:bg-gray-800 hover:text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Rechte Sidebar */}
      <div className="w-80">
        <OrgChartSidebar />
      </div>
    </div>
  );
};
