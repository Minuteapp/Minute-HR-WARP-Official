import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface PayrollRun {
  id: string;
  runType: "monthly" | "special" | "correction";
  payrollPeriod: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
  employeeCount: number;
  totalGross: number;
  completedAt?: string;
}

interface RecentRunsSidebarProps {
  runs: PayrollRun[];
  isLoading?: boolean;
  onDownload?: (run: PayrollRun) => void;
}

const statusConfig = {
  draft: {
    label: "Entwurf",
    icon: Clock,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  in_progress: {
    label: "In Bearbeitung",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  completed: {
    label: "Abgeschlossen",
    icon: CheckCircle,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  cancelled: {
    label: "Abgebrochen",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

const runTypeLabels = {
  monthly: "Monatslauf",
  special: "Sonderlauf",
  correction: "Korrektur",
};

export const RecentRunsSidebar = ({
  runs,
  isLoading,
  onDownload,
}: RecentRunsSidebarProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPeriod = (period: string) => {
    try {
      const [year, month] = period.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, "MMMM yyyy", { locale: de });
    } catch {
      return period;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Letzte Läufe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-3 bg-muted rounded w-32 mb-2" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Letzte Läufe
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Noch keine Lohnläufe durchgeführt</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Letzte Läufe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {runs.map((run) => {
          const config = statusConfig[run.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={run.id}
              className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">
                    {runTypeLabels[run.runType]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPeriod(run.payrollPeriod)} • {run.employeeCount} MA
                  </div>
                </div>
                <Badge className={cn("text-xs", config.className)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  {formatCurrency(run.totalGross)}
                </span>
                {run.status === "completed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1"
                    onClick={() => onDownload?.(run)}
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-xs">Export</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
