import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List, Plus } from 'lucide-react';

interface ApplicationsHeaderProps {
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
  onCreateClick: () => void;
}

const ApplicationsHeader = ({ viewMode, onViewModeChange, onCreateClick }: ApplicationsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Bewerbungen (Pipeline)</h2>
        <p className="text-sm text-muted-foreground">
          Verwaltung des kompletten Bewerbungsprozesses
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && onViewModeChange(value as 'kanban' | 'table')}
          className="border rounded-lg"
        >
          <ToggleGroupItem value="kanban" aria-label="Kanban-Ansicht" className="px-3">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Tabellen-Ansicht" className="px-3">
            <List className="h-4 w-4 mr-2" />
            Tabelle
          </ToggleGroupItem>
        </ToggleGroup>
        
        <Button onClick={onCreateClick} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Bewerbung erfassen
        </Button>
      </div>
    </div>
  );
};

export default ApplicationsHeader;
