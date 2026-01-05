import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Settings,
  FileText,
  Zap
} from 'lucide-react';

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktive KI-Modelle</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+2</span> neu hinzugefügt
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monatliche Kosten</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2.347€</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">-12%</span> vs. letzter Monat
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eingesparte Zeit</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">342h</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+24%</span> vs. letzter Monat
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">DSGVO-Compliance</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">92%</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-orange-600">2</span> offene Prüfungen
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickActions = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Schnellaktionen
        </CardTitle>
        <CardDescription>
          Häufig verwendete KI-Management-Funktionen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Neues KI-Modell hinzufügen
          </Button>
          <Button size="sm" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            DSGVO-Audit starten
          </Button>
          <Button size="sm" variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Kosten-Report generieren
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Team-Berechtigungen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivity = () => {
  const activities: { id: number; type: string; message: string; time: string; icon: any; iconColor: string }[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Letzte Aktivitäten</CardTitle>
        <CardDescription>
          Aktuelle Ereignisse im KI-Management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <IconComponent className={`h-5 w-5 mt-0.5 ${activity.iconColor}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const ComplianceOverview = () => {
  const complianceData: { name: string; status: string; score: number }[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'in_review':
        return <Badge variant="secondary">In Prüfung</Badge>;
      case 'pending':
        return <Badge variant="outline">Ausstehend</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          DSGVO-Compliance Übersicht
        </CardTitle>
        <CardDescription>
          Status der Datenschutzprüfungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complianceData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-medium">{item.name}</div>
                {getStatusBadge(item.status)}
              </div>
              {item.status === 'approved' && (
                <div className="flex items-center gap-2">
                  <Progress value={item.score} className="w-20" />
                  <span className="text-sm text-muted-foreground">{item.score}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Import sub-components
import AIUsage from './AIUsage';
import AIResearch from './AIResearch';
import AIGovernance from './AIGovernance';
import AIFutureProjects from './AIFutureProjects';

// Component mapping
const AIInventory = AIUsage;
const AIUsageAnalytics = AIUsage;
const AICompliance = AIGovernance;
const AISuggestionPortal = AIResearch;
const AITeamCockpit = AIGovernance;
const AIROIDashboard = AIFutureProjects;
const AIAutomationDiscovery = AIFutureProjects;
const AIPredictiveForecasts = AIFutureProjects;

export const AIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
              <Brain className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Künstliche Intelligenz</h1>
              <p className="text-sm text-muted-foreground">Zentrale KI-Governance und Management-Plattform</p>
            </div>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neues KI-Modell
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger 
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="inventory"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              KI-Inventar
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Nutzung
            </TabsTrigger>
            <TabsTrigger 
              value="compliance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Compliance
            </TabsTrigger>
            <TabsTrigger 
              value="suggestions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Vorschläge
            </TabsTrigger>
            <TabsTrigger 
              value="automation"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Automatisierung
            </TabsTrigger>
            <TabsTrigger 
              value="team"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              KI-Team
            </TabsTrigger>
            <TabsTrigger 
              value="forecasts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Prognosen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <DashboardStats />
            <QuickActions />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplianceOverview />
              <RecentActivity />
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <AIInventory />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AIUsageAnalytics />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <AICompliance />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6">
            <AISuggestionPortal />
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            <AIAutomationDiscovery />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <AITeamCockpit />
          </TabsContent>

          <TabsContent value="forecasts" className="mt-6">
            <AIPredictiveForecasts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};