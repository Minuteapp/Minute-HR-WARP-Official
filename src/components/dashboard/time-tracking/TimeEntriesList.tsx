
import { ArrowDown, ArrowUp } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";

interface TimeEntriesListProps {
  entries: TimeEntry[];
  handleEntryClick: (entryId: string, e: React.MouseEvent) => void;
}

const TimeEntriesList = ({ entries, handleEntryClick }: TimeEntriesListProps) => {
  return (
    <div className="space-y-2">
      {entries && entries.length > 0 ? (
        entries.slice(0, 3).map((entry) => (
          <div 
            key={entry.id}
            className="flex items-center justify-between text-sm hover:bg-gray-100 p-2 rounded-lg"
            onClick={(e) => handleEntryClick(entry.id, e)}
          >
            <div className="flex items-center gap-2">
              {!entry.end_time ? (
                <ArrowDown className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowUp className="h-4 w-4 text-red-500" />
              )}
              <span>{new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <span className="text-muted-foreground">
              {entry.end_time ? 
                new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                'Aktiv'
              }
            </span>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Keine Einträge für heute
        </p>
      )}
    </div>
  );
};

export default TimeEntriesList;
