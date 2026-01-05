import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ResourcesFiltersProps {
  departmentFilter: string;
  memberFilter: string;
  onDepartmentChange: (value: string) => void;
  onMemberChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  departments: string[];
  members: { id: string; name: string }[];
}

const ResourcesFilters = ({
  departmentFilter,
  memberFilter,
  onDepartmentChange,
  onMemberChange,
  filteredCount,
  totalCount,
  departments,
  members
}: ResourcesFiltersProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filter:</span>
        </div>
        <Select value={departmentFilter} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={memberFilter} onValueChange={onMemberChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Mitarbeiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        {filteredCount} von {totalCount} Mitarbeitern
      </Badge>
    </div>
  );
};

export default ResourcesFilters;
