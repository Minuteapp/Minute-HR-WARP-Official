
import { useState, useEffect } from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAutoTimeTracking } from '@/hooks/useAutoTimeTracking';

interface TaskTimeTrackingDisplayProps {
  taskId: string;
  taskTitle: string;
  autoTimeTracking: boolean;
  onToggleAutoTracking?: (enabled: boolean) => void;
}

export const TaskTimeTrackingDisplay = ({
  taskId,
  taskTitle,
  autoTimeTracking,
  onToggleAutoTracking
}: TaskTimeTrackingDisplayProps) => {
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  const {
    isAutoTracking,
    autoTrackingStartTime,
    totalTrackedTime,
    startAutoTracking,
    stopAutoTracking
  } = useAutoTimeTracking({
    taskId,
    taskTitle,
    isEnabled: autoTimeTracking
  });

  // Live-Timer für aktuelle Session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoTracking && autoTrackingStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - autoTrackingStartTime.getTime()) / 1000);
        setCurrentSessionTime(elapsed);
      }, 1000);
    } else {
      setCurrentSessionTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoTracking, autoTrackingStartTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimeShort = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleToggleTracking = async () => {
    console.log('Toggle Tracking geklickt, aktueller Status:', isAutoTracking);
    
    if (isAutoTracking) {
      await stopAutoTracking();
    } else {
      await startAutoTracking();
    }
  };

  // Gesamtzeit = bereits erfasste Zeit + aktuelle Session
  const displayTotalTime = totalTrackedTime + (isAutoTracking ? currentSessionTime : 0);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm">Zeiterfassung</span>
        </div>
        
        <Button
          variant={isAutoTracking ? "destructive" : "default"}
          size="sm"
          onClick={handleToggleTracking}
        >
          {isAutoTracking ? (
            <>
              <Square className="h-3 w-3 mr-1" />
              Stoppen
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              Starten
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Gesamtzeit:</span>
          <Badge variant="outline" className="font-mono">
            {formatTimeShort(displayTotalTime)}
          </Badge>
        </div>

        {isAutoTracking && autoTrackingStartTime && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Läuft seit {autoTrackingStartTime.toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aktuelle Session:</span>
              <Badge variant="secondary" className="font-mono">
                {formatTime(currentSessionTime)}
              </Badge>
            </div>
          </>
        )}

        {!isAutoTracking && displayTotalTime === 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            Noch keine Zeit erfasst
          </div>
        )}
        
        {/* Debug-Informationen */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 border-t pt-2">
            Debug: TaskID={taskId}, Tracking={isAutoTracking ? 'Ja' : 'Nein'}, 
            Total={displayTotalTime}s, Session={currentSessionTime}s
          </div>
        )}
      </div>
    </Card>
  );
};
