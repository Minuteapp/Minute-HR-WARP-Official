import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BudgetDetailsKPIs } from './BudgetDetailsKPIs';
import { BudgetInfoSection } from './BudgetInfoSection';
import { MonthlyDevelopmentChart } from './MonthlyDevelopmentChart';
import { CostBreakdownSection } from './CostBreakdownSection';
import { TransactionsTable } from './TransactionsTable';
import { NotesSection } from './NotesSection';

interface BudgetDetailsDialogProps {
  budgetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BudgetDetailsDialog: React.FC<BudgetDetailsDialogProps> = ({
  budgetId,
  open,
  onOpenChange,
}) => {
  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget-details', budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('id', budgetId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!budgetId,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['budget-transactions', budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('*')
        .eq('budget_id', budgetId)
        .order('entry_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!budgetId,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!budget) {
    return null;
  }

  const totalBudget = Number(budget.total_amount) || 0;
  const usedBudget = Number(budget.actual_amount) || 0;
  const availableBudget = totalBudget - usedBudget;
  const usedPercent = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Vorschau</Badge>
          </div>
          <DialogTitle className="text-xl">{budget.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Budget-Details und Analyse</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* KPI Cards */}
          <BudgetDetailsKPIs
            totalBudget={totalBudget}
            usedBudget={usedBudget}
            availableBudget={availableBudget}
            usedPercent={usedPercent}
            currency={budget.currency || 'EUR'}
          />

          {/* Budget Info */}
          <BudgetInfoSection budget={budget} />

          {/* Monthly Development Chart */}
          <MonthlyDevelopmentChart budgetId={budgetId} />

          {/* Cost Breakdown */}
          <CostBreakdownSection budgetId={budgetId} totalBudget={totalBudget} />

          {/* Transactions Table */}
          <TransactionsTable transactions={transactions} />

          {/* Notes */}
          <NotesSection notes={budget.notes} />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
