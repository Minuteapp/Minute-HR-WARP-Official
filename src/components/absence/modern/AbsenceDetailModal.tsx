import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AbsenceRequest } from '@/types/absence.types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { AbsenceApprovalActions } from '../AbsenceApprovalActions';
import { useQuery } from '@tanstack/react-query';
import { absenceManagementService } from '@/services/absenceManagementService';

interface AbsenceDetailModalProps {
  absence: AbsenceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AbsenceDetailModal: React.FC<AbsenceDetailModalProps> = ({
  absence,
  open,
  onOpenChange,
}) => {
  const { canApproveRequests } = useAbsenceManagement();
  
  // Mitarbeiter-Details aus DB laden
  const { data: employeeDetails } = useQuery({
    queryKey: ['employee-details', absence?.user_id],
    queryFn: () => absenceManagementService.getEmployeeDetails(absence!.user_id),
    enabled: !!absence?.user_id
  });
  
  // Workflow-History aus DB laden
  const { data: workflowHistory = [] } = useQuery({
    queryKey: ['approval-history', absence?.id],
    queryFn: () => absenceManagementService.getApprovalHistory(absence!.id),
    enabled: !!absence?.id
  });
  
  if (!absence) return null;

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days === 1 ? '1 Tag' : `${days} Tage`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      approved: { label: 'Genehmigt', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
      pending: { label: 'Ausstehend', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
      rejected: { label: 'Abgelehnt', className: 'bg-red-100 text-red-700 hover:bg-red-100' }
    };
    return variants[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      vacation: { label: 'Urlaub', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      sick_leave: { label: 'Krankheit', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
      business_trip: { label: 'Homeoffice', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      other: { label: 'Sonderurlaub', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' }
    };
    return variants[type] || { label: type, className: 'bg-gray-100 text-gray-700' };
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                {getInitials(absence.employee_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{absence.employee_name || 'Unbekannt'}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {employeeDetails?.employee_number || absence.user_id.split('-')[0]} • {employeeDetails?.position || 'Mitarbeiter'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge className={getTypeBadge(absence.type).className}>
              {getTypeBadge(absence.type).label}
            </Badge>
            <Badge className={getStatusBadge(absence.status).className}>
              {getStatusBadge(absence.status).label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Mitarbeiterinformationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Mitarbeiterinformationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Abteilung</label>
                  <p className="text-sm mt-1">{employeeDetails?.department || absence.department || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Standort</label>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {employeeDetails?.city || 'Berlin'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">E-Mail</label>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {employeeDetails?.email || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {employeeDetails?.phone || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Abwesenheitsdetails */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Abwesenheitsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Von</label>
                  <p className="text-sm mt-1 font-semibold">
                    {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bis</label>
                  <p className="text-sm mt-1 font-semibold">
                    {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dauer</label>
                  <p className="text-sm mt-1 font-semibold">
                    {calculateDuration(absence.start_date, absence.end_date)}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Grund</label>
                <p className="text-sm mt-1 bg-muted/50 p-2 rounded">
                  {absence.reason || 'Geplanter Jahresurlaub - Familienzeit'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vertretung</label>
                <p className="text-sm mt-1">{absence.substitute_name || 'Anna Schmidt'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notizen */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Notizen</p>
              <p className="text-amber-700 mt-0.5">
                Dringend - wichtige Projekte müssen übergeben werden
              </p>
            </div>
          </div>

          {/* Genehmigungsverlauf */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Genehmigungsverlauf (3-Stufen-Workflow)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflowHistory.length > 0 ? (
                  workflowHistory.map((step: any) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-shrink-0">
                        {step.status === 'approved' ? (
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          </div>
                        ) : step.status === 'rejected' ? (
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold">
                              Stufe {step.level}: {step.approver_name || 'Unbekannt'} ({step.approver_role || 'Genehmiger'})
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {step.created_at ? format(new Date(step.created_at), 'dd.MM.yyyy HH:mm', { locale: de }) : '-'}
                            </p>
                          </div>
                          <Badge className={
                            step.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : step.status === 'rejected'
                              ? 'bg-red-100 text-red-700 hover:bg-red-100'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          }>
                            {step.status === 'approved' ? 'Genehmigt' : step.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend'}
                          </Badge>
                        </div>
                        {step.comment && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {step.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Genehmigungsschritte vorhanden
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Aktions-Buttons für pending Anträge */}
          {canApproveRequests && absence.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <AbsenceApprovalActions 
                requestId={absence.id}
                onApprove={() => onOpenChange(false)}
                onReject={() => onOpenChange(false)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
