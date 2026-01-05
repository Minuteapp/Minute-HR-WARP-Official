
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import { format } from "date-fns";
import { AlertCircle, Clock } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TimeEntry } from "@/types/time-tracking.types";
import TimeEntryDetailDialog from "@/components/dialogs/TimeEntryDetailDialog";

const RecentTimeEntries = () => {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['todayTimeEntries'],
    queryFn: timeTrackingService.getTodayTimeEntries,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const formatDuration = (start: string, end: string | null) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  const handleEntryClick = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowDetailDialog(true);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2 text-[#9b87f5]" />
          Letzte Zeiterfassungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center p-6 text-gray-500 flex flex-col items-center">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Keine Zeiterfassungen heute</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {entries.slice(0, 5).map((entry: TimeEntry) => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
                onClick={() => handleEntryClick(entry)}
              >
                <div>
                  <div className="font-medium">
                    {entry.project || 'Kein Projekt'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(entry.start_time), 'HH:mm')} - 
                    {entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : 'Aktiv'}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={entry.status === 'active' ? 'default' : 'outline'}>
                    {formatDuration(entry.start_time, entry.end_time)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <TimeEntryDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        timeEntry={selectedEntry}
      />
    </Card>
  );
};

export default RecentTimeEntries;
