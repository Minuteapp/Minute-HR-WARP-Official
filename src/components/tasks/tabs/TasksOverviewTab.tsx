import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Inbox, Clock, TrendingUp, Calendar, Filter, ArrowUpDown, Plus, CheckCircle2, Clock as ClockIcon, Trash2, MoreVertical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  dueDate: string;
  assignee: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  status: 'In Bearbeitung' | 'Offen' | 'Recht' | 'Dringend';
  progress: number;
  tags: string[];
  isOverdue?: boolean;
}

const mockTasks: Task[] = [];

export function TasksOverviewTab() {
  const [tasks] = useState<Task[]>(mockTasks);

  const totalOpen = tasks.filter(t => t.status === 'Offen' || t.status === 'In Bearbeitung').length;
  const dueToday = tasks.filter(t => t.tags.includes('Dringend')).length;
  const inProgress = tasks.filter(t => t.status === 'In Bearbeitung').length;
  const thisWeek = 8;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-700';
      case 'Mittel': return 'bg-yellow-100 text-yellow-700';
      case 'Niedrig': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Bearbeitung': return 'bg-blue-100 text-blue-700';
      case 'Offen': return 'bg-gray-100 text-gray-700';
      case 'Dringend': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* KI-Zusammenfassung */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">KI-Zusammenfassung für heute</h3>
            <p className="text-sm text-gray-700">
              Guten Morgen! Sie haben <strong>2 Aufgaben mit hoher Priorität</strong>, die heute fällig sind. Die Gehaltsabrechnung ist zu <strong>75% fertig</strong> und könnte heute abgeschlossen werden. Achtung: Der Vertragsprüfung fehlt noch die Freigabe vom Vorgesetzten.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="bg-white">2 heute fällig</Badge>
              <Badge variant="secondary" className="bg-white">1 überfällig</Badge>
              <Badge variant="secondary" className="bg-white">3 in Bearbeitung</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Metriken */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Gesamt offen</span>
            <Inbox className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-semibold">{totalOpen}</div>
          <div className="text-xs text-gray-500 mt-1">+3 seit gestern</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Heute fällig</span>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-3xl font-semibold text-orange-600">{dueToday}</div>
          <div className="text-xs text-orange-600 mt-1">Hohe Priorität</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">In Bearbeitung</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-3xl font-semibold text-blue-600">{inProgress}</div>
          <div className="text-xs text-gray-500 mt-1">Ø 65% Fortschritt</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Diese Woche</span>
            <Calendar className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-semibold text-green-600">{thisWeek}</div>
          <div className="text-xs text-green-600 mt-1">5 abgeschlossen</div>
        </Card>
      </div>

      {/* Filter & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sortieren
          </Button>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Aufgabe erstellen
        </Button>
      </div>

      {/* Aufgabenliste */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <Checkbox className="mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      {task.isOverdue && (
                        <Badge variant="destructive" className="text-xs">Überfällig</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        Als erledigt markieren
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ClockIcon className="h-4 w-4 mr-2 text-orange-600" />
                        Verschieben
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Inbox className="h-3 w-3" />
                    <span>{task.project}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                      {task.assignee.split(' ').map(n => n[0]).join('')}
                    </span>
                    <span>{task.assignee}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Fortschritt</span>
                    <span className="font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {task.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className={
                        tag === 'Hoch' ? getPriorityColor('Hoch') :
                        tag === 'Mittel' ? getPriorityColor('Mittel') :
                        tag === 'Niedrig' ? getPriorityColor('Niedrig') :
                        tag === 'In Bearbeitung' ? getStatusColor('In Bearbeitung') :
                        tag === 'Offen' ? getStatusColor('Offen') :
                        'bg-gray-100 text-gray-700'
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
