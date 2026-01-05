import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, RefreshCw, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useSuperadminApi } from "@/hooks/useSuperadminApi";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE_TENANT: { label: "Tenant erstellt", color: "bg-green-100 text-green-700" },
  INVITE_USER: { label: "User eingeladen", color: "bg-blue-100 text-blue-700" },
  CREATE_TEST_USER: { label: "Test-User erstellt", color: "bg-purple-100 text-purple-700" },
  BOOTSTRAP_ORG: { label: "Org-Bootstrap", color: "bg-amber-100 text-amber-700" },
};

export const SuperadminAuditTab = () => {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { getAllAuditLogs } = useSuperadminApi();
  const limit = 20;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['superadmin-audit-logs', page, actionFilter],
    queryFn: async () => {
      return await getAllAuditLogs({
        limit,
        offset: page * limit,
        action: actionFilter !== "all" ? actionFilter : undefined
      });
    }
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm:ss", { locale: de });
    } catch {
      return dateString;
    }
  };

  const getActionBadge = (action: string) => {
    const config = ACTION_LABELS[action] || { label: action, color: "bg-gray-100 text-gray-700" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Superadmin Audit Log</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Alle Aktionen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Aktionen</SelectItem>
                <SelectItem value="CREATE_TENANT">Tenant erstellt</SelectItem>
                <SelectItem value="INVITE_USER">User eingeladen</SelectItem>
                <SelectItem value="CREATE_TEST_USER">Test-User erstellt</SelectItem>
                <SelectItem value="BOOTSTRAP_ORG">Org-Bootstrap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeitpunkt</TableHead>
                    <TableHead>Aktion</TableHead>
                    <TableHead>Target Tenant</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Keine Audit-Logs vorhanden
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.target_tenant_id ? log.target_tenant_id.slice(0, 8) + "..." : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.target_user_id ? log.target_user_id.slice(0, 8) + "..." : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.status === 'success' ? 'default' : 'destructive'}
                            className={log.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {log.status === 'success' ? 'Erfolg' : 'Fehler'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {log.error_message || JSON.stringify(log.response_payload)?.slice(0, 50)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Zeige {page * limit + 1} - {Math.min((page + 1) * limit, total)} von {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Seite {page + 1} von {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
