
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CollapsibleBreakdownSection from './CollapsibleBreakdownSection';

interface BreakdownItem {
  label: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
  badgeColor?: string;
}

interface ExpensesSummarySectionProps {
  totalAmount?: number;
  totalCount?: number;
  byStatus?: BreakdownItem[];
  byCategory?: BreakdownItem[];
  byPaymentType?: BreakdownItem[];
  byDepartment?: BreakdownItem[];
}

const ExpensesSummarySection = ({
  totalAmount = 0,
  totalCount = 0,
  byStatus = [],
  byCategory = [],
  byPaymentType = [],
  byDepartment = []
}: ExpensesSummarySectionProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg font-semibold">Ausgaben-Zusammensetzung</CardTitle>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">Gesamtsumme {formatCurrency(totalAmount)}</p>
            <p className="text-sm text-muted-foreground">{totalCount.toLocaleString()} Ausgaben</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CollapsibleBreakdownSection
          title="Nach Status"
          itemCount={byStatus.length || 5}
          items={byStatus}
          defaultOpen={true}
        />
        <CollapsibleBreakdownSection
          title="Nach Kategorie"
          itemCount={byCategory.length || 6}
          items={byCategory}
        />
        <CollapsibleBreakdownSection
          title="Nach Zahlungsart"
          itemCount={byPaymentType.length || 2}
          items={byPaymentType}
        />
        <CollapsibleBreakdownSection
          title="Nach Abteilung"
          itemCount={byDepartment.length || 5}
          items={byDepartment}
        />
      </CardContent>
    </Card>
  );
};

export default ExpensesSummarySection;
