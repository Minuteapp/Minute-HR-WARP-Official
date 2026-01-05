import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ApplicationStatusBadge from './ApplicationStatusBadge';

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: {
    id: string;
    current_stage: string;
    submitted_at: string;
    notes?: string;
    candidate: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      location?: string;
      source?: string;
      gdpr_consent?: boolean;
    };
    job_posting: {
      id: string;
      title: string;
      location?: string;
      department?: string;
      employment_type?: string;
    };
  } | null;
}

const statusOptions = [
  { value: 'new', label: 'Eingegangen' },
  { value: 'preselection', label: 'Vorauswahl' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'decision', label: 'Entscheidung' },
  { value: 'offer', label: 'Angebot' },
  { value: 'hired', label: 'Eingestellt' },
  { value: 'rejected', label: 'Abgelehnt' },
];

const sourceLabels: Record<string, string> = {
  career_portal: 'Karriereportal',
  email: 'E-Mail',
  api: 'API/Jobbörse',
  referral: 'Empfehlung',
  manual: 'Manuell',
};

const ApplicationDetailsDialog = ({ open, onOpenChange, application }: ApplicationDetailsDialogProps) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState(application?.current_stage || '');
  const [notes, setNotes] = useState('');

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ current_stage: status })
        .eq('id', application?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status erfolgreich aktualisiert');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    },
  });

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    updateStatusMutation.mutate(status);
  };

  if (!application) return null;

  const candidateName = `${application.candidate?.first_name || ''} ${application.candidate?.last_name || ''}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bewerbungsdetails</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Kandidat Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kandidat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{candidateName || 'Unbekannt'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="font-medium">{application.candidate?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{application.candidate?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standort</p>
                  <p className="font-medium">{application.candidate?.location || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">DSGVO:</span>
                  {application.candidate?.gdpr_consent ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <Check className="h-4 w-4 mr-1" />
                      Einwilligung erteilt
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm">Keine Einwilligung</span>
                  )}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Quelle: </span>
                  <span className="text-sm font-medium">
                    {sourceLabels[application.candidate?.source || ''] || application.candidate?.source || '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stelle Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Titel</p>
                  <p className="font-medium">{application.job_posting?.title || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standort</p>
                  <p className="font-medium">{application.job_posting?.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Abteilung</p>
                  <p className="font-medium">{application.job_posting?.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vertragsart</p>
                  <p className="font-medium">{application.job_posting?.employment_type || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status ändern */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status ändern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ApplicationStatusBadge status={application.current_stage || 'new'} />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Select value={newStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Neuer Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notizen */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notizen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes" className="sr-only">Notizen</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Neue Notiz hinzufügen..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button size="sm" variant="outline">
                    Notiz speichern
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsDialog;
