import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";

export const ComplianceReport = () => {
  const { assignments, isLoading } = useWorkforceExtended();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Mock compliance data based on assignments
  const complianceData = {
    violations: assignments?.filter(a => a.compliance_status === 'violation').length || 0,
    warnings: assignments?.filter(a => a.compliance_status === 'warning').length || 0,
    compliant: assignments?.filter(a => a.compliance_status === 'compliant').length || 0,
    total: assignments?.length || 0,
  };

  const complianceScore = complianceData.total > 0 
    ? ((complianceData.compliant / complianceData.total) * 100) 
    : 0;

  // Mock rule violations
  const ruleViolations = [
    {
      id: '1',
      rule: 'Max. 10h pro Tag',
      type: 'arbeitszeit',
      severity: 'error',
      count: 3,
      trend: 'up',
      costImpact: 2500,
      description: 'Tägliche Arbeitszeit überschritten'
    },
    {
      id: '2',
      rule: '11h Ruhezeit',
      type: 'ruhezeit',
      severity: 'warning',
      count: 5,
      trend: 'down',
      costImpact: 1200,
      description: 'Mindestrhuezeit nicht eingehalten'
    },
    {
      id: '3',
      rule: 'Max. 5 Nachtschichten/Monat',
      type: 'nachtarbeit',
      severity: 'warning',
      count: 2,
      trend: 'stable',
      costImpact: 800,
      description: 'Nachtarbeitsgrenzwerte erreicht'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalCostImpact = ruleViolations.reduce((sum, violation) => sum + violation.costImpact, 0);

  return (
    <div className="space-y-6">
      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600">{complianceScore.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Compliance-Score</div>
              </div>
              <Progress value={complianceScore} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Regelkonform</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {complianceData.compliant}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Warnungen</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {complianceData.warnings}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Verstöße</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {complianceData.violations}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Kostenwirkung von Regelverstößen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {totalCostImpact.toLocaleString('de-DE')}€
            </div>
            <div className="text-sm text-muted-foreground">
              Geschätzte monatliche Mehrkosten durch Compliance-Verstöße
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rule Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Aktuelle Regelverstöße
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ruleViolations.map((violation) => (
              <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-medium">{violation.rule}</div>
                    <Badge variant="secondary" className={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {violation.description}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Kategorie: {violation.type}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{violation.count}</span>
                    {getTrendIcon(violation.trend)}
                  </div>
                  <div className="text-sm text-red-600 font-medium">
                    +{violation.costImpact.toLocaleString('de-DE')}€
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Monatskosten
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compliance-Trend (letzte 6 Monate)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">↗ 8%</div>
              <div className="text-sm text-muted-foreground">Verbesserung</div>
              <div className="text-xs text-muted-foreground mt-1">
                Weniger Arbeitszeitverstöße
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">↗ 12%</div>
              <div className="text-sm text-muted-foreground">Verschlechterung</div>
              <div className="text-xs text-muted-foreground mt-1">
                Mehr Ruhezeit-Probleme
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">→ 0%</div>
              <div className="text-sm text-muted-foreground">Stabil</div>
              <div className="text-xs text-muted-foreground mt-1">
                Nachtarbeit konstant
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Empfohlene Maßnahmen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <div className="font-medium text-blue-800">Schulung zu Arbeitszeitgesetzen</div>
                <div className="text-sm text-blue-600">
                  Für Teamleiter und Planer zur Reduzierung der Verstöße
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <div className="font-medium text-blue-800">Automatische Compliance-Prüfung</div>
                <div className="text-sm text-blue-600">
                  Integration von Echzeit-Warnungen bei der Planung
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <div className="font-medium text-blue-800">Überprüfung der Schichtpläne</div>
                <div className="text-sm text-blue-600">
                  Wöchentliche Analyse zur Früherkennung von Problemen
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};