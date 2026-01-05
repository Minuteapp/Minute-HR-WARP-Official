import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Info, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PulseInsightCardProps {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'warning' | 'success' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

const severityConfig = {
  low: { label: 'Niedrig', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Mittel', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Hoch', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Kritisch', color: 'bg-red-100 text-red-800' },
};

const typeConfig = {
  warning: { icon: AlertCircle, color: 'border-yellow-200 bg-yellow-50' },
  success: { icon: CheckCircle, color: 'border-green-200 bg-green-50' },
  info: { icon: Info, color: 'border-blue-200 bg-blue-50' },
};

export const PulseInsightCard = ({
  title,
  description,
  severity,
  type,
  actionLabel,
  onAction,
}: PulseInsightCardProps) => {
  const Icon = typeConfig[type].icon;
  const config = severityConfig[severity];

  return (
    <Card className={cn("border-l-4", typeConfig[type].color)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className={config.color}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction && (
          <Button size="sm" onClick={onAction} variant="outline">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
