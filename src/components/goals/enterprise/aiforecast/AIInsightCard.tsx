import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { AIInsightActions } from "./AIInsightActions";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface AIInsightCardProps {
  id: string;
  insightType: 'critical' | 'warning' | 'forecast' | 'recommendation';
  category: string;
  title: string;
  description: string;
  confidenceScore: number;
  createdAt: string;
  recommendations: string[];
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const AIInsightCard = ({
  id,
  insightType,
  category,
  title,
  description,
  confidenceScore,
  createdAt,
  recommendations,
  onResolve,
  onDismiss
}: AIInsightCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeConfig = {
    critical: {
      badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
      iconColor: "text-destructive",
      titleColor: "text-destructive"
    },
    warning: {
      badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-foreground"
    },
    forecast: {
      badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-foreground"
    },
    recommendation: {
      badgeClass: "bg-green-100 text-green-700 border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-foreground"
    }
  };

  const config = typeConfig[insightType];
  const typeLabels = {
    critical: "Kritisch",
    warning: "Warnung",
    forecast: "Prognose",
    recommendation: "Empfehlung"
  };

  return (
    <Card className="p-4">
      <div 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />
            <Badge variant="outline" className={config.badgeClass}>
              {typeLabels[insightType]}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-700">
              {category}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Confidence: {confidenceScore}%</span>
            <span>{format(new Date(createdAt), 'dd.MM.yyyy', { locale: de })}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        <h4 className={`font-semibold mb-1 ${config.titleColor}`}>{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {isExpanded && recommendations.length > 0 && (
        <AIInsightActions
          recommendations={recommendations}
          onImplement={() => {}}
          onMarkResolved={() => onResolve(id)}
          onDismiss={() => onDismiss(id)}
        />
      )}
    </Card>
  );
};
