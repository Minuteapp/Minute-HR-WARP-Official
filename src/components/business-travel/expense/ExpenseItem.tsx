
import { Expense } from "@/types/business-travel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface ExpenseItemProps {
  expense: Expense;
  formatCurrency: (amount: number, currency: string) => string;
}

const ExpenseItem = ({ expense, formatCurrency }: ExpenseItemProps) => {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{expense.description}</h4>
          <Badge variant="secondary">{expense.category}</Badge>
        </div>
        <p className="text-sm text-gray-500">
          {format(new Date(expense.expense_date), 'dd. MMMM yyyy', { locale: de })}
        </p>
        {expense.notes && (
          <p className="text-sm text-gray-600 mt-1">{expense.notes}</p>
        )}
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(expense.amount, expense.currency)}</p>
        <Badge variant={expense.approved ? "default" : "secondary"}>
          {expense.approved ? "Genehmigt" : "Ausstehend"}
        </Badge>
      </div>
    </div>
  );
};

export default ExpenseItem;
