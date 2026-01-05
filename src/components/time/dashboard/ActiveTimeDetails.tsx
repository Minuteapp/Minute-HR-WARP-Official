
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, ClockIcon, TimerReset, FileText } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ActiveTimeDetailsProps {
  activeEntry: TimeEntry | null;
  elapsedTime: number;
  isPaused: boolean;
  totalPauseTime: number;
  formatTime: (seconds: number) => string;
}

const ActiveTimeDetails = ({ 
  activeEntry, 
  elapsedTime, 
  isPaused,
  totalPauseTime,
  formatTime
}: ActiveTimeDetailsProps) => {
  if (!activeEntry) return null;

  const startTime = new Date(activeEntry.start_time);
  
  return (
    <Card className="w-full border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Details zur aktuellen Zeiterfassung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              Start
            </p>
            <p className="text-sm text-muted-foreground">
              {format(startTime, "EEEE, dd. MMMM yyyy", { locale: de })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(startTime, "HH:mm", { locale: de })} Uhr
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5 text-primary" />
              Ort
            </p>
            <p className="text-sm text-muted-foreground">
              {activeEntry.location === "office" ? "Büro" : 
               activeEntry.location === "home" ? "Home Office" : 
               activeEntry.location === "mobile" ? "Unterwegs" : 
               activeEntry.location || "Nicht angegeben"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5 text-primary" />
              Dauer
            </p>
            <p className="text-sm text-muted-foreground">
              {formatTime(elapsedTime)} {isPaused && "(Pausiert)"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-1">
              <TimerReset className="h-3.5 w-3.5 text-primary" />
              Pausenzeit
            </p>
            <p className="text-sm text-muted-foreground">
              {formatTime(totalPauseTime)}
            </p>
          </div>
        </div>

        {activeEntry.note && (
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Notiz
            </p>
            <p className="text-sm text-muted-foreground">
              {activeEntry.note}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveTimeDetails;

