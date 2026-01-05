import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { EventSourceBadge } from './EventSourceBadge';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface HistoryEventCardProps {
  event: {
    id: string;
    event_type: string;
    title: string;
    department: string | null;
    employee_name: string | null;
    progress: number | null;
    source: string | null;
    event_date: string;
  };
}

export const HistoryEventCard: React.FC<HistoryEventCardProps> = ({ event }) => {
  const getTypeLabel = () => {
    switch (event.event_type) {
      case 'review_completed': return 'Review';
      case 'goal_reached': return 'Ziel';
      case 'action_completed': return 'Maßnahme';
      default: return 'Ereignis';
    }
  };

  const formattedDate = format(parseISO(event.event_date), 'dd.MM.yyyy', { locale: de });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground truncate">
                {event.title}
                {event.department && (
                  <span className="text-muted-foreground"> - {event.department}</span>
                )}
              </h4>
            </div>
            {event.employee_name && (
              <p className="text-sm text-muted-foreground mb-1">{event.employee_name}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {event.progress !== null && (
                <span className="text-sm text-muted-foreground">
                  Fortschritt: {event.progress}%
                </span>
              )}
              <EventSourceBadge source={event.source} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary">{getTypeLabel()}</Badge>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
