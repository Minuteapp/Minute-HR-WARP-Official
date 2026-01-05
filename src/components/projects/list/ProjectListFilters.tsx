
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter, Search, Archive } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProjectListFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  showArchivedOrTrash?: boolean;
  onArchivedFilterChange?: (show: boolean) => void;
}

export const ProjectListFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  showArchivedOrTrash = false,
  onArchivedFilterChange
}: ProjectListFiltersProps) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Suche nach Projekten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>Status</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Anstehend</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="archived">Archiv</SelectItem>
              <SelectItem value="trash">Papierkorb</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>Priorität</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Prioritäten</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {onArchivedFilterChange && (
          <div className="flex items-center gap-2">
            <Switch 
              id="archived-filter"
              checked={showArchivedOrTrash}
              onCheckedChange={onArchivedFilterChange}
            />
            <Label htmlFor="archived-filter" className="flex items-center gap-1 cursor-pointer">
              <Archive size={16} />
              <span className="text-sm">Archiv/Papierkorb</span>
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};
