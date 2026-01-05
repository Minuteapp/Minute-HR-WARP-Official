import React, { useState } from 'react';
import { BudgetPlanningHeader } from '../planning/BudgetPlanningHeader';
import { BudgetInfoCards } from '../planning/BudgetInfoCards';
import { BudgetsTable } from '../planning/BudgetsTable';
import { NewBudgetEmptyState } from '../planning/NewBudgetEmptyState';
import { CreateBudgetWizard } from '../planning/CreateBudgetWizard';
import { BudgetFilterPanel } from '../planning/BudgetFilterPanel';
import { BudgetDetailsDialog } from '../dialogs/BudgetDetailsDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BudgetPlanningTabProps {
  fiscalYear: string;
}

export const BudgetPlanningTab: React.FC<BudgetPlanningTabProps> = ({ fiscalYear }) => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    type: 'all',
    status: 'all',
    onlyApproved: false,
    onlyDepartment: false,
    onlyAnnual: false,
  });

  const { data: budgets = [], isLoading, refetch } = useQuery({
    queryKey: ['budget-plans', fiscalYear, filters],
    queryFn: async () => {
      let query = supabase
        .from('budget_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }
      if (filters.type !== 'all') {
        query = query.eq('budget_type', filters.type);
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.onlyApproved) {
        query = query.eq('status', 'approved');
      }
      if (filters.onlyDepartment) {
        query = query.eq('level', 'department');
      }
      if (filters.onlyAnnual) {
        query = query.eq('budget_type', 'annual');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const handleBudgetCreated = () => {
    setShowCreateWizard(false);
    refetch();
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setShowFilterPanel(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BudgetPlanningHeader
        onNewBudget={() => setShowCreateWizard(true)}
        onFilter={() => setShowFilterPanel(true)}
      />

      {/* Info Cards */}
      <BudgetInfoCards budgets={budgets} />

      {/* Budgets Table or Empty State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : budgets.length > 0 ? (
        <BudgetsTable 
          budgets={budgets} 
          onViewDetails={(id) => setSelectedBudgetId(id)}
        />
      ) : (
        <NewBudgetEmptyState onCreateBudget={() => setShowCreateWizard(true)} />
      )}

      {/* Create Budget Wizard */}
      <CreateBudgetWizard
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
        onSuccess={handleBudgetCreated}
      />

      {/* Filter Panel */}
      <BudgetFilterPanel
        open={showFilterPanel}
        onOpenChange={setShowFilterPanel}
        filters={filters}
        onApply={handleApplyFilters}
      />

      {/* Budget Details Dialog */}
      {selectedBudgetId && (
        <BudgetDetailsDialog
          budgetId={selectedBudgetId}
          open={!!selectedBudgetId}
          onOpenChange={(open) => !open && setSelectedBudgetId(null)}
        />
      )}
    </div>
  );
};
