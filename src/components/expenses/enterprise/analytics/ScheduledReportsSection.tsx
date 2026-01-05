
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import ScheduledReportItem from './ScheduledReportItem';

interface ScheduledReport {
  id: string;
  name: string;
  schedule: string;
  recipient: string;
}

interface ScheduledReportsSectionProps {
  reports: ScheduledReport[];
  onNewReport: () => void;
  onViewReport: (id: string) => void;
  onDownloadReport: (id: string) => void;
}

const ScheduledReportsSection = ({ 
  reports, 
  onNewReport, 
  onViewReport, 
  onDownloadReport 
}: ScheduledReportsSectionProps) => {
  const hasData = reports.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Geplante Reports
        </CardTitle>
        <button 
          onClick={onNewReport}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Neuen Report planen
        </button>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div>
            {reports.map((report) => (
              <ScheduledReportItem
                key={report.id}
                name={report.name}
                schedule={report.schedule}
                recipient={report.recipient}
                onView={() => onViewReport(report.id)}
                onDownload={() => onDownloadReport(report.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Keine geplanten Reports vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduledReportsSection;
