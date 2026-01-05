
import { Card } from "@/components/ui/card";
import { Clock, Calendar, Timer, MapPin, FileText, Info } from 'lucide-react';
import { TimeEntry } from "@/types/time-tracking.types";

interface ActiveTimeEntryProps {
  isTracking: boolean;
  isPaused: boolean;
  trackingStartTime: Date | null;
  elapsedTime: number;
  activeEntry: TimeEntry | null;
  formatTime: (seconds: number) => string;
  handleViewDetails: (entry: TimeEntry) => void;
}

const ActiveTimeEntry = ({
  isTracking,
  isPaused,
  trackingStartTime,
  elapsedTime,
  activeEntry,
  formatTime,
  handleViewDetails,
}: ActiveTimeEntryProps) => {
  if (!isTracking) {
    return (
      <Card className="p-6 border-[#2c3ad1] border">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#2c3ad1]" />
            Aktive Zeiterfassung
          </h3>
          <p className="text-gray-600">Keine aktive Zeiterfassung</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="p-6 border-[#2c3ad1] border cursor-pointer hover:bg-gray-50/50 transition-colors"
      onClick={() => activeEntry && handleViewDetails(activeEntry)}
    >
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#2c3ad1]" />
          Aktive Zeiterfassung
        </h3>
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#2c3ad1]/5">
            <span className="text-gray-600 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#2c3ad1]" />
              Status
            </span>
            <span className="font-semibold">{isPaused ? "Pausiert" : "Aktiv"}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#2c3ad1]/5">
            <span className="text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#2c3ad1]" />
              Startzeit
            </span>
            <span className="font-semibold">
              {trackingStartTime?.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#2c3ad1]/5">
            <span className="text-gray-600 flex items-center gap-2">
              <Timer className="h-4 w-4 text-[#2c3ad1]" />
              Verstrichene Zeit
            </span>
            <span className="font-semibold">{formatTime(elapsedTime)}</span>
          </div>
          {activeEntry?.location && (
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#2c3ad1]/5">
              <span className="text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#2c3ad1]" />
                Arbeitsort
              </span>
              <span className="font-semibold">{activeEntry.location}</span>
            </div>
          )}
          {activeEntry?.project && (
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#2c3ad1]/5">
              <span className="text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2c3ad1]" />
                Projekt
              </span>
              <span className="font-semibold">{activeEntry.project}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActiveTimeEntry;
