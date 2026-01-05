
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RelocationHeaderProps {
  onCreateClick: () => void;
}

export function RelocationHeader({ onCreateClick }: RelocationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Relocation & Logistik</h2>
        <p className="text-muted-foreground">Verwalten Sie alle Umzugs- und Logistikaufgaben für Entsendungen</p>
      </div>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Aufgabe hinzufügen
      </Button>
    </div>
  );
}
