import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import ExpensePolicyCard, { ExpensePolicy } from './ExpensePolicyCard';

interface ExpensePoliciesListProps {
  policies: ExpensePolicy[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onNewPolicy: () => void;
  canEdit?: boolean;
}

const ExpensePoliciesList = ({ 
  policies, 
  onEdit, 
  onDelete, 
  onNewPolicy,
  canEdit = true,
}: ExpensePoliciesListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Spesenrichtlinien</h3>
        {canEdit && (
          <Button onClick={onNewPolicy} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Neue Richtlinie
          </Button>
        )}
      </div>
      
      {policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">
            {canEdit ? 'Keine Richtlinien definiert' : 'Keine Richtlinien verfügbar'}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {canEdit 
              ? 'Erstellen Sie Ihre erste Spesenrichtlinie, um Ausgabenlimits festzulegen.'
              : 'Es wurden noch keine Spesenrichtlinien für Ihr Unternehmen definiert.'
            }
          </p>
          {canEdit && (
            <Button onClick={onNewPolicy} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Erste Richtlinie erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <ExpensePolicyCard
              key={policy.id}
              policy={policy}
              onEdit={canEdit ? onEdit : undefined}
              onDelete={canEdit ? onDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensePoliciesList;
