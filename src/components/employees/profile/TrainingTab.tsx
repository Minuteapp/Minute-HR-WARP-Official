
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Calendar, Award, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrainingTabProps {
  employeeId: string;
}

export const TrainingTab = ({ employeeId }: TrainingTabProps) => {
  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['employeeTrainings', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_trainings')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['employeeCertificates', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_certificates')
        .select('*')
        .eq('employee_id', employeeId)
        .order('issued_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Schulungen & Zertifikate</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schulung hinzufügen
        </Button>
      </div>

      {/* Aktuelle Schulungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Schulungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Schulungen vorhanden</p>
          ) : (
            <div className="space-y-4">
              {trainings.map((training: any) => (
                <div key={training.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{training.title}</h3>
                    <Badge className={getStatusColor(training.status)}>
                      {training.status === 'completed' ? 'Abgeschlossen' :
                       training.status === 'in_progress' ? 'Laufend' :
                       training.status === 'scheduled' ? 'Geplant' : training.status}
                    </Badge>
                  </div>
                  {training.description && (
                    <p className="text-sm text-gray-600 mb-3">{training.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {training.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(training.start_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    {training.duration && (
                      <span>Dauer: {training.duration}h</span>
                    )}
                    {training.provider && (
                      <span>Anbieter: {training.provider}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zertifikate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Zertifikate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Zertifikate vorhanden</p>
          ) : (
            <div className="space-y-4">
              {certificates.map((certificate: any) => (
                <div key={certificate.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{certificate.name}</h3>
                    {certificate.expiry_date && (
                      <Badge variant={new Date(certificate.expiry_date) > new Date() ? "default" : "destructive"}>
                        {new Date(certificate.expiry_date) > new Date() ? 'Gültig' : 'Abgelaufen'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {certificate.issued_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Ausgestellt: {new Date(certificate.issued_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    {certificate.expiry_date && (
                      <span>Gültig bis: {new Date(certificate.expiry_date).toLocaleDateString('de-DE')}</span>
                    )}
                    {certificate.issuer && (
                      <span>Aussteller: {certificate.issuer}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
