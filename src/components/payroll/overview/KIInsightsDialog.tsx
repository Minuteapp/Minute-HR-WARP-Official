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
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  TrendingUp,
  Info,
  Sparkles,
  Download,
  Eye,
  Lightbulb,
  X,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PayrollInsight } from "./KIInsightsSection";

interface KIInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: PayrollInsight[];
  onAction?: (insight: PayrollInsight, action: string) => void;
  onDismiss?: (insight: PayrollInsight) => void;
}

const priorityConfig = {
  high: {
    label: "Hoch",
    icon: AlertTriangle,
    cardClass: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    iconClass: "text-red-600 dark:text-red-400",
  },
  medium: {
    label: "Mittel",
    icon: TrendingUp,
    cardClass: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    iconClass: "text-purple-600 dark:text-purple-400",
  },
  info: {
    label: "Info",
    icon: Info,
    cardClass: "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700",
    badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    iconClass: "text-gray-600 dark:text-gray-400",
  },
};

export const KIInsightsDialog = ({
  open,
  onOpenChange,
  insights,
  onAction,
  onDismiss,
}: KIInsightsDialogProps) => {
  const highPriorityInsights = insights.filter((i) => i.priority === "high");
  const mediumPriorityInsights = insights.filter((i) => i.priority === "medium");
  const infoPriorityInsights = insights.filter((i) => i.priority === "info");

  const renderInsightCard = (insight: PayrollInsight) => {
    const config = priorityConfig[insight.priority];
    const Icon = config.icon;

    return (
      <Card
        key={insight.id}
        className={cn("border transition-shadow hover:shadow-md", config.cardClass)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", config.iconClass)} />
              <Badge className={cn("text-xs", config.badgeClass)}>
                {config.label}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDismiss?.(insight)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <h3 className="font-medium text-sm mb-2">{insight.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {insight.description}
          </p>

          {insight.affected_count !== undefined && (
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Betrifft {insight.affected_count} Mitarbeiter
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onAction?.(insight, "analyze")}
            >
              <Eye className="h-3 w-3" />
              Analyse
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onAction?.(insight, "suggestion")}
            >
              <Lightbulb className="h-3 w-3" />
              Vorschlag
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onAction?.(insight, "details")}
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Alle KI-Insights
          </DialogTitle>
          <DialogDescription>
            KI-generierte Erkenntnisse und Handlungsempfehlungen für Ihre Lohnabrechnung
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {highPriorityInsights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Hohe Priorität ({highPriorityInsights.length})
                </h4>
                <div className="space-y-3">
                  {highPriorityInsights.map(renderInsightCard)}
                </div>
              </div>
            )}

            {mediumPriorityInsights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2">
                  Mittlere Priorität ({mediumPriorityInsights.length})
                </h4>
                <div className="space-y-3">
                  {mediumPriorityInsights.map(renderInsightCard)}
                </div>
              </div>
            )}

            {infoPriorityInsights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Informationen ({infoPriorityInsights.length})
                </h4>
                <div className="space-y-3">
                  {infoPriorityInsights.map(renderInsightCard)}
                </div>
              </div>
            )}

            {/* Premium Section */}
            <Separator />
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Premium Analysen</span>
                  <Badge variant="outline" className="text-xs">
                    Pro
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Erweiterte KI-Analysen mit prädiktiver Kostenplanung, Benchmarking
                  und automatisierten Optimierungsvorschlägen.
                </p>
                <Button variant="outline" size="sm" className="text-xs">
                  Mehr erfahren
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
          <Button variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Insights exportieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
