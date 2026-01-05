
import { useState } from 'react';
import ExpenseStatsCards from '../my-expenses/ExpenseStatsCards';
import ExpenseActionButtons from '../my-expenses/ExpenseActionButtons';
import ExpenseSearchBar from '../my-expenses/ExpenseSearchBar';
import ExpensesTable from '../my-expenses/ExpensesTable';
import NewExpenseDialog, { NewExpenseForm } from '../my-expenses/NewExpenseDialog';
import UploadReceiptDialog from '../my-expenses/UploadReceiptDialog';
import { toast } from 'sonner';
import { useExpenses } from '@/hooks/useExpenses';

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

const MyExpensesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isUploadReceiptOpen, setIsUploadReceiptOpen] = useState(false);

  const { 
    expenses: dbExpenses, 
    createExpense, 
    deleteExpense,
    isLoading,
    summary 
  } = useExpenses();

  // Map database expenses to PersonalExpense format
  const expenses: PersonalExpense[] = (dbExpenses || []).map((exp: any) => ({
    id: exp.id,
    date: new Date(exp.date),
    category: exp.category || 'other',
    merchant: exp.merchant || '',
    description: exp.description || '',
    project: exp.project_id,
    amount: exp.amount || 0,
    paymentType: exp.payment_type || 'private',
    status: exp.status || 'draft'
  }));

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = searchTerm === '' || 
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: summary?.totalAmount || 0,
    drafts: expenses.filter(e => e.status === 'draft').length,
    submitted: expenses.filter(e => e.status === 'submitted').length,
    approved: expenses.filter(e => e.status === 'approved').length
  };

  const handleNewExpense = () => {
    setIsNewExpenseOpen(true);
  };

  const handleUploadReceipt = () => {
    setIsUploadReceiptOpen(true);
  };

  const handleScanPhoto = () => {
    toast.info('Foto-Scanner wird geöffnet...');
  };

  const handleSubmitExpense = async (data: NewExpenseForm) => {
    try {
      createExpense({
        date: data.date,
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description,
        merchant: data.merchant,
        payment_type: data.paymentType as 'private' | 'corporate_card',
        receipt_url: data.receiptUrl,
        status: 'submitted',
        currency: 'EUR'
      } as any);
      
      toast.success('Ausgabe erfolgreich eingereicht');
      setIsNewExpenseOpen(false);
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Fehler beim Einreichen der Ausgabe');
    }
  };

  const handleSaveAsDraft = async (data: NewExpenseForm) => {
    try {
      createExpense({
        date: data.date,
        amount: parseFloat(data.amount) || 0,
        category: data.category || 'other',
        description: data.description,
        merchant: data.merchant,
        payment_type: data.paymentType as 'private' | 'corporate_card',
        receipt_url: data.receiptUrl,
        status: 'draft',
        currency: 'EUR'
      } as any);
      
      toast.success('Ausgabe als Entwurf gespeichert');
      setIsNewExpenseOpen(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Fehler beim Speichern des Entwurfs');
    }
  };

  const handleUploadSubmit = (data: any) => {
    console.log('Upload submit:', data);
    toast.success('Beleg erfolgreich hochgeladen');
    setIsUploadReceiptOpen(false);
  };

  const handleViewExpense = (expense: PersonalExpense) => {
    console.log('View expense:', expense);
  };

  const handleEditExpense = (expense: PersonalExpense) => {
    console.log('Edit expense:', expense);
  };

  const handleDeleteExpense = (expense: PersonalExpense) => {
    try {
      deleteExpense(expense.id);
      toast.success('Ausgabe gelöscht');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Fehler beim Löschen der Ausgabe');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <ExpenseStatsCards stats={stats} />

      {/* Action Buttons */}
      <ExpenseActionButtons
        onNewExpense={handleNewExpense}
        onUploadReceipt={handleUploadReceipt}
        onScanPhoto={handleScanPhoto}
      />

      {/* Search Bar */}
      <ExpenseSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Expenses Table */}
      <ExpensesTable
        expenses={filteredExpenses}
        onView={handleViewExpense}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Dialogs */}
      <NewExpenseDialog
        open={isNewExpenseOpen}
        onOpenChange={setIsNewExpenseOpen}
        onSubmit={handleSubmitExpense}
        onSaveAsDraft={handleSaveAsDraft}
      />

      <UploadReceiptDialog
        open={isUploadReceiptOpen}
        onOpenChange={setIsUploadReceiptOpen}
        onSubmit={handleUploadSubmit}
      />
    </div>
  );
};

export default MyExpensesTab;
