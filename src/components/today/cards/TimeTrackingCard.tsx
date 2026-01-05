
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, X, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimeTrackingCardProps {
  timeTracking: any;
  darkMode: boolean;
  onToggleVisibility: () => void;
}

const TimeTrackingCard = ({ timeTracking, darkMode, onToggleVisibility }: TimeTrackingCardProps) => {
  const navigate = useNavigate();
  
  const {
    isTracking,
    isPaused,
    elapsedTime,
    lastDisplayTime,
    formatTime,
    handleTimeAction,
    handlePauseResume,
    handleStop,
    dailyWorkHours
  } = timeTracking;

  console.log('TimeTrackingCard - Status:', {
    isTracking,
    isPaused,
    elapsedTime,
    lastDisplayTime,
    dailyWorkHours
  });
  
  const getTimeStatusColor = () => {
    if (dailyWorkHours < 4) return "bg-yellow-500";
    if (dailyWorkHours > 10) return "bg-red-500";
    return "bg-green-500";
  };
  
  const formatHours = (hours: number) => {
    return hours.toFixed(2).replace('.', ',') + ' h';
  };

  // Zeige die aktuelle Zeit oder die letzte gespeicherte Zeit
  const displayTime = isTracking ? elapsedTime : (lastDisplayTime || 0);
  
  return (
    <Card className="today-card h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Clock className="h-5 w-5 text-primary" />
          Zeiterfassung
        </CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/time')}>
                Zur Zeiterfassung
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleVisibility}>
                Card ausblenden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${getTimeStatusColor()} mr-2`}></div>
            <div className="text-3xl font-bold font-mono">
              {formatTime(displayTime)}
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isTracking ? (
              <Button 
                variant="default" 
                className="flex items-center gap-1" 
                onClick={handleTimeAction}
              >
                <Play className="h-4 w-4" />
                Starten
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1" 
                      onClick={handlePauseResume}
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex items-center gap-1" 
                      onClick={handleStop}
                    >
                      <X className="h-4 w-4" />
                      Beenden
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1" 
                      onClick={handlePauseResume}
                    >
                      <Play className="h-4 w-4" />
                      Fortsetzen
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex items-center gap-1" 
                      onClick={handleStop}
                    >
                      <X className="h-4 w-4" />
                      Beenden
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-0 flex-shrink-0">
        <div className="w-full grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-600">
            Heute gearbeitet:
          </div>
          <div className="text-right font-medium">
            {formatHours(dailyWorkHours)}
          </div>
          {isTracking && (
            <>
              <div className="text-gray-600">
                Status:
              </div>
              <div className="text-right font-medium text-green-600">
                {isPaused ? 'Pausiert' : 'Aktiv'}
              </div>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TimeTrackingCard;
