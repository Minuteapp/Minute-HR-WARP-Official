
import React, { useState } from 'react';
import { 
  Button 
} from "@/components/ui/button";
import { 
  Card 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { BudgetPlan } from "@/types/business-travel";
import { Plus, Download, RefreshCw } from "lucide-react";
import BudgetPlanList from "./BudgetPlanList";
import BudgetPlanFormDialog from "./BudgetPlanFormDialog";
import BudgetDashboardView from "./BudgetDashboardView";
import BudgetTripHistoryView from "./BudgetTripHistoryView";

interface BudgetPlanningTabProps {
  initialTab?: string;
}

const BudgetPlanningTab: React.FC<BudgetPlanningTabProps> = ({ initialTab = "all" }) => {
  const { budgetPlans, isLoadingBudgetPlans, refetchBudgetPlans } = useBusinessTravel();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reisebudget-Planung</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchBudgetPlans()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Budget
          </Button>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Alle Budgets</TabsTrigger>
          <TabsTrigger value="departments">Abteilungen</TabsTrigger>
          <TabsTrigger value="projects">Projekte</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="cost-centers">Kostenstellen</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <BudgetPlanList 
            budgetPlans={budgetPlans || []} 
            isLoading={isLoadingBudgetPlans}
            onSelectBudget={setSelectedBudgetId}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <BudgetPlanList 
            budgetPlans={(budgetPlans || []).filter(b => b.type === 'department')}
            isLoading={isLoadingBudgetPlans}
            onSelectBudget={setSelectedBudgetId}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <BudgetPlanList 
            budgetPlans={(budgetPlans || []).filter(b => b.type === 'project')}
            isLoading={isLoadingBudgetPlans}
            onSelectBudget={setSelectedBudgetId}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <BudgetPlanList 
            budgetPlans={(budgetPlans || []).filter(b => b.type === 'team')}
            isLoading={isLoadingBudgetPlans}
            onSelectBudget={setSelectedBudgetId}
          />
        </TabsContent>

        <TabsContent value="cost-centers" className="space-y-4">
          <BudgetPlanList 
            budgetPlans={(budgetPlans || []).filter(b => b.type === 'cost_center')}
            isLoading={isLoadingBudgetPlans}
            onSelectBudget={setSelectedBudgetId}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <BudgetDashboardView budgetPlans={budgetPlans || []} />
        </TabsContent>
      </Tabs>

      {selectedBudgetId && (
        <BudgetTripHistoryView 
          budgetId={selectedBudgetId} 
          onClose={() => setSelectedBudgetId(null)} 
        />
      )}

      <BudgetPlanFormDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
};

export default BudgetPlanningTab;
