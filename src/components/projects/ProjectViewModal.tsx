import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Eye, Calendar, DollarSign, Users, Settings, CheckCircle2, Clock, Circle, TrendingUp, Mail, Bell, AlertTriangle, BarChart2, Archive, Trash2 } from "lucide-react";
import { getInitials } from "@/utils/avatarUtils";

interface ProjectViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
}

export function ProjectViewModal({ open, onOpenChange, project }: ProjectViewModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState(true);
  const [autoReports, setAutoReports] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [budgetTracking, setBudgetTracking] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'planning':
        return 'bg-blue-500';
      case 'review':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'planning':
        return 'Planung';
      case 'review':
        return 'Review';
      default:
        return status;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'green':
        return 'Grün';
      case 'yellow':
        return 'Gelb';
      case 'red':
        return 'Hoch';
      default:
        return 'Unbekannt';
    }
  };

  const tabs = [
    { id: "overview", label: "Übersicht", icon: Eye },
    { id: "timeline", label: "Zeitplan", icon: Calendar },
    { id: "budget", label: "Budget", icon: DollarSign },
    { id: "team", label: "Team", icon: Users },
    { id: "settings", label: "Einstellungen", icon: Settings },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl">{project?.name || 'ERP Migration'}</DialogTitle>
                <Badge className={`${getStatusColor(project?.status || 'active')} text-white`}>
                  {getStatusText(project?.status || 'active')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{project?.project_type || 'IT'}</p>
            </div>
            <Button variant="outline" size="sm">
              Bearbeiten
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <div className="text-sm text-blue-700 mb-1">Fortschritt</div>
                  <div className="text-3xl font-bold text-blue-600">{project?.progress || 45}%</div>
                  <Progress value={project?.progress || 45} className="h-1 mt-2 bg-blue-200" />
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-100">
                <CardContent className="p-4">
                  <div className="text-sm text-green-700 mb-1">Budget</div>
                  <div className="text-3xl font-bold text-green-600">€{project?.budget || 850}K</div>
                  <div className="text-xs text-green-700 mt-1">
                    {project?.progress || 62}% verbraucht
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-100">
                <CardContent className="p-4">
                  <div className="text-sm text-purple-700 mb-1">Team</div>
                  <div className="text-3xl font-bold text-purple-600">{project?.team_members?.length || 12}</div>
                  <div className="text-xs text-purple-700 mt-1">Mitglieder</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="p-4">
                  <div className="text-sm text-orange-700 mb-1">Risiko</div>
                  <div className="text-2xl font-bold text-orange-600">Hoch</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Projektname</label>
                  <p className="mt-1">{project?.name || 'ERP Migration'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Abteilung</label>
                  <p className="mt-1">{project?.project_type || 'IT'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={`${getStatusColor(project?.status || 'active')} text-white mt-1`}>
                    {getStatusText(project?.status || 'active')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Projektleiter</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                      AS
                    </div>
                    <span>Anna Schmidt</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Zeitraum</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {project?.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '01.01.2025'} - 
                      {project?.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '31.12.2025'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Health Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor('yellow').replace('text-', 'bg-')}`}></div>
                    <span className={getHealthColor('yellow')}>Gelb</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Projektbeschreibung</label>
              <p className="mt-2 text-sm leading-relaxed">
                {project?.description || 'Dieses Projekt umfasst die vollständige Migration unserer bestehenden ERP-Systeme auf eine moderne Cloud-basierte Lösung. Ziel ist die Verbesserung der Effizienz und Skalierbarkeit unserer Geschäftsprozesse.'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Startdatum</label>
                  <p className="mt-1">
                    {project?.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '01.01.2025'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Enddatum</label>
                  <p className="mt-1">
                    {project?.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '31.12.2025'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Meilensteine</label>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Kickoff Meeting</p>
                      <p className="text-sm text-muted-foreground">01.01.2025 - Abgeschlossen</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Phase 1 Abschluss</p>
                      <p className="text-sm text-muted-foreground">30.04.2025 - In Arbeit</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Go-Live</p>
                      <p className="text-sm text-muted-foreground">31.12.2025 - Geplant</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Zeitplan-Status</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Das Projekt liegt aktuell im Zeitplan. Nächster Meilenstein in 45 Tagen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">Gesamtbudget</div>
                  <div className="text-4xl font-bold">€{project?.budget || 850}K</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">Verbrauchte Mittel</div>
                  <div className="text-4xl font-bold">{project?.progress || 62}%</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Budget-Verteilung</label>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Personal</span>
                    <span className="text-sm font-medium">€520K (61%)</span>
                  </div>
                  <Progress value={61} className="h-2 bg-gray-200" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Infrastruktur</span>
                    <span className="text-sm font-medium">€210K (25%)</span>
                  </div>
                  <Progress value={25} className="h-2 bg-gray-200" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Software & Lizenzen</span>
                    <span className="text-sm font-medium">€85K (10%)</span>
                  </div>
                  <Progress value={10} className="h-2 bg-gray-200" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Sonstiges</span>
                    <span className="text-sm font-medium">€35K (4%)</span>
                  </div>
                  <Progress value={4} className="h-2 bg-gray-200" />
                </div>
              </div>
            </div>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-orange-900">Budget-Warnung</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Aktuelle Hochrechnung zeigt 8% Überschreitung. Review empfohlen.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Projektteam (12 Mitglieder)</h3>
              </div>
              
              <div className="space-y-2">
                {/* Projektleiter */}
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-semibold text-white text-sm">
                    AS
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Anna Schmidt</p>
                    <p className="text-sm text-muted-foreground">Projektleiter</p>
                  </div>
                  <Badge className="bg-blue-500 text-white">Admin</Badge>
                </div>

                {/* Team-Mitglieder werden aus der Datenbank geladen */}
                <div className="text-center py-4 text-muted-foreground">
                  <p>Keine weiteren Teammitglieder zugewiesen</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Benachrichtigungen */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Benachrichtigungen</p>
                      <p className="text-sm text-muted-foreground">Email bei wichtigen Updates</p>
                    </div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Automatische Berichte</p>
                      <p className="text-sm text-muted-foreground">Wöchentliche Status-Reports</p>
                    </div>
                  </div>
                  <Switch checked={autoReports} onCheckedChange={setAutoReports} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Risiko-Alerts</p>
                      <p className="text-sm text-muted-foreground">Bei kritischen Risiken warnen</p>
                    </div>
                  </div>
                  <Switch checked={riskAlerts} onCheckedChange={setRiskAlerts} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Budget-Tracking</p>
                      <p className="text-sm text-muted-foreground">Kontinuierliche Überwachung</p>
                    </div>
                  </div>
                  <Switch checked={budgetTracking} onCheckedChange={setBudgetTracking} />
                </div>
              </div>

              {/* Gefahrenzone */}
              <div className="border-t pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Gefahrenzone
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Diese Aktionen können nicht rückgängig gemacht werden
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                  >
                    <Archive className="w-4 h-4" />
                    Projekt archivieren
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Projekt löschen
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
