
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Expense } from "@/types/business-travel";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import ExpenseFormDialog from "./ExpenseFormDialog";
import ExpenseEmptyState from "./expense/ExpenseEmptyState";
import ExpenseItem from "./expense/ExpenseItem";
import ExpenseListSkeleton from "./expense/ExpenseListSkeleton";
import { formatCurrency } from "@/utils/currencyUtils";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  tripId: string;
  canAddExpense: boolean;
}

const ExpenseList = ({ expenses, isLoading, tripId, canAddExpense }: ExpenseListProps) => {
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (isLoading) {
    return <ExpenseListSkeleton />;
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Ausgaben</h3>
          
          {canAddExpense && (
            <Button 
              size="sm" 
              onClick={() => setIsExpenseDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Neue Ausgabe
            </Button>
          )}
        </div>
        
        {expenses.length === 0 ? (
          <ExpenseEmptyState 
            canAddExpense={canAddExpense} 
            onAddExpense={() => setIsExpenseDialogOpen(true)} 
          />
        ) : (
          <>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <ExpenseItem 
                  key={expense.id} 
                  expense={expense} 
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <p className="font-medium">Gesamtbetrag</p>
              <p className="font-bold text-lg">{formatCurrency(totalExpenses, 'EUR')}</p>
            </div>
          </>
        )}
      </Card>
      
      <ExpenseFormDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        tripId={tripId}
      />
    </>
  );
};

export default ExpenseList;
