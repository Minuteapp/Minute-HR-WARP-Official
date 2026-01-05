import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  CheckCircle2,
  Edit,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface PayrollOpenIssue {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  issueType: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
}

interface OpenIssuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: PayrollOpenIssue[];
  onResolve?: (issue: PayrollOpenIssue) => void;
  onEdit?: (issue: PayrollOpenIssue) => void;
  onViewDetails?: (issue: PayrollOpenIssue) => void;
  onResolveAll?: () => void;
}

const severityConfig = {
  critical: {
    label: "Kritisch",
    icon: AlertCircle,
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    borderClass: "border-l-4 border-l-red-500",
  },
  warning: {
    label: "Warnung",
    icon: AlertTriangle,
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    borderClass: "border-l-4 border-l-amber-500",
  },
  info: {
    label: "Info",
    icon: Info,
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    borderClass: "border-l-4 border-l-blue-500",
  },
};

export const OpenIssuesDialog = ({
  open,
  onOpenChange,
  issues,
  onResolve,
  onEdit,
  onViewDetails,
  onResolveAll,
}: OpenIssuesDialogProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayedIssues = showAll ? issues : issues.slice(0, 5);
  const remainingCount = issues.length - 5;

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Offene Punkte ({issues.length})
          </DialogTitle>
          <DialogDescription className="flex items-center gap-3">
            <span>Vor der Abrechnung zu klären</span>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} kritisch
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                {warningCount} Warnungen
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-3">
            {displayedIssues.map((issue) => {
              const config = severityConfig[issue.severity];
              const SeverityIcon = config.icon;

              return (
                <Card
                  key={issue.id}
                  className={cn("overflow-hidden", config.borderClass)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={issue.employeeAvatar} alt={issue.employeeName} />
                        <AvatarFallback className="text-xs">
                          {getInitials(issue.employeeName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {issue.employeeName}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {issue.department}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {issue.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs gap-1", config.badgeClass)}>
                            <SeverityIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit?.(issue)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onViewDetails?.(issue)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                          onClick={() => onResolve?.(issue)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {!showAll && remainingCount > 0 && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowAll(true)}
              >
                <ChevronDown className="h-4 w-4" />
                Weitere {remainingCount} Punkte anzeigen
              </Button>
            )}

            {issues.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                <p className="font-medium">Alle Punkte geklärt</p>
                <p className="text-sm">Die Lohnabrechnung kann gestartet werden.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
          {issues.length > 0 && (
            <Button
              variant="secondary"
              className="gap-2"
              onClick={onResolveAll}
            >
              <CheckCircle2 className="h-4 w-4" />
              Alle als geklärt markieren
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
