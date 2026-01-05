
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, Calendar, Euro, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ExpensesTabProps {
  employeeId: string;
}

export const ExpensesTab = ({ employeeId }: ExpensesTabProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['employeeExpenses', employeeId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('employee_id', employeeId)
        .order('expense_date', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    return <Receipt className="h-4 w-4" />;
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const approvedAmount = expenses
    .filter(expense => expense.status === 'approved' || expense.status === 'paid')
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Ausgaben</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Ausgabe
        </Button>
      </div>

      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt beantragt</p>
                <p className="text-2xl font-bold">{totalAmount.toFixed(2)} €</p>
              </div>
              <Euro className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Genehmigt</p>
                <p className="text-2xl font-bold text-green-600">{approvedAmount.toFixed(2)} €</p>
              </div>
              <Euro className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Offen</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {expenses
                    .filter(expense => expense.status === 'pending')
                    .reduce((sum, expense) => sum + (expense.amount || 0), 0)
                    .toFixed(2)} €
                </p>
              </div>
              <Euro className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
          size="sm"
        >
          Alle
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('pending')}
          size="sm"
        >
          Ausstehend
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('approved')}
          size="sm"
        >
          Genehmigt
        </Button>
        <Button
          variant={statusFilter === 'paid' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('paid')}
          size="sm"
        >
          Bezahlt
        </Button>
      </div>

      {/* Ausgaben Liste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Ausgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Ausgaben vorhanden</p>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense: any) => (
                <div key={expense.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(expense.category)}
                      <h3 className="font-medium">{expense.description}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{expense.amount?.toFixed(2)} €</p>
                      <Badge className={getStatusColor(expense.status)}>
                        {expense.status === 'approved' ? 'Genehmigt' :
                         expense.status === 'pending' ? 'Ausstehend' :
                         expense.status === 'rejected' ? 'Abgelehnt' :
                         expense.status === 'paid' ? 'Bezahlt' : expense.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(expense.expense_date).toLocaleDateString('de-DE')}
                    </div>
                    {expense.category && (
                      <span>Kategorie: {expense.category}</span>
                    )}
                    {expense.project_name && (
                      <span>Projekt: {expense.project_name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
