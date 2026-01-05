import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, FolderOpen, FileText, DollarSign } from 'lucide-react';

interface BudgetInfoCardsProps {
  budgets: any[];
}

export const BudgetInfoCards: React.FC<BudgetInfoCardsProps> = ({ budgets }) => {
  const approvedBudgets = budgets.filter(b => b.status === 'approved').length;
  const draftBudgets = budgets.filter(b => b.status === 'draft').length;
  const lockedBudgets = budgets.filter(b => b.status === 'locked').length;
  
  const totalVolume = budgets
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value.toLocaleString('de-DE')}`;
  };

  const cards = [
    {
      title: 'Budgetebenen',
      value: '7 Ebenen',
      description: 'Unternehmen, Gesellschaft, Standort, Abteilung, Team, Projekt, Kostenstelle',
      icon: Layers,
    },
    {
      title: 'Budgetarten',
      value: '6 Typen',
      description: 'Jahres-, Quartals-, Projekt-, Personal-, Investitions-, ESG-Budget',
      icon: FolderOpen,
    },
    {
      title: 'Aktive Budgets',
      value: `${budgets.length} Budgets`,
      description: `${approvedBudgets} freigegeben, ${draftBudgets} Entwürfe, ${lockedBudgets} gesperrt`,
      icon: FileText,
    },
    {
      title: 'Gesamtvolumen',
      value: formatCurrency(totalVolume),
      description: 'Alle freigegebenen Budgets',
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-lg font-semibold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground truncate">{card.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
