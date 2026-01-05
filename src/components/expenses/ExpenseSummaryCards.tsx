import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, XCircle, Euro } from 'lucide-react';
import { ExpenseSummary } from '@/types/expenses';
import { formatCurrency } from '@/utils/currencyUtils';

interface ExpenseSummaryCardsProps {
  summary: ExpenseSummary;
}

const ExpenseSummaryCards = ({ summary }: ExpenseSummaryCardsProps) => {
  const cards = [
    {
      title: "Gesamtausgaben",
      value: summary.totalExpenses,
      icon: Euro,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Wartend auf Genehmigung",
      value: summary.pendingApproval,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Genehmigt",
      value: summary.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Abgelehnt",
      value: summary.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.title === "Gesamtausgaben" 
                ? formatCurrency(summary.totalAmount, summary.currency)
                : card.value
              }
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2,5% vom Vormonat
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseSummaryCards;