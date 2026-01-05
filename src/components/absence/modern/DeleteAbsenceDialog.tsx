import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { toast } from '@/hooks/use-toast';

interface DeleteAbsenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  absenceId: string | null;
  absenceType?: string;
  startDate?: string;
  endDate?: string;
}

const getTypeLabel = (type?: string): string => {
  const labels: Record<string, string> = {
    vacation: 'Urlaub',
    sick_leave: 'Krankheit',
    business_trip: 'Dienstreise',
    homeoffice: 'Homeoffice',
    special_vacation: 'Sonderurlaub',
    other: 'Sonstige'
  };
  return type ? labels[type] || type : 'Abwesenheit';
};

export const DeleteAbsenceDialog: React.FC<DeleteAbsenceDialogProps> = ({
  open,
  onOpenChange,
  absenceId,
  absenceType,
  startDate,
  endDate
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return absenceService.deleteRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-absences'] });
      queryClient.invalidateQueries({ queryKey: ['recent-absence-requests'] });
      queryClient.invalidateQueries({ queryKey: ['vacation-stats'] });
      toast({
        title: 'Erfolgreich gelöscht',
        description: 'Die Abwesenheit wurde gelöscht.'
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Die Abwesenheit konnte nicht gelöscht werden.',
        variant: 'destructive'
      });
    }
  });

  const handleDelete = () => {
    if (absenceId) {
      deleteMutation.mutate(absenceId);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abwesenheit löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchten Sie diese {getTypeLabel(absenceType)} wirklich löschen?
            {startDate && endDate && (
              <span className="block mt-2 font-medium text-foreground">
                Zeitraum: {startDate} - {endDate}
              </span>
            )}
            <span className="block mt-2 text-destructive">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
