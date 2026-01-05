
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Folder, MessageSquare, Plug, Shield, Workflow, Wallet } from "lucide-react";
import OutlookSettings from "@/components/calendar/OutlookSettings";
import PayrollSettings from "@/components/settings/PayrollSettings";
import SSOSettings from "@/components/settings/SSOSettings";
import IntegrationCard from "@/components/settings/IntegrationCard";

const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="font-medium leading-tight">{title}</h3>
    </div>
    {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
  </div>
);

const IntegrationSettings = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="communication">Kommunikation</TabsTrigger>
          <TabsTrigger value="accounting">Buchhaltung</TabsTrigger>
          <TabsTrigger value="storage">Speicher</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
        </TabsList>

        {/* Übersicht */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                API & Integrationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Noch keine Integrationen verbunden</Badge>
              </div>

              <SectionTitle icon={<Calendar className="h-5 w-5" />} title="Kalender" subtitle="Outlook, Google Calendar, iCal/CalDAV" />
              <Grid>
                <IntegrationCard
                  title="Microsoft Outlook"
                  description="Synchronisation von Terminen & Abwesenheiten."
                  status="not_connected"
                  icon={<Calendar className="h-4 w-4" />}
                  disabled
                />
                <IntegrationCard
                  title="Google Calendar"
                  description="Zweiseitige Sync von Ereignissen (OAuth)."
                  status="not_connected"
                  icon={<Calendar className="h-4 w-4" />}
                  disabled
                />
                <IntegrationCard
                  title="iCal / CalDAV"
                  description="Einseitiger Abo-Feed bzw. CalDAV-Anbindung."
                  status="coming_soon"
                  icon={<Calendar className="h-4 w-4" />}
                  disabled
                  ctaLabel="Bald verfügbar"
                />
              </Grid>

              <SectionTitle icon={<MessageSquare className="h-5 w-5" />} title="Kommunikation" subtitle="Slack, Microsoft Teams" />
              <Grid>
                <IntegrationCard
                  title="Slack"
                  description="Benachrichtigungen zu Abwesenheiten & Genehmigungen."
                  status="not_connected"
                  icon={<MessageSquare className="h-4 w-4" />}
                  disabled
                />
                <IntegrationCard
                  title="Microsoft Teams"
                  description="Kanalspezifische Nachrichten & Adaptive Cards."
                  status="coming_soon"
                  icon={<MessageSquare className="h-4 w-4" />}
                  disabled
                  ctaLabel="Bald verfügbar"
                />
              </Grid>

              <SectionTitle icon={<Wallet className="h-5 w-5" />} title="Buchhaltung" subtitle="sevDesk, Lexoffice, DATEV (Export)" />
              <Grid>
                <IntegrationCard
                  title="sevDesk"
                  description="Belege/FiBu-Schnittstelle für HR-Workflows."
                  status="not_connected"
                  icon={<Wallet className="h-4 w-4" />}
                  disabled
                />
                <IntegrationCard
                  title="Lexoffice"
                  description="Rechnungen & Kontakte synchronisieren."
                  status="coming_soon"
                  icon={<Wallet className="h-4 w-4" />}
                  disabled
                  ctaLabel="Bald verfügbar"
                />
              </Grid>

              <SectionTitle icon={<Folder className="h-5 w-5" />} title="Speicher/DMS" subtitle="OneDrive/SharePoint, Google Drive, Dropbox" />
              <Grid>
                <IntegrationCard
                  title="OneDrive / SharePoint"
                  description="Dokumente zentral verwalten (z. B. AU-Nachweise)."
                  status="coming_soon"
                  icon={<Folder className="h-4 w-4" />}
                  disabled
                  ctaLabel="Bald verfügbar"
                />
                <IntegrationCard
                  title="Google Drive"
                  description="Geteilte Ordner für Personalunterlagen."
                  status="coming_soon"
                  icon={<Folder className="h-4 w-4" />}
                  disabled
                  ctaLabel="Bald verfügbar"
                />
                <IntegrationCard
                  title="Dropbox"
                  description="Dateiaustausch mit externer Ablage."
                  status="coming_soon"
                  icon={<Folder className="h-4 w-4" />}
                  disabled
                  ctaLabel="Bald verfügbar"
                />
              </Grid>

              <SectionTitle icon={<Workflow className="h-5 w-5" />} title="Automatisierung" subtitle="Zapier, Make.com" />
              <Grid>
                <IntegrationCard
                  title="Zapier"
                  description="No-Code-Automationen via Webhooks."
                  status="not_connected"
                  icon={<Workflow className="h-4 w-4" />}
                  disabled
                />
                <IntegrationCard
                  title="Make.com"
                  description="Workflows für Genehmigungen & Sync."
                  status="coming_soon"
                  icon={<Workflow className="h-4 w-4" />}
                  disabled
                  ctaLabel="Bald verfügbar"
                />
              </Grid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kalender */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Kalender-Integrationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Grid>
                <IntegrationCard title="Microsoft Outlook" description="Empfohlen – bestehende Integration." status="not_connected" icon={<Calendar className="h-4 w-4" />} disabled />
                <IntegrationCard title="Google Calendar" description="OAuth-basiert, bidirektional (Phase 1)." status="not_connected" icon={<Calendar className="h-4 w-4" />} disabled />
                <IntegrationCard title="iCal / CalDAV" description="Feed/CalDAV (Lesen/Schreiben – je nach Server)." status="coming_soon" icon={<Calendar className="h-4 w-4" />} disabled ctaLabel="Bald verfügbar" />
              </Grid>
              {/* Beibehaltene bestehende Einstellungen */}
              <OutlookSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kommunikation */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kommunikations-Integrationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Grid>
                <IntegrationCard title="Slack" description="Abwesenheits-Updates in Channels." status="not_connected" icon={<MessageSquare className="h-4 w-4" />} disabled />
                <IntegrationCard title="Microsoft Teams" description="Benachrichtigungen & Adaptive Cards." status="coming_soon" icon={<MessageSquare className="h-4 w-4" />} disabled ctaLabel="Bald verfügbar" />
              </Grid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buchhaltung */}
        <TabsContent value="accounting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Buchhaltung & FiBu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Grid>
                <IntegrationCard title="sevDesk" description="API-Token benötigt (Phase 1)." status="not_connected" icon={<Wallet className="h-4 w-4" />} disabled />
                <IntegrationCard title="Lexoffice" description="Demnächst verfügbar." status="coming_soon" icon={<Wallet className="h-4 w-4" />} disabled ctaLabel="Bald verfügbar" />
              </Grid>
            </CardContent>
          </Card>

          {/* Bestehende Payroll-Einstellungen belassen */}
          <PayrollSettings />
        </TabsContent>

        {/* Speicher */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Speicher & Dokumente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Grid>
                <IntegrationCard title="OneDrive / SharePoint" description="Dokumente zentral verwalten." status="coming_soon" icon={<Folder className="h-4 w-4" />} disabled ctaLabel="Bald verfügbar" />
                <IntegrationCard title="Google Drive" description="Austausch mit Google Workspace." status="coming_soon" icon={<Folder className="h-4 w-4" />} disabled ctaLabel="Bald verfügbar" />
                <IntegrationCard title="Dropbox" description="Einfacher Dateiaustausch." status="coming_soon" icon={<Folder className="h-4 w-4" />} disabled ctaLabel="Bald verfügbar" />
              </Grid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSO */}
        <TabsContent value="sso" className="space-y-6">
          <SSOSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationSettings;
