import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Verfügbar' | 'Normal' | 'Überlastet';
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  workload: number;
  overdueTasks?: number;
  avatarColor: string;
}

interface Task {
  id: string;
  title: string;
  effort: number;
  priority: 'hoch' | 'mittel' | 'niedrig';
}

interface ReassignTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceMember: TeamMember | null;
  teamMembers: TeamMember[];
}

const mockTasks: Task[] = [];

export const ReassignTasksDialog = ({ 
  open, 
  onOpenChange, 
  sourceMember,
  teamMembers 
}: ReassignTasksDialogProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [targetMemberId, setTargetMemberId] = useState<string>('');

  if (!sourceMember) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'hoch':
        return <Badge variant="destructive" className="text-xs">Hoch</Badge>;
      case 'mittel':
        return <Badge className="text-xs bg-orange-500 hover:bg-orange-600">Mittel</Badge>;
      case 'niedrig':
        return <Badge variant="secondary" className="text-xs">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const totalEffort = mockTasks
    .filter(t => selectedTasks.includes(t.id))
    .reduce((sum, t) => sum + t.effort, 0);

  const availableMembers = teamMembers.filter(m => m.id !== sourceMember.id);
  const recommendedMember = availableMembers.length > 0 
    ? [...availableMembers].sort((a, b) => a.workload - b.workload)[0]
    : null;
  const targetMember = teamMembers.find(m => m.id === targetMemberId);

  // Berechne neue Auslastung
  const calculateNewWorkload = (member: TeamMember, additionalEffort: number) => {
    // Vereinfachte Berechnung: 1h Aufwand = 2.5% Auslastung
    return member.workload + (additionalEffort * 2.5);
  };

  const handleReassign = () => {
    console.log('Aufgaben neu zuweisen:', { selectedTasks, targetMemberId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aufgaben neu zuweisen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Wählen Sie Aufgaben aus und weisen Sie diese einem anderen Teammitglied zu.
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Quell-Mitarbeiter - Orangener/Gelber Hintergrund */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={cn('text-white', sourceMember.avatarColor)}>
                  {getInitials(sourceMember.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{sourceMember.name}</div>
                <div className="text-sm text-muted-foreground">{sourceMember.role}</div>
              </div>
              <div className="text-right">
                <div className={cn(
                  'text-sm font-bold',
                  sourceMember.workload > 100 ? 'text-destructive' : 'text-orange-600'
                )}>
                  {sourceMember.workload}% Auslastung
                </div>
                {sourceMember.status === 'Überlastet' && (
                  <Badge variant="destructive" className="text-xs mt-1">Überlastet</Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Aufgaben zur Neuzuweisung */}
          <div>
            <h3 className="font-medium mb-3">Aufgaben zur Neuzuweisung auswählen</h3>
            {mockTasks.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground border rounded-lg bg-muted/30">
                <p className="text-sm">Keine Aufgaben vorhanden</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mockTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                      selectedTasks.includes(task.id) 
                        ? 'bg-green-50 border-green-300' 
                        : 'hover:bg-muted/30'
                    )}
                    onClick={() => toggleTaskSelection(task.id)}
                  >
                    {/* Custom Checkbox mit grünem Checkmark */}
                    <div className={cn(
                      'h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                      selectedTasks.includes(task.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    )}>
                      {selectedTasks.includes(task.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{task.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">~{task.effort}h Aufwand</span>
                    {getPriorityBadge(task.priority)}
                  </div>
                ))}
              </div>
            )}
            
            {/* Counter Box */}
            {selectedTasks.length > 0 && (
              <Card className="mt-3 p-3 bg-muted/50 border">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{selectedTasks.length} Aufgabe(n) ausgewählt</span>
                  <span className="text-muted-foreground font-medium">~{totalEffort}h Gesamtaufwand</span>
                </div>
              </Card>
            )}
          </div>

          {/* KI-Empfehlung mit AlertTriangle */}
          {recommendedMember && (
            <Card className="p-3 bg-primary/10 border-primary/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">
                  <span className="font-semibold text-primary">KI-Empfehlung:</span>{' '}
                  {recommendedMember.name} ist optimal für diese Aufgaben geeignet (niedrigste Auslastung: {recommendedMember.workload}%).
                </p>
              </div>
            </Card>
          )}

          {/* Teammitglied auswählen */}
          <div>
            <h3 className="font-medium mb-3">Teammitglied auswählen</h3>
            <RadioGroup value={targetMemberId} onValueChange={setTargetMemberId}>
              <div className="space-y-2">
                {availableMembers.map((member) => (
                  <div
                    key={member.id}
                    className={cn(
                      'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                      targetMemberId === member.id 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'hover:bg-muted/30'
                    )}
                    onClick={() => setTargetMemberId(member.id)}
                  >
                    <RadioGroupItem value={member.id} id={member.id} />
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={cn('text-white text-xs', member.avatarColor)}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor={member.id} className="font-semibold cursor-pointer">
                        {member.name}
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-bold text-sm',
                          member.workload > 100 ? 'text-destructive' :
                          member.workload >= 80 ? 'text-orange-500' :
                          'text-foreground'
                        )}>
                          {member.workload}%
                        </span>
                        <span className="text-xs text-muted-foreground">{member.role}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">
                        {Math.max(0, 100 - member.workload)}% frei
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Vorschau der Änderung - Grüner Hintergrund */}
          {targetMember && selectedTasks.length > 0 && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Vorschau der Änderung</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{sourceMember.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{targetMember.name}</span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Neue Auslastung: {Math.round(calculateNewWorkload(targetMember, totalEffort))}%
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleReassign}
            disabled={selectedTasks.length === 0 || !targetMemberId}
          >
            {selectedTasks.length} Aufgabe(n) zuweisen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};