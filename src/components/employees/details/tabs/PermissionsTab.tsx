import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Settings, Lock, Mail, RotateCcw, Send, RefreshCw, CalendarIcon, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PermissionsTabProps {
  employeeId: string;
}

type AccountStatus = {
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  passwordChangedAt: string;
};

type ActivityLogItem = {
  id: number;
  action: string;
  date: string;
  type: "success" | "warning" | "info" | "error";
};

export const PermissionsTab = ({ employeeId }: PermissionsTabProps) => {
  const [lockReason, setLockReason] = useState("");
  const [lockUntilDate, setLockUntilDate] = useState<Date | undefined>();
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [restrictedAccess, setRestrictedAccess] = useState(false);
  const [isSendingCredentials, setIsSendingCredentials] = useState(false);

  // Keine Mock-Daten
  const accountStatus: AccountStatus | null = null;
  const activityLog: ActivityLogItem[] = [];

  const handleSendCredentials = async () => {
    setIsSendingCredentials(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        throw new Error('Nicht authentifiziert');
      }

      const response = await fetch(
        'https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/secure-user-management/send-credentials-by-employee',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ employeeId }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Fehler beim Senden der Zugangsdaten');
      }

      toast.success(result.message || 'Zugangsdaten wurden erfolgreich gesendet');
    } catch (error) {
      console.error('Error sending credentials:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden der Zugangsdaten');
    } finally {
      setIsSendingCredentials(false);
    }
  };

  const handleQuickAction = (action: string) => {
    toast.success(`Aktion "${action}" wird ausgeführt...`);
  };

  const handleLockAccount = () => {
    if (!lockReason.trim()) {
      toast.error("Bitte geben Sie einen Sperrgrund an");
      return;
    }
    toast.success("Konto wurde gesperrt");
    setLockReason("");
    setLockUntilDate(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Berechtigungen & Zugangsverwaltung</h2>
          <p className="text-sm text-muted-foreground">Verwaltung von Zugriffsrechten, Kontostatus und Sicherheitsoptionen</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Bearbeiten
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kontostatus */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Kontostatus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountStatus ? (
              <>
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      accountStatus.isActive ? "bg-green-100" : "bg-red-100"
                    )}
                  >
                    <Lock
                      className={cn(
                        "h-6 w-6",
                        accountStatus.isActive ? "text-green-600" : "text-red-600"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-foreground text-background">
                        {accountStatus.isActive ? "Aktiv" : "Gesperrt"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {accountStatus.isActive
                        ? "Das Konto ist aktiv und der Benutzer kann sich anmelden."
                        : "Das Konto ist gesperrt und der Benutzer kann sich nicht anmelden."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Erstellt am</p>
                    <p className="text-sm font-medium">{accountStatus.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Letzte Anmeldung</p>
                    <p className="text-sm font-medium">{accountStatus.lastLogin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Passwort geändert</p>
                    <p className="text-sm font-medium">{accountStatus.passwordChangedAt}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Kontostatus nicht verfügbar</p>
                  <p className="text-xs text-muted-foreground">Es liegen aktuell keine Kontostatus-Daten vor.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schnellaktionen */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Schnellaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSendCredentials}
                disabled={isSendingCredentials}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingCredentials ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : (
                  <Mail className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {isSendingCredentials ? 'Wird gesendet...' : 'Zugangsdaten versenden'}
                </span>
              </button>
              <button
                onClick={() => handleQuickAction("Passwort zurücksetzen")}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Passwort zurücksetzen</span>
              </button>
              <button
                onClick={() => handleQuickAction("Aktivierung erneut senden")}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <Send className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Aktivierung erneut senden</span>
              </button>
              <button
                onClick={() => handleQuickAction("Sitzungen beenden")}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Sitzungen beenden</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Kontosperrung */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Kontosperrung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sperren Sie das Konto vorübergehend oder dauerhaft. Der Benutzer kann sich nach der Sperrung nicht mehr
              anmelden.
            </p>

            <div className="space-y-2">
              <Label htmlFor="lockReason">Sperrgrund (erforderlich)</Label>
              <Textarea
                id="lockReason"
                placeholder="Geben Sie den Grund für die Sperrung an..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Temporäre Sperrung bis (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !lockUntilDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lockUntilDate ? format(lockUntilDate, "PPP", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={lockUntilDate}
                    onSelect={setLockUntilDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="destructive" className="w-full gap-2" onClick={handleLockAccount}>
              <Lock className="h-4 w-4" />
              Konto sperren
            </Button>
          </CardContent>
        </Card>

        {/* Sicherheitseinstellungen */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Sicherheitseinstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="forcePassword">Passwortänderung erzwingen</Label>
                <p className="text-xs text-muted-foreground">Benutzer muss bei der nächsten Anmeldung das Passwort ändern</p>
              </div>
              <Switch id="forcePassword" checked={forcePasswordChange} onCheckedChange={setForcePasswordChange} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="restrictedAccess">Eingeschränkter Zugriff</Label>
                <p className="text-xs text-muted-foreground">Zugriff auf sensible Bereiche einschränken</p>
              </div>
              <Switch id="restrictedAccess" checked={restrictedAccess} onCheckedChange={setRestrictedAccess} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktivitätsprotokoll */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Aktivitätsprotokoll</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Keine Aktivitäten vorhanden</p>
              <p className="text-xs text-muted-foreground">Es liegen aktuell keine Protokolleinträge vor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
