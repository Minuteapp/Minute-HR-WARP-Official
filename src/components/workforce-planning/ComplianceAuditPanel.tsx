
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, FileText, Shield, TrendingUp } from "lucide-react";

interface ComplianceMetric {
  id: string;
  name: string;
  category: string;
  score: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  lastAudit: string;
  nextAudit: string;
  requirements: string[];
}

interface AuditFinding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo: string;
}

export const ComplianceAuditPanel = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock data - würde normalerweise aus API kommen
  const complianceMetrics: ComplianceMetric[] = [
    {
      id: '1',
      name: 'Datenschutz-Grundverordnung (DSGVO)',
      category: 'Datenschutz',
      score: 92,
      status: 'compliant',
      lastAudit: '2024-01-15',
      nextAudit: '2024-07-15',
      requirements: ['Einwilligungsverwaltung', 'Löschkonzept', 'Mitarbeiterschulung']
    },
    {
      id: '2',
      name: 'Arbeitsschutzgesetz',
      category: 'Arbeitsschutz',
      score: 78,
      status: 'at_risk',
      lastAudit: '2023-11-20',
      nextAudit: '2024-05-20',
      requirements: ['Gefährdungsbeurteilung', 'Unterweisung', 'Erste Hilfe']
    },
    {
      id: '3',
      name: 'Betriebsverfassungsgesetz',
      category: 'Mitbestimmung',
      score: 65,
      status: 'non_compliant',
      lastAudit: '2023-09-10',
      nextAudit: '2024-03-10',
      requirements: ['Betriebsrat', 'Mitarbeitergespräche', 'Informationspflichten']
    }
  ];

  const auditFindings: AuditFinding[] = [
    {
      id: '1',
      title: 'Fehlende Datenschutz-Schulung für neue Mitarbeiter',
      severity: 'high',
      category: 'Datenschutz',
      description: 'Neue Mitarbeiter erhalten nicht automatisch eine DSGVO-Schulung',
      dueDate: '2024-02-28',
      status: 'open',
      assignedTo: 'HR Team'
    },
    {
      id: '2',
      title: 'Veraltete Gefährdungsbeurteilung',
      severity: 'medium',
      category: 'Arbeitsschutz',
      description: 'Gefährdungsbeurteilung wurde seit 2 Jahren nicht aktualisiert',
      dueDate: '2024-03-15',
      status: 'in_progress',
      assignedTo: 'Sicherheitsbeauftragte'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const overallComplianceScore = Math.round(
    complianceMetrics.reduce((acc, metric) => acc + metric.score, 0) / complianceMetrics.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Compliance Audit</h2>
          <p className="text-sm text-gray-500">
            Überwachung und Bewertung der Compliance-Anforderungen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            Gesamt-Score: {overallComplianceScore}%
          </span>
        </div>
      </div>

      {/* Übersicht Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt-Compliance</p>
                <p className="text-2xl font-bold text-gray-900">{overallComplianceScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={overallComplianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Konforme Bereiche</p>
                <p className="text-2xl font-bold text-green-600">
                  {complianceMetrics.filter(m => m.status === 'compliant').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risikobereiche</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {complianceMetrics.filter(m => m.status === 'at_risk').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offene Findings</p>
                <p className="text-2xl font-bold text-red-600">
                  {auditFindings.filter(f => f.status === 'open').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Compliance Kennzahlen</TabsTrigger>
          <TabsTrigger value="findings">Audit Findings</TabsTrigger>
          <TabsTrigger value="timeline">Audit Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Kennzahlen</CardTitle>
              <CardDescription>
                Detaillierte Bewertung aller Compliance-Bereiche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceMetrics.map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(metric.status)}
                          <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status === 'compliant' ? 'Konform' : 
                             metric.status === 'at_risk' ? 'Risiko' : 'Nicht konform'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Kategorie: {metric.category}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Letztes Audit: {new Date(metric.lastAudit).toLocaleDateString('de-DE')}</span>
                          <span>Nächstes Audit: {new Date(metric.nextAudit).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{metric.score}%</div>
                        <Progress value={metric.score} className="w-24" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Anforderungen:</p>
                      <div className="flex flex-wrap gap-1">
                        {metric.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>Audit Findings</CardTitle>
              <CardDescription>
                Offene und bearbeitete Audit-Feststellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditFindings.map((finding) => (
                  <div key={finding.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{finding.title}</h3>
                          <Badge className={getSeverityColor(finding.severity)}>
                            {finding.severity === 'low' ? 'Niedrig' :
                             finding.severity === 'medium' ? 'Mittel' :
                             finding.severity === 'high' ? 'Hoch' : 'Kritisch'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Kategorie: {finding.category}</span>
                          <span>Fällig: {new Date(finding.dueDate).toLocaleDateString('de-DE')}</span>
                          <span>Zugewiesen: {finding.assignedTo}</span>
                        </div>
                      </div>
                      <Badge className={
                        finding.status === 'open' ? 'bg-red-100 text-red-800' :
                        finding.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {finding.status === 'open' ? 'Offen' :
                         finding.status === 'in_progress' ? 'In Bearbeitung' : 'Gelöst'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Audit Timeline</CardTitle>
              <CardDescription>
                Geplante und durchgeführte Audits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Audit Timeline wird geladen...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Hier werden zukünftig alle geplanten und durchgeführten Audits angezeigt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
