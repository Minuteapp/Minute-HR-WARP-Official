import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useIntegrationSettings } from "@/hooks/useIntegrationSettings";

const PayrollSettings = () => {
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const { settings, isLoading, saveSettings } = useIntegrationSettings('payroll');

  useEffect(() => {
    if (settings) {
      setProvider(settings.provider || "");
      setApiKey(settings.settings.apiKey || "");
      setEndpoint(settings.settings.endpoint || "");
    }
  }, [settings]);

  const handleSave = async () => {
    if (!provider || !apiKey) {
      return;
    }

    const success = await saveSettings({
      integration_type: 'payroll',
      provider,
      settings: {
        apiKey,
        endpoint,
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
          <DollarSign className="h-5 w-5" />
          Lohnabrechnung Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!settings?.is_active && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Die Lohnabrechnung-Integration ist noch nicht konfiguriert.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="provider">Anbieter</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie einen Anbieter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="datev">DATEV</SelectItem>
                <SelectItem value="personio">Personio</SelectItem>
                <SelectItem value="sage">Sage</SelectItem>
                <SelectItem value="lexware">Lexware</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="apiKey">API Schlüssel *</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Geben Sie Ihren API Schlüssel ein"
            />
          </div>
          
          <div>
            <Label htmlFor="endpoint">API Endpoint (optional)</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/payroll"
            />
          </div>
          
          <Button onClick={handleSave} className="w-full">
            Konfiguration speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayrollSettings;