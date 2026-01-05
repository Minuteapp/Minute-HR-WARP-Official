import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, DollarSign, Calendar, Globe } from 'lucide-react';

export interface ExpensePolicy {
  id: string;
  name: string;
  category: string;
  description: string;
  limit: number;
  period: 'night' | 'person' | 'month' | 'year';
  country?: string;
  violations: number;
}

interface ExpensePolicyCardProps {
  policy: ExpensePolicy;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ExpensePolicyCard = ({ policy, onEdit, onDelete }: ExpensePolicyCardProps) => {
  const periodLabels = {
    night: 'pro Nacht',
    person: 'pro Person',
    month: 'pro Monat',
    year: 'pro Jahr',
  };

  const showActions = onEdit || onDelete;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-foreground">{policy.name}</h4>
              <span className="bg-purple-100 text-purple-700 rounded px-2 py-0.5 text-xs">
                {policy.category}
              </span>
              {policy.violations > 0 && (
                <span className="bg-red-100 text-red-600 border border-red-200 rounded px-2 py-0.5 text-xs">
                  {policy.violations} Verstöße
                </span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{policy.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-foreground">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {policy.limit.toLocaleString('de-DE')} EUR
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {periodLabels[policy.period]}
              </span>
              {policy.country && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {policy.country}
                </span>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 ml-4">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(policy.id)}>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(policy.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensePolicyCard;
