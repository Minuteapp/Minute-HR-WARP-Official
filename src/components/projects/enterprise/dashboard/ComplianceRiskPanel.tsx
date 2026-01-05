import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';
import { EnterpriseProject } from '@/types/project-enterprise';

interface ComplianceRiskPanelProps {
  project: EnterpriseProject;
  onUpdate?: (project: EnterpriseProject) => void;
}

export const ComplianceRiskPanel: React.FC<ComplianceRiskPanelProps> = ({
  project,
  onUpdate
}) => {
  // Dummy-Daten für Compliance Checks
  const complianceChecks = [
    { 
      id: '1', 
      check_type: 'DSGVO', 
      rule_name: 'Datenschutz Grundverordnung', 
      status: 'passed',
      checked_at: '2024-01-15',
      findings: 'Alle Anforderungen erfüllt'
    },
    { 
      id: '2', 
      check_type: 'ISO27001', 
      rule_name: 'Informationssicherheit', 
      status: 'warning',
      checked_at: '2024-01-10',
      findings: 'Kleine Verbesserungen erforderlich'
    },
    { 
      id: '3', 
      check_type: 'SOX', 
      rule_name: 'Sarbanes-Oxley Compliance', 
      status: 'pending',
      findings: 'Überprüfung ausstehend'
    }
  ];

  // Dummy-Daten für Risk Matrix
  const riskAssessments = [
    {
      id: '1',
      risk_type: 'Technology',
      description: 'Veraltete Technologie-Stack',
      probability: 0.3,
      impact: 0.7,
      status: 'mitigating',
      mitigation_strategy: 'Schrittweise Migration geplant'
    },
    {
      id: '2',
      risk_type: 'Resource',
      description: 'Schlüsselpersonal Ausfall',
      probability: 0.2,
      impact: 0.9,
      status: 'identified',
      mitigation_strategy: 'Backup-Personal identifizieren'
    },
    {
      id: '3',
      risk_type: 'Budget',
      description: 'Unvorhergesehene Kosten',
      probability: 0.4,
      impact: 0.6,
      status: 'analyzing',
      mitigation_strategy: 'Pufferbudget eingeplant'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'default';
      case 'warning': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getRiskLevel = (probability: number, impact: number) => {
    const score = probability * impact;
    if (score >= 0.6) return { level: 'Hoch', color: 'destructive' };
    if (score >= 0.3) return { level: 'Mittel', color: 'secondary' };
    return { level: 'Niedrig', color: 'default' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Compliance Score berechnen
  const passedChecks = complianceChecks.filter(check => check.status === 'passed').length;
  const complianceScore = (passedChecks / complianceChecks.length) * 100;

  return (
    <div className="space-y-6">
      {/* Compliance & Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold">{complianceScore.toFixed(1)}%</p>
                <Badge variant={complianceScore >= 80 ? 'default' : 'destructive'} className="mt-1">
                  {complianceScore >= 80 ? 'Gut' : 'Verbesserung nötig'}
                </Badge>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offene Checks</p>
                <p className="text-2xl font-bold">
                  {complianceChecks.filter(check => check.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risiken</p>
                <p className="text-2xl font-bold">{riskAssessments.length}</p>
                <p className="text-xs text-muted-foreground">
                  {riskAssessments.filter(risk => getRiskLevel(risk.probability, risk.impact).level === 'Hoch').length} kritisch
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Audit Trail</p>
                <p className="text-2xl font-bold">{project.audit_trail?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Einträge</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Checks & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Checks
            </CardTitle>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceChecks.map((check, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <div>
                        <h4 className="font-medium text-sm">{check.rule_name}</h4>
                        <p className="text-xs text-muted-foreground">{check.check_type}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(check.status)}>
                      {check.status}
                    </Badge>
                  </div>
                  
                  {check.findings && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {check.findings}
                    </p>
                  )}
                  
                  {check.checked_at && (
                    <p className="text-xs text-muted-foreground">
                      Letzte Prüfung: {new Date(check.checked_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risiko Matrix
            </CardTitle>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Verwalten
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAssessments.map((risk, index) => {
                const riskLevel = getRiskLevel(risk.probability, risk.impact);
                
                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{risk.description}</h4>
                        <p className="text-xs text-muted-foreground">{risk.risk_type}</p>
                      </div>
                      <Badge variant={riskLevel.color as any}>
                        {riskLevel.level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Wahrscheinlichkeit</p>
                        <Progress value={risk.probability * 100} className="h-2 mt-1" />
                        <span className="text-xs">{(risk.probability * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Impact</p>
                        <Progress value={risk.impact * 100} className="h-2 mt-1" />
                        <span className="text-xs">{(risk.impact * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    {risk.mitigation_strategy && (
                      <div className="bg-muted/30 p-3 rounded text-xs">
                        <p className="font-medium">Maßnahme:</p>
                        <p className="text-muted-foreground">{risk.mitigation_strategy}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Trail (Letzte Aktivitäten)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.audit_trail && project.audit_trail.length > 0 ? (
            <div className="space-y-3">
              {project.audit_trail.slice(0, 5).map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.change_description}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.changed_by} • {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{entry.change_type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Keine Audit-Einträge</p>
              <p className="text-sm">Änderungen werden automatisch protokolliert</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};