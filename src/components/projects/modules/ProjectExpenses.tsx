
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  Plus, 
  Receipt,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useProjectExpenses } from '@/hooks/useProjectExpenses';

interface ProjectExpensesProps {
  projectId: string;
  projectName: string;
}

export const ProjectExpenses: React.FC<ProjectExpensesProps> = ({
  projectId,
  projectName
}) => {
  const {
    expenses,
    budget,
    loading,
    error,
    createExpense,
    getTotalExpenses,
    getPendingExpenses,
    getApprovedExpenses,
    getExpensesByCategory
  } = useProjectExpenses(projectId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    currency: 'EUR',
    category: 'Software',
    date: new Date().toISOString().split('T')[0]
  });

  const totalExpenses = getTotalExpenses();
  const pendingExpenses = getPendingExpenses();
  const approvedExpenses = getApprovedExpenses();
  const expensesByCategory = getExpensesByCategory();
  const budgetAmount = budget?.amount || 5000;

  const handleSubmit = async () => {
    if (!newExpense.description || !newExpense.amount) return;

    setIsSubmitting(true);
    const result = await createExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      category: newExpense.category,
      date: newExpense.date
    });

    if (result) {
      setNewExpense({
        description: '',
        amount: '',
        currency: 'EUR',
        category: 'Software',
        date: new Date().toISOString().split('T')[0]
      });
      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Genehmigt</Badge>;
      case 'pending':
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Ausstehend</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">Entwurf</Badge>;
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-orange-600', 'text-purple-600', 'text-pink-600'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ausgaben-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtausgaben</p>
                <p className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Genehmigt</p>
                <p className="text-2xl font-bold">€{approvedExpenses.toFixed(2)}</p>
              </div>
              <Receipt className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold">€{pendingExpenses.toFixed(2)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold">€{budgetAmount.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs">
                <span>Verwendet: {((totalExpenses / budgetAmount) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${totalExpenses > budgetAmount ? 'bg-destructive' : 'bg-purple-600'}`}
                  style={{ width: `${Math.min((totalExpenses / budgetAmount) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Neue Ausgabe hinzufügen */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Ausgabenverwaltung
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Ausgabe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Ausgabe erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="description">Beschreibung</Label>
                    <Input
                      id="description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="z.B. Software-Lizenz"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Betrag</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Währung</Label>
                      <Select
                        value={newExpense.currency}
                        onValueChange={(value) => setNewExpense({ ...newExpense, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Kategorie</Label>
                      <Select
                        value={newExpense.category}
                        onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Reisen">Reisen</SelectItem>
                          <SelectItem value="Schulung">Schulung</SelectItem>
                          <SelectItem value="Büromaterial">Büromaterial</SelectItem>
                          <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Datum</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !newExpense.description || !newExpense.amount}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      'Ausgabe erstellen'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Ausgaben für dieses Projekt erfasst.</p>
              <p className="text-sm">Klicken Sie auf "Neue Ausgabe", um eine hinzuzufügen.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{expense.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • {expense.submittedByName || 'Unbekannt'} • {expense.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold">{expense.currency === 'EUR' ? '€' : expense.currency}{expense.amount.toFixed(2)}</p>
                    </div>
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ausgaben-Kategorien */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ausgaben nach Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {expensesByCategory.map((cat, index) => (
                <div key={cat.category} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{cat.category}</h4>
                  <p className={`text-2xl font-bold ${getCategoryColor(index)}`}>
                    €{cat.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cat.percentage.toFixed(1)}% der Ausgaben
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
