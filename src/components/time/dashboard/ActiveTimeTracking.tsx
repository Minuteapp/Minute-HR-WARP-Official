
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Play, Calendar } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import TimeTrackingDialog from "@/components/dialogs/TimeTrackingDialog";
import TimeTrackingTimeline from "./TimeTrackingTimeline";
import EmptyStateIllustration from "../EmptyStateIllustration";
import DailyWorkSummary from "../DailyWorkSummary";

interface ActiveTimeTrackingProps {
  isTracking: boolean;
  isPaused: boolean;
  elapsedTime: number;
  lastDisplayTime: number;
  handleTimeAction: () => void;
  handlePauseResume: () => void;
  handleStop: () => void;
  formatTime: (seconds: number) => string;
  setShowManualDialog: (show: boolean) => void;
  activeEntry: TimeEntry | null;
  dailyWorkHours: number;
  weeklyWorkHours: number;
  getCurrentPausedTime?: () => number;
}

const ActiveTimeTracking = ({
  isTracking,
  isPaused,
  elapsedTime,
  lastDisplayTime,
  handleTimeAction,
  handlePauseResume,
  handleStop,
  formatTime,
  setShowManualDialog,
  activeEntry,
  dailyWorkHours,
  weeklyWorkHours,
  getCurrentPausedTime
}: ActiveTimeTrackingProps) => {
  
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  
  useEffect(() => {
    const handleOpenDialog = () => {
      setShowTimeEntryDialog(true);
    };

    // Event-Listener für das Öffnen des Dialogs
    document.addEventListener('open-time-entry-dialog', handleOpenDialog);
    
    return () => {
      document.removeEventListener('open-time-entry-dialog', handleOpenDialog);
    };
  }, []);

  const openTimeEntryDialog = () => {
    setShowTimeEntryDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Status-Karten Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Aktuelle Zeit */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-yellow-800">Aktuelle Zeit</span>
            </div>
            <div className="text-2xl font-bold font-mono text-yellow-900">
              {formatTime(isTracking ? elapsedTime : lastDisplayTime)}
            </div>
          </CardContent>
        </Card>

        {/* Arbeitszeit Heute */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Arbeitszeit Heute</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {dailyWorkHours.toFixed(1)} h
            </div>
          </CardContent>
        </Card>

        {/* Diese Woche */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-yellow-800">Diese Woche</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {weeklyWorkHours.toFixed(1)} h
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className={`${isTracking && !isPaused ? 'bg-green-50 border-green-200' : isPaused ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-4 w-4 rounded-full ${isTracking && !isPaused ? 'bg-green-500' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <span className={`text-sm font-medium ${isTracking && !isPaused ? 'text-green-800' : isPaused ? 'text-yellow-800' : 'text-gray-800'}`}>Status</span>
            </div>
            <div className={`text-2xl font-bold ${isTracking && !isPaused ? 'text-green-900' : isPaused ? 'text-yellow-900' : 'text-gray-900'}`}>
              {isTracking ? (isPaused ? "Pausiert" : "Aktiv") : "Offline"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zeiterfassung Hauptbereich */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">Zeiterfassung</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 py-8">
          {!isTracking ? (
            <div className="text-center space-y-6">
              {/* Status-Text */}
              <p className="text-gray-600">Keine aktive Zeiterfassung</p>
              
              {/* Großer violetter Play Button */}
              <Button
                size="lg"
                className="w-32 h-32 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
                onClick={openTimeEntryDialog}
                type="button"
              >
                <Play className="h-16 w-16 text-white" />
              </Button>
              
              {/* "Zeit manuell erfassen" Link */}
              <Button
                variant="ghost"
                className="text-gray-600 flex items-center gap-2"
                onClick={() => setShowManualDialog(true)}
                type="button"
              >
                <Clock className="h-4 w-4" />
                Zeit manuell erfassen
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold font-mono text-purple-600">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-gray-500">
                {activeEntry?.location || "Kein Standort"}
              </div>
              <div className="flex gap-4">
                {/* Pause/Resume Button */}
                <Button
                  size="lg"
                  variant={isPaused ? "default" : "outline"}
                  className="rounded-full w-16 h-16 flex flex-col items-center justify-center gap-1"
                  onClick={handlePauseResume}
                  type="button"
                  title={isPaused ? "Fortsetzen" : "Pausieren"}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-6 w-6" />
                      <span className="text-xs">Play</span>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-6 bg-current rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-current rounded-sm"></div>
                      </div>
                      <span className="text-xs">Pause</span>
                    </>
                  )}
                </Button>
                
                {/* Stop Button */}
                <Button
                  size="lg"
                  variant="destructive"
                  className="rounded-full w-16 h-16 flex flex-col items-center justify-center gap-1"
                  onClick={handleStop}
                  type="button"
                  title="Stoppen"
                >
                  <div className="h-6 w-6 bg-white rounded-sm"></div>
                  <span className="text-xs text-white">Stop</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Time Entry Dialog */}
      <TimeTrackingDialog
        open={showTimeEntryDialog}
        onOpenChange={setShowTimeEntryDialog}
        mode="start"
        onSuccess={() => {
          setShowTimeEntryDialog(false);
          // Trigger refresh of time tracking state
          handleTimeAction();
        }}
      />

      {/* Timeline - nur anzeigen wenn Zeit erfasst wird */}
      {(isTracking || dailyWorkHours > 0) && (
        <TimeTrackingTimeline
          activeEntry={activeEntry}
          totalBreakTime={activeEntry?.break_minutes || 0}
          workingMinutes={Math.floor(dailyWorkHours * 60)}
          currentPausedTime={getCurrentPausedTime ? getCurrentPausedTime() : 0}
        />
      )}
    </div>
  );
};

export default ActiveTimeTracking;
