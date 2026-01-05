
import { TimeEntry } from "@/types/time-tracking.types";

interface TimeEntryListProps {
  entries: TimeEntry[];
  calculateDailyHours: (date: Date) => number;
  formatTimeOnly: (dateString: string) => string;
  formatDuration: (start: string, end: string, breakMinutes?: number) => string;
}

export const TimeEntryList = ({
  entries,
  calculateDailyHours,
  formatTimeOnly,
  formatDuration
}: TimeEntryListProps) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        Keine Zeiteinträge für diesen Tag
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium">
              {formatTimeOnly(entry.start_time)} - {entry.end_time ? formatTimeOnly(entry.end_time) : 'Aktiv'}
            </div>
            {entry.end_time && (
              <div className="text-xs text-gray-600">
                Dauer: {formatDuration(entry.start_time, entry.end_time, entry.break_minutes)}
              </div>
            )}
          </div>
          <div className="text-sm">
            {entry.project && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {entry.project}
              </span>
            )}
          </div>
        </div>
      ))}
      
      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between items-center text-sm">
          <span>Gesamtstunden:</span>
          <span className="font-medium">{calculateDailyHours(new Date())}</span>
        </div>
      </div>
    </div>
  );
};
