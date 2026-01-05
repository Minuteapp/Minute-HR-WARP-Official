
import { Calendar, Eye, Download } from 'lucide-react';

interface ScheduledReportItemProps {
  name: string;
  schedule: string;
  recipient: string;
  onView: () => void;
  onDownload: () => void;
}

const ScheduledReportItem = ({ name, schedule, recipient, onView, onDownload }: ScheduledReportItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-muted rounded-lg">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{schedule} an {recipient}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onView}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4 text-muted-foreground" />
        </button>
        <button 
          onClick={onDownload}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Download className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ScheduledReportItem;
