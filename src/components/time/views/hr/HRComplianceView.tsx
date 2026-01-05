import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

const complianceStats = [
  { label: 'Überschreitung Arbeitszeit', value: 0, severity: 'low', trend: 'neutral', borderColor: 'border-gray-200', bgColor: 'bg-gray-50/50' },
  { label: 'Fehlende Pausenzeiten', value: 0, severity: 'low', trend: 'neutral', borderColor: 'border-gray-200', bgColor: 'bg-gray-50/50' },
  { label: 'Unvollständige Zeiterfassung', value: 0, severity: 'low', trend: 'neutral', borderColor: 'border-gray-200', bgColor: 'bg-gray-50/50' },
  { label: 'Ruhezeiten unterschritten', value: 0, severity: 'low', trend: 'neutral', borderColor: 'border-gray-200', bgColor: 'bg-gray-50/50' },
];

const complianceIssues: Array<{ id: number; employee: string; date: string; description: string; severity: string }> = [];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'high':
      return <Badge className="bg-red-500 text-white hover:bg-red-500">Hoch</Badge>;
    case 'medium':
      return <Badge className="bg-gray-700 text-white hover:bg-gray-700">Mittel</Badge>;
    case 'low':
      return <Badge className="bg-gray-500 text-white hover:bg-gray-500">Niedrig</Badge>;
    default:
      return <Badge className="bg-gray-500 text-white hover:bg-gray-500">Info</Badge>;
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <ArrowUp className="h-4 w-4 text-muted-foreground" />;
    case 'down':
      return <ArrowDown className="h-4 w-4 text-muted-foreground" />;
    default:
      return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
  }
};

const HRComplianceView = () => {
  const totalProblems = complianceStats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Compliance-Überwachung</h2>
        <Badge className="bg-red-500 text-white hover:bg-red-500 px-3 py-1">
          {totalProblems} offene Probleme
        </Badge>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceStats.map((stat) => (
          <Card key={stat.label} className={`${stat.borderColor} ${stat.bgColor} border`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                {getSeverityBadge(stat.severity)}
                {getTrendIcon(stat.trend)}
              </div>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detaillierte Compliance-Probleme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Detaillierte Compliance-Probleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getSeverityBadge(issue.severity)}
                    <span className="font-medium">{issue.employee}</span>
                    <span className="text-sm text-muted-foreground">• {issue.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  Bearbeiten
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRComplianceView;
