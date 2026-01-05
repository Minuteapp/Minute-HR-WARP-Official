import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, Plane } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface VacationAwareTimeTrackingProps {
  employeeId: string;
  children: React.ReactNode;
}

interface AbsenceRequest {
  id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  reason?: string;
}

export const VacationAwareTimeTracking = ({ employeeId, children }: VacationAwareTimeTrackingProps) => {
  const [isOnVacation, setIsOnVacation] = useState(false);
  const [currentVacation, setCurrentVacation] = useState<AbsenceRequest | null>(null);

  const { data: activeVacations = [] } = useQuery({
    queryKey: ['activeVacations', employeeId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('user_id', employeeId)
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);
      
      if (error) throw error;
      return data as AbsenceRequest[];
    }
  });

  useEffect(() => {
    const today = new Date();
    const vacation = activeVacations.find(vacation => {
      const startDate = parseISO(vacation.start_date);
      const endDate = parseISO(vacation.end_date);
      return today >= startDate && today <= endDate;
    });
    
    setIsOnVacation(!!vacation);
    setCurrentVacation(vacation || null);
  }, [activeVacations]);

  // Wenn Mitarbeiter im Urlaub ist, zeige Blockierung an
  if (isOnVacation && currentVacation) {
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <Plane className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Zeiterfassung blockiert:</strong> Der Mitarbeiter befindet sich derzeit im Urlaub
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {format(parseISO(currentVacation.start_date), 'dd.MM.', { locale: de })} - {format(parseISO(currentVacation.end_date), 'dd.MM.yyyy', { locale: de })}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Calendar className="h-5 w-5" />
              Aktuelle Abwesenheit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Zeitraum:</span>
                  <div className="font-medium">
                    {format(parseISO(currentVacation.start_date), 'dd.MM.yyyy', { locale: de })} - {' '}
                    {format(parseISO(currentVacation.end_date), 'dd.MM.yyyy', { locale: de })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Art:</span>
                  <div className="font-medium">
                    {currentVacation.type === 'vacation' ? 'Urlaub' : currentVacation.type}
                  </div>
                </div>
              </div>

              {currentVacation.reason && (
                <div>
                  <span className="text-gray-600 text-sm">Grund:</span>
                  <div className="font-medium mt-1 p-2 bg-gray-50 rounded">{currentVacation.reason}</div>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Hinweis</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Während der Abwesenheit ist keine Zeiterfassung möglich. 
                  Die Zeiterfassung wird automatisch nach Ende des Urlaubs wieder aktiviert.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stark reduzierte Ansicht der Zeiterfassung im schreibgeschützten Modus */}
        <div className={cn(
          "opacity-50 pointer-events-none relative",
          "after:content-[''] after:absolute after:inset-0 after:bg-gray-100/50 after:backdrop-blur-sm after:z-10"
        )}>
          {children}
        </div>
      </div>
    );
  }

  // Normale Zeiterfassung wenn nicht im Urlaub
  return <div className="space-y-6">{children}</div>;
};