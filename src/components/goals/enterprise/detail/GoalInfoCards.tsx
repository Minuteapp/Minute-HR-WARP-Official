import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface GoalInfoCardsProps {
  ownerName?: string;
  departmentName?: string;
  startDate?: string;
  endDate?: string;
}

export const GoalInfoCards = ({
  ownerName,
  departmentName,
  startDate,
  endDate
}: GoalInfoCardsProps) => {
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return format(new Date(date), 'd.M.yyyy', { locale: de });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Verantwortlichkeit</span>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Owner:</span> {ownerName || '-'}</p>
            {departmentName && (
              <p><span className="text-muted-foreground">Bereich:</span> {departmentName}</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Zeitrahmen</span>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Start:</span> {formatDate(startDate)}</p>
            <p><span className="text-muted-foreground">Ende:</span> {formatDate(endDate)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
