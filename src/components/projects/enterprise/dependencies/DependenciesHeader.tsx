import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const DependenciesHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Abhängigkeiten & Risiken</h2>
        <p className="text-muted-foreground">Risiko-Management und Projekt-Abhängigkeiten</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Abhängigkeit
        </Button>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Risiko hinzufügen
        </Button>
      </div>
    </div>
  );
};

export default DependenciesHeader;
