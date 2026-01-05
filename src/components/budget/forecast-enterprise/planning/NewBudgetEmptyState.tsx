import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewBudgetEmptyStateProps {
  onCreateBudget: () => void;
}

export const NewBudgetEmptyState: React.FC<NewBudgetEmptyStateProps> = ({ onCreateBudget }) => {
  const budgetTypes = [
    'Jahresbudget',
    'Quartalsbudget',
    'Projektbudget',
    'Personalbudget',
    'ESG-Budget',
  ];

  return (
    <Card 
      className="border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onCreateBudget}
    >
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Neues Budget erstellen</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Klicken Sie auf "Neues Budget", um ein Budget auf beliebiger Ebene zu erstellen
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {budgetTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              {type}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
