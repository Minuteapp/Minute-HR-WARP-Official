
import { CheckCircle } from 'lucide-react';

interface ValidationFooterProps {
  totalExpenses?: number;
  totalAmount?: number;
}

const ValidationFooter = ({ totalExpenses = 0, totalAmount = 0 }: ValidationFooterProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <span>
        Alle Summen validiert • {totalExpenses.toLocaleString()} Ausgaben • {formatCurrency(totalAmount)} Gesamtsumme
      </span>
    </div>
  );
};

export default ValidationFooter;
