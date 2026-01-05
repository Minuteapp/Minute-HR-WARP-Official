
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Filter, ZoomIn, ZoomOut } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ProjectFormData } from "@/hooks/projects/types";

interface GanttChartProps {
  project: ProjectFormData;
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export const GanttChart = ({ project, onTaskUpdate }: GanttChartProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [filteredTasks, setFilteredTasks] = useState(project.tasks || []);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // Calculate the visible date range based on the view mode
  const getDateRange = () => {
    const end = new Date(startDate);
    switch (viewMode) {
      case 'day':
        end.setDate(startDate.getDate() + 1);
        break;
      case 'week':
        end.setDate(startDate.getDate() + 7);
        break;
      case 'month':
        end.setMonth(startDate.getMonth() + 1);
        break;
    }
    return { start: startDate, end };
  };

  // Generate dates for the timeline header
  const generateTimelineHeaders = () => {
    const { start, end } = getDateRange();
    const dates = [];
    const current = new Date(start);

    while (current < end) {
      dates.push(new Date(current));
      switch (viewMode) {
        case 'day':
          current.setHours(current.getHours() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 1);
          break;
        case 'month':
          current.setDate(current.getDate() + 1);
          break;
      }
    }
    return dates;
  };

  // Navigate through time
  const handlePrevious = () => {
    const newDate = new Date(startDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setStartDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(startDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setStartDate(newDate);
  };

  // Filter tasks based on priority
  useEffect(() => {
    if (filterPriority) {
      setFilteredTasks((project.tasks || []).filter(task => task.priority === filterPriority));
    } else {
      setFilteredTasks(project.tasks || []);
    }
  }, [filterPriority, project.tasks]);

  // Format the date display based on view mode
  const formatHeaderDate = (date: Date) => {
    switch (viewMode) {
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString([], { day: 'numeric' });
    }
  };

  // Calculate task position and width in the timeline
  const getTaskPosition = (task: any) => {
    if (!task.dueDate) return { left: 0, width: '10%' };
    
    const taskDate = new Date(task.dueDate);
    const { start, end } = getDateRange();
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const taskDays = (taskDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    const left = Math.max(0, Math.min(100, (taskDays / totalDays) * 100));
    
    // Placeholder for task duration - in a real app, you'd calculate based on start/end dates
    const width = 10; // Percentage width
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Get color based on task priority
  const getTaskColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const timelineHeaders = generateTimelineHeaders();

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Gantt-Chart: Projektzeitleiste
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ansicht" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Tag</SelectItem>
                <SelectItem value="week">Woche</SelectItem>
                <SelectItem value="month">Monat</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filterPriority || ''} 
              onValueChange={(value) => setFilterPriority(value || null)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priorität" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="gantt-container overflow-x-auto">
          {/* Timeline header */}
          <div className="gantt-header grid grid-cols-[150px_1fr] border-b">
            <div className="py-2 px-3 border-r font-medium text-sm">Aufgabe</div>
            <div className="timeline-header flex">
              {timelineHeaders.map((date, index) => (
                <div 
                  key={index} 
                  className="timeline-header-cell flex-1 p-2 text-center text-sm font-medium border-r last:border-r-0"
                >
                  {formatHeaderDate(date)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Tasks */}
          <div className="gantt-body">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <div key={task.id} className="gantt-row grid grid-cols-[150px_1fr] border-b hover:bg-gray-50">
                  <div className="task-info py-3 px-3 border-r truncate">
                    <div className="font-medium text-sm">{task.title || "Unbenannte Aufgabe"}</div>
                    <div className="text-xs text-gray-500">{task.dueDate ? formatDate(task.dueDate) : "Kein Datum"}</div>
                  </div>
                  <div className="timeline-cells relative" style={{ height: "60px" }}>
                    {/* Task bar */}
                    <div 
                      className={`absolute top-1/4 h-1/2 rounded-md ${getTaskColor(task.priority)} text-white text-xs flex items-center justify-center cursor-pointer`}
                      style={getTaskPosition(task)}
                      title={`${task.title}: ${task.dueDate ? formatDate(task.dueDate) : "Kein Datum"}`}
                    >
                      {task.title.substring(0, 10)}{task.title.length > 10 ? '...' : ''}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Keine Aufgaben gefunden. Fügen Sie Aufgaben hinzu, um sie im Gantt-Chart zu sehen.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
