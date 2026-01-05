
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, Square } from 'lucide-react';

interface TimeEntry {
  id: string;
  user: string;
  task: string;
  duration: number; // in minutes
  date: string;
  status: 'active' | 'completed';
}

interface ProjectTimeTrackerProps {
  projectId: string;
  projectName: string;
}

export const ProjectTimeTracker: React.FC<ProjectTimeTrackerProps> = ({ 
  projectId, 
  projectName 
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [timeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      user: 'Anna Schmidt',
      task: 'Frontend Entwicklung',
      duration: 240, // 4 hours
      date: '2024-01-20',
      status: 'completed'
    },
    {
      id: '2',
      user: 'Michael Weber',
      task: 'API Integration',
      duration: 180, // 3 hours
      date: '2024-01-20',
      status: 'completed'
    },
    {
      id: '3',
      user: 'Anna Schmidt',
      task: 'Code Review',
      duration: 45,
      date: '2024-01-21',
      status: 'active'
    }
  ]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTotalHours = () => {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0);
  };

  const handleStartTracking = () => {
    setIsTracking(true);
    setCurrentTask('Neue Aufgabe');
  };

  const handlePauseTracking = () => {
    setIsTracking(false);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setElapsedTime(0);
    setCurrentTask('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Zeiterfassung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Tracking */}
          <div className="p-3 bg-gray-50 rounded-lg">
            {isTracking ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-600">Läuft: {currentTask}</span>
                  <Badge variant="default" className="bg-green-500">
                    {formatDuration(elapsedTime)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handlePauseTracking}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pausieren
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleStopTracking}>
                    <Square className="h-4 w-4 mr-1" />
                    Beenden
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={handleStartTracking} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Zeiterfassung starten
              </Button>
            )}
          </div>

          {/* Time Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{formatDuration(getTotalHours())}</p>
              <p className="text-sm text-gray-600">Gesamt</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{timeEntries.length}</p>
              <p className="text-sm text-gray-600">Einträge</p>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Letzte Einträge</h4>
            {timeEntries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">{entry.task}</p>
                  <p className="text-xs text-gray-500">{entry.user} • {entry.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatDuration(entry.duration)}</p>
                  <Badge 
                    variant={entry.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {entry.status === 'active' ? 'Aktiv' : 'Beendet'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
