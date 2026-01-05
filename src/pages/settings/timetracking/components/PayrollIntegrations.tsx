import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Link, Settings, AlertCircle, CheckCircle } from "lucide-react";

const PayrollIntegrations = () => {
  return (
    <div className="space-y-6">
      {/* Payroll-Systeme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payroll-Systeme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">DATEV</p>
                    <p className="text-sm text-muted-foreground">Lohn & Gehalt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verbunden
                  </Badge>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">SevDesk</p>
                    <p className="text-sm text-muted-foreground">Buchhaltung & Payroll</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Nicht verbunden</Badge>
                  <Switch />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Lexware</p>
                    <p className="text-sm text-muted-foreground">Lohn & Gehalt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Nicht verbunden</Badge>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">SAP SuccessFactors</p>
                    <p className="text-sm text-muted-foreground">HR & Payroll</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Nicht verbunden</Badge>
                  <Switch />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Workday</p>
                    <p className="text-sm text-muted-foreground">HCM & Payroll</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Nicht verbunden</Badge>
                  <Switch />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Personio</p>
                    <p className="text-sm text-muted-foreground">HR Suite</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Nicht verbunden</Badge>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Synchronisation & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Synchronisations-Frequenz</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Echtzeit</SelectItem>
                  <SelectItem value="hourly">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Exportformat</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="datev">DATEV-Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Automatische Überstunden-Berechnung</p>
              <p className="text-sm text-muted-foreground">
                Überstunden werden automatisch an Payroll-System übertragen
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Zuschläge synchronisieren</p>
              <p className="text-sm text-muted-foreground">
                Nacht-, Wochenend- und Feiertagszuschläge übertragen
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* API-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-url">API Endpoint URL</Label>
              <Input 
                id="api-url"
                placeholder="https://api.payroll-system.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Schlüssel</Label>
              <Input 
                id="api-key"
                type="password"
                placeholder="••••••••••••••••"
              />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-yellow-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Sicherheitshinweis</p>
                <p className="text-sm text-yellow-700">
                  API-Schlüssel werden verschlüsselt gespeichert. Ändern Sie regelmäßig Ihre Zugangsdaten.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>Verbindung testen</Button>
            <Button variant="outline">Konfiguration speichern</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollIntegrations;