import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Ban, CheckCircle, Globe, Eye, Lock, Loader2, XCircle, AlertCircle } from "lucide-react";
import { useSuspiciousActivities, useSupportAccessLogs, useSecurityStats, useComplianceChecks } from "@/hooks/useSecurityData";

const SecurityComplianceTab = () => {
  const { data: suspiciousActivities, isLoading: loadingActivities } = useSuspiciousActivities();
  const { data: accessLogs, isLoading: loadingLogs } = useSupportAccessLogs();
  const { data: stats, isLoading: loadingStats } = useSecurityStats();
  const { data: complianceChecks, isLoading: loadingChecks } = useComplianceChecks();

  const statsData = [
    { label: "Mandantenisolation", value: stats?.tenantIsolation || "Aktiv", icon: Shield, status: stats?.tenantIsolation === 'Aktiv' ? "green" : "red" },
    { label: "Verdächtige Logins (24h)", value: stats?.suspiciousLogins?.toString() || "0", icon: AlertTriangle, status: (stats?.suspiciousLogins || 0) > 0 ? "orange" : "green" },
    { label: "Rate-Limit-Verstöße", value: stats?.rateLimitViolations?.toString() || "0", icon: Ban, status: (stats?.rateLimitViolations || 0) > 0 ? "orange" : "green" },
    { label: "DSGVO-Konformität", value: stats?.dsgvoCompliance || "0%", icon: CheckCircle, status: parseInt(stats?.dsgvoCompliance || '0') >= 80 ? "green" : parseInt(stats?.dsgvoCompliance || '0') >= 50 ? "orange" : "red" },
  ];

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCheckStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return <span className="text-sm text-green-600">Bestanden</span>;
      case 'warning':
        return <span className="text-sm text-yellow-600">Warnung</span>;
      case 'failed':
        return <span className="text-sm text-red-600">Fehlgeschlagen</span>;
      default:
        return <span className="text-sm text-gray-600">Unbekannt</span>;
    }
  };

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Sicherheitsdaten...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Sicherheit & Compliance</h2>
        <p className="text-sm text-muted-foreground">Systemweite Sicherheitsüberwachung</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${
                    stat.status === "green" ? "text-green-600" : 
                    stat.status === "orange" ? "text-orange-600" : "text-red-600"
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    stat.status === "green" ? "bg-green-500" : 
                    stat.status === "orange" ? "bg-orange-500" : "bg-red-500"
                  }`} />
                  <stat.icon className={`h-5 w-5 ${
                    stat.status === "green" ? "text-green-600" : 
                    stat.status === "orange" ? "text-orange-600" : "text-red-600"
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Verdächtige Aktivitäten (24h)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingActivities ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (suspiciousActivities || []).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Keine verdächtigen Aktivitäten</p>
          ) : (
            (suspiciousActivities || []).slice(0, 5).map((activity, index) => (
              <div key={index} className="border-l-4 border-l-orange-500 bg-gray-50 rounded-r-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-orange-100 text-orange-700">{activity.attempt_count} fehlgeschlagene Logins</Badge>
                    <p className="text-sm text-muted-foreground mt-2">{new Date(activity.login_at).toLocaleString('de-DE')}</p>
                    <p className="font-medium mt-1">{activity.email}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{activity.ip_address || '-'}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Untersuchen</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Support-Zugriffsprotokolle</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benutzer</TableHead>
                <TableHead>Aktion</TableHead>
                <TableHead>Ressource</TableHead>
                <TableHead>Zeitpunkt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingLogs ? (
                <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : (accessLogs || []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Keine Zugriffsprotokolle</TableCell></TableRow>
              ) : (
                (accessLogs || []).slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user_email}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.company_name}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(log.created_at).toLocaleString('de-DE')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Compliance-Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingChecks ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {(complianceChecks || []).map((check) => (
                <div key={check.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getCheckStatusIcon(check.status)}
                    <div>
                      <span className="text-sm font-medium">{check.name}</span>
                      {check.details && (
                        <p className="text-xs text-muted-foreground">{check.details}</p>
                      )}
                    </div>
                  </div>
                  {getCheckStatusText(check.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg text-red-600">Notfallmaßnahmen</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="destructive">Platform-Kill-Switch</Button>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">Alle Sessions beenden</Button>
          </div>
          <p className="text-sm text-red-600 mt-3">⚠️ Diese Aktionen sind irreversibel.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityComplianceTab;
