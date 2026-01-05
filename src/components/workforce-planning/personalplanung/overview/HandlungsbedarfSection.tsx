import { Badge } from "@/components/ui/badge";
import { ActionCard } from "./ActionCard";

interface ActionItem {
  id: string;
  title: string;
  subtitle?: string;
  severity: 'critical' | 'important';
  metrics: Array<{ label: string; value: string; isNegative?: boolean }>;
  links: Array<{ label: string; href: string }>;
}

interface HandlungsbedarfSectionProps {
  actions?: ActionItem[];
  criticalCount?: number;
  importantCount?: number;
}

export const HandlungsbedarfSection = ({ 
  actions = [], 
  criticalCount = 0, 
  importantCount = 0 
}: HandlungsbedarfSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Handlungsbedarf</h3>
        {criticalCount > 0 && (
          <Badge className="bg-red-100 text-red-600 border border-red-200 hover:bg-red-100">
            {criticalCount} Kritisch
          </Badge>
        )}
        {importantCount > 0 && (
          <Badge className="bg-orange-100 text-orange-600 border border-orange-200 hover:bg-orange-100">
            {importantCount} Wichtig
          </Badge>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <p>Keine aktuellen Handlungsbedarfe vorhanden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              subtitle={action.subtitle}
              severity={action.severity}
              metrics={action.metrics}
              links={action.links}
            />
          ))}
        </div>
      )}
    </div>
  );
};
