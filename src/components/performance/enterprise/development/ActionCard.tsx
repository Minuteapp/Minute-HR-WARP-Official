import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionTypeBadge } from "./ActionTypeBadge";
import { ActionStatusBadge } from "./ActionStatusBadge";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ActionCardProps {
  action: {
    id: string;
    title: string;
    description?: string;
    action_type: string;
    status: string;
    due_date?: string;
  };
  onComplete: () => void;
}

export const ActionCard = ({ action, onComplete }: ActionCardProps) => {
  const isInProgress = action.status === 'in_progress';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ActionTypeBadge type={action.action_type} />
              <ActionStatusBadge status={action.status} />
            </div>
            
            <h4 className="font-semibold mb-1">{action.title}</h4>
            
            {action.description && (
              <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
            )}
            
            {action.due_date && (
              <p className="text-sm text-muted-foreground">
                Fällig: {format(new Date(action.due_date), 'dd.MM.yyyy', { locale: de })}
              </p>
            )}
          </div>

          {isInProgress && (
            <Button variant="outline" size="sm" onClick={onComplete} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Abschließen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
