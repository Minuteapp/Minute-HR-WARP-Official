
interface ActiveTimeDisplayProps {
  elapsedTime: number;
  formatTimeDetailed: (seconds: number) => { hours: string; minutes: string; seconds: string };
  calculateTotalPausedTime: () => string;
  activeEntry: any;
}

const ActiveTimeDisplay = ({
  elapsedTime,
  formatTimeDetailed,
  calculateTotalPausedTime,
  activeEntry
}: ActiveTimeDisplayProps) => {
  const timeDisplay = formatTimeDetailed(elapsedTime);

  console.log("=== ActiveTimeDisplay RENDER ===");
  console.log("elapsedTime:", elapsedTime);
  console.log("timeDisplay:", timeDisplay);
  console.log("activeEntry status:", activeEntry?.status);

  return (
    <div className="space-y-2">
      {/* Hauptzeit-Anzeige */}
      <div className="text-center">
        <div className="text-2xl font-mono font-bold text-gray-900">
          {timeDisplay.hours}:{timeDisplay.minutes}:{timeDisplay.seconds}
        </div>
        <div className="text-xs text-gray-500">
          {activeEntry ? (activeEntry.status === 'active' ? 'Aktiv' : 'Pausiert') : 'Gestoppt'}
        </div>
      </div>

      {/* Zusätzliche Informationen */}
      {activeEntry && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>Gestartet: {new Date(activeEntry.start_time).toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
          <span>Pausen: {calculateTotalPausedTime()}</span>
        </div>
      )}
    </div>
  );
};

export default ActiveTimeDisplay;
