import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Eye, Edit, AlertTriangle, ListTodo } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTasksTabNewProps {
  project: any;
}

export const ProjectTasksTabNew: React.FC<ProjectTasksTabNewProps> = ({ project }) => {
  // Lade echte Tasks aus der Datenbank
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['project-tasks', project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!project?.id
  });

  // Berechne Stats dynamisch aus echten Daten
  const stats = [
    { 
      label: 'Gesamt', 
      value: tasks.length, 
      bgColor: 'bg-blue-50', 
      textColor: 'text-blue-600', 
      borderColor: 'border-b-4 border-blue-500' 
    },
    { 
      label: 'Erledigt', 
      value: tasks.filter((t: any) => t.status === 'completed' || t.status === 'done').length, 
      bgColor: 'bg-green-50', 
      textColor: 'text-green-600', 
      borderColor: 'border-b-4 border-green-500' 
    },
    { 
      label: 'In Arbeit', 
      value: tasks.filter((t: any) => t.status === 'in_progress' || t.status === 'in-progress').length, 
      bgColor: 'bg-yellow-50', 
      textColor: 'text-yellow-600', 
      borderColor: 'border-b-4 border-yellow-500' 
    },
    { 
      label: 'Überfällig', 
      value: tasks.filter((t: any) => {
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date() && t.status !== 'completed' && t.status !== 'done';
      }).length, 
      bgColor: 'bg-red-50', 
      textColor: 'text-red-600', 
      borderColor: 'border-b-4 border-red-500' 
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return { label: 'Erledigt', color: 'bg-green-500' };
      case 'in_progress':
      case 'in-progress':
        return { label: 'In Arbeit', color: 'bg-blue-500' };
      case 'delayed':
      case 'overdue':
        return { label: 'Verzögert', color: 'bg-orange-500' };
      case 'planned':
      case 'todo':
        return { label: 'Geplant', color: 'bg-gray-400' };
      default:
        return { label: status, color: 'bg-gray-400' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { label: 'Kritisch', color: 'bg-red-500' };
      case 'high':
        return { label: 'Hoch', color: 'bg-orange-500' };
      case 'medium':
        return { label: 'Mittel', color: 'bg-yellow-500' };
      case 'low':
        return { label: 'Niedrig', color: 'bg-green-500' };
      default:
        return { label: priority || 'Normal', color: 'bg-gray-400' };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const isOverdue = (task: any) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed' && task.status !== 'done';
  };

  if (tasks.length === 0 && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Projekt-Aufgaben</h2>
            <p className="text-sm text-muted-foreground">Verwalten Sie alle Aufgaben dieses Projekts</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Neue Aufgabe
          </Button>
        </div>

        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Aufgaben vorhanden</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Erstellen Sie Ihre erste Aufgabe, um den Fortschritt dieses Projekts zu verfolgen.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Erste Aufgabe erstellen
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Projekt-Aufgaben</h2>
          <p className="text-sm text-muted-foreground">Verwalten Sie alle Aufgaben dieses Projekts</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Neue Aufgabe
        </Button>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={stat.borderColor}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aufgaben-Tabelle */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Aufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aufgabe</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priorität</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Zugewiesen</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fällig</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fortschritt</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task: any) => {
                  const statusBadge = getStatusBadge(task.status);
                  const priorityBadge = getPriorityBadge(task.priority);
                  const taskIsOverdue = isOverdue(task);
                  const progress = task.progress || 0;

                  return (
                    <tr key={task.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {taskIsOverdue && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="text-sm font-medium">{task.title || task.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${statusBadge.color} text-white text-xs`}>
                          {statusBadge.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${priorityBadge.color} text-white text-xs`}>
                          {priorityBadge.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10">
                              {(task.assignee_name || task.assigned_to || '?').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{task.assignee_name || task.assigned_to || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${taskIsOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {formatDate(task.due_date)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={progress} 
                            className={`h-2 w-20 ${progress === 100 ? '[&>div]:bg-green-500' : progress >= 50 ? '[&>div]:bg-blue-500' : '[&>div]:bg-yellow-500'}`} 
                          />
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
