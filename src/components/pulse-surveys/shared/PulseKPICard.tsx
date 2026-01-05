import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PulseKPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  color: 'purple' | 'green' | 'yellow' | 'red' | 'blue';
}

const colorClasses = {
  purple: 'text-purple-600 bg-purple-50',
  green: 'text-green-600 bg-green-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  red: 'text-red-600 bg-red-50',
  blue: 'text-blue-600 bg-blue-50',
};

export const PulseKPICard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  color,
}: PulseKPICardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-2 rounded-lg", colorClasses[color])}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={cn(
              "text-sm font-medium px-2 py-1 rounded",
              trend.positive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
            )}>
              {trend.positive ? '+' : ''}{trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
