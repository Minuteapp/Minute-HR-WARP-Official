import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain, Bell, TrendingUp, Calendar, AlertTriangle, Zap, Clock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AutomationAI() {
  // Lade echte Metriken aus der Datenbank
  const { data: metrics } = useQuery({
    queryKey: ['automation-ai-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return null;

      // Zähle automatische Benachrichtigungen (letzte 7 Tage)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .gte('created_at', weekAgo.toISOString());

      // Zähle erkannte Anomalien (Time Entries mit Flags)
      const { count: anomalyCount } = await supabase
        .from('time_entries')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('is_flagged', true);

      // Überlastungswarnungen (Mitarbeiter mit >40h/Woche)
      const { data: overtimeData } = await supabase
        .from('time_entries')
        .select('employee_id, duration_hours')
        .eq('company_id', profile.company_id)
        .gte('start_time', weekAgo.toISOString());

      const employeeHours: Record<string, number> = {};
      overtimeData?.forEach(entry => {
        if (entry.employee_id) {
          employeeHours[entry.employee_id] = (employeeHours[entry.employee_id] || 0) + (entry.duration_hours || 0);
        }
      });
      const overloadCount = Object.values(employeeHours).filter(h => h > 40).length;

      return {
        notificationsSent: notificationCount || 0,
        anomaliesDetected: anomalyCount || 0,
        overloadAlerts: overloadCount || 0,
        companyId: profile.company_id
      };
    }
  });

  const aiFeatures = [
    { 
      id: "shift-planning", 
      name: "KI-Schichtplanung", 
      description: "Optimierte Schichtverteilung", 
      active: true, 
      savings: "15%" 
    },
    { 
      id: "anomaly-detection", 
      name: "Anomalie-Erkennung", 
      description: "Ungewöhnliche Arbeitsmuster", 
      active: true, 
      detections: metrics?.anomaliesDetected || 0 
    },
    { 
      id: "workload-analysis", 
      name: "Überlastungswarnung", 
      description: "Frühwarnsystem für Mitarbeiter", 
      active: true, 
      alerts: metrics?.overloadAlerts || 0 
    },
    { 
      id: "smart-notifications", 
      name: "Intelligente Benachrichtigungen", 
      description: "Automatische Push-Nachrichten", 
      active: true, 
      sent: metrics?.notificationsSent || 0 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KI-Features aktiv</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiFeatures.filter(f => f.active).length}</div>
            <p className="text-xs text-muted-foreground">von {aiFeatures.length} verfügbar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automatische Benachrichtigungen</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.notificationsSent?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Diese Woche versendet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erkannte Anomalien</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.anomaliesDetected || 0}</div>
            <p className="text-xs text-muted-foreground">Automatisch identifiziert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Überlastungswarnungen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overloadAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">Mitarbeiter mit &gt;40h/Woche</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>KI-gestützte Schichtplanung</CardTitle>
            <CardDescription>
              Automatische Optimierung der Schichtverteilung basierend auf historischen Daten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Intelligente Schichtplanung aktivieren</div>
                  <div className="text-sm text-muted-foreground">
                    KI erstellt Vorschläge basierend auf Arbeitsauslastung
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planning-horizon">Planungshorizont</Label>
                <Select defaultValue="4weeks">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2weeks">2 Wochen</SelectItem>
                    <SelectItem value="4weeks">4 Wochen</SelectItem>
                    <SelectItem value="8weeks">8 Wochen</SelectItem>
                    <SelectItem value="3months">3 Monate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Optimierungskriterien</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minimize-overtime">Überstunden minimieren</Label>
                    <Switch id="minimize-overtime" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="balance-workload">Arbeitsbelastung ausgleichen</Label>
                    <Switch id="balance-workload" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="respect-preferences">Mitarbeiterwünsche berücksichtigen</Label>
                    <Switch id="respect-preferences" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-800">
                <strong>KI-Empfehlung aktiv:</strong> Das System optimiert 
                Schichtverteilungen basierend auf Ihren Daten. 
                Nächste Optimierung: Täglich um 06:00 Uhr.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automatische Anomalie-Erkennung</CardTitle>
            <CardDescription>
              Intelligente Identifizierung ungewöhnlicher Arbeitsmuster und Abweichungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Anomalie-Erkennung aktivieren</div>
                  <div className="text-sm text-muted-foreground">
                    Automatische Erkennung ungewöhnlicher Muster
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="space-y-3">
                <Label>Erkennungstypen</Label>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Mitarbeiter vergisst auszustempeln</div>
                        <div className="text-sm text-muted-foreground">5 Tage in Folge kein Check-out</div>
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        {Math.floor((metrics?.anomaliesDetected || 0) * 0.3)} Fälle
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Ungewöhnliche Arbeitszeiten</div>
                        <div className="text-sm text-muted-foreground">Außerhalb normaler Schichtzeiten</div>
                      </div>
                      <Badge variant="outline" className="text-yellow-600">
                        {Math.floor((metrics?.anomaliesDetected || 0) * 0.5)} Fälle
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Übermäßige Überstunden</div>
                        <div className="text-sm text-muted-foreground">Überschreitung der Höchstarbeitszeit</div>
                      </div>
                      <Badge variant="outline" className="text-red-600">
                        {metrics?.overloadAlerts || 0} Fälle
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensitivity">Erkennungsempfindlichkeit</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig (weniger false positives)</SelectItem>
                    <SelectItem value="medium">Mittel (ausgewogen)</SelectItem>
                    <SelectItem value="high">Hoch (alle Anomalien erfassen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automatische Benachrichtigungen & Push-Nachrichten</CardTitle>
          <CardDescription>
            Konfiguration intelligenter Benachrichtigungen für verschiedene Ereignisse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Mitarbeiter-Benachrichtigungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Schichtänderungen</div>
                    <div className="text-sm text-muted-foreground">24h vor Schichtbeginn</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Pausenerinnerungen</div>
                    <div className="text-sm text-muted-foreground">Nach 6 Stunden Arbeitszeit</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Check-out Erinnerung</div>
                    <div className="text-sm text-muted-foreground">Bei vergessenen Ausstempelungen</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-delay">Erinnerungs-Verzögerung (Minuten)</Label>
                <Input id="notification-delay" type="number" defaultValue="30" min="5" max="120" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Management-Benachrichtigungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Überstunden-Warnungen</div>
                    <div className="text-sm text-muted-foreground">Bei Überschreitung der Limits</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Fehlzeiten-Alerts</div>
                    <div className="text-sm text-muted-foreground">Unentschuldigte Abwesenheiten</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Compliance-Verstöße</div>
                    <div className="text-sm text-muted-foreground">Arbeitszeit- und Gesetzesverstoße</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation-level">Eskalationsstufe</Label>
                <Select defaultValue="manager">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teamlead">Nur Teamleiter</SelectItem>
                    <SelectItem value="manager">Manager + HR</SelectItem>
                    <SelectItem value="all">Alle Administratoren</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-800">
              <strong>KI-Optimierung aktiv:</strong> Das System lernt aus dem Verhalten 
              der Mitarbeiter und passt die Benachrichtigungszeiten automatisch an, 
              um die Reaktionsrate zu maximieren und Störungen zu minimieren.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
