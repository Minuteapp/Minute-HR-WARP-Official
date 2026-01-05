
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetCalculationService } from '@/services/budget/budgetCalculationService';
import { useToast } from '@/hooks/use-toast';
import type {
  BudgetLineItem,
  BudgetScenario,
  BudgetAdjustment,
  CashflowProjection,
  BudgetAlert
} from '@/types/budgetEnterprise';

export const useBudgetLineItems = (budgetPlanId: string) => {
  return useQuery({
    queryKey: ['budget-line-items', budgetPlanId],
    queryFn: () => budgetCalculationService.getLineItems(budgetPlanId),
    enabled: !!budgetPlanId,
  });
};

export const useCreateBudgetLineItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (lineItem: Omit<BudgetLineItem, 'id' | 'created_at' | 'updated_at'>) =>
      budgetCalculationService.createLineItem(lineItem),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget-line-items', data.budget_plan_id] });
      toast({
        title: "Budget-Position erstellt",
        description: "Die neue Budget-Position wurde erfolgreich hinzugefügt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Budget-Position konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBudgetLineItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BudgetLineItem> }) =>
      budgetCalculationService.updateLineItem(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget-line-items', data.budget_plan_id] });
      toast({
        title: "Budget-Position aktualisiert",
        description: "Die Budget-Position wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Budget-Position konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBudgetLineItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => budgetCalculationService.deleteLineItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-line-items'] });
      toast({
        title: "Budget-Position gelöscht",
        description: "Die Budget-Position wurde erfolgreich entfernt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Budget-Position konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });
};

export const useBudgetScenarios = (budgetPlanId: string) => {
  return useQuery({
    queryKey: ['budget-scenarios', budgetPlanId],
    queryFn: () => budgetCalculationService.getScenarios(budgetPlanId),
    enabled: !!budgetPlanId,
  });
};

export const useCreateBudgetScenario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (scenario: Omit<BudgetScenario, 'id' | 'created_at' | 'updated_at'>) =>
      budgetCalculationService.createScenario(scenario),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget-scenarios', data.budget_plan_id] });
      toast({
        title: "Szenario erstellt",
        description: "Das Budget-Szenario wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({  
        title: "Fehler",
        description: "Das Szenario konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useCalculateBudgetScenario = () => {
  return useMutation({
    mutationFn: ({ budgetPlanId, adjustments }: { 
      budgetPlanId: string; 
      adjustments: BudgetAdjustment[] 
    }) => budgetCalculationService.calculateScenario(budgetPlanId, adjustments),
  });
};

export const useCashflowProjection = (budgetPlanId: string, scenarioId?: string) => {
  return useQuery({
    queryKey: ['cashflow-projection', budgetPlanId, scenarioId],
    queryFn: () => budgetCalculationService.generateCashflowProjection(budgetPlanId, scenarioId),
    enabled: !!budgetPlanId,
  });
};

export const useBudgetAlerts = (budgetPlanId: string) => {
  return useQuery({
    queryKey: ['budget-alerts', budgetPlanId],
    queryFn: () => budgetCalculationService.checkBudgetAlerts(budgetPlanId),
    enabled: !!budgetPlanId,
    refetchInterval: 5 * 60 * 1000, // Alle 5 Minuten prüfen
  });
};

export const useActualVsBudget = (budgetPlanId: string) => {
  return useQuery({
    queryKey: ['actual-vs-budget', budgetPlanId],
    queryFn: () => budgetCalculationService.getActualVsBudget(budgetPlanId),
    enabled: !!budgetPlanId,
  });
};

export const useForecastHeatmap = (budgetPlanId: string) => {
  return useQuery({
    queryKey: ['forecast-heatmap', budgetPlanId],
    queryFn: () => budgetCalculationService.getForecastHeatmapData(budgetPlanId),
    enabled: !!budgetPlanId,
  });
};
