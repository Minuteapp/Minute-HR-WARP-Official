import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useIntegrationSettings } from "@/hooks/useIntegrationSettings";

const SSOSettings = () => {
  const [provider, setProvider] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [domain, setDomain] = useState("");
  const [autoProvisioning, setAutoProvisioning] = useState(false);
  const { settings, isLoading, saveSettings } = useIntegrationSettings('sso');

  useEffect(() => {
    if (settings) {
      setProvider(settings.provider || "");
      setClientId(settings.settings.clientId || "");
      setClientSecret(settings.settings.clientSecret || "");
      setDomain(settings.settings.domain || "");
      setAutoProvisioning(settings.settings.autoProvisioning || false);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!provider || !clientId || !clientSecret) {
      return;
    }

    const success = await saveSettings({
      integration_type: 'sso',
      provider,
      settings: {
        clientId,
        clientSecret,
        domain,
        autoProvisioning,
      },
      is_active: true,
    });

    // Success message is handled by the hook
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Einstellungen werden geladen...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Single Sign-On Konfiguration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!settings?.is_active && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Single Sign-On ist noch nicht konfiguriert.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ssoProvider">SSO Anbieter</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie einen SSO Anbieter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="azure">Azure Active Directory</SelectItem>
                <SelectItem value="google">Google Workspace</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="auth0">Auth0</SelectItem>
                <SelectItem value="saml">SAML 2.0</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="clientId">Client ID *</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Geben Sie Ihre Client ID ein"
            />
          </div>
          
          <div>
            <Label htmlFor="clientSecret">Client Secret *</Label>
            <Input
              id="clientSecret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Geben Sie Ihr Client Secret ein"
            />
          </div>
          
          <div>
            <Label htmlFor="domain">Domain (optional)</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="beispiel.com"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="autoProvisioning"
              checked={autoProvisioning}
              onCheckedChange={setAutoProvisioning}
            />
            <Label htmlFor="autoProvisioning">
              Automatische Benutzer-Bereitstellung aktivieren
            </Label>
          </div>
          
          <Button onClick={handleSave} className="w-full">
            SSO Konfiguration speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SSOSettings;