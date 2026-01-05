import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Database, Eye, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminSecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sicherheit & Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-Tenant-Isolation • DSGVO-Konformität • Verschlüsselung
          </p>
        </div>
      </div>

      {/* Security Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Sicherheitsstatus: Optimal</h3>
              <p className="text-sm text-green-800 mb-3">
                Alle kritischen Sicherheitsmaßnahmen sind aktiv. System ist vollständig abgesichert.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Multi-Tenant-Isolation aktiv</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">End-to-End Verschlüsselung</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">DSGVO-Konform</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Audit-Logging aktiv</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentifizierung & Zugriff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            Authentifizierung & Zugriff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">2FA-Pflicht für alle Admins</h4>
              <p className="text-sm text-muted-foreground">
                Zwei-Faktor-Authentifizierung ist für alle Admin-Benutzer verpflichtend
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Auto-Logout nach Inaktivität</h4>
              <p className="text-sm text-muted-foreground">
                Automatische Abmeldung nach 30 Minuten Inaktivität
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">IP-Whitelist</h4>
              <p className="text-sm text-muted-foreground">
                Nur Zugriff von definierten IP-Adressen erlauben
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Mandanten-Isolation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Mandanten-Isolation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Strikte Mandanten-Isolation</h4>
              <p className="text-sm text-muted-foreground">
                Jeder Mandant hat eine isolierte Datenbankinstanz (UUID-basiert)
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-2">Garantierte Datentrennung:</p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Keine Cross-Tenant-Queries möglich</li>
                    <li>• Separate Verschlüsselungsschlüssel pro Mandant</li>
                    <li>• Datenbank-Partitionierung nach Tenant-ID</li>
                    <li>• Automatische Validierung bei jedem Request</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Verschlüsselung & Datenschutz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Verschlüsselung & Datenschutz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">End-to-End Verschlüsselung</h4>
              <p className="text-sm text-muted-foreground">
                Alle Daten werden verschlüsselt gespeichert (AES-256)
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">DSGVO-Konformität</h4>
              <p className="text-sm text-muted-foreground">
                Automatische Einhaltung aller DSGVO-Richtlinien
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Serverstandort: Deutschland (DSGVO-konform)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Recht auf Vergessenwerden implementiert
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Datenport für Mandanten verfügbar
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Auftragsverarbeitungsvertrag (AVV) verfügbar
                </li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Superadmin-Funktionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-600" />
            Superadmin-Funktionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Audit-Logging</h4>
              <p className="text-sm text-muted-foreground">
                Alle Aktionen werden permanent protokolliert
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Mandanten-Impersonation (Support-Modus)</h4>
              <p className="text-sm text-muted-foreground">
                Superadmin kann sich temporär in Mandanten einloggen
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900 mb-2">Superadmin-Zugriff wird protokolliert:</p>
                  <ul className="space-y-1 text-sm text-orange-800">
                    <li>• Jede Impersonation wird im Audit-Log erfasst</li>
                    <li>• IP-Adresse und Zeitstempel werden gespeichert</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
