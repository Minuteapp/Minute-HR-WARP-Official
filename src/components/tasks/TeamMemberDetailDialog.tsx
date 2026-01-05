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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  CheckCircle2, 
  Circle,
  Clock,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  project: string;
  status: 'offen' | 'in_bearbeitung' | 'abgeschlossen';
  dueDate: string;
  timeSpent: number;
  timeEstimate: number;
  priority: 'hoch' | 'mittel' | 'niedrig';
  progress: number;
}

interface TeamMemberDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onReassignTasks: () => void;
  onAdjustWorkload: () => void;
}

const mockTasks: Task[] = [];

export const TeamMemberDetailDialog = ({ 
  open, 
  onOpenChange, 
  member,
  onReassignTasks,
  onAdjustWorkload
}: TeamMemberDetailDialogProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  if (!member) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offen':
        return <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">Offen</Badge>;
      case 'in_bearbeitung':
        return <Badge className="text-xs bg-blue-500 hover:bg-blue-600">In Bearbeitung</Badge>;
      case 'abgeschlossen':
        return <Badge className="text-xs bg-green-500 hover:bg-green-600">Abgeschlossen</Badge>;
      default:
        return null;
    }
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

  const completedCount = member.completedTasks;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className={cn('text-white text-lg', member.avatarColor)}>
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{member.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auslastungsübersicht */}
          <div>
            <h3 className="font-semibold mb-3">Auslastungsübersicht</h3>
            <div className="grid grid-cols-4 gap-3">
              {/* Auslastung Card */}
              <Card className="p-3 bg-white border">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Auslastung</span>
                </div>
                <div className={cn(
                  'text-2xl font-bold mb-2',
                  member.workload > 100 ? 'text-destructive' :
                  member.workload >= 80 ? 'text-orange-500' :
                  'text-green-600'
                )}>
                  {member.workload}%
                </div>
                <Progress 
                  value={Math.min(member.workload, 100)} 
                  className="h-1.5"
                />
              </Card>

              {/* Aufgaben Card */}
              <Card className="p-3 bg-white border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Aufgaben</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{member.totalTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">{completedCount} abgeschlossen</div>
              </Card>

              {/* Offen Card */}
              <Card className="p-3 bg-white border">
                <div className="flex items-center gap-2 mb-2">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Offen</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{member.openTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">Zu erledigen</div>
              </Card>

              {/* In Arbeit Card */}
              <Card className="p-3 bg-white border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">In Arbeit</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{member.inProgressTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">Aktiv</div>
              </Card>
            </div>
          </div>

          {/* Alle Aufgaben als Tabelle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Alle Aufgaben</h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Aufgabe zuweisen
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-white">
              {mockTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Keine Aufgaben vorhanden</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="font-semibold">Aufgabe</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Projekt</TableHead>
                      <TableHead className="font-semibold">Fälligkeitsdatum</TableHead>
                      <TableHead className="font-semibold text-center">Aufwand</TableHead>
                      <TableHead className="font-semibold">Priorität</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTasks.map((task) => (
                      <TableRow 
                        key={task.id}
                        className={cn(
                          selectedTasks.includes(task.id) && 'bg-primary/5'
                        )}
                      >
                        <TableCell className="w-10">
                          <div 
                            onClick={() => toggleTaskSelection(task.id)}
                            className={cn(
                              'h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors',
                              task.status === 'abgeschlossen' 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 hover:border-primary'
                            )}
                          >
                            {task.status === 'abgeschlossen' && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className={cn(
                              'font-medium text-sm',
                              task.status === 'abgeschlossen' && 'text-muted-foreground line-through'
                            )}>
                              {task.title}
                            </span>
                            <Progress 
                              value={task.progress} 
                              className="h-1 mt-1.5 w-24"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(task.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {task.project}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-destructive font-medium">{task.dueDate}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-muted-foreground">
                            {task.timeSpent}/{task.timeEstimate}h
                          </span>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(task.priority)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReassignTasks}>
            Aufgaben neu zuweisen
          </Button>
          <Button onClick={onAdjustWorkload}>
            Workload anpassen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};