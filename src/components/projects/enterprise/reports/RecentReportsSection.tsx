import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import RecentReportRow from './RecentReportRow';
import { toast } from 'sonner';

interface Report {
  id: string;
  fileName: string;
  generatedAt: string;
  type: string;
  format: string;
}

interface RecentReportsSectionProps {
  reports: Report[];
}

const RecentReportsSection = ({ reports }: RecentReportsSectionProps) => {
  const handleDownload = (fileName: string) => {
    toast.success(`Download von "${fileName}" gestartet...`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Zuletzt generierte Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Reports generiert
          </p>
        ) : (
          <div>
            {reports.map((report) => (
              <RecentReportRow
                key={report.id}
                {...report}
                onDownload={() => handleDownload(report.fileName)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentReportsSection;
