
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface TemplateSearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  { value: 'documents', label: 'Dokumente' },
  { value: 'goals', label: 'Ziele' },
  { value: 'performance', label: 'Performance' },
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'payroll', label: 'Lohn & Gehalt' },
  { value: 'training', label: 'Weiterbildung' },
  { value: 'budget', label: 'Budget' },
  { value: 'custom', label: 'Eigene' }
];

export const TemplateSearchAndFilter = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: TemplateSearchAndFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Templates durchsuchen..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory || ''} onValueChange={(value) => onCategoryChange(value || null)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Kategorien</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchTerm || selectedCategory) && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                onSearchChange('');
                onCategoryChange(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {(searchTerm || selectedCategory) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Suche: "{searchTerm}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Kategorie: {categories.find(c => c.value === selectedCategory)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onCategoryChange(null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
