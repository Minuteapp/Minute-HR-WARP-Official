import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Clock, MapPin, Briefcase } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import { getLocationText } from "@/utils/time-entry-helpers";

interface MobileTimeControlsProps {
  isTracking: boolean;
  isPaused: boolean;
  elapsedTime: number;
  currentActiveEntry: TimeEntry | null;
  formatTime: (seconds: number) => string;
  onStart: () => void;
  onPauseResume: () => void;
  onStop: () => void;
  onManualEntry: () => void;
}

const MobileTimeControls = ({
  isTracking,
  isPaused,
  elapsedTime,
  currentActiveEntry,
  formatTime,
  onStart,
  onPauseResume,
  onStop,
  onManualEntry
}: MobileTimeControlsProps) => {
  if (!isTracking) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-[13px] font-semibold text-gray-900 text-center mb-2">
          Zeiterfassung
        </h2>
        <div className="flex flex-col items-center space-y-3">
          <p className="text-[10px] text-gray-600 text-center">Keine aktive Zeiterfassung</p>
          <button
            onClick={onStart}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <Play className="w-8 h-8 text-white ml-0.5" fill="white" />
          </button>
          <button
            onClick={onManualEntry}
            className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Clock className="h-3 w-3" />
            Zeit manuell erfassen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <h2 className="text-[13px] font-semibold text-gray-900 text-center mb-2">
        Zeiterfassung
      </h2>
      
      {/* Status Badge */}
      <div className="flex justify-center mb-2">
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
          isPaused ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {isPaused ? 'Pausiert' : 'Aktiv'}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold font-mono tracking-wider text-gray-900">
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Project/Location Info */}
      {currentActiveEntry && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px]">
            <Briefcase className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Projekt:</span>
            <span className="font-medium text-gray-900 flex-1 text-right">
              {currentActiveEntry.project || '-'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Arbeitsort:</span>
            <span className="font-medium text-gray-900 flex-1 text-right">
              {getLocationText(currentActiveEntry.location)}
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={onPauseResume}
          className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          {isPaused ? (
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          ) : (
            <Pause className="w-5 h-5 text-white" fill="white" />
          )}
        </button>
        <button
          onClick={onStop}
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <Square className="w-5 h-5 text-white" fill="white" />
        </button>
      </div>
    </div>
  );
};

export default MobileTimeControls;
