import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, X, Check } from 'lucide-react';
import { QueryRequestModal } from './QueryRequestModal';
import { RejectRequestModal } from './RejectRequestModal';
import { ApproveRequestModal } from './ApproveRequestModal';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ApprovalRequest {
  id: string;
  employee_name: string;
  employee_number: string;
  department: string;
  type: 'vacation' | 'sick_leave' | 'business_trip' | 'other';
  start_date: string;
  end_date: string;
  duration_days: number;
  substitute_name?: string;
  remaining_vacation_days: number;
  requested_date: string;
  impact: 'high' | 'medium' | 'low';
}

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-teal-500', 'bg-cyan-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getTypeBadge = (type: string) => {
  const badges = {
    vacation: { label: 'Urlaub', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    sick_leave: { label: 'Krankheit', class: 'bg-red-100 text-red-700 border-red-200' },
    business_trip: { label: 'Dienstreise', class: 'bg-green-100 text-green-700 border-green-200' },
    other: { label: 'Sonderurlaub', class: 'bg-orange-100 text-orange-700 border-orange-200' }
  };
  return badges[type as keyof typeof badges] || badges.other;
};

const getImpactBadge = (impact: string) => {
  const badges = {
    high: { label: 'Hohe Auswirkung', class: 'bg-red-50 text-red-600 border-red-200' },
    medium: { label: 'Mittlere Auswirkung', class: 'bg-amber-50 text-amber-600 border-amber-200' },
    low: { label: 'Geringe Auswirkung', class: 'bg-slate-50 text-slate-600 border-slate-200' }
  };
  return badges[impact as keyof typeof badges];
};

const calculateWorkingDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
};

interface OpenApprovalsListProps {
  filters: {
    types: string[];
    priorities: string[];
    departments: string[];
  };
}

export const OpenApprovalsList = ({ filters }: OpenApprovalsListProps) => {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Lade echte Daten aus der Datenbank
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['pending-approvals', filters],
    queryFn: async () => {
      let query = supabase
        .from('absence_requests')
        .select(`
          *,
          employees!absence_requests_user_id_fkey(
            employee_number,
            name,
            department
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Fehler beim Laden der Genehmigungsanträge:', error);
        return [];
      }

      // Transformiere Daten für die Liste
      return Promise.all((data || []).map(async (request: any) => {
        const durationDays = calculateWorkingDays(request.start_date, request.end_date);
        
        // Hole Resturlaub
        const { data: quotaData } = await supabase
          .from('absence_quotas')
          .select('total_days, used_days, planned_days')
          .eq('user_id', request.user_id)
          .eq('absence_type', 'vacation')
          .eq('quota_year', new Date().getFullYear())
          .single();

        const remainingVacation = quotaData 
          ? (quotaData.total_days - quotaData.used_days - quotaData.planned_days)
          : 0;

        // Bestimme Impact basierend auf Dauer
        let impact: 'high' | 'medium' | 'low' = 'low';
        if (durationDays > 10) impact = 'high';
        else if (durationDays > 5) impact = 'medium';

        return {
          id: request.id,
          employee_name: request.employees?.name || 'Unbekannt',
          employee_number: request.employees?.employee_number || 'N/A',
          department: request.employees?.department || 'Keine Abteilung',
          type: request.type,
          start_date: request.start_date,
          end_date: request.end_date,
          duration_days: durationDays,
          substitute_name: undefined, // TODO: Vertretung aus DB laden
          remaining_vacation_days: remainingVacation,
          requested_date: request.created_at,
          impact
        };
      }));
    },
    refetchInterval: 30000 // Aktualisiere alle 30 Sekunden
  });

  const filteredApprovals = approvals.filter(approval => {
    if (filters.types.length && !filters.types.includes(approval.type)) return false;
    if (filters.departments.length && !filters.departments.includes(approval.department)) return false;
    return true;
  });

  const handleQuery = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setQueryModalOpen(true);
  };

  const handleReject = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleApprove = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return <div className="text-center p-8 text-muted-foreground">Lade Genehmigungsanträge...</div>;
  }

  if (filteredApprovals.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">Keine offenen Genehmigungsanträge</div>;
  }

  return (
    <div className="space-y-4">
      {filteredApprovals.map(request => {
        const typeBadge = getTypeBadge(request.type);
        const impactBadge = getImpactBadge(request.impact);

        return (
          <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <Checkbox
                checked={selectedItems.includes(request.id)}
                onCheckedChange={() => toggleSelection(request.id)}
              />

              {/* Avatar */}
              <div className={`${getAvatarColor(request.employee_name)} h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                {getInitials(request.employee_name)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{request.employee_name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {request.employee_number} • {request.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeBadge.class}>
                        {typeBadge.label}
                      </Badge>
                      <Badge variant="outline" className={impactBadge.class}>
                        {impactBadge.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Zeitraum</p>
                        <p className="font-medium">
                          {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Dauer</p>
                        <p className="font-medium">{request.duration_days} {request.duration_days === 1 ? 'Tag' : 'Tage'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Vertretung</p>
                        <p className="font-medium">{request.substitute_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Resturlaub</p>
                        <p className="font-medium text-green-600">{request.remaining_vacation_days} Tage</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Beantragt am</p>
                        <p className="font-medium">{format(new Date(request.requested_date), 'dd.MM.yyyy', { locale: de })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuery(request)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Rückfrage
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleReject(request)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Ablehnen
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(request)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Genehmigen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Modals */}
      {selectedRequest && (
        <>
          <QueryRequestModal
            request={selectedRequest}
            open={queryModalOpen}
            onOpenChange={setQueryModalOpen}
          />
          <RejectRequestModal
            request={selectedRequest}
            open={rejectModalOpen}
            onOpenChange={setRejectModalOpen}
          />
          <ApproveRequestModal
            request={selectedRequest}
            open={approveModalOpen}
            onOpenChange={setApproveModalOpen}
          />
        </>
      )}
    </div>
  );
};
