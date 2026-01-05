
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AbsenceApprovalActions } from './AbsenceApprovalActions';
import { AbsenceDetailDialog } from './AbsenceDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { AbsenceRequest } from '@/types/absence.types';

export const AbsenceList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AbsenceRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { user } = useAuth();
  const { hasPermission, isAdmin, isSuperAdmin } = useRolePermissions();

  // Berechtigungen prüfen
  const canApproveRequests = isSuperAdmin || isAdmin || hasPermission('absence:approve');

  const { data: absenceRequests = [], isLoading, error } = useQuery({
    queryKey: ['absence-requests'],
    queryFn: absenceService.getRequests
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

  const filteredRequests = absenceRequests.filter(request => {
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    if (typeFilter !== 'all' && request.type !== typeFilter && request.absence_type !== typeFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Lade Abwesenheitsanträge...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Fehler beim Laden der Abwesenheitsanträge
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:space-y-0">
            <CardTitle>Abwesenheitsanträge</CardTitle>
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                  <SelectItem value="sick_leave">Krankmeldung</SelectItem>
                  <SelectItem value="sick">Krankmeldung</SelectItem>
                  <SelectItem value="parental">Elternzeit</SelectItem>
                  <SelectItem value="business_trip">Dienstreise</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Abwesenheitsanträge gefunden
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowDetailDialog(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:space-y-0">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {request.employee_name || 'Unbekannter Mitarbeiter'}
                          </span>
                          <Badge variant="outline">
                            {getTypeBadge(request.type || request.absence_type)}
                          </Badge>
                          {request.department && (
                            <Badge variant="secondary" className="ml-2">
                              {request.department}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - 
                              {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                            </span>
                          </div>
                          
                          {request.half_day && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Halbtag</span>
                            </div>
                          )}
                        </div>
                        
                        {request.reason && (
                          <div className="flex items-start space-x-1 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">{request.reason}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        {/* Genehmigungsbuttons nur für ausstehende Anträge und berechtigte Benutzer */}
                        {request.status === 'pending' && canApproveRequests && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <AbsenceApprovalActions requestId={request.id} />
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          {request.created_at && format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <AbsenceDetailDialog
        request={selectedRequest}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  );
};
