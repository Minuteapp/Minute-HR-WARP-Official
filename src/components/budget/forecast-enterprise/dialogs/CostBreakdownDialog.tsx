import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CostBreakdownHeader } from './CostBreakdownHeader';
import { SubcategorySection } from './SubcategorySection';
import { CostBreakdownFooter } from './CostBreakdownFooter';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CostBreakdownDialogProps {
  budgetId: string;
  category: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CostBreakdownDialog: React.FC<CostBreakdownDialogProps> = ({
  budgetId,
  category,
  open,
  onOpenChange,
}) => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['budget-category-breakdown', budgetId, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('category', category)
        .order('subcategory')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!budgetId && !!category,
  });

  // Group by subcategory
  const subcategories: { [key: string]: typeof transactions } = transactions.reduce((acc, transaction) => {
    const subcategory = transaction.subcategory || 'Ohne Kategorie';
    if (!acc[subcategory]) {
      acc[subcategory] = [];
    }
    acc[subcategory].push(transaction);
    return acc;
  }, {} as { [key: string]: typeof transactions });

  const totalAmount = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const subcategoryCount = Object.keys(subcategories).length;
  const positionCount = transactions.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Detaillierte Kostenaufschlüsselung</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {category} – Einzelposten bis auf den Cent
              </p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Stats */}
            <CostBreakdownHeader
              category={category}
              positionCount={positionCount}
              subcategoryCount={subcategoryCount}
              totalAmount={totalAmount}
            />

            {/* Subcategory Sections */}
            {Object.entries(subcategories).length > 0 ? (
              Object.entries(subcategories).map(([subcategory, items]) => (
                <SubcategorySection
                  key={subcategory}
                  name={subcategory}
                  items={items}
                  totalAmount={items.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)}
                  percent={totalAmount > 0 ? Math.round((items.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) / totalAmount) * 100) : 0}
                />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Keine Transaktionen in dieser Kategorie vorhanden
              </div>
            )}

            {/* Total Sum Box */}
            {transactions.length > 0 && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Gesamtsumme {category}</p>
                    <p className="text-sm text-muted-foreground">
                      {positionCount} Einzelposten in {subcategoryCount} Unterkategorien
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">Cent-genau aufgeschlüsselt</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Detaillierte Nachverfolgung</h4>
                <p className="text-sm text-muted-foreground">
                  Jede Position ist mit einer eindeutigen Referenznummer versehen und wurde durch 
                  einen Verantwortlichen genehmigt. Alle Beträge sind auf den Cent genau erfasst.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <CostBreakdownFooter onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
