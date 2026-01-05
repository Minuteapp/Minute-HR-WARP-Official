import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpenseClaims } from '@/hooks/employee-tabs/useExpenseClaims';
import { ExpenseClaimDialog } from '../dialogs/ExpenseClaimDialog';
import { DollarSign, Plus, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';
import { EditableField } from '../../shared/EditableField';
import { EmployeeTabEditProps } from '@/types/employee-tab-props.types';

interface ExpensesTabNewProps extends EmployeeTabEditProps {}

const STATUS_CONFIG = {
  draft: { label: 'Entwurf', icon: Clock, variant: 'secondary' as const },
  submitted: { label: 'Eingereicht', icon: Clock, variant: 'default' as const },
  approved: { label: 'Genehmigt', icon: CheckCircle, variant: 'default' as const },
  rejected: { label: 'Abgelehnt', icon: XCircle, variant: 'destructive' as const },
  paid: { label: 'Bezahlt', icon: CheckCircle, variant: 'default' as const },
};

export const ExpensesTabNew = ({ 
  employeeId,
  isEditing = false,
  onFieldChange,
  pendingChanges
}: ExpensesTabNewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    expenses,
    isLoading,
    statistics,
    createExpense,
    submitExpense,
    isCreating,
  } = useExpenseClaims(employeeId);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <EditableField
              value={statistics.total}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('expenses', 'total', val)}
              type="currency"
              suffix=" €"
              valueClassName="text-2xl font-bold"
              showLabel={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <EditableField
              value={statistics.pending}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('expenses', 'pending', val)}
              type="number"
              valueClassName="text-2xl font-bold"
              showLabel={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genehmigt</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <EditableField
              value={statistics.approved}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('expenses', 'approved', val)}
              type="number"
              valueClassName="text-2xl font-bold"
              showLabel={false}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ausgaben</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ausgabe hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Ausgaben vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map(expense => {
                const config = STATUS_CONFIG[expense.status];
                const Icon = config.icon;
                
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isEditing ? (
                          <EditableField
                            value={pendingChanges?.expenses?.[expense.id]?.description ?? expense.description}
                            isEditing={isEditing}
                            onChange={(val) => onFieldChange?.('expenses', `${expense.id}_description`, val)}
                            valueClassName="font-medium"
                            showLabel={false}
                          />
                        ) : (
                          <p className="font-medium">{expense.description}</p>
                        )}
                        <Badge variant={config.variant}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(expense.expense_date).toLocaleDateString('de-DE')}</span>
                        <span>•</span>
                        <span className="capitalize">{expense.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {isEditing ? (
                        <EditableField
                          value={pendingChanges?.expenses?.[expense.id]?.amount ?? expense.amount}
                          isEditing={isEditing}
                          onChange={(val) => onFieldChange?.('expenses', `${expense.id}_amount`, val)}
                          type="currency"
                          suffix={` ${expense.currency}`}
                          valueClassName="font-semibold"
                          showLabel={false}
                        />
                      ) : (
                        <p className="font-semibold">
                          {expense.amount.toLocaleString('de-DE', { style: 'currency', currency: expense.currency })}
                        </p>
                      )}
                      {expense.status === 'draft' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => submitExpense(expense.id)}
                          className="mt-2"
                        >
                          Einreichen
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseClaimDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(expenseData, receiptFile) => 
          createExpense({ expense: expenseData, receiptFile })
        }
        employeeId={employeeId}
        isSubmitting={isCreating}
      />
    </div>
  );
};
