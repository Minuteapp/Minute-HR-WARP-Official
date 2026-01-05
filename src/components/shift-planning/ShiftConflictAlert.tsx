
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { useCrossModuleEvents } from '@/hooks/useCrossModuleEvents';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ShiftConflictAlertProps {
  employeeId?: string;
  date?: Date;
  className?: string;
}

const ShiftConflictAlert: React.FC<ShiftConflictAlertProps> = ({
  employeeId,
  date,
  className
}) => {
  const { shiftConflicts, resolveEvent } = useCrossModuleEvents();

  // Filtere Konflikte basierend auf Props
  const relevantConflicts = shiftConflicts.filter(conflict => {
    if (employeeId && conflict.user_id !== employeeId) return false;
    if (date) {
      const conflictDate = new Date(conflict.start_date);
      if (conflictDate.toDateString() !== date.toDateString()) return false;
    }
    return conflict.status === 'conflict';
  });

  if (relevantConflicts.length === 0) {
    return null;
  }

  const handleResolveConflict = (conflictId: string) => {
    resolveEvent({
      eventId: conflictId,
      resolution: 'Schichtkonflikt manuell durch Planer aufgelöst'
    });
  };

  return (
    <div className={className}>
      {relevantConflicts.map((conflict) => (
        <Alert key={conflict.id} variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Schichtkonflikt erkannt
            <Badge variant="outline" className="ml-2">
              {conflict.department}
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <p>
                <strong>{conflict.employee_name}</strong> hat eine genehmigte Abwesenheit 
                am {format(new Date(conflict.start_date), 'dd.MM.yyyy', { locale: de })}.
              </p>
              
              {conflict.metadata?.absence_type && (
                <p className="text-sm">
                  Abwesenheitstyp: <strong>{conflict.metadata.absence_type}</strong>
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Zeitraum: {format(new Date(conflict.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(conflict.end_date), 'dd.MM.yyyy', { locale: de })}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  Bitte alternative Schichtbesetzung planen oder Schicht absagen.
                </p>
                <Button
                  size="sm"
                  onClick={() => handleResolveConflict(conflict.id)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Konflikt lösen
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default ShiftConflictAlert;
