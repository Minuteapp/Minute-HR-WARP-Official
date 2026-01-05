import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Clock, 
  Users, 
  FileText, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useIntelligentModuleIntegration } from '@/hooks/useIntelligentModuleIntegration';

const IntelligentModuleHub = () => {
  const { 
    isProcessing, 
    integrationStats, 
    updateIntegrationStats 
  } = useIntelligentModuleIntegration();

  const moduleConnections = [
    {
      id: 'sick-leave-integration',
      name: 'Krankmeldung → Schichtplanung',
      description: 'Automatische Vertretungssuche und Schicht-Updates',
      status: 'active',
      lastTrigger: '2 Min',
      automatedActions: 8,
      icon: Users,
      color: 'bg-emerald-500'
    },
    {
      id: 'document-categorization',
      name: 'Dokument → Auto-Kategorisierung',
      description: 'KI-basierte Dokumentenerkennung und Verknüpfung',
      status: 'active',
      lastTrigger: '5 Min',
      automatedActions: 12,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      id: 'time-tracking-overtime',
      name: 'Zeiterfassung → Überstunden-Check',
      description: 'Automatische Überstunden-Erkennung und Genehmigung',
      status: 'active',
      lastTrigger: '1 Min',
      automatedActions: 6,
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      id: 'employee-onboarding',
      name: 'Onboarding → Multi-Module Setup',
      description: 'Automatische Einrichtung aller Module für neue Mitarbeiter',
      status: 'active',
      lastTrigger: '1 Std',
      automatedActions: 15,
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      id: 'calendar-shift-sync',
      name: 'Kalender ↔ Schichtplanung',
      description: 'Bidirektionale Synchronisation von Terminen und Schichten',
      status: 'active',
      lastTrigger: '30 Sek',
      automatedActions: 4,
      icon: Calendar,
      color: 'bg-cyan-500'
    }
  ];

  const intelligenceMetrics = [
    {
      label: 'Automatisierungsgrad',
      value: integrationStats.successRate,
      unit: '%',
      icon: Zap,
      color: 'text-emerald-600'
    },
    {
      label: 'Cross-Module Events',
      value: integrationStats.totalEvents,
      unit: '',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Automatische Aktionen',
      value: integrationStats.automatedActions,
      unit: '',
      icon: CheckCircle2,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            Intelligente Module-Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Automatische Workflows und intelligente Verknüpfungen zwischen allen Modulen
          </p>
        </div>
        <Button 
          onClick={updateIntegrationStats}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {isProcessing ? 'Aktualisiere...' : 'Stats aktualisieren'}
        </Button>
      </div>

      {/* Intelligence Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {intelligenceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                </div>
                {metric.label === 'Automatisierungsgrad' && (
                  <Progress value={metric.value} className="mt-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Module Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Aktive Module-Verbindungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moduleConnections.map((connection) => {
              const Icon = connection.icon;
              return (
                <div 
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${connection.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {connection.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {connection.automatedActions} Aktionen
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Zuletzt: {connection.lastTrigger}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={connection.status === 'active' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        connection.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                      {connection.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integration Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Intelligente Workflow-Ketten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sick Leave Workflow */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Krankmeldung Workflow
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Krankmeldung eingereicht</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Schichtplanung benachrichtigt</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Vertretung gesucht</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Manager informiert</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Dokument-Upload</Badge>
              </div>
            </div>

            {/* Document Processing Workflow */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Dokument-Verarbeitung Workflow
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Dokument hochgeladen</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">KI-Kategorisierung</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">OCR-Verarbeitung</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Auto-Verknüpfung</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Benachrichtigungen</Badge>
              </div>
            </div>

            {/* Time Tracking Workflow */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                Zeiterfassung Workflow
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Zeit gestempelt</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Überstunden-Check</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Compliance-Prüfung</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Gehaltsabrechnung</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">Genehmigungsantrag</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Processing Indicator */}
      {isProcessing && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="font-medium">Intelligente Integration läuft...</span>
              <div className="text-sm text-muted-foreground">
                Module werden automatisch verknüpft und Workflows ausgeführt
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentModuleHub;