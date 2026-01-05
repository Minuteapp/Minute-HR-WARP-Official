import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface DSARRequest {
  id: string;
  type: 'access' | 'deletion' | 'rectification';
  status: 'open' | 'in_progress' | 'completed';
  isHighPriority?: boolean;
  applicantName: string;
  receivedDate: Date;
  deadline: Date;
}

interface DSARCardProps {
  request: DSARRequest;
  onEdit?: (id: string) => void;
}

export const DSARCard: React.FC<DSARCardProps> = ({ request, onEdit }) => {
  const typeLabels = {
    access: 'Auskunftsanfrage',
    deletion: 'Löschungsanfrage',
    rectification: 'Berichtigungsanfrage',
  };

  const statusConfig = {
    open: {
      label: 'Offen',
      className: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    },
    in_progress: {
      label: 'In Bearbeitung',
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    },
    completed: {
      label: 'Abgeschlossen',
      className: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    },
  };

  const status = statusConfig[request.status];

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-foreground">{typeLabels[request.type]}</h4>
                <Badge variant="secondary" className={status.className}>
                  {status.label}
                </Badge>
                {request.isHighPriority && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    Hohe Priorität
                  </Badge>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Antragsteller:</span> {request.applicantName}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">Eingegangen:</span> {format(request.receivedDate, 'dd.MM.yyyy', { locale: de })}
                  </span>
                  <span>
                    <span className="font-medium">Frist:</span> {format(request.deadline, 'dd.MM.yyyy', { locale: de })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => onEdit?.(request.id)}
          >
            Bearbeiten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
