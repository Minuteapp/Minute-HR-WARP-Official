import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Users, Activity, Server, Search, Download, Eye, Info, Loader2 } from "lucide-react";
import { useAuditLogs, useAuditLogsStats } from "@/hooks/useAuditLogs";

const LogsAuditsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { data: logs, isLoading } = useAuditLogs({ type: typeFilter });
  const { data: stats } = useAuditLogsStats();

  const statsData = [
    { label: "Logs (24h)", value: stats?.logsLast24h?.toLocaleString() || "0", icon: FileText },
    { label: "Admin-Aktionen", value: stats?.adminActions?.toLocaleString() || "0", icon: Users },
    { label: "Login-Events", value: stats?.loginEvents?.toLocaleString() || "0", icon: Activity },
    { label: "System-Events", value: stats?.systemEvents?.toLocaleString() || "0", icon: Server },
  ];

  const getTypeBadge = (action: string) => {
    const colors: Record<string, string> = {
      INSERT: "bg-green-100 text-green-700",
      UPDATE: "bg-blue-100 text-blue-700",
      DELETE: "bg-red-100 text-red-700",
      SELECT: "bg-gray-100 text-gray-700",
    };
    return <Badge className={colors[action] || "bg-gray-100 text-gray-700"}>{action}</Badge>;
  };

  const filteredLogs = (logs || []).filter(log => {
    const search = searchTerm.toLowerCase();
    return (log.user_email || '').toLowerCase().includes(search) ||
           (log.table_name || '').toLowerCase().includes(search) ||
           (log.action || '').toLowerCase().includes(search);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Logs, Audits & Monitoring</h2>
        <p className="text-sm text-muted-foreground">Vollständige Übersicht aller Systemereignisse</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <stat.icon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Logs durchsuchen..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Typen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="INSERT">INSERT</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="SELECT">SELECT</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Benutzer</TableHead>
                <TableHead>Tabelle</TableHead>
                <TableHead>IP-Adresse</TableHead>
                <TableHead>Zeitpunkt</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Keine Logs gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.slice(0, 50).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.id.slice(0, 8)}</TableCell>
                    <TableCell>{getTypeBadge(log.action)}</TableCell>
                    <TableCell>{log.user_email || 'System'}</TableCell>
                    <TableCell>{log.table_name}</TableCell>
                    <TableCell className="font-mono text-sm">{log.ip_address || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('de-DE')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Audit-Funktionen</p>
          <p className="text-sm text-blue-700">
            Alle Logs werden DSGVO-konform für 90 Tage gespeichert.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogsAuditsTab;