import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, FileDown } from 'lucide-react';

interface ExportCardProps {
  name: string;
  icon: 'datev' | 'sap' | 'csv';
  onExport: () => void;
}

const ExportCard = ({ name, icon, onExport }: ExportCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'datev':
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      case 'sap':
        return <FileText className="h-6 w-6 text-blue-600" />;
      case 'csv':
        return <FileDown className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <Card className="bg-card border-border hover:border-gray-300 transition-colors cursor-pointer">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="font-medium text-foreground">{name}</span>
        </div>
        <Button variant="link" className="text-purple-600 p-0" onClick={onExport}>
          Exportieren
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportCard;
