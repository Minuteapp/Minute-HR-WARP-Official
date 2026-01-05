import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface TasksFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedProject: string;
  onProjectChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  projects: Project[];
}

const TasksFilters = ({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  projects
}: TasksFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Aufgaben durchsuchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={selectedProject} onValueChange={onProjectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Projekte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Projekte</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Alle Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="todo">Zu erledigen</SelectItem>
          <SelectItem value="in_progress">In Arbeit</SelectItem>
          <SelectItem value="blocked">Blockiert</SelectItem>
          <SelectItem value="completed">Abgeschlossen</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedPriority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Alle Prioritäten" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Prioritäten</SelectItem>
          <SelectItem value="critical">Kritisch</SelectItem>
          <SelectItem value="high">Hoch</SelectItem>
          <SelectItem value="medium">Mittel</SelectItem>
          <SelectItem value="low">Niedrig</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TasksFilters;
