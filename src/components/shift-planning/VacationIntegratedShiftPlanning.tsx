import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface Shift {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface VacationRequest {
  id: string;
  user_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface VacationIntegratedShiftPlanningProps {
  month?: Date;
  employeeId?: string; // Wenn gesetzt, nur diesen Mitarbeiter anzeigen
}

export const VacationIntegratedShiftPlanning = ({ month = new Date(), employeeId }: VacationIntegratedShiftPlanningProps) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Hole Mitarbeiter (entweder alle oder nur den spezifischen)
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('id, name, department')
        .eq('status', 'active');
      
      // Wenn employeeId gesetzt ist, nur diesen Mitarbeiter holen
      if (employeeId) {
        query = query.eq('id', employeeId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as Employee[];
    }
  });

  // Hole Schichten für den Monat (optional nur für einen Mitarbeiter)
  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts', format(month, 'yyyy-MM'), employeeId],
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select('*')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));
      
      // Wenn employeeId gesetzt ist, nur Schichten für diesen Mitarbeiter
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query.order('date');
      
      if (error) throw error;
      return data as Shift[];
    }
  });

  // Hole genehmigte Urlaube für den Monat (optional nur für einen Mitarbeiter)
  const { data: approvedVacations = [] } = useQuery({
    queryKey: ['approvedVacations', format(month, 'yyyy-MM'), employeeId],
    queryFn: async () => {
      let query = supabase
        .from('absence_requests')
        .select('id, user_id, employee_name, start_date, end_date, status')
        .eq('status', 'approved')
        .lte('start_date', format(monthEnd, 'yyyy-MM-dd'))
        .gte('end_date', format(monthStart, 'yyyy-MM-dd'));
      
      // Wenn employeeId gesetzt ist, nur Urlaube für diesen Mitarbeiter
      if (employeeId) {
        query = query.eq('user_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as VacationRequest[];
    }
  });

  const isEmployeeOnVacation = (employeeId: string, date: Date) => {
    return approvedVacations.some(vacation => {
      if (vacation.user_id !== employeeId) return false;
      const startDate = new Date(vacation.start_date);
      const endDate = new Date(vacation.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getShiftsForEmployeeAndDate = (employeeId: string, date: Date) => {
    return shifts.filter(shift => 
      shift.employee_id === employeeId && 
      isSameDay(new Date(shift.date), date)
    );
  };

  const getVacationForEmployeeAndDate = (employeeId: string, date: Date) => {
    return approvedVacations.find(vacation => 
      vacation.user_id === employeeId &&
      date >= new Date(vacation.start_date) &&
      date <= new Date(vacation.end_date)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schichtplanung mit Urlaubsintegration - {format(month, 'MMMM yyyy', { locale: de })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legende */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Geplante Schicht</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Urlaub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Konflikt</span>
            </div>
          </div>

          {/* Mitarbeiter-Übersicht */}
          <div className="space-y-4">
            {employees.map(employee => (
              <div key={employee.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{employee.name}</span>
                    <Badge variant="outline">{employee.department}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map(day => {
                    const dayShifts = getShiftsForEmployeeAndDate(employee.id, day);
                    const vacation = getVacationForEmployeeAndDate(employee.id, day);
                    const hasConflict = vacation && dayShifts.length > 0;

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "p-2 border rounded text-center text-xs min-h-[60px] flex flex-col",
                          hasConflict && "bg-yellow-100 border-yellow-300",
                          vacation && !hasConflict && "bg-red-100 border-red-200",
                          dayShifts.length > 0 && !vacation && "bg-green-100 border-green-200",
                          !dayShifts.length && !vacation && "bg-gray-50"
                        )}
                      >
                        <div className="font-medium mb-1">
                          {format(day, 'd')}
                        </div>

                        {hasConflict && (
                          <div className="mb-1">
                            <AlertTriangle className="h-3 w-3 mx-auto text-yellow-600" />
                            <div className="text-yellow-700 font-medium">Konflikt!</div>
                          </div>
                        )}

                        {vacation && (
                          <div className="text-red-700 font-medium mb-1">
                            Urlaub
                          </div>
                        )}

                        {dayShifts.map(shift => (
                          <div key={shift.id} className="text-gray-700 mb-1">
                            {shift.start_time} - {shift.end_time}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Konflikt-Übersicht */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Schicht-Urlaub-Konflikte
            </h3>
            
            {(() => {
              const conflicts: any[] = [];
              
              employees.forEach(employee => {
                monthDays.forEach(day => {
                  const dayShifts = getShiftsForEmployeeAndDate(employee.id, day);
                  const vacation = getVacationForEmployeeAndDate(employee.id, day);
                  
                  if (vacation && dayShifts.length > 0) {
                    conflicts.push({
                      employee: employee.name,
                      date: day,
                      shifts: dayShifts,
                      vacation
                    });
                  }
                });
              });

              if (conflicts.length === 0) {
                return <p className="text-yellow-700">Keine Konflikte gefunden.</p>;
              }

              return (
                <div className="space-y-2">
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-900">
                        {conflict.employee} - {format(conflict.date, 'dd.MM.yyyy', { locale: de })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Geplante Schicht(en): {conflict.shifts.map((s: any) => `${s.start_time}-${s.end_time}`).join(', ')}
                      </div>
                      <div className="text-sm text-red-600">
                        Aber: Genehmigter Urlaub vom {format(new Date(conflict.vacation.start_date), 'dd.MM.yyyy')} bis {format(new Date(conflict.vacation.end_date), 'dd.MM.yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};