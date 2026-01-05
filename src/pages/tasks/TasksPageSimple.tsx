import React, { useState } from 'react';
import { Plus, LayoutGrid, List, Calendar, Settings, Filter, Search, ChevronDown, Archive, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { HierarchyBreadcrumb } from '@/components/HierarchyBreadcrumb';
import { useEnhancedTasks } from '@/components/hooks/useEnhancedTasks';
import { useProjectsAndRoadmaps } from '@/components/hooks/useProjectsAndRoadmaps';
import TaskDetailDialog from '@/components/dialogs/TaskDetailDialog';
import AddTaskDialog from '@/components/dialogs/AddTaskDialog';
import { useTaskDetail } from '@/hooks/tasks/useTaskDetail';
import type { Task } from '@/types/tasks';
import { format, isPast } from 'date-fns';
import { de } from 'date-fns/locale';

export default function TasksPageSimple() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [sortBy, setSortBy] = useState<string>('status');

  const { tasks } = useEnhancedTasks('member');
  const { projects, roadmaps } = useProjectsAndRoadmaps();
  
  const {
    selectedTask,
    isDetailOpen,
    setIsDetailOpen,
    isAddTaskOpen,
    setIsAddTaskOpen,
    handleTaskClick,
    handleTaskStatusChange,
    handleTaskComplete,
  } = useTaskDetail();

  // Filter tasks based on selected project/roadmap and search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (selectedProjectId) {
      return task.projectId === selectedProjectId && matchesSearch;
    }
    if (selectedRoadmapId) {
      const roadmapProjects = projects.filter(p => p.roadmapId === selectedRoadmapId);
      return roadmapProjects.some(p => p.id === task.projectId) && matchesSearch;
    }
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': 
      case 'urgent': 
        return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'Zu erledigen';
      case 'in-progress': return 'In Bearbeitung';
      case 'done': return 'Erledigt';
      case 'review': return 'Review';
      case 'blocked': return 'Blockiert';
      default: return 'Zu erledigen';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': 
      case 'urgent':
        return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return 'Mittel';
    }
  };

  const isOverdue = (task: any) => {
    return task.dueDate ? isPast(new Date(task.dueDate)) && !task.completed : false;
  };

  const getProjectName = (projectId?: string) => {
    if (projectId === 'proj-1') return 'Kampagne Social Media';
    if (projectId === 'proj-2') return 'Website Relaunch';  
    if (projectId === 'proj-3') return 'Mobile App Development';
    if (projectId === 'proj-4') return 'CRM Integration';
    if (projectId === 'proj-5') return 'E-Commerce Platform';
    return 'Website Relaunch';
  };

  const getAssigneeName = (assignedTo?: string[] | string) => {
    // Handle both assignedTo (array) and assignee (string) for ExtendedTask compatibility
    let assignee: string | undefined;
    if (Array.isArray(assignedTo)) {
      assignee = assignedTo[0];
    } else if (typeof assignedTo === 'string') {
      assignee = assignedTo;
    } else {
      // Check if task has assignee property (ExtendedTask)
      const task = assignedTo as any;
      assignee = task?.assignee;
    }
    
    if (!assignee) return 'Tom Weber';
    if (assignee === 'user1') return 'Sarah Klein';
    if (assignee === 'user2') return 'Anna Schmidt';
    if (assignee === 'user3') return 'Max Bauer';
    if (assignee === 'user4') return 'David Meyer';
    if (assignee === 'user5') return 'Peter Wagner';
    if (assignee === 'user6') return 'Robert Schneider';
    if (assignee === 'user7') return 'Lisa Müller';
    return assignee;
  };

  const getAssigneeFromTask = (task: any): string => {
    // For ExtendedTask compatibility - check both assignedTo and assignee
    if (task.assignedTo && Array.isArray(task.assignedTo)) {
      return getAssigneeName(task.assignedTo);
    }
    if (task.assignee) {
      return getAssigneeName(task.assignee);
    }
    return 'Tom Weber';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar
        selectedProjectId={selectedProjectId}
        selectedRoadmapId={selectedRoadmapId}
        onProjectSelect={setSelectedProjectId}
        onRoadmapSelect={setSelectedRoadmapId}
        userRole="admin"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HierarchyBreadcrumb
          selectedProjectId={selectedProjectId}
          selectedRoadmapId={selectedRoadmapId}
          onProjectSelect={setSelectedProjectId}
          onRoadmapSelect={setSelectedRoadmapId}
          userRole="admin"
        />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Aufgaben Enterprise</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Archive className="h-4 w-4 mr-1" />
                  Archiv
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Papierkorb
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select defaultValue="manager">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-1" />
                Info
              </Button>
              
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Liste
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                Kalender
              </Button>
              
              <Button onClick={() => setIsAddTaskOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Neue Aufgabe
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4 text-sm">
            <div className="flex items-center">
              <span className="text-blue-600 font-medium">{filteredTasks.length}</span>
              <span className="text-gray-600 ml-1">Aufgaben</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 font-medium">{filteredTasks.filter(t => t.status === 'done').length}</span>
              <span className="text-gray-600 ml-1">fertiggestellt</span>
            </div>
            <div className="flex items-center">
              <span className="text-orange-600 font-medium">{filteredTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}</span>
              <span className="text-gray-600 ml-1">dringend</span>
            </div>
            <div className="flex items-center">
              <span className="text-red-600 font-medium">{filteredTasks.filter(t => isOverdue(t)).length}</span>
              <span className="text-gray-600 ml-1">überfällig</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'list' ? (
            /* Liste View */
            <div className="bg-white">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-medium">Alle Aufgaben ({filteredTasks.length})</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Nach Status</SelectItem>
                    <SelectItem value="priority">Nach Priorität</SelectItem>
                    <SelectItem value="dueDate">Nach Fälligkeitsdatum</SelectItem>
                    <SelectItem value="assignee">Nach Zugewiesene Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Aufgabe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Zugewiesen</TableHead>
                    <TableHead>Fälligkeitsdatum</TableHead>
                    <TableHead>Projekt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                     <TableRow 
                       key={task.id}
                       className="cursor-pointer hover:bg-gray-50"
                       onClick={() => handleTaskClick(task as any)}
                     >
                      <TableCell>
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'done' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' :
                          task.status === 'review' ? 'bg-purple-500' :
                          'bg-gray-300'
                        }`} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityText(task.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            {getAssigneeFromTask(task)?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm">
                            {getAssigneeFromTask(task)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className={`text-sm ${isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {format(new Date(task.dueDate), 'yyyy-MM-dd', { locale: de })}
                            {isOverdue(task) && (
                              <Badge className="ml-2 bg-red-100 text-red-800">
                                Überfällig
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 text-xs">🎯</span>
                          </div>
                          <span className="text-sm">
                            {getProjectName(task.projectId)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Kanban Board */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['todo', 'in-progress', 'review', 'done'].map((status) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {status === 'todo' ? 'Zu erledigen' : 
                         status === 'in-progress' ? 'In Bearbeitung' :
                         status === 'review' ? 'Review' : 'Erledigt'}
                      </h3>
                      <Badge variant="secondary">
                        {filteredTasks.filter(task => task.status === status).length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {filteredTasks
                        .filter(task => task.status === status)
                        .map((task) => (
                           <Card 
                             key={task.id} 
                             className="cursor-pointer hover:shadow-md transition-shadow"
                             onClick={() => handleTaskClick(task as any)}
                           >
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">{task.title}</h4>
                              <div className="flex items-center justify-between text-sm">
                                <Badge className={getPriorityColor(task.priority)}>
                                  {getPriorityText(task.priority)}
                                </Badge>
                                {task.dueDate && (
                                  <span className={`text-xs ${
                                    isOverdue(task)
                                      ? 'text-red-600 font-medium' 
                                      : 'text-gray-500'
                                  }`}>
                                    {format(new Date(task.dueDate), 'dd.MM.yy', { locale: de })}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          task={selectedTask}
          onDeleteTask={async () => true}
          onArchiveTask={async () => true}
        />
      )}
      
      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
      />
    </div>
  );
}