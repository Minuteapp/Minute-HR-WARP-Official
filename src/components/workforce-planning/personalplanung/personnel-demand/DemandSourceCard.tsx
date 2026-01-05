import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface DemandSourceCardProps {
  title: string;
  icon: LucideIcon;
  priority: 'high' | 'medium' | 'low';
  demandCount: number;
  fteTotal: number;
}

export const DemandSourceCard = ({ 
  title, 
  icon: Icon, 
  priority, 
  demandCount, 
  fteTotal 
}: DemandSourceCardProps) => {
  const priorityConfig = {
    high: { label: 'Hoch', className: 'bg-red-100 text-red-600 border-red-200' },
    medium: { label: 'Mittel', className: 'bg-orange-100 text-orange-600 border-orange-200' },
    low: { label: 'Niedrig', className: 'bg-green-100 text-green-600 border-green-200' }
  };

  const config = priorityConfig[priority];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100">
              <Icon className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-medium text-sm">{title}</span>
          </div>
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{demandCount} Bedarfe</span>
          <span className="font-semibold text-purple-600">{fteTotal} FTE</span>
        </div>
      </CardContent>
    </Card>
  );
};
