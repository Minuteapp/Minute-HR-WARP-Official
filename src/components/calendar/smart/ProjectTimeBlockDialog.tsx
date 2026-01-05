
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock } from 'lucide-react';
import { useCreateProjectTimeBlock } from '@/hooks/useSmartCalendar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectTimeBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectTimeBlockDialog: React.FC<ProjectTimeBlockDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [blockType, setBlockType] = useState<'milestone' | 'deadline' | 'focus_time'>('focus_time');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [isFlexible, setIsFlexible] = useState(false);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const createTimeBlock = useCreateProjectTimeBlock();

  // Lade verfügbare Projekte
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status')
        .or(`owner_id.eq.${user.id},team_members.cs.{${user.id}}`)
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleSubmit = async () => {
    if (!title.trim() || !startTime || !endTime) {
      return;
    }

    try {
      await createTimeBlock.mutateAsync({
        title,
        description,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        block_type: blockType,
        priority,
        is_flexible: isFlexible,
        buffer_minutes: bufferMinutes,
        user_id: user?.id || crypto.randomUUID(),
        project_id: selectedProjectId || undefined
      });

      // Reset form
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setBlockType('focus_time');
      setPriority('high');
      setIsFlexible(false);
      setBufferMinutes(0);
      setSelectedProjectId('');

      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des Zeitblocks:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Projekt-Zeitblock erstellen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Frontend-Entwicklung"
            />
          </div>

          <div>
            <Label htmlFor="project">Projekt (optional)</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Projekt auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Kein Projekt</SelectItem>
                {projectsLoading && (
                  <SelectItem value="loading" disabled>
                    Projekte werden geladen...
                  </SelectItem>
                )}
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zusätzliche Details..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Startzeit</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endTime">Endzeit</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Block-Typ</Label>
              <Select value={blockType} onValueChange={(value: 'milestone' | 'deadline' | 'focus_time') => setBlockType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Meilenstein</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="focus_time">Fokuszeit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priorität</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFlexible"
              checked={isFlexible}
              onCheckedChange={(checked) => setIsFlexible(checked as boolean)}
            />
            <Label htmlFor="isFlexible">
              Zeitblock ist flexibel verschiebbar
            </Label>
          </div>

          <div>
            <Label htmlFor="bufferMinutes">Pufferzeit (Minuten)</Label>
            <Input
              id="bufferMinutes"
              type="number"
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              max="120"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createTimeBlock.isPending || !title.trim() || !startTime || !endTime}
            >
              <Clock className="h-4 w-4 mr-2" />
              {createTimeBlock.isPending ? 'Erstellt...' : 'Zeitblock erstellen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTimeBlockDialog;
