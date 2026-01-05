import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimeTrackerProps {
  activeTimer: string | null;
  setActiveTimer: (timer: string | null) => void;
}

export const TimeTracker = ({ activeTimer, setActiveTimer }: TimeTrackerProps) => {
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const { toast } = useToast();

  // Timer-Logik
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimer && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        setCurrentTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer, startTime]);

  const startTimer = async () => {
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie eine Beschreibung ein."
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      const now = new Date();
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          start_time: now.toISOString(),
          description,
          project_name: project || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveTimer(data.id);
      setStartTime(now);
      
      toast({
        title: "Timer gestartet",
        description: "Zeiterfassung wurde erfolgreich gestartet."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message
      });
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    try {
      const now = new Date();
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: now.toISOString(),
          status: 'completed'
        })
        .eq('id', activeTimer);

      if (error) throw error;

      setActiveTimer(null);
      setStartTime(null);
      setCurrentTime('00:00:00');
      setDescription('');
      setProject('');
      
      toast({
        title: "Timer gestoppt",
        description: "Zeiterfassung wurde erfolgreich beendet."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timer Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Aktueller Timer</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-mono font-bold text-blue-600">
            {currentTime}
          </div>
          
          <div className="flex justify-center gap-4">
            {!activeTimer ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="gap-2"
                disabled={!description.trim()}
              >
                <Play className="h-5 w-5" />
                Start
              </Button>
            ) : (
              <Button
                onClick={stopTimer}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <Square className="h-5 w-5" />
                Stop
              </Button>
            )}
          </div>

          {activeTimer && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Läuft seit</p>
              <p className="text-blue-800">{startTime?.toLocaleTimeString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timer Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Timer konfigurieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              placeholder="Woran arbeiten Sie?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!!activeTimer}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Projekt (optional)</Label>
            <Input
              id="project"
              placeholder="Projektname"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={!!activeTimer}
            />
          </div>

          {activeTimer && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Aktive Aufgabe</h4>
              <p className="text-sm text-green-700">{description}</p>
              {project && (
                <p className="text-sm text-green-600 mt-1">Projekt: {project}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};