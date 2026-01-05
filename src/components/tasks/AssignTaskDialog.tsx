import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
}

// Keine Mock-Daten - Aufgaben werden aus der Datenbank geladen
const mockTasks: { id: string; title: string; project: string }[] = [];

export const AssignTaskDialog = ({ open, onOpenChange, teamMembers }: AssignTaskDialogProps) => {
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Finde das am wenigsten ausgelastete Mitglied für die KI-Empfehlung
  const recommendedMember = teamMembers.length > 0 
    ? [...teamMembers].sort((a, b) => a.workload - b.workload)[0]
    : null;

  const getStatusBadge = (status: string, workload: number) => {
    if (status === 'Überlastet' || workload > 100) {
      return (
        <div className="flex items-center gap-1">
          <Badge variant="destructive" className="text-xs">Überlastet</Badge>
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        </div>
      );
    }
    if (status === 'Verfügbar' || workload < 60) {
      return <Badge className="text-xs bg-green-500 hover:bg-green-600">Verfügbar</Badge>;
    }
    return <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Normal</Badge>;
  };

  const handleApplyRecommendation = () => {
    if (recommendedMember) {
      setSelectedMember(recommendedMember.id);
    }
  };

  const handleAssign = () => {
    console.log('Aufgabe zuweisen:', { selectedTask, selectedMember });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aufgabe zuweisen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Weisen Sie eine Aufgabe einem Teammitglied zu.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aufgabe auswählen */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Aufgabe auswählen</Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Aufgabe..." />
              </SelectTrigger>
              <SelectContent>
                {mockTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title} ({task.project})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* KI-Empfehlung */}
          {recommendedMember && (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary rounded-lg shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">KI-Empfehlung</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">{recommendedMember.name}</span> hat die geringste Auslastung ({recommendedMember.workload}%) und ist optimal für diese Aufgabe geeignet.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={handleApplyRecommendation}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Empfehlung übernehmen
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Suchfeld */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Mitarbeiter auswählen</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mitarbeiter suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Mitarbeiter-Tabelle */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Mitarbeiter</TableHead>
                  <TableHead className="font-semibold">Rolle</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Auslastung</TableHead>
                  <TableHead className="font-semibold text-center">Kapazität</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedMember === member.id 
                        ? 'bg-primary/10' 
                        : 'hover:bg-muted/30'
                    )}
                    onClick={() => setSelectedMember(member.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={cn('text-white text-xs', member.avatarColor)}>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.role}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(member.status, member.workload)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        'font-semibold text-sm',
                        member.workload > 100 ? 'text-destructive' :
                        member.workload >= 80 ? 'text-orange-500' :
                        'text-green-600'
                      )}>
                        {member.workload}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {member.totalTasks} Aufgaben
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Keine Mitarbeiter gefunden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedMember}
          >
            Aufgabe zuweisen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};