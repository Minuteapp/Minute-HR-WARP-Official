import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Key, 
  Lock, 
  RefreshCw, 
  Globe, 
  AlertTriangle,
  Plus,
  Trash2,
  Save
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiGlobalSettings {
  id: string;
  company_id: string;
  api_enabled: boolean;
  default_access_level: string;
  auth_methods: string[];
  token_rotation_days: number;
  ip_whitelist: string[];
  rate_limit_per_minute: number;
  throttling_enabled: boolean;
  payload_limit_mb: number;
  encryption_in_transit: boolean;
  encryption_at_rest: boolean;
}

export function GlobalApiSettingsTab() {
  const queryClient = useQueryClient();
  const [newIp, setNewIp] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ['api-global-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_global_settings')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Return default settings if none exist
      return data || {
        api_enabled: true,
        default_access_level: 'read-only',
        auth_methods: ['api_key'],
        token_rotation_days: 90,
        ip_whitelist: [],
        rate_limit_per_minute: 100,
        throttling_enabled: true,
        payload_limit_mb: 10,
        encryption_in_transit: true,
        encryption_at_rest: true
      } as Partial<ApiGlobalSettings>;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: Partial<ApiGlobalSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('api_global_settings')
          .update(newSettings)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_global_settings')
          .insert(newSettings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-global-settings'] });
      toast.success("Einstellungen gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    }
  });

  const updateSetting = (key: keyof ApiGlobalSettings, value: any) => {
    saveMutation.mutate({ ...settings, [key]: value });
  };

  const addIpToWhitelist = () => {
    if (newIp && !settings?.ip_whitelist?.includes(newIp)) {
      const newList = [...(settings?.ip_whitelist || []), newIp];
      updateSetting('ip_whitelist', newList);
      setNewIp("");
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    const newList = (settings?.ip_whitelist || []).filter(i => i !== ip);
    updateSetting('ip_whitelist', newList);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API-Status
          </CardTitle>
          <CardDescription>
            Globale API-Einstellungen und Zugriffskontrolle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>API Global aktiviert</Label>
              <p className="text-sm text-muted-foreground">
                Aktiviert oder deaktiviert alle API-Zugriffe
              </p>
            </div>
            <Switch 
              checked={settings?.api_enabled ?? true}
              onCheckedChange={(checked) => updateSetting('api_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Standard-Zugriffsebene</Label>
              <Select 
                value={settings?.default_access_level || 'read-only'}
                onValueChange={(value) => updateSetting('default_access_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read-only">Nur Lesen</SelectItem>
                  <SelectItem value="read-write">Lesen & Schreiben</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rate-Limit (Anfragen/Minute)</Label>
              <Input 
                type="number"
                value={settings?.rate_limit_per_minute || 100}
                onChange={(e) => updateSetting('rate_limit_per_minute', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentifizierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentifizierung
          </CardTitle>
          <CardDescription>
            Unterstützte Authentifizierungsmethoden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { key: 'api_key', label: 'API-Keys', description: 'Statische Schlüssel für Server-zu-Server' },
              { key: 'oauth2', label: 'OAuth 2.0', description: 'Token-basierte Authentifizierung' },
              { key: 'saml', label: 'SAML', description: 'Enterprise SSO Integration' },
              { key: 'oidc', label: 'OpenID Connect', description: 'Identity Provider Integration' }
            ].map((method) => (
              <div key={method.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>{method.label}</Label>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                <Switch 
                  checked={(settings?.auth_methods as string[] || []).includes(method.key)}
                  onCheckedChange={(checked) => {
                    const methods = settings?.auth_methods as string[] || [];
                    const newMethods = checked 
                      ? [...methods, method.key]
                      : methods.filter(m => m !== method.key);
                    updateSetting('auth_methods', newMethods);
                  }}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Token-Rotation (Tage)
              </Label>
              <Input 
                type="number"
                value={settings?.token_rotation_days || 90}
                onChange={(e) => updateSetting('token_rotation_days', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Automatische Rotation nach dieser Zeit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sicherheit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicherheit
          </CardTitle>
          <CardDescription>
            Sicherheitseinstellungen und IP-Beschränkungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Throttling aktiviert</Label>
                <p className="text-xs text-muted-foreground">Begrenzt Anfragen bei Überlastung</p>
              </div>
              <Switch 
                checked={settings?.throttling_enabled ?? true}
                onCheckedChange={(checked) => updateSetting('throttling_enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Payload-Limit (MB)</Label>
              <Input 
                type="number"
                value={settings?.payload_limit_mb || 10}
                onChange={(e) => updateSetting('payload_limit_mb', parseInt(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Verschlüsselung
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>In-Transit (TLS)</Label>
                  <p className="text-xs text-muted-foreground">HTTPS für alle Verbindungen</p>
                </div>
                <Switch 
                  checked={settings?.encryption_in_transit ?? true}
                  onCheckedChange={(checked) => updateSetting('encryption_in_transit', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>At-Rest</Label>
                  <p className="text-xs text-muted-foreground">Verschlüsselte Datenspeicherung</p>
                </div>
                <Switch 
                  checked={settings?.encryption_at_rest ?? true}
                  onCheckedChange={(checked) => updateSetting('encryption_at_rest', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* IP Whitelist */}
          <div className="space-y-4">
            <Label>IP-Whitelist</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="z.B. 192.168.1.0/24"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
              />
              <Button onClick={addIpToWhitelist} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {(settings?.ip_whitelist as string[] || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(settings?.ip_whitelist as string[] || []).map((ip) => (
                  <Badge key={ip} variant="secondary" className="gap-1">
                    {ip}
                    <button onClick={() => removeIpFromWhitelist(ip)}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Keine IP-Beschränkung aktiv. Alle IPs können zugreifen.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
