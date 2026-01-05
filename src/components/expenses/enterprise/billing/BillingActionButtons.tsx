import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';

interface BillingActionButtonsProps {
  onBatchPayment: () => void;
  onExport: () => void;
}

const BillingActionButtons = ({ onBatchPayment, onExport }: BillingActionButtonsProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button onClick={onBatchPayment} className="bg-purple-600 hover:bg-purple-700">
        <Upload className="h-4 w-4 mr-2" />
        Sammelauszahlung starten
      </Button>
      <Button variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Export für Buchhaltung
      </Button>
    </div>
  );
};

export default BillingActionButtons;
