
import { useState, useMemo, useCallback } from 'react';
import { useTasksStore } from '@/stores/useTasksStore';
import { Task, TaskFilters } from '@/types/tasks';
import { 
  isToday, 
  isTomorrow, 
  isThisWeek, 
  isThisMonth, 
  isPast, 
  startOfDay 
} from 'date-fns';

// Standardwerte für Filter
const defaultFilters: TaskFilters = {
  status: [],
  priority: [],
  dueDate: 'all',
  dueDateCustomRange: {
    from: null,
    to: null
  },
  tags: [],
  assignedTo: [],
  minimumProgress: 0
};

export const useTaskList = () => {
  const { tasks } = useTasksStore();

  // Filter-State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [advancedFilters, setAdvancedFilters] = useState<TaskFilters>(defaultFilters);
  
  // Ansichtsmodus: Kanban oder Liste
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Gefilterte Aufgaben mit erweiterten Filtermöglichkeiten
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Ausgeblendete Status (archiviert/gelöscht) filtern
      if (task.status === 'archived' || task.status === 'deleted') {
        return false;
      }
      
      // Nach Suchbegriff filtern
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(task.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      // Nach Status filtern (einfacher Filter)
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      
      // Nach Status filtern (erweiterter Filter)
      if (advancedFilters.status.length > 0 && !advancedFilters.status.includes(task.status)) {
        return false;
      }
      
      // Nach Priorität filtern (einfacher Filter)
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      
      // Nach Priorität filtern (erweiterter Filter)
      if (advancedFilters.priority.length > 0 && !advancedFilters.priority.includes(task.priority)) {
        return false;
      }
      
      // Nach Fälligkeitsdatum filtern
      if (advancedFilters.dueDate !== 'all' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        
        switch (advancedFilters.dueDate) {
          case 'today':
            if (!isToday(dueDate)) return false;
            break;
          case 'tomorrow':
            if (!isTomorrow(dueDate)) return false;
            break;
          case 'this-week':
            if (!isThisWeek(dueDate, { weekStartsOn: 1 })) return false;
            break;
          case 'this-month':
            if (!isThisMonth(dueDate)) return false;
            break;
          case 'overdue':
            if (!isPast(dueDate) || isToday(dueDate)) return false;
            break;
          case 'no-date':
            if (task.dueDate) return false;
            break;
          case 'custom':
            // Benutzerdefinierter Zeitraum
            if (advancedFilters.dueDateCustomRange.from && 
                dueDate < advancedFilters.dueDateCustomRange.from) {
              return false;
            }
            
            if (advancedFilters.dueDateCustomRange.to) {
              // Enddatum auf Ende des Tages setzen für inklusive Vergleiche
              const endOfDay = new Date(advancedFilters.dueDateCustomRange.to);
              endOfDay.setHours(23, 59, 59, 999);
              
              if (dueDate > endOfDay) {
                return false;
              }
            }
            break;
        }
      }
      
      // Nach Tags filtern
      if (advancedFilters.tags.length > 0) {
        if (!task.tags || !Array.isArray(task.tags)) return false;
        
        const hasMatchingTag = advancedFilters.tags.some(tagId => 
          task.tags?.includes(tagId)
        );
        
        if (!hasMatchingTag) return false;
      }
      
      // Nach zugewiesenen Benutzern filtern
      if (advancedFilters.assignedTo.length > 0) {
        if (!task.assignedTo || !Array.isArray(task.assignedTo)) return false;
        
        const hasMatchingUser = advancedFilters.assignedTo.some(userId => 
          task.assignedTo?.includes(userId)
        );
        
        if (!hasMatchingUser) return false;
      }
      
      // Nach Fortschritt filtern
      if (advancedFilters.minimumProgress > 0) {
        const taskProgress = task.progress || 0;
        if (taskProgress < advancedFilters.minimumProgress) {
          return false;
        }
      }
      
      return true;
    });
  }, [
    tasks, 
    searchQuery, 
    statusFilter, 
    priorityFilter, 
    advancedFilters
  ]);
  
  // Sortierte Aufgaben
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Erledigte Aufgaben nach unten
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      
      // Nach Priorität (hoch -> mittel -> niedrig)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Nach Fälligkeit (früher fällig zuerst)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }
      
      // Nach Erstellungsdatum (neuer zuerst)
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [filteredTasks]);
  
  // Status-Statistiken
  const statusStats = useMemo(() => {
    const stats = {
      all: tasks.filter(t => t.status !== 'archived' && t.status !== 'deleted').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      done: tasks.filter(t => t.status === 'done').length,
      archived: tasks.filter(t => t.status === 'archived').length,
      deleted: tasks.filter(t => t.status === 'deleted').length,
    };
    
    return stats;
  }, [tasks]);
  
  // Überfällige Aufgaben
  const overdueTasksCount = useMemo(() => {
    const now = startOfDay(new Date());
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'done' || task.completed) return false;
      return new Date(task.dueDate) < now;
    }).length;
  }, [tasks]);

  // Zurücksetzen aller Filter
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAdvancedFilters(defaultFilters);
  }, []);

  // Aktualisieren der erweiterten Filter
  const updateAdvancedFilters = useCallback((newFilters: TaskFilters) => {
    setAdvancedFilters(newFilters);
    
    // Synchronisieren der einfachen Filter mit den erweiterten Filtern
    // wenn nur ein einzelner Status ausgewählt ist
    if (newFilters.status.length === 1) {
      setStatusFilter(newFilters.status[0]);
    } else {
      setStatusFilter('all');
    }
    
    // wenn nur eine einzelne Priorität ausgewählt ist
    if (newFilters.priority.length === 1) {
      setPriorityFilter(newFilters.priority[0]);
    } else {
      setPriorityFilter('all');
    }
  }, []);

  return {
    tasks,
    filteredTasks: sortedTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    viewMode,
    setViewMode,
    statusStats,
    overdueTasksCount,
    advancedFilters,
    updateAdvancedFilters,
    resetFilters
  };
};
