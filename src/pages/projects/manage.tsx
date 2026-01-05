import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  ArrowLeft, 
  Database, 
  Users, 
  FileText, 
  Shield, 
  Activity,
  Archive,
  Plus,
  Filter,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import StandardPageLayout from "@/components/layout/StandardPageLayout";
import { useProjects } from "@/hooks/projects/useProjects";

export default function ProjectManagementPage() {
  const navigate = useNavigate();

  const actions = (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Projekten
      </Button>
      <Button 
        onClick={() => navigate('/projects/new')}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Neues Projekt
      </Button>
    </div>
  );

  const { projects, isLoading } = useProjects();

  // Berechne echte Statistiken aus den Projekten
  const projectStats = React.useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const overdueProjects = projects.filter(p => 
      p.end_date && new Date(p.end_date) < new Date() && p.status !== 'completed'
    ).length;

    return [
      { label: "Aktive Projekte", value: activeProjects, status: "success" },
      { label: "Überfällige Projekte", value: overdueProjects, status: "error" },
      { label: "Geplante Projekte", value: pendingProjects, status: "warning" },
      { label: "Abgeschlossene Projekte", value: completedProjects, status: "info" }
    ];
  }, [projects]);

  const recentActivities: any[] = [];

  const templates = [
    { name: "Standard Webprojekt", usage: 12, description: "Für typische Webentwicklungsprojekte" },
    { name: "Mobile App Entwicklung", usage: 8, description: "Template für App-Entwicklung" },
    { name: "Marketing Kampagne", usage: 15, description: "Für Marketingprojekte und Kampagnen" },
    { name: "IT Infrastructure", usage: 5, description: "Für IT-Infrastrukturprojekte" }
  ];

  return (
    <StandardPageLayout
      title="Projektverwaltung"
      subtitle="Zentrale Verwaltung und Konfiguration aller Projektaspekte"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Projekt-Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Badge 
                    variant={stat.status === "success" ? "default" : 
                            stat.status === "error" ? "destructive" : 
                            stat.status === "warning" ? "secondary" : "outline"}
                  >
                    {stat.status === "success" ? "Gut" : 
                     stat.status === "error" ? "Kritisch" : 
                     stat.status === "warning" ? "Achtung" : "Info"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="permissions">Berechtigungen</TabsTrigger>
            <TabsTrigger value="archive">Archiv</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Suchleiste */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Projektsuche und Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input placeholder="Projekt suchen..." className="flex-1" />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Letzte Aktivitäten */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Letzte Aktivitäten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.project}</p>
                        <p className="text-sm text-muted-foreground">{activity.action} von {activity.user}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Projektvorlagen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map((template, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.usage}x verwendet</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Bearbeiten</Button>
                        <Button size="sm">Verwenden</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Berechtigungen verwalten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Admin-Rechte</h4>
                      <p className="text-sm text-muted-foreground mb-4">Vollzugriff auf alle Projekte</p>
                      <Button size="sm" variant="outline">Verwalten</Button>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Projektleiter</h4>
                      <p className="text-sm text-muted-foreground mb-4">Verwalten eigener Projekte</p>
                      <Button size="sm" variant="outline">Verwalten</Button>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Team-Mitglieder</h4>
                      <p className="text-sm text-muted-foreground mb-4">Zugewiesene Tasks bearbeiten</p>
                      <Button size="sm" variant="outline">Verwalten</Button>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Archivierte Projekte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Keine archivierten Projekte vorhanden</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="max-w-xl mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle>Projekt-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Alle Einstellungen für Projekte wurden in das zentrale Einstellungsmodul verschoben. 
                  Dort können Sie alle Konfigurationen zentral verwalten.
                </p>
                <Button 
                  onClick={() => navigate('/settings/projects')} 
                  className="gap-2"
                >
                  Zu den Einstellungen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageLayout>
  );
}