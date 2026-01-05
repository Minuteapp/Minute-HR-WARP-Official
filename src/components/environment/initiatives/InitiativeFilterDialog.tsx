
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { CheckIcon, X } from 'lucide-react';

interface InitiativeFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InitiativeFilterDialog: React.FC<InitiativeFilterDialogProps> = ({
  open,
  onOpenChange,
}) => {
  // State für die Filter
  const [filters, setFilters] = useState({
    status: {
      planned: true,
      inProgress: true,
      completed: true,
      archived: false,
    },
    progressRange: [0, 100],
    tags: [],
    searchTerm: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  // Dummy Tags für das Demo-UI
  const availableTags = [
    'Energie', 'Abfall', 'Wasser', 'Transport', 'Bildung', 'CO2-Reduktion'
  ];

  const handleStatusChange = (key: string) => {
    setFilters(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [key]: !prev.status[key as keyof typeof prev.status],
      }
    }));
  };

  const handleProgressChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      progressRange: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => {
      const tags = [...prev.tags];
      const index = tags.indexOf(tag);
      
      if (index > -1) {
        tags.splice(index, 1);
      } else {
        tags.push(tag);
      }
      
      return {
        ...prev,
        tags,
      };
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: e.target.value,
      }
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: {
        planned: true,
        inProgress: true,
        completed: true,
        archived: false,
      },
      progressRange: [0, 100],
      tags: [],
      searchTerm: '',
      dateRange: {
        start: '',
        end: '',
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter für Initiativen
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" /> Filter zurücksetzen
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Suchfeld */}
          <div className="space-y-2">
            <Label>Suche</Label>
            <Input 
              placeholder="Nach Titel oder Beschreibung suchen..." 
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="status-planned" 
                  checked={filters.status.planned}
                  onCheckedChange={() => handleStatusChange('planned')}
                />
                <Label htmlFor="status-planned" className="cursor-pointer">Geplant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="status-inProgress" 
                  checked={filters.status.inProgress}
                  onCheckedChange={() => handleStatusChange('inProgress')}
                />
                <Label htmlFor="status-inProgress" className="cursor-pointer">In Bearbeitung</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="status-completed" 
                  checked={filters.status.completed}
                  onCheckedChange={() => handleStatusChange('completed')}
                />
                <Label htmlFor="status-completed" className="cursor-pointer">Abgeschlossen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="status-archived" 
                  checked={filters.status.archived}
                  onCheckedChange={() => handleStatusChange('archived')}
                />
                <Label htmlFor="status-archived" className="cursor-pointer">Archiviert</Label>
              </div>
            </div>
          </div>

          {/* Fortschritt Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fortschritt</Label>
              <span className="text-sm text-gray-500">
                {filters.progressRange[0]}% - {filters.progressRange[1]}%
              </span>
            </div>
            <Slider
              defaultValue={[0, 100]}
              value={filters.progressRange}
              onValueChange={handleProgressChange}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Zeitraum Filter */}
          <div className="space-y-3">
            <Label>Zeitraum</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Von</Label>
                <Input 
                  type="date" 
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateChange(e, 'start')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Bis</Label>
                <Input 
                  type="date" 
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateChange(e, 'end')}
                />
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isSelected = filters.tags.includes(tag);
                return (
                  <Button
                    key={tag}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTagToggle(tag)}
                    className="flex items-center gap-1 text-xs h-8 rounded-full"
                  >
                    {isSelected && <CheckIcon className="h-3 w-3" />}
                    {tag}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Filter anwenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
