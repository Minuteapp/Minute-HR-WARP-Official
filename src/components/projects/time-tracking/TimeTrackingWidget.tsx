import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Calendar,
  User,
  Tag,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  tags: string[];
  isRunning: boolean;
}

interface TimeTrackingWidgetProps {
  projectId?: string;
  projectName?: string;
}

export const TimeTrackingWidget = ({ projectId, projectName }: TimeTrackingWidgetProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);

  // Timer für laufende Zeiterfassung
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && currentEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentEntry]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const startTracking = () => {
    if (!selectedProject || !description.trim()) {
      toast.error('Bitte Projekt und Beschreibung auswählen');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      projectId: selectedProject,
      projectName: projectName || 'Ausgewähltes Projekt',
      description: description.trim(),
      startTime: new Date(),
      duration: 0,
      tags: [],
      isRunning: true
    };

    setCurrentEntry(newEntry);
    setIsTracking(true);
    setElapsedTime(0);
    toast.success('Zeiterfassung gestartet');
  };

  const pauseTracking = () => {
    setIsTracking(false);
    toast.info('Zeiterfassung pausiert');
  };

  const resumeTracking = () => {
    if (currentEntry) {
      setIsTracking(true);
      toast.info('Zeiterfassung fortgesetzt');
    }
  };

  const stopTracking = () => {
    if (currentEntry) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentEntry.startTime.getTime()) / (1000 * 60));
      
      const completedEntry: TimeEntry = {
        ...currentEntry,
        endTime,
        duration,
        isRunning: false
      };

      setRecentEntries(prev => [completedEntry, ...prev.slice(0, 4)]);
      setCurrentEntry(null);
      setIsTracking(false);
      setElapsedTime(0);
      setDescription('');
      
      toast.success(`Zeiterfassung beendet: ${formatDuration(duration)}`);
    }
  };

  const mockProjects: any[] = [];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Zeiterfassung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <motion.div
            key={elapsedTime}
            initial={{ scale: 1 }}
            animate={{ scale: isTracking ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className={`text-4xl font-mono font-bold ${isTracking ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {formatTime(elapsedTime)}
          </motion.div>
          {currentEntry && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <Badge variant={isTracking ? "default" : "secondary"} className="gap-1">
                {isTracking ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {isTracking ? 'Läuft' : 'Pausiert'}
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Project Selection & Description */}
        {!currentEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Projekt</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Projekt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                placeholder="Was arbeitest du gerade?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>
          </motion.div>
        )}

        {/* Current Entry Info */}
        {currentEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted/30 rounded-lg border"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{currentEntry.projectName}</span>
              </div>
              <p className="text-sm text-muted-foreground">{currentEntry.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Gestartet: {currentEntry.startTime.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!currentEntry ? (
            <Button 
              onClick={startTracking} 
              className="flex-1 gap-2"
              disabled={!selectedProject || !description.trim()}
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <>
              {isTracking ? (
                <Button onClick={pauseTracking} variant="outline" className="flex-1 gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeTracking} className="flex-1 gap-2">
                  <Play className="h-4 w-4" />
                  Fortsetzen
                </Button>
              )}
              <Button onClick={stopTracking} variant="destructive" className="flex-1 gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Letzte Einträge
            </h4>
            {recentEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-background border rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{entry.projectName}</div>
                    <div className="text-xs text-muted-foreground">{entry.description}</div>
                  </div>
                  <Badge variant="secondary">{formatDuration(entry.duration)}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};