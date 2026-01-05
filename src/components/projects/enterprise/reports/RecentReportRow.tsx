import { FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface RecentReportRowProps {
  fileName: string;
  generatedAt: string;
  type: string;
  format: string;
  onDownload: () => void;
}

const RecentReportRow = ({
  fileName,
  generatedAt,
  type,
  format: fileFormat,
  onDownload,
}: RecentReportRowProps) => {
  const typeColors: Record<string, string> = {
    'Portfolio': 'bg-blue-100 text-blue-800',
    'Budget': 'bg-green-100 text-green-800',
    'Ressourcen': 'bg-purple-100 text-purple-800',
    'Risiko': 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(generatedAt), 'dd. MMM yyyy, HH:mm', { locale: de })} Uhr
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
          {type}
        </Badge>
        <Badge variant="outline">{fileFormat}</Badge>
        <Button variant="ghost" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RecentReportRow;
