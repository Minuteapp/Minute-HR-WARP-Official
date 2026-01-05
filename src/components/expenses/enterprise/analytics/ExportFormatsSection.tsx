
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ExportFormatsSectionProps {
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'json') => void;
}

const formats = [
  { id: 'pdf', label: 'PDF' },
  { id: 'excel', label: 'Excel' },
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
] as const;

const ExportFormatsSection = ({ onExport }: ExportFormatsSectionProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Export-Formate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => onExport(format.id)}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{format.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportFormatsSection;
