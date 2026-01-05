import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Users, Shield, Bell, BarChart3, Calendar } from "lucide-react";
import { useState } from "react";

export const WorkforceSettings = () => {
  const [settings, setSettings] = useState({
    autoAssignment: true,
    complianceAlerts: true,
    overtimeWarnings: false,
    skillsTracking: true,
    forecastMode: 'conservative',
    notificationLevel: 'important',
    cachingEnabled: true,
    auditLogging: true,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Allgemeine Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Auto-Besetzung aktivieren</div>
              <div className="text-sm text-muted-foreground">
                Automatische Zuweisung von Mitarbeitern basierend auf Skills und Verfügbarkeit
              </div>
            </div>
            <Switch 
              checked={settings.autoAssignment}
              onCheckedChange={() => toggleSetting('autoAssignment')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Skills-Tracking</div>
              <div className="text-sm text-muted-foreground">
                Überwachung und Verwaltung von Mitarbeiter-Qualifikationen
              </div>
            </div>
            <Switch 
              checked={settings.skillsTracking}
              onCheckedChange={() => toggleSetting('skillsTracking')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Audit-Logging</div>
              <div className="text-sm text-muted-foreground">
                Protokollierung aller Änderungen für Compliance-Zwecke
              </div>
            </div>
            <Switch 
              checked={settings.auditLogging}
              onCheckedChange={() => toggleSetting('auditLogging')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Compliance-Alerts</div>
              <div className="text-sm text-muted-foreground">
                Echtzeit-Warnungen bei Regelverstößen
              </div>
            </div>
            <Switch 
              checked={settings.complianceAlerts}
              onCheckedChange={() => toggleSetting('complianceAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Überstunden-Warnungen</div>
              <div className="text-sm text-muted-foreground">
                Benachrichtigungen bei drohenden Überstunden
              </div>
            </div>
            <Switch 
              checked={settings.overtimeWarnings}
              onCheckedChange={() => toggleSetting('overtimeWarnings')}
            />
          </div>

          <div className="space-y-3">
            <div className="font-medium">Aktive Compliance-Regeln</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Arbeitszeit-Limits</div>
                  <div className="text-sm text-muted-foreground">Max. 10h/Tag, 48h/Woche</div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Ruhezeiten</div>
                  <div className="text-sm text-muted-foreground">Min. 11h zwischen Schichten</div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Nachtarbeit-Limits</div>
                  <div className="text-sm text-muted-foreground">Max. 5 Nächte/Monat</div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warnung</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="font-medium">Benachrichtigungsstufe</div>
            <div className="grid gap-3">
              <label className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  name="notificationLevel" 
                  value="all"
                  checked={settings.notificationLevel === 'all'}
                  onChange={(e) => setSettings(prev => ({...prev, notificationLevel: e.target.value}))}
                />
                <div>
                  <div className="font-medium">Alle Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">Erhalte alle Updates und Warnungen</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  name="notificationLevel" 
                  value="important"
                  checked={settings.notificationLevel === 'important'}
                  onChange={(e) => setSettings(prev => ({...prev, notificationLevel: e.target.value}))}
                />
                <div>
                  <div className="font-medium">Nur wichtige</div>
                  <div className="text-sm text-muted-foreground">Nur kritische Warnungen und Fehler</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  name="notificationLevel" 
                  value="minimal"
                  checked={settings.notificationLevel === 'minimal'}
                  onChange={(e) => setSettings(prev => ({...prev, notificationLevel: e.target.value}))}
                />
                <div>
                  <div className="font-medium">Minimal</div>
                  <div className="text-sm text-muted-foreground">Nur System-kritische Meldungen</div>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Caching aktivieren</div>
              <div className="text-sm text-muted-foreground">
                Verbessert Ladezeiten für häufig abgerufene Daten
              </div>
            </div>
            <Switch 
              checked={settings.cachingEnabled}
              onCheckedChange={() => toggleSetting('cachingEnabled')}
            />
          </div>

          <div className="space-y-3">
            <div className="font-medium">Cache-Einstellungen</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <div className="font-medium">Coverage Percentage</div>
                <div className="text-sm text-muted-foreground">Cache-Dauer: 5 Minuten</div>
                <Button size="sm" variant="outline" className="mt-2">Anpassen</Button>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">Gap Hours</div>
                <div className="text-sm text-muted-foreground">Cache-Dauer: 1 Minute</div>
                <Button size="sm" variant="outline" className="mt-2">Anpassen</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Role Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Benutzerrollen & Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { role: 'Admin', count: 2, permissions: 'Vollzugriff auf alle Module' },
              { role: 'HR-Manager', count: 5, permissions: 'Personalplanung, Compliance, Reports' },
              { role: 'Workforce-Planer', count: 8, permissions: 'Schichtplanung, Zuweisungen, Kapazitäten' },
              { role: 'Manager/Teamleiter', count: 15, permissions: 'Team-Übersicht, Genehmigungen' },
              { role: 'Mitarbeiter', count: 150, permissions: 'Eigene Daten, Verfügbarkeiten' },
              { role: 'Auditor', count: 3, permissions: 'Compliance-Reports, Audit-Logs' },
            ].map((roleInfo) => (
              <div key={roleInfo.role} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{roleInfo.role}</div>
                  <div className="text-sm text-muted-foreground">{roleInfo.permissions}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{roleInfo.count}</div>
                  <div className="text-sm text-muted-foreground">Benutzer</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Datenquellen & Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">Event-Bus Integration</div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Scheduling.shift.* ↔ wf.assignment.*</div>
                  <div>✓ Projects.task.* → WF_Demand</div>
                  <div>✓ Recruiting.job.* ↔ WF_Request</div>
                  <div>✓ Absence.* → Supply reduzieren</div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">Datenquellen Status</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">HR-System</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Verbunden</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Zeiterfassung</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Verbunden</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projektmanagement</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Teilweise</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button variant="outline">Zurücksetzen</Button>
            <Button>Einstellungen speichern</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};