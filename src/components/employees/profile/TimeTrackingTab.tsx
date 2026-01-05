
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TimeTrackingCalendar from "@/components/time/dashboard/TimeTrackingCalendar";
import { TimeStatCards } from "./time-tracking/TimeStatCards";
import { TimeEntriesTable } from "./time-tracking/TimeEntriesTable";
import { AddTimeDialog } from "./time-tracking/AddTimeDialog";
import { TimeTrackingHeader } from "./time-tracking/TimeTrackingHeader";
import { TimeTrackingUpload } from "./TimeTrackingUpload";
import { TimeEntry } from "@/types/time-tracking.types";
import { useTimeExport } from "@/hooks/time-tracking/useTimeExport";

interface TimeTrackingTabProps {
  employeeId: string;
}

export const TimeTrackingTab = ({ employeeId }: TimeTrackingTabProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { exportToCSV, exportToPDF } = useTimeExport();

  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['timeEntries', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', employeeId)
        .order('start_time', { ascending: false });
      
      if (error) throw error;

      // Sicherstellen, dass der Status einem validen TimeEntry-Status entspricht
      return (data || []).map(entry => ({
        ...entry,
        status: (entry.status === 'active' || 
                entry.status === 'pending' || 
                entry.status === 'completed' || 
                entry.status === 'cancelled') 
          ? entry.status 
          : 'pending'
      })) as TimeEntry[];
    }
  });

  const handleExportCSV = () => {
    if (timeEntries && timeEntries.length > 0) {
      exportToCSV(timeEntries, `Employee_${employeeId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Keine Daten",
        description: "Keine Zeiteinträge zum Exportieren vorhanden.",
      });
    }
  };

  const handleExportPDF = () => {
    if (timeEntries && timeEntries.length > 0) {
      exportToPDF(timeEntries, `Employee_${employeeId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Keine Daten",
        description: "Keine Zeiteinträge zum Exportieren vorhanden.",
      });
    }
  };

  const handleTimeEntry = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte Start- und Endzeit auswählen",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('time_entries')
        .insert({
          user_id: employeeId,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          project: "Allgemein",
          location: "Büro",
          status: 'completed' as const,
          break_minutes: 0
        });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Zeiterfassung wurde gespeichert",
      });
      
      setShowTimeEntryDialog(false);
      queryClient.invalidateQueries({ queryKey: ['timeEntries', employeeId] });
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Zeiterfassung konnte nicht gespeichert werden",
      });
    }
  };

  return (
    <div className="space-y-6">
      <TimeTrackingHeader 
        onAddTime={() => setShowTimeEntryDialog(true)}
        onUpload={() => setShowUploadDialog(true)}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      <TimeStatCards timeEntries={timeEntries || []} />

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-4">Zeiterfassungskalender</h3>
        <TimeTrackingCalendar />
      </div>

      <TimeEntriesTable 
        timeEntries={timeEntries || []}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
      />

      <AddTimeDialog 
        open={showTimeEntryDialog}
        onOpenChange={setShowTimeEntryDialog}
        onSave={handleTimeEntry}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <TimeTrackingUpload 
        employeeId={employeeId}
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
    </div>
  );
};
