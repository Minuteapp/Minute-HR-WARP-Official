
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmployeeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  companyFilter?: string;
  onCompanyFilterChange?: (value: string) => void;
  companies?: Array<{ id: string, name: string }>;
}

export const EmployeeSearchBar = ({ 
  value, 
  onChange,
  companyFilter,
  onCompanyFilterChange,
  companies = []
}: EmployeeSearchBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Mitarbeiter suchen..."
          className="pl-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      
      {onCompanyFilterChange && (
        <div className="w-full md:w-64">
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={companyFilter}
            onChange={(e) => onCompanyFilterChange(e.target.value)}
          >
            <option value="">Alle Firmen</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
