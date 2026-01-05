
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmployeesHeaderProps {
  onCreateClick: () => void;
}

export function EmployeesHeader({ onCreateClick }: EmployeesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mitarbeiter & Familienstatus</h2>
        <p className="text-muted-foreground">Verwalten Sie Mitarbeiterdaten für internationale Entsendungen</p>
      </div>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Mitarbeiterdaten erfassen
      </Button>
    </div>
  );
}
