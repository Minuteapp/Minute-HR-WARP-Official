import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, List, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

export const MyTasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .contains('assigned_to', [user.id])
          .neq('status', 'done')
          .order('priority', { ascending: false })
          .order('due_date', { ascending: true })
          .limit(8);

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Aufgaben:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Meine Aufgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Meine Aufgaben ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">Keine offenen Aufgaben</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-2 border rounded-md space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium line-clamp-1">{task.title}</h4>
                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                  {getPriorityIcon(task.priority)}
                  <span className="ml-1">{task.priority}</span>
                </Badge>
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Fällig: {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de })}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export const TaskOverviewWidget: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    done: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        // Alle Tasks des Users
        const { data: allTasks, error: allError } = await supabase
          .from('tasks')
          .select('status')
          .contains('assigned_to', [user.id]);

        if (allError) throw allError;

        const taskStats = {
          total: allTasks?.length || 0,
          pending: allTasks?.filter(t => t.status === 'pending').length || 0,
          in_progress: allTasks?.filter(t => t.status === 'in_progress').length || 0,
          done: allTasks?.filter(t => t.status === 'done').length || 0,
        };

        setStats(taskStats);
      } catch (error) {
        console.error('Fehler beim Laden der Aufgaben-Statistiken:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskStats();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <List className="h-4 w-4" />
            Aufgaben-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <List className="h-4 w-4" />
          Aufgaben-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Gesamt</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{stats.pending + stats.in_progress}</div>
            <div className="text-xs text-muted-foreground">Offen</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Fortschritt</span>
            <span>{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};