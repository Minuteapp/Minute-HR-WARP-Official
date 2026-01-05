import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, FileText, Stethoscope } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface EmployeeSickLeaveTabContentProps {
  employeeId: string;
}

export const EmployeeSickLeaveTabContent = ({ employeeId }: EmployeeSickLeaveTabContentProps) => {
  const { data: sickLeaves, isLoading } = useQuery({
    queryKey: ['employee-sick-leaves', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sick_leaves')
        .select('*')
        .eq('user_id', employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'rejected':
        return <Badge variant="default" className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Krankmeldungen</CardTitle>
              <CardDescription>Übersicht aller Krankmeldungen des Mitarbeiters</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Neue Krankmeldung
          </Button>
        </CardHeader>
      </Card>

      {!sickLeaves || sickLeaves.length === 0 ? (
        <Card className="hover-scale">
          <CardContent className="p-6 text-center">
            <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Keine Krankmeldungen vorhanden</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 animate-fade-in">
          {sickLeaves.map((sickLeave) => (
            <Card key={sickLeave.id} className="hover-scale">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {sickLeave.is_child_sick_leave ? 'Kind-Krankmeldung' : 'Krankmeldung'}
                      {sickLeave.child_name && ` - ${sickLeave.child_name}`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(sickLeave.start_date), 'dd.MM.yyyy', { locale: de })}
                        {sickLeave.end_date && ` - ${format(new Date(sickLeave.end_date), 'dd.MM.yyyy', { locale: de })}`}
                      </span>
                      {sickLeave.is_partial_day && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {sickLeave.start_time} - {sickLeave.end_time}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(sickLeave.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Grund:</strong> {sickLeave.reason}</p>
                  {sickLeave.notes && (
                    <p><strong>Notizen:</strong> {sickLeave.notes}</p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Arzt kontaktiert: {sickLeave.has_contacted_doctor ? 'Ja' : 'Nein'}</span>
                    <span>Dokumente: {sickLeave.has_documents ? 'Ja' : 'Nein'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};