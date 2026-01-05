
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AbsenceNotifications } from '@/components/absence/AbsenceNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface AbsenceHistoryTabProps {
  userId: string;
}

export const AbsenceHistoryTab = ({ userId }: AbsenceHistoryTabProps) => {
  const { user } = useAuth();
  
  const { data: absenceHistory = [], isLoading } = useQuery({
    queryKey: ['employee-absence-history', userId],
    queryFn: async () => {
      return await absenceService.getRequests();
    }
  });

  // Zusätzlich Daten aus der absences Tabelle laden für genehmigte Abwesenheiten
  const { data: approvedAbsences = [] } = useQuery({
    queryKey: ['employee-approved-absences', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Fehler beim Laden der genehmigten Abwesenheiten:', error);
        return [];
      }
      
      return data || [];
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Ausstehend' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Genehmigt' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Abgelehnt' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {variant.text}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      vacation: 'Urlaub',
      sick_leave: 'Krankmeldung',
      sick: 'Krankmeldung',
      parental: 'Elternzeit',
      business_trip: 'Dienstreise',
      other: 'Sonstiges'
    };
    
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  // Filtere nur die Abwesenheiten des spezifischen Benutzers oder des aktuellen Benutzers
  const userAbsences = absenceHistory.filter(absence => absence.user_id === userId || absence.user_id === user?.id);

  // Kombiniere beide Datenquellen und entferne Duplikate
  const allAbsences = [...userAbsences];
  
  // Füge genehmigte Abwesenheiten aus der absences Tabelle hinzu, die nicht bereits in der absence_requests Tabelle stehen
  approvedAbsences.forEach(approvedAbsence => {
    const existsInRequests = userAbsences.some(request => 
      request.user_id === approvedAbsence.user_id &&
      format(new Date(request.start_date), 'yyyy-MM-dd') === format(new Date(approvedAbsence.start_date), 'yyyy-MM-dd') &&
      format(new Date(request.end_date), 'yyyy-MM-dd') === format(new Date(approvedAbsence.end_date), 'yyyy-MM-dd')
    );
    
    if (!existsInRequests) {
      // Formatiere die genehmigte Abwesenheit im gleichen Format wie absence_requests
      allAbsences.push({
        id: approvedAbsence.id,
        user_id: approvedAbsence.user_id,
        start_date: format(new Date(approvedAbsence.start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(approvedAbsence.end_date), 'yyyy-MM-dd'),
        start_time: approvedAbsence.start_time,
        end_time: approvedAbsence.end_time,
        status: 'approved',
        type: 'vacation', // Standardtyp, da in absences Tabelle kein Typ gespeichert wird
        reason: approvedAbsence.notes || 'Genehmigt',
        half_day: false,
        created_at: approvedAbsence.created_at,
        employee_name: null,
        department: null
      });
    }
  });

  // Sortiere nach Erstellungsdatum (neueste zuerst)
  const sortedAbsences = allAbsences.sort((a, b) => 
    new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Benachrichtigungen nur für den aktuellen Benutzer anzeigen */}
      {(userId === user?.id) && <AbsenceNotifications />}
      
      {/* Abwesenheitsverlauf */}
      <Card>
        <CardHeader>
          <CardTitle>Abwesenheitsverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAbsences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Abwesenheiten gefunden
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAbsences.map((absence) => (
                <div key={absence.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getTypeBadge(absence.type || absence.absence_type)}
                      </Badge>
                      {getStatusBadge(absence.status)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {absence.created_at && format(new Date(absence.created_at), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })} - 
                        {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>
                    
                    {absence.half_day && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Halbtag</span>
                      </div>
                    )}
                  </div>
                  
                  {absence.reason && (
                    <p className="text-sm text-gray-600">{absence.reason}</p>
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
