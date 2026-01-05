
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Download, Search } from "lucide-react";

interface EmployeeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  teamFilter: string;
  setTeamFilter: (team: string) => void;
  employmentTypeFilter: string;
  setEmploymentTypeFilter: (type: string) => void;
  onExport: () => void;
  onClearFilters: () => void;
}

const EmployeeFilters = ({
  searchQuery,
  setSearchQuery,
  teamFilter,
  setTeamFilter,
  employmentTypeFilter,
  setEmploymentTypeFilter,
  onExport,
  onClearFilters,
}: EmployeeFiltersProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, Email, Mitarbeiternr. oder Team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Teams</SelectItem>
            <SelectItem value="entwicklung">Entwicklung</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="vertrieb">Vertrieb</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Arten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Arten</SelectItem>
            <SelectItem value="full_time">Vollzeit</SelectItem>
            <SelectItem value="part_time">Teilzeit</SelectItem>
            <SelectItem value="temporary">Befristet</SelectItem>
            <SelectItem value="freelance">Freiberuflich</SelectItem>
            <SelectItem value="intern">Praktikant</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Standorte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Standorte</SelectItem>
            <SelectItem value="berlin">Berlin</SelectItem>
            <SelectItem value="muenchen">München</SelectItem>
            <SelectItem value="hamburg">Hamburg</SelectItem>
            <SelectItem value="koeln">Köln</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Positionen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Positionen</SelectItem>
            <SelectItem value="developer">Entwickler</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="lead">Team Lead</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Zurücksetzen
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default EmployeeFilters;
