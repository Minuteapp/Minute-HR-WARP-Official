import { FeedbackTypeBadge } from "./FeedbackTypeBadge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface FeedbackEntryProps {
  date: string;
  type: 'manager_to_employee' | 'self_reflection' | 'peer' | 'upward';
  strengths?: string;
  developmentAreas?: string;
  agreements?: string;
}

export const FeedbackEntry = ({
  date,
  type,
  strengths,
  developmentAreas,
  agreements
}: FeedbackEntryProps) => {
  return (
    <div className="border-l-2 border-muted pl-4 py-2">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm text-muted-foreground">
          {format(new Date(date), 'dd. MMMM yyyy', { locale: de })}
        </span>
        <FeedbackTypeBadge type={type} />
      </div>

      {strengths && (
        <div className="mb-2">
          <p className="text-sm font-medium text-green-700">Stärken</p>
          <p className="text-sm text-muted-foreground">{strengths}</p>
        </div>
      )}

      {developmentAreas && (
        <div className="mb-2">
          <p className="text-sm font-medium text-orange-700">Entwicklungsfelder</p>
          <p className="text-sm text-muted-foreground">{developmentAreas}</p>
        </div>
      )}

      {agreements && (
        <div>
          <p className="text-sm font-medium text-blue-700">Vereinbarungen</p>
          <p className="text-sm text-muted-foreground">{agreements}</p>
        </div>
      )}
    </div>
  );
};
