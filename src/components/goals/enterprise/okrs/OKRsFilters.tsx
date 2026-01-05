import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface OKRsFiltersProps {
  levelFilter: string;
  typeFilter: string;
  onLevelChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCreateClick: () => void;
}

export const OKRsFilters = ({ 
  levelFilter, 
  typeFilter, 
  onLevelChange, 
  onTypeChange, 
  onCreateClick 
}: OKRsFiltersProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Select value={levelFilter} onValueChange={onLevelChange}>
        <SelectTrigger className="w-40">
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
        <SelectTrigger className="w-40">
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

      <div className="flex-1" />

      <Button onClick={onCreateClick} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Neues Ziel
      </Button>
    </div>
  );
};
