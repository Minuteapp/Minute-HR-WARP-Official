import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface AIInsightActionsProps {
  recommendations: string[];
  onImplement: () => void;
  onMarkResolved: () => void;
  onDismiss: () => void;
}

export const AIInsightActions = ({ 
  recommendations, 
  onImplement, 
  onMarkResolved, 
  onDismiss 
}: AIInsightActionsProps) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div>
        <p className="font-medium text-foreground mb-2">Empfohlene Maßnahmen:</p>
        <ul className="space-y-1">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onImplement}>
          Maßnahmen umsetzen
        </Button>
        <Button size="sm" variant="secondary" onClick={onMarkResolved}>
          Als erledigt markieren
        </Button>
        <Button size="sm" variant="outline" onClick={onDismiss}>
          <X className="h-4 w-4 mr-1" />
          Verwerfen
        </Button>
      </div>
    </div>
  );
};
