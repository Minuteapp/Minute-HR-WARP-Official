import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import { useState } from 'react';

interface AbsenceRequest {
  id: string;
  user_id: string;
  employee_name: string;
  department: string;
  type: string;
  start_date: string;
  end_date: string;
  half_day: boolean;
  reason?: string;
  status: string;
  created_at: string;
}

export const VacationApprovalNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Hole ausstehende Urlaubsanträge für Admins/Vorgesetzte
  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['pendingVacationRequests'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('absence_requests')
        .select(`
          id, user_id, employee_name, department, type, 
          start_date, end_date, half_day, reason, status, created_at
        `)
        .eq('status', 'pending')
        .eq('type', 'vacation')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AbsenceRequest[];
    },
    enabled: !!user
  });

  const handleApproval = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('absence_requests')
        .update({ 
          status: action,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: `Urlaubsantrag wurde ${action === 'approved' ? 'genehmigt' : 'abgelehnt'}.`,
      });

      // Cache invalidieren für alle relevanten Queries
      queryClient.invalidateQueries({ queryKey: ['pendingVacationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
      queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });

    } catch (error) {
      console.error('Error updating vacation request:', error);
      toast({
        title: "Fehler",
        description: "Der Urlaubsantrag konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const calculateVacationDays = (startDate: string, endDate: string, halfDay: boolean) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return halfDay ? days * 0.5 : days;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Urlaubsgenehmigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Urlaubsgenehmigungen
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingRequests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Keine ausstehenden Urlaubsanträge</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{request.employee_name}</span>
                      <Badge variant="outline">{request.department}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - {' '}
                          {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {calculateVacationDays(request.start_date, request.end_date, request.half_day)} Tage
                        </span>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Grund:</strong> {request.reason}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Eingereicht am {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleApproval(request.id, 'approved')}
                      disabled={processingId === request.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Genehmigen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleApproval(request.id, 'rejected')}
                      disabled={processingId === request.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Ablehnen
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};