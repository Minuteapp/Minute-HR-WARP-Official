import { Button } from "@/components/ui/button";
import { CalendarViewType } from "@/types/calendar";
import { Download, Printer, Bot } from "lucide-react";

interface CalendarToolbarProps {
  onExport: () => void;
  onPrint: () => void;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onAIHelp: () => void;
}

const CalendarToolbar = ({
  onExport,
  onPrint,
  onAIHelp,
}: CalendarToolbarProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex-1">
        {/* Tag/Woche/Monat-Buttons wurden entfernt */}
      </div>
      <div className="space-x-2">
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" onClick={onPrint}>
          <Printer className="h-4 w-4 mr-2" />
          Drucken
        </Button>
        <Button variant="outline" onClick={onAIHelp}>
          <Bot className="h-4 w-4 mr-2" />
          KI-Hilfe
        </Button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
