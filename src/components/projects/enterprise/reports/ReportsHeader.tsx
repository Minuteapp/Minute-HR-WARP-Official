import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportsHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Reports & Exporte</h2>
          <p className="text-sm text-muted-foreground">
            Generieren Sie Reports und exportieren Sie Projektdaten
          </p>
        </div>
      </div>
      <Button className="gap-2">
        <Download className="h-4 w-4" />
        Alle exportieren
      </Button>
    </div>
  );
};

export default ReportsHeader;
