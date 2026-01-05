import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DemandPlanningHeaderProps {
  onNewDemand: () => void;
}

export const DemandPlanningHeader = ({ onNewDemand }: DemandPlanningHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Bedarfsplanung</h2>
        <p className="text-muted-foreground text-sm">
          Personalbedarfe strukturiert erfassen und Gap-Analyse
        </p>
      </div>
      <Button onClick={onNewDemand} className="bg-purple-600 hover:bg-purple-700">
        <Plus className="h-4 w-4 mr-2" />
        Neuer Bedarf
      </Button>
    </div>
  );
};
