import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface DeletionQueueItem {
  id: string;
  categoryName: string;
  status: 'planned';
  affectedRecords: number;
  plannedDate: Date;
}

interface DeletionQueueCardProps {
  item: DeletionQueueItem;
  onExecute?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export const DeletionQueueCard: React.FC<DeletionQueueCardProps> = ({ 
  item, 
  onExecute,
  onViewDetails,
}) => {
  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{item.categoryName}</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  Geplant
                </Badge>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Betroffene Datensätze:</span> {item.affectedRecords.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Geplant für:</span>{' '}
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {format(item.plannedDate, 'dd.MM.yyyy', { locale: de })}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => onExecute?.(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Löschung ausführen
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewDetails?.(item.id)}
            >
              Details ansehen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
