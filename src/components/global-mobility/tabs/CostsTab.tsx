
import { useState } from 'react';
import { CostsHeader } from '../costs/CostsHeader';
import { CostsKPICards } from '../costs/CostsKPICards';
import { CostEntriesTable } from '../costs/CostEntriesTable';
import { BudgetVsActualChart } from '../costs/BudgetVsActualChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Leere Daten - werden aus der Datenbank geladen
const costEntries: Array<{
  id: string;
  employee_name: string;
  category: string;
  description: string;
  budget_amount: number;
  actual_amount: number;
  cost_center: string;
  status: string;
  created_at: string;
}> = [];

const chartData: Array<{ month: string; budget: number; actual: number }> = [];

export function CostsTab() {
  const [isLoading] = useState(false);

  // KPIs auf 0 setzen - werden aus echten Daten berechnet
  const totalBudget = 0;
  const actualCosts = 0;
  const deviation = 0;
  const avgCostPerAssignment = 0;
  return (
    <div className="space-y-6">
      <CostsHeader />
      
      <CostsKPICards
        totalBudget={totalBudget}
        actualCosts={actualCosts}
        deviation={deviation}
        avgCostPerAssignment={avgCostPerAssignment}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetVsActualChart data={chartData} />
        
        <Card>
          <CardHeader>
            <CardTitle>Kostenverteilung nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            Diagramm wird geladen...
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Kosteneinträge</CardTitle>
        </CardHeader>
        <CardContent>
          <CostEntriesTable entries={costEntries} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
