
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface VATOverviewCardProps {
  netAmount?: number;
  vatAmount?: number;
  grossAmount?: number;
}

const VATOverviewCard = ({ netAmount = 0, vatAmount = 0, grossAmount = 0 }: VATOverviewCardProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(2)}k`;
    return `€${value.toFixed(2)}`;
  };

  return (
    <Card className="bg-purple-50 border-purple-100">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-purple-600" />
          <h4 className="font-semibold text-purple-900">MwSt. Übersicht</h4>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-purple-700">Nettobetrag</span>
            <span className="text-purple-900">{formatCurrency(netAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">MwSt.</span>
            <span className="text-purple-900">{formatCurrency(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-purple-200">
            <span className="text-purple-900">Bruttobetrag</span>
            <span className="text-purple-900">{formatCurrency(grossAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VATOverviewCard;
