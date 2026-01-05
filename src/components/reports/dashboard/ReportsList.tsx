
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Archive, Trash } from 'lucide-react';
import { Report } from '@/types/reports';
import ReportFileUpload from '../ReportFileUpload';

interface ReportsListProps {
  reports: Report[];
  selectedReport: string | null;
  onReportSelect: (reportId: string | null) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onUploadComplete: () => void;
  isLoading?: boolean;
}

const ReportsList = ({
  reports,
  selectedReport,
  onReportSelect,
  onArchive,
  onDelete,
  onUploadComplete,
  isLoading = false
}: ReportsListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Aktuelle Berichte</CardTitle>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Neuer Bericht
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.length > 0 ? (
              reports.slice(0, 5).map((report) => (
                <div key={report.id} className="space-y-4">
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReportSelect(selectedReport === report.id ? null : report.id)}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onArchive(report.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(report.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {selectedReport === report.id && (
                    <div className="pl-8">
                      <ReportFileUpload 
                        reportId={report.id} 
                        onUploadComplete={() => {
                          onReportSelect(null);
                          onUploadComplete();
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">Keine Berichte verfügbar</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsList;
