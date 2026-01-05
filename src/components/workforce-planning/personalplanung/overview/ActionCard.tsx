import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ActionMetric {
  label: string;
  value: string;
  isNegative?: boolean;
}

interface ActionLink {
  label: string;
  href: string;
}

interface ActionCardProps {
  title: string;
  subtitle?: string;
  severity: 'critical' | 'important';
  metrics: ActionMetric[];
  links: ActionLink[];
}

export const ActionCard = ({ title, subtitle, severity, metrics, links }: ActionCardProps) => {
  const severityStyles = {
    critical: {
      bg: "bg-red-50",
      border: "border-l-4 border-l-red-500",
      title: "text-red-900"
    },
    important: {
      bg: "bg-orange-50",
      border: "border-l-4 border-l-orange-500",
      title: "text-orange-900"
    }
  };

  const styles = severityStyles[severity];

  return (
    <Card className={`${styles.bg} ${styles.border} border-0 shadow-sm`}>
      <CardContent className="p-4">
        <h4 className={`font-semibold ${styles.title}`}>{title}</h4>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {metrics.map((metric, index) => (
            <div key={index}>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className={`text-sm font-semibold ${metric.isNegative ? 'text-red-600' : ''}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-sm text-purple-600 font-medium hover:underline flex items-center gap-1"
            >
              {link.label}
              <ArrowRight className="h-3 w-3" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
