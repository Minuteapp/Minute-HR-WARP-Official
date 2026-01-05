import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TaskFilterPanel } from "./TaskFilterPanel";
import { Search, Plus, Layout, List, Archive, Trash2 } from 'lucide-react';
import { TaskFilters } from '@/types/tasks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TasksPageHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onFilterClick: (filterType: 'status' | 'priority', value: string) => void;
  onAddTaskClick: () => void;
  onArchiveClick: () => void;
  onTrashClick: () => void;
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
  advancedFilters: TaskFilters;
  onAdvancedFiltersChange: (filters: TaskFilters) => void;
  onResetFilters: () => void;
}

export const TasksPageHeader = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterClick,
  onAddTaskClick,
  onArchiveClick,
  onTrashClick,
  viewMode,
  setViewMode,
  advancedFilters,
  onAdvancedFiltersChange,
  onResetFilters
}: TasksPageHeaderProps) => {
  const statusFilters = [
    { value: 'all', label: 'Alle', count: 0 },
    { value: 'todo', label: 'Zu erledigen', count: 0 },
    { value: 'in-progress', label: 'In Bearbeitung', count: 0 },
    { value: 'review', label: 'Review', count: 0 },
    { value: 'blocked', label: 'Blockiert', count: 0 },
    { value: 'done', label: 'Erledigt', count: 0 }
  ];

  // Echte Teammitglieder aus der Datenbank laden
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['employees-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('status', 'active')
        .order('last_name');
      
      if (error) throw error;
      return (data || []).map(emp => ({
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt'
      }));
    }
  });

  // Tags aus bestehenden Aufgaben laden
  const { data: tags = [] } = useQuery({
    queryKey: ['task-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('tags')
        .not('tags', 'is', null);
      
      if (error) throw error;
      
      // Alle einzigartigen Tags sammeln
      const allTags = new Set<string>();
      (data || []).forEach(task => {
        if (Array.isArray(task.tags)) {
          task.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      return Array.from(allTags).map((tag, index) => ({
        id: `tag-${index}`,
        name: tag
      }));
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Aufgaben</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onArchiveClick}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archiv
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onTrashClick}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Papierkorb
          </Button>
          <Button onClick={onAddTaskClick}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Aufgabe
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Aufgaben suchen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TaskFilterPanel 
            filters={advancedFilters}
            onFiltersChange={onAdvancedFiltersChange}
            onResetFilters={onResetFilters}
            teamMembers={teamMembers}
            tags={tags}
          />
          
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-8"
            >
              <Layout className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterClick('status', filter.value)}
            className="text-xs"
          >
            {filter.label}
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
