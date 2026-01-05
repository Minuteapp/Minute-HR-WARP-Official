import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationFilterDropdownsProps {
  statusFilter: string;
  priorityFilter: string;
  moduleFilter: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onModuleChange: (value: string) => void;
}

const NotificationFilterDropdowns = ({
  statusFilter,
  priorityFilter,
  moduleFilter,
  onStatusChange,
  onPriorityChange,
  onModuleChange,
}: NotificationFilterDropdownsProps) => {
  return (
    <div className="flex gap-3">
      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Alle Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="unread">Ungelesen</SelectItem>
          <SelectItem value="read">Gelesen</SelectItem>
          <SelectItem value="archived">Archiviert</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Prioritäten" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Prioritäten</SelectItem>
          <SelectItem value="kritisch">Kritisch</SelectItem>
          <SelectItem value="wichtig">Wichtig</SelectItem>
          <SelectItem value="hinweis">Hinweis</SelectItem>
          <SelectItem value="info">Info</SelectItem>
        </SelectContent>
      </Select>

      {/* Module Filter */}
      <Select value={moduleFilter} onValueChange={onModuleChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Alle Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Module</SelectItem>
          <SelectItem value="schichtplanung">Schichtplanung</SelectItem>
          <SelectItem value="aufgaben">Aufgaben</SelectItem>
          <SelectItem value="performance">Performance</SelectItem>
          <SelectItem value="compliance">Compliance Hub</SelectItem>
          <SelectItem value="zeiterfassung">Zeiterfassung</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NotificationFilterDropdowns;
