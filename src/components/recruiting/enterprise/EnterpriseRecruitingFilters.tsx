import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface EnterpriseRecruitingFiltersProps {
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  onResetFilters: () => void;
}

const EnterpriseRecruitingFilters = ({
  selectedCountry,
  setSelectedCountry,
  selectedLocation,
  setSelectedLocation,
  selectedDepartment,
  setSelectedDepartment,
  onResetFilters,
}: EnterpriseRecruitingFiltersProps) => {
  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-card rounded-lg border">
      <Filter className="h-4 w-4 text-muted-foreground" />
      
      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Alle Länder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Länder</SelectItem>
          <SelectItem value="deutschland">Deutschland</SelectItem>
          <SelectItem value="schweiz">Schweiz</SelectItem>
          <SelectItem value="oesterreich">Österreich</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Alle Standorte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Standorte</SelectItem>
          <SelectItem value="berlin">Berlin</SelectItem>
          <SelectItem value="muenchen">München</SelectItem>
          <SelectItem value="hamburg">Hamburg</SelectItem>
          <SelectItem value="zuerich">Zürich</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Alle Abteilungen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Abteilungen</SelectItem>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="hr">HR</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="link" onClick={onResetFilters} className="text-muted-foreground hover:text-foreground">
        Filter zurücksetzen
      </Button>
    </div>
  );
};

export default EnterpriseRecruitingFilters;
