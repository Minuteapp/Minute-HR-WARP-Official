import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Info, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PayrollInsight {
  id: string;
  priority: "high" | "medium" | "info";
  title: string;
  description: string;
  affected_count?: number;
  action_label?: string;
}

interface KIInsightsSectionProps {
  insights: PayrollInsight[];
  isLoading?: boolean;
  onViewAll: () => void;
  onInsightAction?: (insight: PayrollInsight) => void;
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

export const KIInsightsSection = ({
  insights,
  isLoading,
  onViewAll,
  onInsightAction,
}: KIInsightsSectionProps) => {
  // Gruppiere Insights nach Priorität und zeige max 3
  const displayedInsights = insights.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">KI-Insights</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">KI-Insights</h2>
          </div>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Keine KI-Insights vorhanden</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">KI-Insights</h2>
          <Badge variant="secondary" className="text-xs">
            {insights.length} aktiv
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
          Alle ansehen
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {displayedInsights.map((insight) => {
          const config = priorityConfig[insight.priority];
          const Icon = config.icon;

          return (
            <Card
              key={insight.id}
              className={cn("border transition-shadow hover:shadow-md", config.cardClass)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={cn("text-xs", config.badgeClass)}>
                    {config.label}
                  </Badge>
                  <Icon className={cn("h-4 w-4", config.iconClass)} />
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-1">{insight.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {insight.description}
                </p>
                {insight.affected_count !== undefined && (
                  <p className="text-xs font-medium mb-2">
                    {insight.affected_count} Mitarbeiter betroffen
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs"
                  onClick={() => onInsightAction?.(insight)}
                >
                  {insight.action_label || "Details"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
