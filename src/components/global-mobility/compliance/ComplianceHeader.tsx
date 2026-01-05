
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ComplianceHeaderProps {
  onCreateClick: () => void;
}

export function ComplianceHeader({ onCreateClick }: ComplianceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Visa, Steuern & Compliance</h2>
        <p className="text-muted-foreground">Überwachen Sie alle Compliance-Anforderungen für internationale Entsendungen</p>
      </div>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Compliance-Eintrag anlegen
      </Button>
    </div>
  );
}
