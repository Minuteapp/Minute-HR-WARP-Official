import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Calendar, 
  RefreshCw,
  Search,
  Filter,
  Folder,
  User,
  Loader2
} from 'lucide-react';
import { useTasksStore } from '@/stores/useTasksStore';
import { toast } from 'sonner';
import { format, differenceInDays, subDays } from 'date-fns';
import { de } from 'date-fns/locale';

export const ArchiveView = () => {
  const { tasks, updateTask } = useTasksStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  // Filtere archivierte Aufgaben (status = 'done' oder 'archived')
  const archivedTasks = useMemo(() => {
    return tasks
      .filter(task => task.status === 'done' || task.status === 'archived')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [tasks]);

  // Berechne echte Statistiken
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    const last30Days = archivedTasks.filter(t => 
      new Date(t.updatedAt || t.createdAt) >= thirtyDaysAgo
    );
    
    const thisWeek = archivedTasks.filter(t => 
      new Date(t.updatedAt || t.createdAt) >= sevenDaysAgo
    );

    // Berechne durchschnittliche Zeit bis Abschluss
    const completionTimes = archivedTasks
      .filter(t => t.createdAt && t.updatedAt)
      .map(t => differenceInDays(new Date(t.updatedAt!), new Date(t.createdAt)));
    
    const avgTime = completionTimes.length > 0 
      ? (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(1)
      : '0';

    return {
      total: last30Days.length,
      thisWeek: thisWeek.length,
      reactivated: 0, // Würde ein Audit-Log benötigen
      avgTime: `${avgTime}d`
    };
  }, [archivedTasks]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return archivedTasks;
    
    const query = searchQuery.toLowerCase();
    return archivedTasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [archivedTasks, searchQuery]);

  const handleReactivate = async (taskId: string) => {
    setReactivatingId(taskId);
    try {
      await updateTask(taskId, { 
        status: 'todo',
        completed: false,
        progress: 0
      });
      toast.success('Aufgabe wurde reaktiviert');
    } catch (error) {
      console.error('Reactivate error:', error);
      toast.error('Fehler beim Reaktivieren');
    } finally {
      setReactivatingId(null);
    }
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <div className="space-y-4">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Archiviert gesamt</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">Letzte 30 Tage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Diese Woche</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <div className="text-xs text-muted-foreground mt-1">Abgeschlossen</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Reaktiviert</span>
              <RefreshCw className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.reactivated}</div>
            <div className="text-xs text-muted-foreground mt-1">Letzte 30 Tage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Durchschn. Zeit</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.avgTime}</div>
            <div className="text-xs text-muted-foreground mt-1">Bis Abschluss</div>
          </CardContent>
        </Card>
      </div>

      {/* Suchfeld + Filter */}
      <div className="flex gap-3">
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

      {/* Archivierte Aufgaben-Liste */}
      <div className="space-y-3">
        {filteredTasks.slice(0, visibleCount).map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Green Check Icon */}
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-2">{task.title}</h3>
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
                    {task.projectId && (
                      <div className="flex items-center gap-1">
                        <Folder className="h-3.5 w-3.5" />
                        <span>Projekt</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Abgeschlossen: {format(new Date(task.updatedAt || task.createdAt), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{task.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {task.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-600 font-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reactivate Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleReactivate(task.id)}
                  disabled={reactivatingId === task.id}
                  className="flex-shrink-0"
                >
                  {reactivatingId === task.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reaktivieren
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredTasks.length && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            Weitere Aufgaben laden ({filteredTasks.length - visibleCount} verbleibend)
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Keine archivierten Aufgaben gefunden</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Versuchen Sie einen anderen Suchbegriff.' : 'Abgeschlossene Aufgaben werden hier angezeigt.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
