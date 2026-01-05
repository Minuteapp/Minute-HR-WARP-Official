import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface PendingApprovalsWarningProps {
  count: number;
  onNavigateToHistory: () => void;
}

const PendingApprovalsWarning = ({ count, onNavigateToHistory }: PendingApprovalsWarningProps) => {
  if (count === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <Send className="h-4 w-4 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-[11px] font-semibold text-yellow-900 mb-0.5">
            Nicht genehmigte Zeiteinträge
          </h3>
          <p className="text-[11px] text-yellow-700">
            Sie haben {count} Zeiteintrag{count !== 1 ? 'e' : ''}, der noch nicht zur Genehmigung gesendet wurde{count !== 1 ? 'n' : ''}.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateToHistory}
          className="flex-shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-100 h-7 text-[10px]"
        >
          Historie
        </Button>
      </div>
    </div>
  );
};

export default PendingApprovalsWarning;
