import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format as formatDate, subDays } from "date-fns";
import { de } from "date-fns/locale";

type ExportFormat = "csv" | "json";
type DateRange = "7d" | "30d" | "90d" | "all";

interface AuditLogExport {
  id: string;
  session_id: string;
  actor_user_id: string;
  performed_by_superadmin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  risk_level: string;
  created_at: string;
}

interface SessionExport {
  id: string;
  superadmin_id: string;
  target_user_id: string | null;
  target_tenant_id: string | null;
  mode: string;
  justification: string;
  justification_type: string;
  started_at: string;
  ended_at: string | null;
  status: string;
}

export const ImpersonationAuditExport = () => {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"sessions" | "audit_logs">("sessions");

  const getDateFilter = (): string | null => {
    const now = new Date();
    switch (dateRange) {
      case "7d":
        return subDays(now, 7).toISOString();
      case "30d":
        return subDays(now, 30).toISOString();
      case "90d":
        return subDays(now, 90).toISOString();
      case "all":
        return null;
      default:
        return null;
    }
  };

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast.error("Keine Daten zum Exportieren");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(";"),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""');
          return String(value).replace(/"/g, '""');
        }).join(";")
      )
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, `${filename}.csv`);
  };

  const exportToJSON = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast.error("Keine Daten zum Exportieren");
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    downloadBlob(blob, `${filename}.json`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dateFilter = getDateFilter();
      const timestamp = formatDate(new Date(), "yyyy-MM-dd_HH-mm", { locale: de });

      if (exportType === "sessions") {
        let query = supabase
          .from("impersonation_sessions")
          .select("id, superadmin_id, target_user_id, target_tenant_id, mode, justification, justification_type, started_at, ended_at, status")
          .order("started_at", { ascending: false });

        if (dateFilter) {
          query = query.gte("started_at", dateFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        const filename = `impersonation-sessions_${timestamp}`;
        
        if (format === "csv") {
          exportToCSV(data as unknown as Record<string, unknown>[], filename);
        } else {
          exportToJSON(data as unknown as Record<string, unknown>[], filename);
        }

        toast.success(`${data.length} Sessions exportiert`);
      } else {
        let query = supabase
          .from("impersonation_audit_logs")
          .select("id, session_id, actor_user_id, performed_by_superadmin_id, action, resource_type, resource_id, risk_level, created_at")
          .order("created_at", { ascending: false });

        if (dateFilter) {
          query = query.gte("created_at", dateFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        const filename = `impersonation-audit-logs_${timestamp}`;
        
        if (format === "csv") {
          exportToCSV(data as unknown as Record<string, unknown>[], filename);
        } else {
          exportToJSON(data as unknown as Record<string, unknown>[], filename);
        }

        toast.success(`${data.length} Audit-Einträge exportiert`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Fehler beim Exportieren");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Audit-Log Export
        </CardTitle>
        <CardDescription>
          Exportieren Sie Impersonation-Sessions und Audit-Logs für Compliance-Zwecke
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Datentyp</Label>
            <Select value={exportType} onValueChange={(v) => setExportType(v as "sessions" | "audit_logs")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sessions">Impersonation-Sessions</SelectItem>
                <SelectItem value="audit_logs">Audit-Logs (Aktionen)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Zeitraum</Label>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                <SelectItem value="90d">Letzte 90 Tage</SelectItem>
                <SelectItem value="all">Alle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full md:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportiere...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportieren
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
