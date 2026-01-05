import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import IntegrationCard from "@/components/settings/IntegrationCard";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { Linkedin, Globe, Building, Users, Calendar, Mail } from "lucide-react";

export default function RecruitingIntegrations() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('recruiting', 'manage');

  return (
    <div className="space-y-6">
      {/* Job-Portale */}
      <Card>
        <CardHeader>
          <CardTitle>Job-Portale Integration</CardTitle>
          <CardDescription>
            Verbindung zu externen Stellenportalen für Multiposting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              title="LinkedIn Talent Solutions"
              description="Automatisches Posting und Bewerbermanagement"
              status="not_connected"
              icon={<Linkedin className="h-5 w-5" />}
              onSetup={() => {}}
              docsUrl="https://docs.microsoft.com/linkedin"
              disabled={!canManage}
            />
            
            <IntegrationCard
              title="StepStone"
              description="Deutschlands führende Jobbörse"
              status="connected"
              icon={<Building className="h-5 w-5" />}
              onSetup={() => {}}
              docsUrl="https://www.stepstone.de/api"
              disabled={!canManage}
            />
            
            <IntegrationCard
              title="Indeed"
              description="Weltweite Reichweite für Stellenausschreibungen"
              status="not_connected"
              icon={<Globe className="h-5 w-5" />}
              onSetup={() => {}}
              docsUrl="https://indeed.com/api"
              disabled={!canManage}
            />
            
            <IntegrationCard
              title="XING Jobs"
              description="Business-Netzwerk für professionelle Kontakte"
              status="not_connected"
              icon={<Users className="h-5 w-5" />}
              onSetup={() => {}}
              docsUrl="https://dev.xing.com"
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>

      {/* API-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle>API-Einstellungen</CardTitle>
          <CardDescription>
            Konfiguration der Schnittstellen und Datenübertragung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sync-interval">Synchronisationsintervall</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Intervall wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Echtzeit</SelectItem>
                  <SelectItem value="15min">Alle 15 Minuten</SelectItem>
                  <SelectItem value="1hour">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retry-attempts">Wiederholungsversuche</Label>
              <Input
                id="retry-attempts"
                type="number"
                placeholder="3"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-import">Automatischer Import</Label>
              <p className="text-sm text-muted-foreground">
                Bewerbungen automatisch ins System importieren
              </p>
            </div>
            <Switch id="auto-import" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://ihre-domain.de/webhooks/recruiting"
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>

      {/* ATS-Systeme */}
      <Card>
        <CardHeader>
          <CardTitle>ATS-Systeme</CardTitle>
          <CardDescription>
            Integration mit Applicant Tracking Systemen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              title="SAP SuccessFactors"
              description="Enterprise ATS-Lösung"
              status="not_connected"
              icon={<Building className="h-5 w-5" />}
              onSetup={() => {}}
              disabled={!canManage}
            />
            
            <IntegrationCard
              title="Workday Recruiting"
              description="Cloud-basiertes Recruiting-System"
              status="not_connected"
              icon={<Globe className="h-5 w-5" />}
              onSetup={() => {}}
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Kalender & E-Mail */}
      <Card>
        <CardHeader>
          <CardTitle>Kalender & E-Mail Integration</CardTitle>
          <CardDescription>
            Verbindung für automatische Terminkoordination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              title="Microsoft Outlook"
              description="Kalender und E-Mail Integration"
              status="connected"
              icon={<Calendar className="h-5 w-5" />}
              onSetup={() => {}}
              disabled={!canManage}
            />
            
            <IntegrationCard
              title="Google Workspace"
              description="Gmail und Google Calendar"
              status="not_connected"
              icon={<Mail className="h-5 w-5" />}
              onSetup={() => {}}
              disabled={!canManage}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-scheduling">Automatische Terminplanung</Label>
                <p className="text-sm text-muted-foreground">
                  Interview-Termine automatisch vorschlagen
                </p>
              </div>
              <Switch id="auto-scheduling" disabled={!canManage} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interview-duration">Standard Interview-Dauer</Label>
                <Select disabled={!canManage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dauer wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Minuten</SelectItem>
                    <SelectItem value="45">45 Minuten</SelectItem>
                    <SelectItem value="60">60 Minuten</SelectItem>
                    <SelectItem value="90">90 Minuten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buffer-time">Pufferzeit (Minuten)</Label>
                <Input
                  id="buffer-time"
                  type="number"
                  placeholder="15"
                  disabled={!canManage}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datenexport */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Backup</CardTitle>
          <CardDescription>
            Konfiguration für Datenexporte und Backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="csv-export" disabled={!canManage} />
              <Label htmlFor="csv-export">CSV-Export</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="excel-export" disabled={!canManage} />
              <Label htmlFor="excel-export">Excel-Export</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="pdf-export" disabled={!canManage} />
              <Label htmlFor="pdf-export">PDF-Export</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-schedule">Automatisches Backup</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Backup-Intervall..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="none">Deaktiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}