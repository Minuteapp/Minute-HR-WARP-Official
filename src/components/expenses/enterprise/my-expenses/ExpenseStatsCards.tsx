
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Send, CheckCircle, Clock } from 'lucide-react';

interface ExpenseStats {
  total: number;
  drafts: number;
  submitted: number;
  approved: number;
}

interface ExpenseStatsCardsProps {
  stats?: ExpenseStats;
}

const ExpenseStatsCards = ({ stats }: ExpenseStatsCardsProps) => {
  const cards = [
    {
      title: 'Gesamt',
      value: stats?.total ?? 0,
      suffix: 'Ausgaben',
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Entwürfe',
      value: stats?.drafts ?? 0,
      icon: Clock,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100'
    },
    {
      title: 'Eingereicht',
      value: stats?.submitted ?? 0,
      icon: Send,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Genehmigt',
      value: stats?.approved ?? 0,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                  {card.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{card.suffix}</span>}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseStatsCards;
