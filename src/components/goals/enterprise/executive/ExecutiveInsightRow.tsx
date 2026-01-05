import { Badge } from "@/components/ui/badge";

interface ExecutiveInsightRowProps {
  priority: string;
  title: string;
  description?: string;
}

export const ExecutiveInsightRow = ({ priority, title, description }: ExecutiveInsightRowProps) => {
  const config: Record<string, { label: string; className: string }> = {
    critical: { label: 'Kritisch', className: 'bg-red-100 text-red-700' },
    warning: { label: 'Warnung', className: 'bg-orange-100 text-orange-700' },
    info: { label: 'Info', className: 'bg-blue-100 text-blue-700' },
  };

  const { label, className } = config[priority] || config.info;

  return (
    <div className="flex items-start gap-3 py-2">
      <Badge variant="secondary" className={className}>
        {label}
      </Badge>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
