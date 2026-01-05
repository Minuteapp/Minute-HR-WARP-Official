import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterState {
  search: string;
  level: string;
  type: string;
  status: string;
  onlyApproved: boolean;
  onlyDepartment: boolean;
  onlyAnnual: boolean;
}

interface BudgetFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export const BudgetFilterPanel: React.FC<BudgetFilterPanelProps> = ({
  open,
  onOpenChange,
  filters,
  onApply,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      level: 'all',
      type: 'all',
      status: 'all',
      onlyApproved: false,
      onlyDepartment: false,
      onlyAnnual: false,
    };
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Search */}
          <div>
            <Label htmlFor="search">Suche</Label>
            <Input
              id="search"
              value={localFilters.search}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
              placeholder="Budget-Name suchen..."
            />
          </div>

          {/* Level */}
          <div>
            <Label>Budget-Ebene</Label>
            <Select
              value={localFilters.level}
              onValueChange={(value) => setLocalFilters({ ...localFilters, level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle Ebenen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Ebenen</SelectItem>
                <SelectItem value="company">Unternehmen</SelectItem>
                <SelectItem value="subsidiary">Gesellschaft</SelectItem>
                <SelectItem value="location">Standort</SelectItem>
                <SelectItem value="department">Abteilung</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="project">Projekt</SelectItem>
                <SelectItem value="cost_center">Kostenstelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div>
            <Label>Budget-Typ</Label>
            <Select
              value={localFilters.type}
              onValueChange={(value) => setLocalFilters({ ...localFilters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="annual">Jahresbudget</SelectItem>
                <SelectItem value="quarterly">Quartalsbudget</SelectItem>
                <SelectItem value="project">Projektbudget</SelectItem>
                <SelectItem value="personnel">Personalbudget</SelectItem>
                <SelectItem value="investment">Investitionsbudget</SelectItem>
                <SelectItem value="esg">ESG-Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="approved">Freigegeben</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="locked">Gesperrt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label>Schnellfilter</Label>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="onlyApproved"
                checked={localFilters.onlyApproved}
                onCheckedChange={(checked) => 
                  setLocalFilters({ ...localFilters, onlyApproved: !!checked })
                }
              />
              <Label htmlFor="onlyApproved" className="font-normal cursor-pointer">
                Nur freigegebene Budgets
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="onlyDepartment"
                checked={localFilters.onlyDepartment}
                onCheckedChange={(checked) => 
                  setLocalFilters({ ...localFilters, onlyDepartment: !!checked })
                }
              />
              <Label htmlFor="onlyDepartment" className="font-normal cursor-pointer">
                Nur Abteilungs-Budgets
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="onlyAnnual"
                checked={localFilters.onlyAnnual}
                onCheckedChange={(checked) => 
                  setLocalFilters({ ...localFilters, onlyAnnual: !!checked })
                }
              />
              <Label htmlFor="onlyAnnual" className="font-normal cursor-pointer">
                Nur Jahresbudgets
              </Label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Zurücksetzen
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Anwenden
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
