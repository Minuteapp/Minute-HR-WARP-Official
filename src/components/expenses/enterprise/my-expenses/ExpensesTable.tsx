
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import ExpenseStatusBadge from './ExpenseStatusBadge';

type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';

interface PersonalExpense {
  id: string;
  date: Date;
  category: string;
  merchant: string;
  description: string;
  project?: string;
  amount: number;
  paymentType: 'private' | 'corporate_card';
  status: ExpenseStatus;
}

interface ExpensesTableProps {
  expenses: PersonalExpense[];
  onView: (expense: PersonalExpense) => void;
  onEdit: (expense: PersonalExpense) => void;
  onDelete: (expense: PersonalExpense) => void;
}

const ExpensesTable = ({ expenses, onView, onEdit, onDelete }: ExpensesTableProps) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Keine Ausgaben vorhanden</p>
        <p className="text-sm text-muted-foreground mt-1">Erstellen Sie eine neue Ausgabe oder laden Sie einen Beleg hoch</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Datum</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Händler</TableHead>
            <TableHead>Beschreibung</TableHead>
            <TableHead>Projekt</TableHead>
            <TableHead className="text-right">Betrag (EUR)</TableHead>
            <TableHead>Zahlungsart</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">
                {format(expense.date, 'dd.MM.yyyy', { locale: de })}
              </TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{expense.merchant}</TableCell>
              <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
              <TableCell>
                {expense.project ? (
                  <span className="text-purple-600 font-medium cursor-pointer hover:underline">
                    {expense.project}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                €{expense.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <span className={expense.paymentType === 'corporate_card' ? 'text-purple-600 font-medium' : ''}>
                  {expense.paymentType === 'corporate_card' ? 'Firmenkarte' : 'Privat'}
                </span>
              </TableCell>
              <TableCell>
                <ExpenseStatusBadge status={expense.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(expense)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(expense)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpensesTable;
