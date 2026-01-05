
import { Button } from '@/components/ui/button';
import { Plus, Upload, Camera } from 'lucide-react';

interface ExpenseActionButtonsProps {
  onNewExpense: () => void;
  onUploadReceipt: () => void;
  onScanPhoto: () => void;
}

const ExpenseActionButtons = ({ onNewExpense, onUploadReceipt, onScanPhoto }: ExpenseActionButtonsProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button onClick={onNewExpense} className="bg-purple-600 hover:bg-purple-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Neue Ausgabe
      </Button>
      <Button variant="outline" onClick={onUploadReceipt} className="border-border">
        <Upload className="h-4 w-4 mr-2" />
        Beleg hochladen
      </Button>
      <Button variant="outline" onClick={onScanPhoto} className="border-border">
        <Camera className="h-4 w-4 mr-2" />
        Foto scannen
      </Button>
    </div>
  );
};

export default ExpenseActionButtons;
