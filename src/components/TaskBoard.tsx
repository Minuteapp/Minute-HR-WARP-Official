import React from 'react';
import { KanbanBoard } from './KanbanBoard';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { useEnhancedTasks } from './hooks/useEnhancedTasks';
import { useProjectsAndRoadmaps } from './hooks/useProjectsAndRoadmaps';

interface TaskBoardProps {
  view: 'kanban' | 'list' | 'calendar';
  selectedProjectId?: string;
  selectedRoadmapId?: string;
  userRole: 'admin' | 'manager' | 'member';
  onTaskClick: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onDelete?: (taskId: string) => void;
  tasks?: any[];
}

export function TaskBoard({ 
  view, 
  selectedProjectId, 
  selectedRoadmapId, 
  userRole,
  onTaskClick,
  onTaskUpdate,
  onDelete,
  tasks: propTasks
}: TaskBoardProps) {
  const { tasks: hookTasks } = useEnhancedTasks(userRole);
  const { projects } = useProjectsAndRoadmaps();
  
  // Use provided tasks or fallback to hook tasks
  const tasks = propTasks || hookTasks;

  // Filter tasks based on selected project or roadmap
  const filteredTasks = React.useMemo(() => {
    let filtered = tasks;

    if (selectedProjectId) {
      // Show tasks for selected project
      filtered = tasks.filter(task => task.projectId === selectedProjectId);
    } else if (selectedRoadmapId) {
      // Show tasks for all projects in selected roadmap
      const roadmapProjects = projects.filter(project => project.roadmapId === selectedRoadmapId);
      const roadmapProjectIds = roadmapProjects.map(project => project.id);
      filtered = tasks.filter(task => roadmapProjectIds.includes(task.projectId));
    }

    return filtered;
  }, [tasks, selectedProjectId, selectedRoadmapId, projects]);

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { status: newStatus });
    }
  };

  // Common props for all views
  const commonProps = {
    tasks: filteredTasks,
    onTaskClick,
    selectedProjectId,
    selectedRoadmapId,
    onTaskStatusChange: handleTaskStatusChange,
    onDelete
  };

  if (view === 'kanban') {
    return <KanbanBoard {...commonProps} />;
  }

  if (view === 'list') {
    return <ListView {...commonProps} />;
  }

  if (view === 'calendar') {
    return <CalendarView {...commonProps} />;
  }

  return null;
}