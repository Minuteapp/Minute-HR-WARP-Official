
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, PlusCircle, CheckCircle, XCircle, AlertTriangle, CalendarDays } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { VacationRequestDialog } from "../VacationRequestDialog";

interface VacationRequest {
  id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
}

interface VacationSettings {
  yearly_days: number;
  carry_over_days: number;
}

interface VacationInfoProps {
  employeeId: string;
  vacationSettings?: VacationSettings;
  vacationRequests?: VacationRequest[];
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'outline';
    case 'rejected':
      return 'destructive';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Genehmigt';
    case 'pending':
      return 'Ausstehend';
    case 'rejected':
      return 'Abgelehnt';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

export const VacationInfo = ({ 
  employeeId, 
  vacationSettings = { yearly_days: 30, carry_over_days: 3 },
  vacationRequests = []
}: VacationInfoProps) => {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Hilfsfunktion zur Berechnung der verbleibenden Urlaubstage
  const calculateUsedVacationDays = () => {
    const approvedRequests = vacationRequests?.filter(req => req.status === 'approved') || [];
    
    let totalDays = 0;
    for (const request of approvedRequests) {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalDays += days;
    }
    
    return totalDays;
  };
  
  const usedDays = calculateUsedVacationDays();
  const totalAvailableDays = (vacationSettings?.yearly_days || 0) + (vacationSettings?.carry_over_days || 0);
  const remainingDays = totalAvailableDays - usedDays;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              Urlaubsübersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{totalAvailableDays}</p>
                <p className="text-xs text-gray-600">Gesamt</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{usedDays}</p>
                <p className="text-xs text-gray-600">Genutzt</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{remainingDays}</p>
                <p className="text-xs text-gray-600">Übrig</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-gray-600">Jahresurlaub:</span>
                <span className="font-medium">{vacationSettings?.yearly_days || 0} Tage</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-gray-600">Resturlaub:</span>
                <span className="font-medium">{vacationSettings?.carry_over_days || 0} Tage</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Sonderurlaub:</span>
                <span className="font-medium">0 Tage</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-6 bg-primary/5 hover:bg-primary/10 border-primary/20"
              onClick={() => setIsRequestDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Urlaubsantrag stellen
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Urlaubsanträge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vacationRequests && vacationRequests.length > 0 ? (
              <div className="space-y-4">
                {vacationRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{request.type}</p>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 self-start md:self-center">
                      <Badge variant={getStatusVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p>Keine Urlaubsanträge vorhanden</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsRequestDialogOpen(true)}
                >
                  Ersten Urlaubsantrag stellen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Urlaubsantragsformular-Dialog */}
      {isRequestDialogOpen && (
        <VacationRequestDialog 
          isOpen={isRequestDialogOpen}
          onClose={() => setIsRequestDialogOpen(false)}
          employeeId={employeeId}
          employeeName="" // Name würde hier dynamisch aus dem Kontext kommen
          department="" // Abteilung würde hier dynamisch aus dem Kontext kommen
        />
      )}
    </div>
  );
};
