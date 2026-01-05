import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Palette, 
  Shield, 
  Bell,
  Download,
  Trash2,
  Save
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ExecutiveSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdate: () => void;
}

export const ExecutiveSettingsDialog = ({ open, onOpenChange, onSettingsUpdate }: ExecutiveSettingsDialogProps) => {
  const [settings, setSettings] = useState({
    // Dashboard Einstellungen
    defaultCurrency: 'EUR',
    refreshInterval: 'auto',
    showTrends: true,
    showTargets: true,
    compactView: false,
    
    // KPI Einstellungen
    kpiAutoRefresh: true,
    kpiDecimalPlaces: 1,
    showPercentageChanges: true,
    
    // Notification Einstellungen
    budgetAlerts: true,
    forecastUpdates: true,
    auditNotifications: true,
    emailReports: 'weekly',
    
    // Export Einstellungen
    defaultExportFormat: 'xlsx',
    includeCharts: true,
    includeComments: false,
    
    // Security Einstellungen
    auditLogging: true,
    dataRetentionYears: 10,
    autoLogout: 30
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      // Hier würde normalerweise ein API-Call stattfinden
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSettingsUpdate();
      
      toast({
        title: "Einstellungen gespeichert",
        description: "Alle Änderungen wurden erfolgreich übernommen."
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const resetToDefaults = () => {
    setSettings({
      defaultCurrency: 'EUR',
      refreshInterval: 'auto',
      showTrends: true,
      showTargets: true,
      compactView: false,
      kpiAutoRefresh: true,
      kpiDecimalPlaces: 1,
      showPercentageChanges: true,
      budgetAlerts: true,
      forecastUpdates: true,
      auditNotifications: true,
      emailReports: 'weekly',
      defaultExportFormat: 'xlsx',
      includeCharts: true,
      includeComments: false,
      auditLogging: true,
      dataRetentionYears: 10,
      autoLogout: 30
    });
    
    toast({
      title: "Zurückgesetzt",
      description: "Alle Einstellungen wurden auf Standardwerte zurückgesetzt."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Executive Cockpit Einstellungen
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="dashboard">
              <Palette className="h-4 w-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-1" />
              Export
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard-Darstellung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Standard-Währung</Label>
                    <Select value={settings.defaultCurrency} onValueChange={(value) => handleSettingChange('defaultCurrency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="GBP">Britisches Pfund (£)</SelectItem>
                        <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="refresh">Aktualisierung</Label>
                    <Select value={settings.refreshInterval} onValueChange={(value) => handleSettingChange('refreshInterval', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatisch</SelectItem>
                        <SelectItem value="5min">Alle 5 Minuten</SelectItem>
                        <SelectItem value="15min">Alle 15 Minuten</SelectItem>
                        <SelectItem value="manual">Manuell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-trends">Trend-Indikatoren anzeigen</Label>
                    <Switch 
                      id="show-trends"
                      checked={settings.showTrends} 
                      onCheckedChange={(checked) => handleSettingChange('showTrends', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-targets">Zielwerte anzeigen</Label>
                    <Switch 
                      id="show-targets"
                      checked={settings.showTargets} 
                      onCheckedChange={(checked) => handleSettingChange('showTargets', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-view">Kompakte Ansicht</Label>
                    <Switch 
                      id="compact-view"
                      checked={settings.compactView} 
                      onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KPI-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="decimal-places">Dezimalstellen</Label>
                    <Select value={settings.kpiDecimalPlaces.toString()} onValueChange={(value) => handleSettingChange('kpiDecimalPlaces', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-refresh">Automatische Aktualisierung</Label>
                    <Switch 
                      id="auto-refresh"
                      checked={settings.kpiAutoRefresh} 
                      onCheckedChange={(checked) => handleSettingChange('kpiAutoRefresh', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="percentage-changes">Prozentuale Änderungen anzeigen</Label>
                    <Switch 
                      id="percentage-changes"
                      checked={settings.showPercentageChanges} 
                      onCheckedChange={(checked) => handleSettingChange('showPercentageChanges', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Benachrichtigungen & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="budget-alerts">Budget-Überschreitungsalarme</Label>
                      <p className="text-sm text-muted-foreground">Warnung bei kritischen Budgetüberschreitungen</p>
                    </div>
                    <Switch 
                      id="budget-alerts"
                      checked={settings.budgetAlerts} 
                      onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="forecast-updates">Forecast-Updates</Label>
                      <p className="text-sm text-muted-foreground">Benachrichtigung bei neuen Prognose-Daten</p>
                    </div>
                    <Switch 
                      id="forecast-updates"
                      checked={settings.forecastUpdates} 
                      onCheckedChange={(checked) => handleSettingChange('forecastUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="audit-notifications">Audit-Benachrichtigungen</Label>
                      <p className="text-sm text-muted-foreground">Wichtige Compliance-Ereignisse</p>
                    </div>
                    <Switch 
                      id="audit-notifications"
                      checked={settings.auditNotifications} 
                      onCheckedChange={(checked) => handleSettingChange('auditNotifications', checked)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email-reports">E-Mail Reports</Label>
                  <Select value={settings.emailReports} onValueChange={(value) => handleSettingChange('emailReports', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Nie</SelectItem>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Standard-Export-Format</Label>
                  <Select value={settings.defaultExportFormat} onValueChange={(value) => handleSettingChange('defaultExportFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-charts">Charts in Export einbeziehen</Label>
                    <Switch 
                      id="include-charts"
                      checked={settings.includeCharts} 
                      onCheckedChange={(checked) => handleSettingChange('includeCharts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-comments">Kommentare einbeziehen</Label>
                    <Switch 
                      id="include-comments"
                      checked={settings.includeComments} 
                      onCheckedChange={(checked) => handleSettingChange('includeComments', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sicherheit & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data-retention">Datenaufbewahrung (Jahre)</Label>
                    <Input 
                      id="data-retention"
                      type="number"
                      value={settings.dataRetentionYears}
                      onChange={(e) => handleSettingChange('dataRetentionYears', parseInt(e.target.value))}
                      min={1}
                      max={20}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="auto-logout">Auto-Logout (Minuten)</Label>
                    <Input 
                      id="auto-logout"
                      type="number"
                      value={settings.autoLogout}
                      onChange={(e) => handleSettingChange('autoLogout', parseInt(e.target.value))}
                      min={5}
                      max={120}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-logging">Audit-Protokollierung</Label>
                    <p className="text-sm text-muted-foreground">Alle Aktionen werden protokolliert (DSGVO-konform)</p>
                  </div>
                  <Switch 
                    id="audit-logging"
                    checked={settings.auditLogging} 
                    onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                  />
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔒 DSGVO-Compliance</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Alle Finanzdaten werden verschlüsselt gespeichert</li>
                    <li>• Automatische Löschung nach Aufbewahrungszeit</li>
                    <li>• Vollständige Audit-Trails verfügbar</li>
                    <li>• Benutzeraktivitäten werden protokolliert</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={resetToDefaults}>
            <Trash2 className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};