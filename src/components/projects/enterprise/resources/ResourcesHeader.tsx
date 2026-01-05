import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';

const ResourcesHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ressourcen & Kapazitäten</h2>
        <p className="text-muted-foreground">Team-Auslastung, Verfügbarkeiten und Skill-Management</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4 mr-2" />
          Ressource zuweisen
        </Button>
      </div>
    </div>
  );
};

export default ResourcesHeader;
