import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Calendar,
  RotateCcw,
  Search,
  Filter,
  Archive,
  Clock,
  FolderOpen,
  User
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

interface ArchivedTask {
  id: string;
  title: string;
  projectName: string;
  completedDate: string;
  assignedTo: string;
  tags: string[];
}

export function ArchiveTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const companyId = useCompanyId();

  // Echte archivierte Aufgaben aus der Datenbank laden
  const { data: archivedTasksRaw = [], isLoading } = useQuery({
    queryKey: ['archived-tasks', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .in('status', ['done', 'archived'])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching archived tasks:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!companyId
  });

  // Transformiere Datenbank-Aufgaben in das UI-Format
  const archivedTasks: ArchivedTask[] = useMemo(() => {
    return archivedTasksRaw.map(task => ({
      id: task.id,
      title: task.title || 'Unbenannte Aufgabe',
      projectName: task.project_id || 'Kein Projekt',
      completedDate: task.updated_at ? new Date(task.updated_at).toLocaleDateString('de-DE') : '-',
      assignedTo: task.assigned_to || 'Nicht zugewiesen',
      tags: task.tags || []
    }));
  }, [archivedTasksRaw]);

  // Berechne echte Statistiken
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekCount = archivedTasksRaw.filter(t => {
    const updatedAt = new Date(t.updated_at);
    return updatedAt >= weekAgo;
  }).length;

  const thisMonthCount = archivedTasksRaw.filter(t => {
    const updatedAt = new Date(t.updated_at);
    return updatedAt >= monthAgo;
  }).length;

  // Berechne durchschnittliche Zeit bis Abschluss (vereinfacht)
  const avgCompletionTime = useMemo(() => {
    if (archivedTasksRaw.length === 0) return '-';
    
    const tasksWithTime = archivedTasksRaw.filter(t => t.created_at && t.updated_at);
    if (tasksWithTime.length === 0) return '-';

    const totalDays = tasksWithTime.reduce((sum, t) => {
      const created = new Date(t.created_at);
      const completed = new Date(t.updated_at);
      const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    const avg = totalDays / tasksWithTime.length;
    return avg < 1 ? '<1d' : `${avg.toFixed(1)}d`;
  }, [archivedTasksRaw]);

  const filteredTasks = archivedTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-background">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Archiviert gesamt</div>
              <div className="text-2xl font-bold">{thisMonthCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Letzte 30 Tage</div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <Archive className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Diese Woche</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{thisWeekCount}</div>
              </div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Gesamt archiviert</div>
              <div className="text-2xl font-bold">{archivedTasks.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Alle Zeit</div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <RotateCcw className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Ø Zeit</div>
              <div className="text-2xl font-bold">{avgCompletionTime}</div>
              <div className="text-xs text-muted-foreground mt-0.5">bis Abschluss</div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Suchfeld und Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Archivierte Aufgaben durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Liste der archivierten Aufgaben */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Lade archivierte Aufgaben...</p>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Keine Aufgaben gefunden' : 'Keine archivierten Aufgaben vorhanden'}
            </p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="p-4 bg-background hover:bg-accent/30 transition-colors">
              <div className="flex items-start gap-4">
                {/* Completion Icon */}
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-2">{task.title}</h4>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>{task.projectName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Abgeschlossen: {task.completedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{task.assignedTo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-border"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reaktivieren Button */}
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reaktivieren
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Weitere laden Button */}
      {filteredTasks.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">
            Weitere Aufgaben laden
          </Button>
        </div>
      )}
    </div>
  );
}
