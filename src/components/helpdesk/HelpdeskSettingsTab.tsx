import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Users, Info, Zap, Mail, AlertTriangle, Save, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useHelpdeskSettings, useSaveHelpdeskSettings, useHelpdeskTeams } from '@/hooks/useHelpdesk';
import { Skeleton } from "@/components/ui/skeleton";

export const HelpdeskSettingsTab = () => {
  const { data: savedSettings, isLoading } = useHelpdeskSettings();
  const { data: teams } = useHelpdeskTeams();
  const saveSettings = useSaveHelpdeskSettings();

  // Allgemein Settings
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: 'Minute HR GmbH',
    domain: 'minute-hr.de',
    timezone: 'Europe/Berlin',
    autoAssignment: true,
    aiSuggestions: true,
    workflowAutomation: true,
    responseTime: 4,
    resolutionTime: 24,
    criticalResponseTime: 1,
  });

  // Benachrichtigungen
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    newTickets: true,
    assignedTickets: true,
    resolvedTickets: true,
    overdueTickets: true,
    emailTemplate: 'standard',
  });

  // Gespeicherte Einstellungen laden
  useEffect(() => {
    if (savedSettings) {
      if (savedSettings.general) {
        setGeneralSettings(prev => ({ ...prev, ...savedSettings.general }));
      }
      if (savedSettings.notifications) {
        setNotificationSettings(prev => ({ ...prev, ...savedSettings.notifications }));
      }
    }
  }, [savedSettings]);

  const handleSave = () => {
    saveSettings.mutate({
      general: generalSettings,
      notifications: notificationSettings,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Online</span>;
      case 'offline':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Offline</span>;
      case 'abwesend':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Abwesend</span>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Team-Mitglieder aus Teams extrahieren
  const teamMembers = teams?.flatMap(team => {
    const members = team.members as Array<{ name: string; role: string; status: string }> | null;
    return members?.map(m => ({
      id: `${team.id}-${m.name}`,
      name: m.name,
      role: m.role || 'HR-Agent',
      status: m.status || 'offline',
      team: team.name,
    })) || [];
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">Konfigurieren Sie Ihr HR Helpdesk-System</p>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Sie haben HR-Admin-Rechte. Einige Systemeinstellungen erfordern System-Admin-Rechte.
        </p>
      </div>

      <Tabs defaultValue="allgemein" className="w-full">
        <div className="bg-muted/50 p-1 rounded-lg mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-transparent">
            <TabsTrigger value="allgemein" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="h-4 w-4" />
              Allgemein
            </TabsTrigger>
            <TabsTrigger value="benachrichtigungen" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4" />
              Benachrichtigungen
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              Team & Rollen
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Allgemein Tab */}
        <TabsContent value="allgemein" className="space-y-6">
          {/* Organisation */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Organisation</h3>
              <p className="text-sm text-muted-foreground">Grundlegende Informationen zu Ihrer Organisation</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organisationsname</Label>
                <Input
                  id="org-name"
                  value={generalSettings.organizationName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, organizationName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={generalSettings.domain}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, domain: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zeitzone</Label>
                <Select
                  value={generalSettings.timezone}
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="Europe/Berlin">Europe/Berlin (GMT+1)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                Diese Einstellungen können nur vom System-Administrator geändert werden.
              </p>
            </div>
          </div>

          {/* Automatisierung */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Automatisierung</CardTitle>
                  <CardDescription>Steuern Sie automatische Prozesse</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatische Zuweisung</Label>
                  <p className="text-sm text-muted-foreground">Tickets automatisch an verfügbare Agenten zuweisen</p>
                </div>
                <Switch
                  checked={generalSettings.autoAssignment}
                  onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, autoAssignment: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>KI-Antwortvorschläge</Label>
                  <p className="text-sm text-muted-foreground">KI generiert automatisch Antwortvorschläge aus der Wissensdatenbank</p>
                </div>
                <Switch
                  checked={generalSettings.aiSuggestions}
                  onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, aiSuggestions: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Workflow-Automatisierung</Label>
                  <p className="text-sm text-muted-foreground">Aktiviert automatische Workflows für bestimmte Ticket-Typen</p>
                </div>
                <Switch
                  checked={generalSettings.workflowAutomation}
                  onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, workflowAutomation: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* SLA-Einstellungen */}
          <Card>
            <CardHeader>
              <CardTitle>SLA-Einstellungen</CardTitle>
              <CardDescription>Service Level Agreements konfigurieren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response-time">Reaktionszeit (Stunden)</Label>
                  <Input
                    id="response-time"
                    type="number"
                    value={generalSettings.responseTime}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, responseTime: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolution-time">Lösungszeit (Stunden)</Label>
                  <Input
                    id="resolution-time"
                    type="number"
                    value={generalSettings.resolutionTime}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, resolutionTime: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="critical-time">Kritisch - Reaktionszeit (Stunden)</Label>
                <Input
                  id="critical-time"
                  type="number"
                  value={generalSettings.criticalResponseTime}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, criticalResponseTime: parseInt(e.target.value) })}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saveSettings.isPending} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {saveSettings.isPending ? 'Speichert...' : 'Änderungen speichern'}
            </Button>
          </div>
        </TabsContent>

        {/* Benachrichtigungen Tab */}
        <TabsContent value="benachrichtigungen" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>E-Mail-Benachrichtigungen</CardTitle>
                  <CardDescription>Konfigurieren Sie E-Mail-Benachrichtigungen</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-Mail-Benachrichtigungen aktivieren</Label>
                  <p className="text-sm text-muted-foreground">Aktivieren Sie E-Mail-Benachrichtigungen für verschiedene Ereignisse</p>
                </div>
                <Switch
                  checked={notificationSettings.emailEnabled}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailEnabled: checked })}
                />
              </div>

              {notificationSettings.emailEnabled && (
                <div className="space-y-3 ml-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-tickets"
                      checked={notificationSettings.newTickets}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newTickets: checked as boolean })}
                    />
                    <Label htmlFor="new-tickets" className="font-normal">Neue Tickets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assigned-tickets"
                      checked={notificationSettings.assignedTickets}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, assignedTickets: checked as boolean })}
                    />
                    <Label htmlFor="assigned-tickets" className="font-normal">Zugewiesene Tickets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="resolved-tickets"
                      checked={notificationSettings.resolvedTickets}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, resolvedTickets: checked as boolean })}
                    />
                    <Label htmlFor="resolved-tickets" className="font-normal">Gelöste Tickets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overdue-tickets"
                      checked={notificationSettings.overdueTickets}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, overdueTickets: checked as boolean })}
                    />
                    <Label htmlFor="overdue-tickets" className="font-normal">Überfällige Tickets</Label>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email-template">E-Mail-Template</Label>
                <Select
                  value={notificationSettings.emailTemplate}
                  onValueChange={(value) => setNotificationSettings({ ...notificationSettings, emailTemplate: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="standard">Standard Template</SelectItem>
                    <SelectItem value="minimal">Minimalistisch</SelectItem>
                    <SelectItem value="detailed">Detailliert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saveSettings.isPending} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {saveSettings.isPending ? 'Speichert...' : 'Änderungen speichern'}
            </Button>
          </div>
        </TabsContent>

        {/* Team & Rollen Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>HR-Agenten</CardTitle>
                  <CardDescription>Verwalten Sie Ihr Helpdesk-Team</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.length > 0 ? (
                  teamMembers.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                          {getInitials(agent.name)}
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.role} • {agent.team}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(agent.status)}
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Teams oder Agenten konfiguriert</p>
                    <p className="text-sm">Erstellen Sie Teams unter "Teams verwalten"</p>
                  </div>
                )}
                
                {/* Agent hinzufügen Button */}
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-2 h-14 text-muted-foreground hover:text-foreground hover:border-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agent hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teams Übersicht */}
          {teams && teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Übersicht Ihrer Helpdesk-Teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">{team.description || 'Keine Beschreibung'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {team.auto_assignment_enabled && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Auto-Zuweisung</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};