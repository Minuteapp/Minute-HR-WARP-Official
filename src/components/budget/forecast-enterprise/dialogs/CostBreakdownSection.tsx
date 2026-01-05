import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { CostCategoryItem } from './CostCategoryItem';
import { CostBreakdownDialog } from './CostBreakdownDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CostBreakdownSectionProps {
  budgetId: string;
  totalBudget: number;
}

export const CostBreakdownSection: React.FC<CostBreakdownSectionProps> = ({ budgetId, totalBudget }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['budget-cost-breakdown', budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('category, amount')
        .eq('budget_id', budgetId);

      if (error) throw error;

      // Group by category
      const categoryTotals: { [key: string]: number } = {};
      (data || []).forEach((transaction) => {
        const category = transaction.category || 'Sonstige';
        categoryTotals[category] = (categoryTotals[category] || 0) + (Number(transaction.amount) || 0);
      });

      const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

      return Object.entries(categoryTotals).map(([name, amount]) => ({
        name,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      }));
    },
    enabled: !!budgetId,
  });

  const hasData = categories.length > 0;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kostenaufschlüsselung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Info Hint */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
            <Lightbulb className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              Klicken Sie auf eine Kategorie für detaillierte Aufschlüsselung
            </span>
          </div>

          {/* Categories */}
          {hasData ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <CostCategoryItem
                  key={category.name}
                  name={category.name}
                  amount={category.amount}
                  percent={category.percent}
                  onClick={() => setSelectedCategory(category.name)}
                />
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              Keine Kostendaten vorhanden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Breakdown Dialog */}
      {selectedCategory && (
        <CostBreakdownDialog
          budgetId={budgetId}
          category={selectedCategory}
          open={!!selectedCategory}
          onOpenChange={(open) => !open && setSelectedCategory(null)}
        />
      )}
    </>
  );
};
