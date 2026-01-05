
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProjectSettingsConfig = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Performance Einstellungen
    enableOptimization: true,
    cacheTimeout: 300, // Sekunden
    enableMemoization: true,
    enableLazyLoading: true,
    
    // Standard Projekteinstellungen
    defaultStatus: 'planning',
    defaultPriority: 'medium',
    autoAssignOwner: false,
    requireApproval: false,
    
    // Mobile Einstellungen
    enableMobileDashboard: true,
    compactView: true,
    touchOptimization: true,
    offlineMode: false,
    
    // Workflow Einstellungen
    enableAutomation: true,
    autoNotifications: true,
    autoStatusUpdates: false,
    autoDeadlineReminders: true,
    
    // Budget Einstellungen
    enableBudgetForecasting: true,
    budgetCurrency: 'EUR',
    budgetPeriod: 'monthly',
    budgetThreshold: 80, // Prozent
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Hier würde die API-Aufrufe zum Speichern stattfinden
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Projekteinstellungen wurden erfolgreich aktualisiert."
    });
  };

  const handleReset = () => {
    // Zurücksetzen auf Standardwerte
    setSettings({
      enableOptimization: true,
      cacheTimeout: 300,
      enableMemoization: true,
      enableLazyLoading: true,
      defaultStatus: 'planning',
      defaultPriority: 'medium',
      autoAssignOwner: false,
      requireApproval: false,
      enableMobileDashboard: true,
      compactView: true,
      touchOptimization: true,
      offlineMode: false,
      enableAutomation: true,
      autoNotifications: true,
      autoStatusUpdates: false,
      autoDeadlineReminders: true,
      enableBudgetForecasting: true,
      budgetCurrency: 'EUR',
      budgetPeriod: 'monthly',
      budgetThreshold: 80,
    });
    
    toast({
      title: "Einstellungen zurückgesetzt",
      description: "Alle Einstellungen wurden auf die Standardwerte zurückgesetzt."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Projekteinstellungen
          </h2>
          <p className="text-muted-foreground">
            Konfigurieren Sie grundlegende Parameter für das Projektmanagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      {/* Performance Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Performance-Optimierungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Performance-Optimierung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Nutzt useOptimizedProjects Hook und Memoization
              </p>
            </div>
            <Switch
              checked={settings.enableOptimization}
              onCheckedChange={(checked) => handleSettingChange('enableOptimization', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cache-Timeout (Sekunden)</Label>
            <Input
              type="number"
              value={settings.cacheTimeout}
              onChange={(e) => handleSettingChange('cacheTimeout', Number(e.target.value))}
              min="60"
              max="3600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>React Memoization</Label>
              <p className="text-sm text-muted-foreground">
                Verwendet React.memo für ProjectCard-Komponenten
              </p>
            </div>
            <Switch
              checked={settings.enableMemoization}
              onCheckedChange={(checked) => handleSettingChange('enableMemoization', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lazy Loading</Label>
              <p className="text-sm text-muted-foreground">
                Lädt Komponenten erst bei Bedarf
              </p>
            </div>
            <Switch
              checked={settings.enableLazyLoading}
              onCheckedChange={(checked) => handleSettingChange('enableLazyLoading', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Projekt-Standardeinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Standard-Projekteinstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard-Status</Label>
              <Select
                value={settings.defaultStatus}
                onValueChange={(value) => handleSettingChange('defaultStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planung</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="pending">Wartend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Standard-Priorität</Label>
              <Select
                value={settings.defaultPriority}
                onValueChange={(value) => handleSettingChange('defaultPriority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Zuordnung des Erstellers</Label>
              <p className="text-sm text-muted-foreground">
                Weist den Projektersteller automatisch als Projektleiter zu
              </p>
            </div>
            <Switch
              checked={settings.autoAssignOwner}
              onCheckedChange={(checked) => handleSettingChange('autoAssignOwner', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Genehmigung erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Neue Projekte müssen genehmigt werden
              </p>
            </div>
            <Switch
              checked={settings.requireApproval}
              onCheckedChange={(checked) => handleSettingChange('requireApproval', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Optimierung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mobile Dashboard aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Spezielle mobile Ansicht für Projektübersicht
              </p>
            </div>
            <Switch
              checked={settings.enableMobileDashboard}
              onCheckedChange={(checked) => handleSettingChange('enableMobileDashboard', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Kompakte Ansicht</Label>
              <p className="text-sm text-muted-foreground">
                Platzsparende Darstellung für mobile Geräte
              </p>
            </div>
            <Switch
              checked={settings.compactView}
              onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Touch-Optimierung</Label>
              <p className="text-sm text-muted-foreground">
                Verbesserte Touch-Gesten und Interaktionen
              </p>
            </div>
            <Switch
              checked={settings.touchOptimization}
              onCheckedChange={(checked) => handleSettingChange('touchOptimization', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Offline-Modus (Beta)</Label>
              <p className="text-sm text-muted-foreground">
                Grundlegende Funktionen auch ohne Internetverbindung
              </p>
            </div>
            <Switch
              checked={settings.offlineMode}
              onCheckedChange={(checked) => handleSettingChange('offlineMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow & Automatisierung */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow & Automatisierung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatisierung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Trigger-basierte Automatisierung für Projektprozesse
              </p>
            </div>
            <Switch
              checked={settings.enableAutomation}
              onCheckedChange={(checked) => handleSettingChange('enableAutomation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Sendet automatisch E-Mails bei wichtigen Events
              </p>
            </div>
            <Switch
              checked={settings.autoNotifications}
              onCheckedChange={(checked) => handleSettingChange('autoNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Status-Updates</Label>
              <p className="text-sm text-muted-foreground">
                Aktualisiert Projektstatus basierend auf Fortschritt
              </p>
            </div>
            <Switch
              checked={settings.autoStatusUpdates}
              onCheckedChange={(checked) => handleSettingChange('autoStatusUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Deadline-Erinnerungen</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Erinnerungen vor Projektdeadlines
              </p>
            </div>
            <Switch
              checked={settings.autoDeadlineReminders}
              onCheckedChange={(checked) => handleSettingChange('autoDeadlineReminders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget & Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle>Budget & Forecasting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Budget-Forecasting aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Erweiterte Budgetprognosen und Finanzanalysen
              </p>
            </div>
            <Switch
              checked={settings.enableBudgetForecasting}
              onCheckedChange={(checked) => handleSettingChange('enableBudgetForecasting', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard-Währung</Label>
              <Select
                value={settings.budgetCurrency}
                onValueChange={(value) => handleSettingChange('budgetCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="GBP">Britisches Pfund (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget-Periode</Label>
              <Select
                value={settings.budgetPeriod}
                onValueChange={(value) => handleSettingChange('budgetPeriod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget-Warnschwelle (%)</Label>
            <Input
              type="number"
              value={settings.budgetThreshold}
              onChange={(e) => handleSettingChange('budgetThreshold', Number(e.target.value))}
              min="50"
              max="100"
            />
            <p className="text-sm text-muted-foreground">
              Warnung bei Überschreitung dieser Schwelle
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSettingsConfig;

