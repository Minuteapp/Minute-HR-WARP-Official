
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

interface ExpenseEmptyStateProps {
  canAddExpense: boolean;
  onAddExpense: () => void;
}

const ExpenseEmptyState = ({ canAddExpense, onAddExpense }: ExpenseEmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Ausgaben vorhanden</h3>
      <p className="text-gray-500 mb-4">
        Für diese Geschäftsreise wurden noch keine Ausgaben erfasst.
      </p>
      {canAddExpense && (
        <Button onClick={onAddExpense}>
          Erste Ausgabe hinzufügen
        </Button>
      )}
    </div>
  );
};

export default ExpenseEmptyState;
