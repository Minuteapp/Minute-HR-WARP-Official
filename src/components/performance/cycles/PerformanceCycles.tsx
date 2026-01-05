import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, Users, Settings, Play, Pause, CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface PerformanceCycle {
  id: string;
  name: string;
  description: string;
  cycle_type: 'quarterly' | 'annual' | 'custom';
  start_date: string;
  end_date: string;
  self_review_deadline: string;
  peer_review_deadline: string;
  manager_review_deadline: string;
  calibration_deadline: string;
  status: 'draft' | 'active' | 'calibration' | 'completed' | 'archived';
  participants: number;
}

export const PerformanceCycles = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  
  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ['performance-cycles', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('performance_cycles')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching performance cycles:', error);
        return [];
      }

      return (data || []).map((cycle: any): PerformanceCycle => ({
        id: cycle.id,
        name: cycle.name || 'Unbenannter Zyklus',
        description: cycle.description || '',
        cycle_type: cycle.cycle_type || 'quarterly',
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        self_review_deadline: cycle.self_review_deadline || cycle.end_date,
        peer_review_deadline: cycle.peer_review_deadline || cycle.end_date,
        manager_review_deadline: cycle.manager_review_deadline || cycle.end_date,
        calibration_deadline: cycle.calibration_deadline || cycle.end_date,
        status: cycle.status || 'draft',
        participants: cycle.participants_count || 0
      }));
    },
    enabled: !!currentCompanyId
  });

  const getStatusColor = (status: PerformanceCycle['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'calibration': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'archived': return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: PerformanceCycle['status']) => {
    switch (status) {
      case 'draft': return <Settings className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'calibration': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'archived': return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance-Zyklen</h2>
          <p className="text-sm text-gray-500">Verwalten Sie Performance-Review-Zyklen mit Deadlines und Workflows</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Zyklus
        </Button>
      </div>

      {cycles.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Performance-Zyklen</h3>
              <p className="text-muted-foreground mb-4">
                Es wurden noch keine Performance-Zyklen erstellt.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Zyklus erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {cycles.map((cycle) => (
            <Card key={cycle.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {cycle.name}
                    </CardTitle>
                    <CardDescription>{cycle.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(cycle.status)} border-0`}
                    >
                      {getStatusIcon(cycle.status)}
                      <span className="ml-1 capitalize">{cycle.status}</span>
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {cycle.participants}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Zeitraum</p>
                    <p className="text-sm">
                      {new Date(cycle.start_date).toLocaleDateString('de-DE')} - 
                      {new Date(cycle.end_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Selbstbewertung bis</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {new Date(cycle.self_review_deadline).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Peer-Review bis</p>
                    <p className="text-sm text-green-600 font-medium">
                      {new Date(cycle.peer_review_deadline).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Manager-Review bis</p>
                    <p className="text-sm text-purple-600 font-medium">
                      {new Date(cycle.manager_review_deadline).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Kalibrierung: {new Date(cycle.calibration_deadline).toLocaleDateString('de-DE')}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button size="sm">
                      Details anzeigen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cycle Creation Quick Guide */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Neuen Performance-Zyklus erstellen</h3>
              <p className="text-sm text-gray-600 mt-1">
                Definieren Sie Zeiträume, Deadlines und automatische Workflows für systematische Reviews
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline">Vorlage verwenden</Button>
              <Button>Von Grund auf erstellen</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
