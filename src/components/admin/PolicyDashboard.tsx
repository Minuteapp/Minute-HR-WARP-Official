import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { usePolicyEngine } from '@/hooks/system/usePolicyEngine';
import PolicyManager from '@/components/system/PolicyManager';
import PolicyStatusIndicator from '@/components/system/PolicyStatusIndicator';

interface PolicyMetrics {
  totalEnforcements: number;
  blockedActions: number;
  allowedActions: number;
  conflictsResolved: number;
  activeUsers: number;
  riskScore: number;
}

const PolicyDashboard = () => {
  const { policies, conflicts, loading } = usePolicyEngine();
  const [metrics, setMetrics] = useState<PolicyMetrics>({
    totalEnforcements: 1247,
    blockedActions: 23,
    allowedActions: 1224,
    conflictsResolved: 5,
    activeUsers: 342,
    riskScore: 92
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const activePolicies = policies.filter(p => p.is_active);
  const criticalConflicts = conflicts.filter(c => c.severity === 'critical');

  // Simuliere Live-Updates der Metriken
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalEnforcements: prev.totalEnforcements + Math.floor(Math.random() * 3),
        blockedActions: prev.blockedActions + (Math.random() > 0.8 ? 1 : 0),
        allowedActions: prev.allowedActions + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRiskLevelColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRate = () => {
    const total = metrics.allowedActions + metrics.blockedActions;
    return total > 0 ? ((metrics.allowedActions / total) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Policy Dashboard</h1>
          <p className="text-muted-foreground">
            Systemweite Überwachung und Verwaltung aller Sicherheitsrichtlinien
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Stunden</SelectItem>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="90d">90 Tage</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalConflicts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            {criticalConflicts.length} kritische Policy-Konflikte
          </AlertTitle>
          <AlertDescription className="text-red-700">
            Sofortiges Handeln erforderlich. Diese Konflikte können die Systemsicherheit gefährden.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Policies</p>
                <p className="text-3xl font-bold text-primary">{activePolicies.length}</p>
                <p className="text-xs text-muted-foreground">
                  +2 seit gestern
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Policy Durchsetzungen</p>
                <p className="text-3xl font-bold">{metrics.totalEnforcements.toLocaleString()}</p>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% seit letzter Woche
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erfolgsrate</p>
                <p className="text-3xl font-bold text-green-600">{getSuccessRate()}%</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.blockedActions} blockiert / {metrics.allowedActions} erlaubt
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sicherheitsscore</p>
                <p className={`text-3xl font-bold ${getRiskLevelColor(metrics.riskScore)}`}>
                  {metrics.riskScore}/100
                </p>
                <p className="text-xs text-muted-foreground">
                  Basierend auf Policy-Compliance
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="enforcement">Live Durchsetzung</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="management">Policy Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Modulstatus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PolicyStatusIndicator moduleName="timetracking" showDetails={true} />
                  <PolicyStatusIndicator moduleName="absence" showDetails={true} />
                  <PolicyStatusIndicator moduleName="documents" showDetails={true} />
                  <PolicyStatusIndicator moduleName="business_travel" showDetails={true} />
                </div>
              </CardContent>
            </Card>

            {/* Recent Policy Changes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Letzte Änderungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      time: '2 Min.', 
                      action: 'QR-Code-Pflicht aktiviert', 
                      user: 'Admin', 
                      impact: 'Hoch' 
                    },
                    { 
                      time: '1 Std.', 
                      action: 'MFA-Ausnahme für User123 erstellt', 
                      user: 'HR Manager', 
                      impact: 'Niedrig' 
                    },
                    { 
                      time: '3 Std.', 
                      action: 'DSGVO-Compliance verschärft', 
                      user: 'System', 
                      impact: 'Mittel' 
                    }
                  ].map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{change.action}</p>
                        <p className="text-xs text-muted-foreground">
                          von {change.user} • vor {change.time}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          change.impact === 'Hoch' ? 'destructive' : 
                          change.impact === 'Mittel' ? 'default' : 'secondary'
                        }
                      >
                        {change.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enforcement" className="space-y-4">
          {/* Live Enforcement Monitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Policy Durchsetzung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter Controls */}
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Nach Benutzer, Aktion oder Policy suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Module</SelectItem>
                      <SelectItem value="timetracking">Zeiterfassung</SelectItem>
                      <SelectItem value="absence">Abwesenheiten</SelectItem>
                      <SelectItem value="documents">Dokumente</SelectItem>
                      <SelectItem value="security">Sicherheit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Live Feed */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {[
                    { 
                      time: '13:42:15', 
                      user: 'max.mueller@company.com', 
                      action: 'time_check_in', 
                      result: 'blocked', 
                      reason: 'QR-Code fehlt' 
                    },
                    { 
                      time: '13:41:33', 
                      user: 'anna.schmidt@company.com', 
                      action: 'document_upload', 
                      result: 'allowed', 
                      reason: 'Alle Richtlinien erfüllt' 
                    },
                    { 
                      time: '13:40:12', 
                      user: 'john.doe@company.com', 
                      action: 'absence_request', 
                      result: 'allowed', 
                      reason: 'Workflow-Genehmigung erforderlich' 
                    },
                    { 
                      time: '13:39:45', 
                      user: 'lisa.wang@company.com', 
                      action: 'time_check_out', 
                      result: 'allowed', 
                      reason: 'Standort verifiziert' 
                    }
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-muted-foreground">{entry.time}</span>
                        <span className="font-medium">{entry.user}</span>
                        <Badge variant="outline">{entry.action}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{entry.reason}</span>
                        <Badge 
                          variant={entry.result === 'allowed' ? 'default' : 'destructive'}
                        >
                          {entry.result === 'allowed' ? 'Erlaubt' : 'Blockiert'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Policy Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detaillierte Analysen und Berichte werden hier angezeigt.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                DSGVO, Arbeitsrecht und andere Compliance-Aspekte werden hier überwacht.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          <PolicyManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyDashboard;