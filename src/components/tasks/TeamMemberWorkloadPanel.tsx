import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  workload: number;
  avatarColor: string;
}

interface TeamMemberWorkloadPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
}

export const TeamMemberWorkloadPanel = ({ open, onOpenChange, member }: TeamMemberWorkloadPanelProps) => {
  if (!member) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 100) return 'bg-red-500';
    if (workload >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Aufgaben werden aus der Datenbank geladen
  const memberTasks: { id: string; title: string; status: string; dueDate: string; priority: string }[] = [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Auslastungsübersicht</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Mitarbeiter-Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className={cn('text-white text-lg', member.avatarColor)}>
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </div>

          {/* Auslastungs-Card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Auslastung</span>
              <span className={cn(
                'text-lg font-bold',
                member.workload > 100 ? 'text-red-500' :
                member.workload >= 80 ? 'text-orange-500' :
                'text-green-500'
              )}>
                {member.workload}%
              </span>
            </div>
            <Progress 
              value={Math.min(member.workload, 100)} 
              className="h-3 mb-4"
              indicatorClassName={getWorkloadColor(member.workload)}
            />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-orange-500">{member.openTasks}</div>
                <div className="text-xs text-muted-foreground">Offen</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-500">{member.inProgressTasks}</div>
                <div className="text-xs text-muted-foreground">In Arbeit</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-500">{member.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Erledigt</div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="tasks" className="flex-1">Aufgaben</TabsTrigger>
              <TabsTrigger value="workload" className="flex-1">Auslastung</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-3 mt-4">
              {memberTasks.map((task) => (
                <Card key={task.id} className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.status === 'Erledigt' ? 'default' :
                        task.status === 'In Bearbeitung' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <Badge
                    variant={
                      task.priority === 'Hoch' ? 'destructive' :
                      task.priority === 'Mittel' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="workload" className="space-y-4 mt-4">
              <Card className="p-4">
                <h4 className="font-medium mb-3">Wöchentliche Auslastung</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Diese Woche</span>
                    <span className="font-semibold">{member.workload}%</span>
                  </div>
                  <Progress value={member.workload} className="h-2" indicatorClassName={getWorkloadColor(member.workload)} />
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3">Zeitverteilung</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Aktive Bearbeitung</span>
                    </div>
                    <span className="font-semibold">24h / Woche</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Abgeschlossene Aufgaben</span>
                    </div>
                    <span className="font-semibold">{member.completedTasks} diese Woche</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Aktionen */}
          <div className="space-y-2 pt-4 border-t">
            <Button className="w-full" variant="outline">
              Aufgabe neu zuweisen
            </Button>
            <Button className="w-full" variant="outline">
              Workload anpassen
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
