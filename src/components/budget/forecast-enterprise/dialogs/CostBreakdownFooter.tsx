import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CostBreakdownFooterProps {
  onClose: () => void;
}

export const CostBreakdownFooter: React.FC<CostBreakdownFooterProps> = ({ onClose }) => {
  const handleExport = () => {
    // TODO: Implement Excel export
    console.log('Export to Excel');
  };

  const currentDate = format(new Date(), 'dd.MM.yyyy', { locale: de });

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Stand: {currentDate}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExport}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel Export
        </Button>
        <Button onClick={onClose}>
          Schließen
        </Button>
      </div>
    </div>
  );
};
