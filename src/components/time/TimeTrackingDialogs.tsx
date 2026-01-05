
import { useState } from 'react';
import TimeTrackingDialog from '../dialogs/TimeTrackingDialog';
import ManualTimeDialog from '../time-tracking/ManualTimeDialog';
import TimeEntryDetailsDialog from './dialogs/TimeEntryDetailsDialog';
import { TimeEntry } from '@/types/time-tracking.types';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';

interface TimeTrackingDialogsProps {
  onTimeEntryStart: (data: any) => Promise<boolean>;
}

export const TimeTrackingDialogs = ({ onTimeEntryStart }: TimeTrackingDialogsProps) => {
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
      toast({
        title: "Zeiterfassung gelöscht",
        description: "Die Zeiterfassung wurde erfolgreich gelöscht.",
      });
      setShowDetailsDialog(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Zeiterfassung konnte nicht gelöscht werden.",
      });
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(false);
    setShowTimeEntryDialog(true);
  };

  const handleViewDetails = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  return {
    dialogs: (
      <>
        <TimeTrackingDialog 
          open={showTimeEntryDialog} 
          onOpenChange={(open) => {
            setShowTimeEntryDialog(open);
            if (!open) setSelectedEntry(null);
          }}
          mode="start"
          existingEntry={selectedEntry}
        />

        <ManualTimeDialog
          open={showManualDialog}
          onOpenChange={setShowManualDialog}
        />

        <TimeEntryDetailsDialog 
          open={showDetailsDialog}
          onOpenChange={(open) => {
            setShowDetailsDialog(open);
            if (!open) setSelectedEntry(null);
          }}
          entry={selectedEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      </>
    ),
    showTimeEntryDialog,
    setShowTimeEntryDialog,
    showManualDialog,
    setShowManualDialog,
    handleViewDetails
  };
};
