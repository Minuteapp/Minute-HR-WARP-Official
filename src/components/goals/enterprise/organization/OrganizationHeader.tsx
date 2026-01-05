import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Building2, Target } from "lucide-react";

interface OrganizationHeaderProps {
  viewMode: 'structure' | 'goals';
  onViewModeChange: (mode: 'structure' | 'goals') => void;
}

export const OrganizationHeader = ({ viewMode, onViewModeChange }: OrganizationHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold">Organisation & Zielzuordnung</h2>
        <p className="text-muted-foreground">
          Hierarchie von Bereichen, Teams und Mitarbeiterzielen
        </p>
      </div>
      <ToggleGroup 
        type="single" 
        value={viewMode} 
        onValueChange={(value) => value && onViewModeChange(value as 'structure' | 'goals')}
        className="bg-muted p-1 rounded-lg"
      >
        <ToggleGroupItem value="structure" className="flex items-center gap-2 px-4">
          <Building2 className="h-4 w-4" />
          Struktur
        </ToggleGroupItem>
        <ToggleGroupItem value="goals" className="flex items-center gap-2 px-4">
          <Target className="h-4 w-4" />
          Ziele
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
