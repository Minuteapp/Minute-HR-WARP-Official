
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Archive } from 'lucide-react';
import { Report } from '@/types/reports';

interface ReportStatsProps {
  reports: Report[];
}

const ReportStats = ({ reports }: ReportStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aktive Berichte
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {reports.filter(r => r.status === 'pending' || r.status === 'draft').length}
          </div>
          <p className="text-xs text-muted-foreground">
            Berichte in Bearbeitung
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Genehmigte Berichte
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {reports.filter(r => r.status === 'approved').length}
          </div>
          <p className="text-xs text-muted-foreground">
            Abgeschlossene Berichte
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Archivierte Berichte
          </CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {reports.filter(r => r.status === 'archived').length}
          </div>
          <p className="text-xs text-muted-foreground">
            Im Archiv
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportStats;
