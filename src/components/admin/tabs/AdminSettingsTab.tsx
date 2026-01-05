import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Shield, Bot, Database, Clock, Loader2 } from "lucide-react";
import { usePlatformSettings, useSaveAllSettings } from "@/hooks/usePlatformSettings";
import { useToast } from "@/components/ui/use-toast";

const AdminSettingsTab = () => {
  const { data, isLoading } = usePlatformSettings();
  const saveSettings = useSaveAllSettings();
  const { toast } = useToast();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data?.settings) {
      setLocalSettings(data.settings);
    }
  }, [data?.settings]);

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings.mutate(localSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Einstellungen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">Globale Plattform-Konfiguration</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Plattform-Einstellungen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Standard-Module bei Neuanlage</p>
              <div className="space-y-2">
                {['workforce_planning', 'feedback_360', 'innovation_hub'].map(mod => {
                  const defaultModules = localSettings.default_modules || [];
                  const isChecked = Array.isArray(defaultModules) && defaultModules.includes(mod);
                  return (
                    <div key={mod} className="flex items-center gap-2">
                      <Checkbox 
                        id={mod} 
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const current = Array.isArray(defaultModules) ? defaultModules : [];
                          const updated = checked 
                            ? [...current, mod]
                            : current.filter((m: string) => m !== mod);
                          updateSetting('default_modules', updated);
                        }}
                      />
                      <label htmlFor={mod} className="text-sm capitalize">{mod.replace('_', ' ')}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Sicherheits-Richtlinien</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Passwort-Mindestlänge</label>
              <Select 
                value={String(localSettings.password_min_length || '12')}
                onValueChange={(v) => updateSetting('password_min_length', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 Zeichen</SelectItem>
                  <SelectItem value="10">10 Zeichen</SelectItem>
                  <SelectItem value="12">12 Zeichen</SelectItem>
                  <SelectItem value="16">16 Zeichen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">2FA-Richtlinie</label>
              <Select 
                value={String(localSettings.two_factor_policy || 'admin').replace(/"/g, '')}
                onValueChange={(v) => updateSetting('two_factor_policy', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="admin">Pflicht für Admins</SelectItem>
                  <SelectItem value="all">Pflicht für alle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Session Timeout (Stunden)</label>
              <Select 
                value={String(localSettings.session_timeout_hours || '8')}
                onValueChange={(v) => updateSetting('session_timeout_hours', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Stunde</SelectItem>
                  <SelectItem value="4">4 Stunden</SelectItem>
                  <SelectItem value="8">8 Stunden</SelectItem>
                  <SelectItem value="24">24 Stunden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Max. Login-Versuche</label>
              <Select 
                value={String(localSettings.max_login_attempts || '5')}
                onValueChange={(v) => updateSetting('max_login_attempts', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">KI-Konfiguration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Token-Limit (Basic)</label>
              <Select 
                value={String(localSettings.ai_token_limit_basic || '50000')}
                onValueChange={(v) => updateSetting('ai_token_limit_basic', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25000">25.000 / Monat</SelectItem>
                  <SelectItem value="50000">50.000 / Monat</SelectItem>
                  <SelectItem value="100000">100.000 / Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Token-Limit (Pro)</label>
              <Select 
                value={String(localSettings.ai_token_limit_pro || '200000')}
                onValueChange={(v) => updateSetting('ai_token_limit_pro', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100000">100.000 / Monat</SelectItem>
                  <SelectItem value="200000">200.000 / Monat</SelectItem>
                  <SelectItem value="500000">500.000 / Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Datenaufbewahrung</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Logs-Aufbewahrung (Tage)</label>
              <Select 
                value={String(localSettings.logs_retention_days || '90')}
                onValueChange={(v) => updateSetting('logs_retention_days', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Tage</SelectItem>
                  <SelectItem value="60">60 Tage</SelectItem>
                  <SelectItem value="90">90 Tage</SelectItem>
                  <SelectItem value="180">180 Tage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Audit-Logs-Aufbewahrung (Tage)</label>
              <Select 
                value={String(localSettings.audit_retention_days || '365')}
                onValueChange={(v) => updateSetting('audit_retention_days', v)}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="180">180 Tage</SelectItem>
                  <SelectItem value="365">1 Jahr</SelectItem>
                  <SelectItem value="730">2 Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Rate-Limiting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">API Requests / Stunde</label>
                <Select 
                  value={String(localSettings.api_rate_limit || '1000')}
                  onValueChange={(v) => updateSetting('api_rate_limit', v)}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1.000</SelectItem>
                    <SelectItem value="2000">2.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline">Abbrechen</Button>
        <Button onClick={handleSave} disabled={saveSettings.isPending}>
          {saveSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsTab;