import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { absenceService } from '@/services/absenceService';

interface RejectRequestModalProps {
  request: {
    id: string;
    employee_name: string;
    employee_number: string;
    department: string;
    type: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    substitute_name?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTypeBadge = (type: string) => {
  const badges = {
    vacation: { label: 'Urlaub', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    sick_leave: { label: 'Krankheit', class: 'bg-red-100 text-red-700 border-red-200' },
    business_trip: { label: 'Dienstreise', class: 'bg-green-100 text-green-700 border-green-200' },
    other: { label: 'Sonderurlaub', class: 'bg-orange-100 text-orange-700 border-orange-200' }
  };
  return badges[type as keyof typeof badges] || badges.other;
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-teal-500', 'bg-cyan-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const RejectRequestModal = ({ request, open, onOpenChange }: RejectRequestModalProps) => {
  const [reason, setReason] = useState('');
  const [showError, setShowError] = useState(false);
  const queryClient = useQueryClient();
  const typeBadge = getTypeBadge(request.type);

  const rejectMutation = useMutation({
    mutationFn: (data: { requestId: string, reason: string }) => 
      absenceService.rejectRequest(data.requestId, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      setReason('');
      setShowError(false);
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Fehler beim Ablehnen des Antrags');
    }
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      setShowError(true);
      toast.error('Bitte geben Sie einen Grund für die Ablehnung an');
      return;
    }
    
    rejectMutation.mutate({
      requestId: request.id,
      reason: reason.trim()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Abwesenheit ablehnen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="flex items-center gap-3">
            <div className={`${getAvatarColor(request.employee_name)} h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold`}>
              {getInitials(request.employee_name)}
            </div>
            <div>
              <h3 className="font-semibold">{request.employee_name}</h3>
              <p className="text-sm text-muted-foreground">
                {request.employee_number} • {request.department}
              </p>
            </div>
          </div>

          {/* Absence Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={typeBadge.class}>
                {typeBadge.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Zeitraum</p>
                <p className="font-medium">
                  {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Dauer</p>
                <p className="font-medium">{request.duration_days} {request.duration_days === 1 ? 'Tag' : 'Tage'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs mb-1">Vertretung</p>
                <p className="font-medium">{request.substitute_name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="text-sm font-medium mb-2 block text-red-600">
              Grund der Ablehnung (erforderlich) *
            </label>
            <Textarea
              placeholder="Bitte geben Sie einen detaillierten Grund für die Ablehnung an..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setShowError(false);
              }}
              rows={4}
              className={`resize-none ${showError && !reason.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {showError && !reason.trim() && (
              <p className="text-xs text-red-600 mt-1">Dieses Feld ist erforderlich</p>
            )}
          </div>

          {/* Info */}
          <div className="flex gap-2 text-xs text-muted-foreground bg-red-50 p-3 rounded-lg">
            <Info className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p>Der Mitarbeiter wird per E-Mail über die Ablehnung und den Grund benachrichtigt.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={rejectMutation.isPending}>
            Abbrechen
          </Button>
          <Button 
            variant="destructive"
            onClick={handleSubmit}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? 'Wird abgelehnt...' : 'Ablehnung bestätigen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
