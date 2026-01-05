
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Clock } from 'lucide-react';

interface TrackingControlsProps {
  isTracking: boolean;
  isPaused: boolean;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  handlePauseResume: () => void;
  handleStop: () => void;
  setShowManualDialog: (show: boolean) => void;
}

const TrackingControls = ({ 
  isTracking, 
  isPaused, 
  elapsedTime, 
  formatTime,
  handlePauseResume, 
  handleStop,
  setShowManualDialog 
}: TrackingControlsProps) => {

  if (!isTracking) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Button
          size="lg"
          className="w-40 h-40 rounded-full bg-[#3B44F6] hover:bg-[#3B44F6]/90 shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center border border-[#3B44F6]"
          onClick={() => {
            document.dispatchEvent(new Event('open-time-entry-dialog'));
          }}
          type="button"
        >
          <Play className="h-16 w-16" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-[#3B44F6] hover:bg-[#3B44F6]/5 text-[#3B44F6] shadow-md"
            onClick={() => setShowManualDialog(true)}
            type="button"
          >
            <Clock className="h-4 w-4 mr-2" />
            Zeit manuell erfassen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-4xl font-bold text-[#3B44F6]">
        {formatTime(elapsedTime)}
      </div>
      <div className="flex gap-4">
        <Button
          size="lg"
          variant={isPaused ? "outline" : "default"}
          className={`rounded-full w-16 h-16 shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center ${
            isPaused 
              ? "border-[#3B44F6] hover:bg-[#3B44F6]/5 text-[#3B44F6]" 
              : "bg-[#3B44F6] hover:bg-[#3B44F6]/90 border border-[#3B44F6]"
          }`}
          onClick={handlePauseResume}
          type="button"
        >
          {isPaused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
        </Button>
        <Button
          size="lg"
          variant="destructive"
          className="rounded-full w-16 h-16 shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
          onClick={handleStop}
          type="button"
        >
          <Square className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default TrackingControls;
