import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import TasksStatsCards from './TasksStatsCards';
import TasksFilters from './TasksFilters';
import TasksViewTabs from './TasksViewTabs';
import KanbanBoard from './views/KanbanBoard';
import TaskListView from './views/TaskListView';

type ViewType = 'kanban' | 'list';

const EnterpriseTasksTab = () => {
  const [activeView, setActiveView] = useState<ViewType>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isEmployee, hasAction } = useEnterprisePermissions();
  const canCreateTask = hasAction('projects', 'create');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      const { data: tasksData, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          *,
          projects:project_id (name)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      const mappedTasks = (tasksData || []).map(task => ({
        id: task.id,
        taskId: `TSK-${task.id.slice(0, 4).toUpperCase()}`,
        title: task.title,
        description: task.description || '',
        status: mapStatus(task.status),
        priority: mapPriority(task.priority),
        projectName: task.projects?.name || 'Unbekanntes Projekt',
        projectId: task.project_id,
        assignee: task.assignee || 'Nicht zugewiesen',
        dueDate: new Date(task.due_date || new Date()),
        storyPoints: task.story_points || 0
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Fehler beim Laden der Aufgaben');
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status: string): 'todo' | 'in_progress' | 'blocked' | 'completed' => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'completed';
      case 'in_progress':
        return 'in_progress';
      case 'blocked':
        return 'blocked';
      default:
        return 'todo';
    }
  };

  const mapPriority = (priority: string): 'critical' | 'high' | 'medium' | 'low' => {
    switch (priority) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProject = selectedProject === 'all' || task.projectId === selectedProject;
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

      return matchesSearch && matchesProject && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, selectedProject, selectedStatus, selectedPriority]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {isEmployee ? 'Meine Aufgaben' : 'Aufgaben'}
          </CardTitle>
          {canCreateTask && (
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Neue Aufgabe
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TasksStatsCards stats={stats} />
        
        <TasksFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          projects={projects}
        />

        <TasksViewTabs activeView={activeView} onViewChange={setActiveView} />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {activeView === 'kanban' && (
              <KanbanBoard tasks={filteredTasks} />
            )}
            {activeView === 'list' && (
              <TaskListView tasks={filteredTasks} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnterpriseTasksTab;
