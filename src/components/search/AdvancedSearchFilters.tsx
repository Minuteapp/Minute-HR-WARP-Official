export interface SearchFilters {
  types?: string[];
  dateFrom?: string;
  dateTo?: string;
  author?: string;
  tags?: string[];
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const AdvancedSearchFilters = ({ filters, onFiltersChange }: AdvancedSearchFiltersProps) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-sm font-medium mb-3">Erweiterte Filter</h3>
      {/* Platzhalter für Filter-UI */}
      <p className="text-xs text-gray-500">Filter-Optionen werden hier implementiert</p>
    </div>
  );
};

export default AdvancedSearchFilters;
