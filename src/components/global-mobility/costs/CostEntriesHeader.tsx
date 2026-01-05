import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface CostEntriesHeaderProps {
  onAddEntry: () => void;
  onExport: () => void;
}

export const CostEntriesHeader = ({ onAddEntry, onExport }: CostEntriesHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Kosteneinträge</h3>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportieren
        </Button>
        <Button size="sm" onClick={onAddEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Kosteneintrag
        </Button>
      </div>
    </div>
  );
};
