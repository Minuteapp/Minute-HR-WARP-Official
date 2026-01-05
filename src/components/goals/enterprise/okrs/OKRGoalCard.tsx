import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, User, Calendar } from "lucide-react";
import { GoalTypeBadge } from "../common/GoalTypeBadge";
import { OKRStatusBadge } from "./OKRStatusBadge";
import { OKRKeyResultItem } from "./OKRKeyResultItem";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface KeyResult {
  id: string;
  title: string;
  current_value: number;
  target_value: number;
  unit: string;
  measurement_type: 'automatic' | 'manual';
}

interface OKRGoalCardProps {
  id: string;
  title: string;
  description?: string;
  type: string;
  ownerName?: string;
  endDate?: string;
  progress: number;
  status: string;
  keyResults: KeyResult[];
  onEdit?: (id: string) => void;
}

export const OKRGoalCard = ({ 
  id,
  title, 
  description, 
  type, 
  ownerName, 
  endDate, 
  progress, 
  status,
  keyResults,
  onEdit 
}: OKRGoalCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <GoalTypeBadge type={type} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onEdit?.(id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="font-semibold mt-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {ownerName && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{ownerName}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(endDate), 'dd.MM.yyyy', { locale: de })}</span>
            </div>
          )}
        </div>

        {keyResults.length > 0 && (
          <div>
            <p className="text-sm font-medium text-purple-600 mb-2">
              Key Results ({keyResults.length}):
            </p>
            <div className="space-y-1">
              {keyResults.map((kr) => (
                <OKRKeyResultItem
                  key={kr.id}
                  title={kr.title}
                  currentValue={kr.current_value}
                  targetValue={kr.target_value}
                  unit={kr.unit}
                  measurementType={kr.measurement_type}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 flex-1">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="ml-4">
            <OKRStatusBadge status={status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
