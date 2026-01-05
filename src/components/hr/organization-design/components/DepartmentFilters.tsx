import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { departmentsService, DepartmentFilters as Filters } from "@/services/departmentsService";

interface DepartmentFiltersProps {
  onFiltersChange: (filters: Filters) => void;
}

export const DepartmentFilters = ({ onFiltersChange }: DepartmentFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<Filters>({});

  const { data: filterOptions } = useQuery({
    queryKey: ['department-filter-options'],
    queryFn: () => departmentsService.getFilterOptions(),
  });

  const updateFilter = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card className="w-80 h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Abteilung/Leiter Suche */}
        <div className="space-y-2">
          <Label>Abteilung / Leiter</Label>
          <Input
            placeholder="Suchen..."
            value={localFilters.department || ''}
            onChange={(e) => updateFilter('department', e.target.value)}
          />
        </div>

        {/* Standorte */}
        <div className="space-y-2">
          <Label>Standorte</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions?.locations.map((location) => (
              <div key={location} className="flex items-center gap-2">
                <Checkbox
                  id={location}
                  checked={localFilters.location === location}
                  onCheckedChange={(checked) => 
                    updateFilter('location', checked ? location : undefined)
                  }
                />
                <label htmlFor={location} className="text-sm cursor-pointer">
                  {location}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets */}
        <div className="space-y-2">
          <Label>Budgets (€)</Label>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Min</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.budgetMin || ''}
                onChange={(e) => updateFilter('budgetMin', Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Max</Label>
              <Input
                type="number"
                placeholder="1000000"
                value={localFilters.budgetMax || ''}
                onChange={(e) => updateFilter('budgetMax', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-2">
          <Label>Performance (%)</Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[localFilters.performanceMin || 0, localFilters.performanceMax || 100]}
            onValueChange={([min, max]) => {
              updateFilter('performanceMin', min);
              updateFilter('performanceMax', max);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{localFilters.performanceMin || 0}%</span>
            <span>{localFilters.performanceMax || 100}%</span>
          </div>
        </div>

        {/* Fluktuation */}
        <div className="space-y-2">
          <Label>Fluktuation (%)</Label>
          <Slider
            min={0}
            max={20}
            step={1}
            value={[localFilters.turnoverMin || 0, localFilters.turnoverMax || 20]}
            onValueChange={([min, max]) => {
              updateFilter('turnoverMin', min);
              updateFilter('turnoverMax', max);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{localFilters.turnoverMin || 0}%</span>
            <span>{localFilters.turnoverMax || 20}%</span>
          </div>
        </div>

        {/* Kapazitäten */}
        <div className="space-y-2">
          <Label>Auslastung (%)</Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[localFilters.utilizationMin || 0, localFilters.utilizationMax || 100]}
            onValueChange={([min, max]) => {
              updateFilter('utilizationMin', min);
              updateFilter('utilizationMax', max);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{localFilters.utilizationMin || 0}%</span>
            <span>{localFilters.utilizationMax || 100}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
