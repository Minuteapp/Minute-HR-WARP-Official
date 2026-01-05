import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { toast } from '@/hooks/use-toast';

interface EditAbsenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  absence: {
    id: string;
    type: string;
    start_date: string;
    end_date: string;
    reason?: string;
    substitute_id?: string;
  } | null;
}

export const EditAbsenceDialog: React.FC<EditAbsenceDialogProps> = ({
  open,
  onOpenChange,
  absence
}) => {
  const queryClient = useQueryClient();
  const [type, setType] = useState('vacation');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (absence) {
      setType(absence.type);
      setStartDate(new Date(absence.start_date));
      setEndDate(new Date(absence.end_date));
      setReason(absence.reason || '');
    }
  }, [absence]);

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      return absenceService.updateRequest(data.id, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-absences'] });
      queryClient.invalidateQueries({ queryKey: ['recent-absence-requests'] });
      toast({
        title: 'Erfolgreich aktualisiert',
        description: 'Die Abwesenheit wurde aktualisiert.'
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Die Abwesenheit konnte nicht aktualisiert werden.',
        variant: 'destructive'
      });
    }
  });

  const handleSave = () => {
    if (!absence || !startDate || !endDate) return;

    updateMutation.mutate({
      id: absence.id,
      updates: {
        type,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        reason
      }
    });
  };

  const absenceTypes = [
    { value: 'vacation', label: 'Urlaub' },
    { value: 'sick_leave', label: 'Krankheit' },
    { value: 'homeoffice', label: 'Homeoffice' },
    { value: 'business_trip', label: 'Dienstreise' },
    { value: 'special_vacation', label: 'Sonderurlaub' },
    { value: 'other', label: 'Sonstige' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Abwesenheit bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie die Details Ihrer Abwesenheit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Abwesenheitsart</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Art wählen" />
              </SelectTrigger>
              <SelectContent>
                {absenceTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Von</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Bis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={de}
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Grund (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Grund für die Abwesenheit..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
