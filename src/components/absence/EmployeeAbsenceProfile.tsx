import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeAbsenceProfileProps {
  employeeId?: string;
}

export const EmployeeAbsenceProfile: React.FC<EmployeeAbsenceProfileProps> = ({ employeeId }) => {
  const [vacationData, setVacationData] = useState({
    total: 0,
    used: 0,
    remaining: 0,
    pending: 0
  });
  const [recentAbsences, setRecentAbsences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployeeAbsenceData();
  }, [employeeId]);

  const loadEmployeeAbsenceData = async () => {
    try {
      setIsLoading(true);
      
      // Ermittle Benutzer-ID
      let userId = employeeId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        userId = user.id;
      }

      // Lade Mitarbeiterinformationen
      const { data: employee } = await supabase
        .from('employees')
        .select('vacation_days, name, department')
        .eq('id', userId)
        .single();

      if (!employee) {
        console.error('Employee not found');
        return;
      }

      const totalVacationDays = employee.vacation_days || 25;

      // Lade Abwesenheitsanträge für das aktuelle Jahr
      const currentYear = new Date().getFullYear();
      const { data: absenceRequests } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', `${currentYear}-01-01`)
        .lte('start_date', `${currentYear}-12-31`)
        .order('created_at', { ascending: false });

      if (absenceRequests) {
        // Berechne genutzte und ausstehende Urlaubstage
        let usedDays = 0;
        let pendingDays = 0;

        absenceRequests.forEach(request => {
          if (request.type === 'vacation') {
            const start = new Date(request.start_date);
            const end = new Date(request.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const actualDays = request.half_day ? days * 0.5 : days;

            if (request.status === 'approved') {
              usedDays += actualDays;
            } else if (request.status === 'pending') {
              pendingDays += actualDays;
            }
          }
        });

        setVacationData({
          total: totalVacationDays,
          used: usedDays,
          remaining: Math.max(0, totalVacationDays - usedDays),
          pending: pendingDays
        });

        // Setze die letzten 5 Abwesenheiten
        setRecentAbsences(absenceRequests.slice(0, 5));
      }

    } catch (error) {
      console.error('Error loading employee absence data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'vacation': 'Urlaub',
      'sick': 'Krankheit',
      'business': 'Dienstreise',
      'parental': 'Elternzeit',
      'training': 'Weiterbildung',
      'special': 'Sonderurlaub'
    };
    return typeMap[type] || type;
  };

  const calculateDuration = (startDate: string, endDate: string, halfDay: boolean) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return halfDay ? days * 0.5 : days;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vacationUsagePercentage = vacationData.total > 0 ? (vacationData.used / vacationData.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Urlaubsübersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Urlaubsübersicht {new Date().getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vacationData.total}</div>
              <div className="text-sm text-slate-600">Gesamt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{vacationData.used}</div>
              <div className="text-sm text-slate-600">Genommen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">{vacationData.remaining}</div>
              <div className="text-sm text-slate-600">Verfügbar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{vacationData.pending}</div>
              <div className="text-sm text-slate-600">Ausstehend</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Verbrauch</span>
              <span>{vacationUsagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={vacationUsagePercentage} className="h-2" />
          </div>

          {vacationData.remaining <= 5 && vacationData.remaining > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Nur noch {vacationData.remaining} Urlaubstage verfügbar
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abwesenheitshistorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Letzte Abwesenheiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAbsences.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              Keine Abwesenheiten gefunden
            </div>
          ) : (
            <div className="space-y-3">
              {recentAbsences.map((absence) => (
                <div key={absence.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getTypeLabel(absence.type)}</span>
                      {getStatusBadge(absence.status)}
                    </div>
                    <span className="text-sm text-slate-600">
                      {calculateDuration(absence.start_date, absence.end_date, absence.half_day)} Tage
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })} - {' '}
                        {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>
                    {absence.half_day && (
                      <Badge variant="outline" className="text-xs">Halbtag</Badge>
                    )}
                  </div>
                  
                  {absence.reason && (
                    <div className="mt-2 text-sm text-slate-600">
                      <strong>Grund:</strong> {absence.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};