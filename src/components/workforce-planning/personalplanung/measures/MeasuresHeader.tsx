import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MeasuresHeaderProps {
  onNewMeasure: () => void;
}

export const MeasuresHeader = ({ onNewMeasure }: MeasuresHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Maßnahmen & Umsetzung</h2>
        <p className="text-muted-foreground text-sm">
          Übergang von Planung zur Handlung: Recruiting, Upskilling, Versetzungen
        </p>
      </div>
      <Button onClick={onNewMeasure} className="bg-purple-600 hover:bg-purple-700">
        <Plus className="h-4 w-4 mr-2" />
        Neue Maßnahme
      </Button>
    </div>
  );
};
