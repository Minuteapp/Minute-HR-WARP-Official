
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, Plus, TrendingUp, Target, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SustainabilityEnvironmentList } from "./SustainabilityEnvironmentList";
import { SustainabilitySocialList } from "./SustainabilitySocialList";

interface SustainabilityTabProps {
  employeeId: string;
}

interface CarbonFootprintEntry {
  id: string;
  date: string;
  source: string;
  emissions_value: number;
  unit: string;
  location?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const SustainabilityTab = ({ employeeId }: SustainabilityTabProps) => {
  const { data: carbonFootprint = [], isLoading } = useQuery({
    queryKey: ['carbonFootprint', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carbon_footprint')
        .select('*')
        .eq('created_by', employeeId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as CarbonFootprintEntry[];
    }
  });

  const { data: sustainabilityGoals = [] } = useQuery({
    queryKey: ['sustainabilityGoals', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_goals')
        .select('*')
        .eq('user_id', employeeId)
        .eq('category', 'sustainability')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Berechne Gesamtemissionen mit korrekten Typen
  const totalEmissions = carbonFootprint.reduce((sum, entry) => {
    const value = typeof entry.emissions_value === 'number' ? entry.emissions_value : 0;
    return sum + value;
  }, 0);

  // Berechne Durchschnitt pro Monat
  const monthlyAverage = carbonFootprint.length > 0 ? totalEmissions / carbonFootprint.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Nachhaltigkeit</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Eintrag
        </Button>
      </div>

      {/* Übersichtskarten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO2-Fußabdruck gesamt</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmissions.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">
              CO2-Äquivalent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monatlicher Durchschnitt</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyAverage.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">
              pro Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nachhaltigkeitsziele</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sustainabilityGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              aktive Ziele
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Umwelt- und Soziale Bewertungen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SustainabilityEnvironmentList />
        <SustainabilitySocialList />
      </div>

      {/* CO2-Fußabdruck Verlauf */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            CO2-Fußabdruck Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carbonFootprint.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine CO2-Einträge erfasst</p>
          ) : (
            <div className="space-y-4">
              {carbonFootprint.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{entry.source}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {entry.emissions_value} {entry.unit}
                    </Badge>
                  </div>
                  {entry.location && (
                    <p className="text-sm text-gray-600 mb-2">Ort: {entry.location}</p>
                  )}
                  {entry.notes && (
                    <p className="text-sm text-gray-600">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nachhaltigkeitsziele */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Nachhaltigkeitsziele
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sustainabilityGoals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Nachhaltigkeitsziele definiert</p>
          ) : (
            <div className="space-y-4">
              {sustainabilityGoals.map((goal: any) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                      {goal.status === 'completed' ? 'Abgeschlossen' : 'Aktiv'}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fortschritt</span>
                      <span>{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
