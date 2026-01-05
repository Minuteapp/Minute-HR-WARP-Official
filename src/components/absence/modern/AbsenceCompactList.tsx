import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AbsenceRequest } from '@/types/absence.types';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { AbsenceDetailModal } from './AbsenceDetailModal';
import { AbsenceApprovalActions } from '../AbsenceApprovalActions';

interface AbsenceCompactListProps {
  absences: AbsenceRequest[];
  isLoading?: boolean;
}

export const AbsenceCompactList: React.FC<AbsenceCompactListProps> = ({ absences, isLoading }) => {
  const { getTypeLabel, getSubTypeLabel, getTypeColor, canApproveRequests } = useAbsenceManagement();
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceRequest | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktuelle Abwesenheiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
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
    return variants[status] || { label: status, className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' };
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      vacation: { label: 'Urlaub', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      sick_leave: { label: 'Krankheit', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
      business_trip: { label: 'Homeoffice', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      other: { label: 'Sonderurlaub', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' }
    };
    return variants[type] || { label: type, className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' };
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Aktuelle Abwesenheiten</span>
            <Badge variant="secondary">{absences.length} von 50 Abwesenheiten</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {absences.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Keine aktuellen Abwesenheiten
              </div>
            ) : (
              absences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex flex-col gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow group"
                >
                  <div 
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setSelectedAbsence(absence)}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className={`${getAvatarColor(absence.employee_name)} text-white font-semibold`}>
                        {getInitials(absence.employee_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">
                        {absence.employee_name || 'Unbekannt'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {absence.department || '-'}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                        <span>•</span>
                        <span>{calculateDuration(absence.start_date, absence.end_date)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                      <Badge className={getTypeBadge(absence.type).className}>
                        {getTypeBadge(absence.type).label}
                      </Badge>
                      <Badge className={getStatusBadge(absence.status).className}>
                        {getStatusBadge(absence.status).label}
                      </Badge>
                      <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Admin Actions für pending Anträge */}
                  {canApproveRequests && absence.status === 'pending' && (
                    <div className="flex justify-end pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                      <AbsenceApprovalActions 
                        requestId={absence.id}
                        onApprove={() => {}}
                        onReject={() => {}}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AbsenceDetailModal
        absence={selectedAbsence}
        open={!!selectedAbsence}
        onOpenChange={(open) => !open && setSelectedAbsence(null)}
      />
    </>
  );
};
