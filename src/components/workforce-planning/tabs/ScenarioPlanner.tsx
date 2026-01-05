import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, TrendingDown, Play, CheckCircle2 } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";

export const ScenarioPlanner = () => {
  const { scenarios, activateScenario, isLoading } = useWorkforceExtended();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const getScenarioTypeColor = (type: string) => {
    switch (type) {
      case 'best': return 'bg-green-100 text-green-800';
      case 'worst': return 'bg-red-100 text-red-800';
      case 'base': return 'bg-blue-100 text-blue-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const activeScenario = scenarios?.find(s => s.is_active);

  return (
    <div className="space-y-6">
      {/* Active Scenario Overview */}
      {activeScenario && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              Aktives Szenario: {activeScenario.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {activeScenario.cost_projection.toLocaleString('de-DE')}€
                </div>
                <div className="text-sm text-green-600">Kostenprojektion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {activeScenario.headcount_projection}
                </div>
                <div className="text-sm text-green-600">Headcount-Prognose</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {activeScenario.overtime_projection.toFixed(1)} h
                </div>
                <div className="text-sm text-green-600">Überstunden-Prognose</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Szenario-Vergleich
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios?.map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-medium">{scenario.name}</div>
                    <Badge variant="secondary" className={getScenarioTypeColor(scenario.scenario_type)}>
                      {scenario.scenario_type}
                    </Badge>
                    {scenario.is_active && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Aktiv
                      </Badge>
                    )}
                  </div>
                  {scenario.description && (
                    <div className="text-sm text-muted-foreground mb-2">
                      {scenario.description}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Erstellt: {new Date(scenario.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-bold text-lg">
                        {scenario.cost_projection.toLocaleString('de-DE')}€
                      </div>
                      <div className="text-xs text-muted-foreground">Kosten</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{scenario.headcount_projection}</div>
                      <div className="text-xs text-muted-foreground">Headcount</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{scenario.overtime_projection.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">Überstunden</div>
                    </div>
                  </div>
                  {!scenario.is_active && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => activateScenario.mutate(scenario.id)}
                      disabled={activateScenario.isPending}
                      className="w-full"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Als Plan übernehmen
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(!scenarios || scenarios.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Szenarien erstellt</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Assumptions */}
      {activeScenario && (
        <Card>
          <CardHeader>
            <CardTitle>Annahmen des aktiven Szenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(activeScenario.assumptions || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="font-medium">{key}</div>
                  <div className="text-sm">{String(value)}</div>
                </div>
              ))}
              {Object.keys(activeScenario.assumptions || {}).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Keine Annahmen definiert
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Scenario Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnelle Szenario-Aktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Best Case erstellen
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingDown className="h-6 w-6 mb-2" />
              Worst Case erstellen
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Lightbulb className="h-6 w-6 mb-2" />
              Eigenes Szenario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};