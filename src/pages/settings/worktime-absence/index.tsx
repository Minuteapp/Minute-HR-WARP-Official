import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Settings2, Calendar, Users, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import SmartZoneSettings from './components/SmartZoneSettings';

export default function WorktimeAbsencePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { title: 'Arbeitszeitmodelle', value: '4', trend: '+1 diese Woche', color: 'bg-blue-100 text-blue-700' },
    { title: 'Abwesenheitsarten', value: '8', trend: 'Vollständig konfiguriert', color: 'bg-green-100 text-green-700' },
    { title: 'Aktive Genehmigungen', value: '12', trend: '3 ausstehend', color: 'bg-yellow-100 text-yellow-700' },
    { title: 'Automatisierte Regeln', value: '6', trend: 'Alle aktiv', color: 'bg-purple-100 text-purple-700' },
  ];

  const quickActions = [
    {
      title: 'Drag & Drop Konfiguration',
      description: 'Richtlinien per Drag & Drop zuweisen',
      icon: Settings2,
      action: () => navigate('/settings/worktime-absence/drag-drop'),
      color: 'bg-primary text-primary-foreground'
    },
    {
      title: 'Neues Arbeitszeitmodell',
      description: 'Flexizeit, Gleitzeit oder feste Arbeitszeiten',
      icon: Calendar,
      action: () => setActiveTab('working-models'),
      color: 'bg-blue-500 text-white'
    },
    {
      title: 'Abwesenheitsart hinzufügen',
      description: 'Urlaub, Krankheit oder Sonderurlaub',
      icon: Users,
      action: () => setActiveTab('absence-types'),
      color: 'bg-green-500 text-white'
    },
    {
      title: 'Genehmigungsprozess',
      description: 'Workflows und Eskalationsstufen definieren',
      icon: Workflow,
      action: () => setActiveTab('approval-workflows'),
      color: 'bg-purple-500 text-white'
    },
  ];

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arbeitszeit & Abwesenheiten</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Arbeitszeitmodelle, Abwesenheitsarten und Genehmigungsprozesse
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="working-models">Arbeitszeitmodelle</TabsTrigger>
          <TabsTrigger value="absence-types">Abwesenheitsarten</TabsTrigger>
          <TabsTrigger value="smart-zones">Smart Zones</TabsTrigger>
          <TabsTrigger value="approval-workflows">Genehmigungen</TabsTrigger>
          <TabsTrigger value="drag-drop">Drag & Drop</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiken */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <Badge className={stat.color} variant="secondary">
                    {stat.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Schnellaktionen */}
          <Card>
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4" onClick={action.action}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <ActionIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Aktuelle Konfiguration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle Arbeitszeitmodelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Gleitzeit Standard</div>
                    <div className="text-sm text-muted-foreground">Kernzeit 10:00-15:00</div>
                  </div>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Vollzeit 40h</div>
                    <div className="text-sm text-muted-foreground">Mo-Fr 08:00-17:00</div>
                  </div>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Abwesenheitsarten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Jahresurlaub</div>
                    <div className="text-sm text-muted-foreground">30 Tage pro Jahr</div>
                  </div>
                  <Badge variant="secondary">Konfiguriert</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Krankheit</div>
                    <div className="text-sm text-muted-foreground">Unbegrenzt mit Attest ab 3 Tagen</div>
                  </div>
                  <Badge variant="secondary">Konfiguriert</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="working-models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Arbeitszeitmodelle verwalten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hier können Sie verschiedene Arbeitszeitmodelle definieren und verwalten.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absence-types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheitsarten konfigurieren</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Definieren Sie verschiedene Arten von Abwesenheiten und deren Regeln.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-zones" className="space-y-6">
          <SmartZoneSettings />
        </TabsContent>

        <TabsContent value="approval-workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Genehmigungsprozesse einrichten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Konfigurieren Sie Workflows für die Genehmigung von Abwesenheitsanträgen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drag-drop" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drag & Drop Konfiguration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Verwenden Sie die erweiterte Drag & Drop Oberfläche für komplexere Konfigurationen.
              </p>
              <Button onClick={() => navigate('/settings/worktime-absence/drag-drop')}>
                Zur Drag & Drop Konfiguration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}