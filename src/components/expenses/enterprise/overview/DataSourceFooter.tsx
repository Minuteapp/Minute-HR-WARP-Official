
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataSourceFooterProps {
  totalExpenses?: number;
  totalAmount?: number;
  employees?: number;
  categories?: number;
  departments?: number;
  statusCount?: number;
  onShowFullList?: () => void;
}

const DataSourceFooter = ({
  totalExpenses = 0,
  totalAmount = 0,
  employees = 0,
  categories = 0,
  departments = 0,
  statusCount = 0,
  onShowFullList
}: DataSourceFooterProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-start gap-3">
        <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-purple-900 mb-2">
            Datenquelle: {totalExpenses.toLocaleString()} Ausgaben
          </h4>
          <p className="text-sm text-purple-700 mb-3">
            Die angezeigten Zahlen basieren auf <strong>{totalExpenses.toLocaleString()} Ausgaben</strong> mit einer Gesamtsumme von <strong>{formatCurrency(totalAmount)}</strong>.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-purple-600 mb-3">
            <span>• {employees.toLocaleString()} Mitarbeiter</span>
            <span>• {categories} Kategorien</span>
            <span>• {departments} Abteilungen</span>
            <span>• {statusCount} Status</span>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={onShowFullList}
          >
            Vollständige Liste anzeigen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceFooter;
