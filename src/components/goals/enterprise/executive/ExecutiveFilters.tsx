import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExecutiveFiltersProps {
  levelFilter: string;
  typeFilter: string;
  onLevelChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export const ExecutiveFilters = ({
  levelFilter,
  typeFilter,
  onLevelChange,
  onTypeChange
}: ExecutiveFiltersProps) => {
  return (
    <div className="flex gap-4">
      <Select value={levelFilter} onValueChange={onLevelChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Ebenen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Ebenen</SelectItem>
          <SelectItem value="company">Unternehmen</SelectItem>
          <SelectItem value="department">Bereich</SelectItem>
          <SelectItem value="team">Team</SelectItem>
          <SelectItem value="individual">Individual</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Typen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Typen</SelectItem>
          <SelectItem value="strategic">Strategisch</SelectItem>
          <SelectItem value="operational">Operativ</SelectItem>
          <SelectItem value="project">Projektbezogen</SelectItem>
          <SelectItem value="okr">OKR</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
