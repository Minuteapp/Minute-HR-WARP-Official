import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Users, DollarSign, TrendingUp, AlertTriangle, Building2, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scenariosService } from "@/services/scenariosService";
import { useToast } from "@/hooks/use-toast";

interface ScenarioCardProps {
  scenario: any;
}

export const ScenarioCard = ({ scenario }: ScenarioCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const duplicateMutation = useMutation({
    mutationFn: () => scenariosService.duplicateScenario(scenario.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-scenarios'] });
      toast({
        title: 'Szenario dupliziert',
        description: 'Das Szenario wurde erfolgreich dupliziert.',
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => scenariosService.approveScenario(scenario.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-scenarios'] });
      toast({
        title: 'Szenario genehmigt',
        description: 'Das Szenario wurde erfolgreich genehmigt.',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Freigegeben</Badge>;
      case 'draft':
        return <Badge variant="secondary">Entwurf</Badge>;
      case 'active':
        return <Badge variant="default">Aktiv</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMetricColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const formatChange = (value: number) => {
    if (value > 0) return `+${value}`;
    return value.toString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{scenario.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
          </div>
          {getStatusBadge(scenario.status)}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Erstellt von {scenario.createdBy} • {new Date(scenario.createdAt).toLocaleDateString('de-DE')}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Geplante Änderungen */}
        {scenario.changes && scenario.changes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Geplante Änderungen:</h4>
            <ul className="text-sm space-y-1">
              {scenario.changes.slice(0, 3).map((change: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* KI-Impact-Analyse */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium mb-1">KI-Impact-Analyse:</p>
              <p className="text-muted-foreground">
                Voraussichtliche Auswirkung: {scenario.impactAnalysis.employeeImpact > 0 ? 'Positiv' : 'Neutral'} 
                {' '}auf {scenario.impactAnalysis.affectedDepartments} Abteilung(en)
              </p>
            </div>
          </div>
        </div>

        {/* Metriken */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Mitarbeiter</p>
              <p className="font-medium">
                {scenario.metrics.employees}
                <span className={getMetricColor(scenario.metrics.employeeChange)}>
                  {' '}({formatChange(scenario.metrics.employeeChange)})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-medium">
                €{scenario.metrics.budget.toLocaleString('de-DE')}
                <span className={getMetricColor(scenario.metrics.budgetChange)}>
                  {' '}({formatChange(scenario.metrics.budgetChange)}%)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Effizienz</p>
              <p className="font-medium">
                {scenario.metrics.efficiency}%
                <span className={getMetricColor(scenario.metrics.efficiencyChange)}>
                  {' '}({formatChange(scenario.metrics.efficiencyChange)})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Risiko</p>
              <p className="font-medium">
                {scenario.metrics.risk}
                <span className={getMetricColor(-scenario.metrics.riskChange)}>
                  {' '}({formatChange(scenario.metrics.riskChange)})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Betroffene Abteilungen</p>
              <p className="font-medium">{scenario.metrics.departments}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => duplicateMutation.mutate()}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplizieren
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>

        {scenario.status === 'approved' && (
          <Button className="w-full" variant="default">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Szenario übernehmen & Live schalten
          </Button>
        )}

        {scenario.status === 'draft' && (
          <Button
            className="w-full"
            variant="default"
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
          >
            Szenario freigeben
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
