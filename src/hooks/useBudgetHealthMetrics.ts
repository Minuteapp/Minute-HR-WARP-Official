
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetEnterpriseService } from '@/services/budgetEnterpriseService';
import { useToast } from '@/hooks/use-toast';

export const useBudgetHealthMetrics = (budgetPlanId?: string) => {
  return useQuery({
    queryKey: ['budget-health-metrics', budgetPlanId],
    queryFn: () => budgetEnterpriseService.getBudgetHealthMetrics(budgetPlanId),
    refetchInterval: 5 * 60 * 1000, // Alle 5 Minuten aktualisieren
  });
};

export const useUpdateBudgetHealthMetrics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ budgetPlanId, metrics }: { 
      budgetPlanId: string; 
      metrics: any;
    }) => budgetEnterpriseService.updateBudgetHealthMetrics(budgetPlanId, metrics),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-health-metrics'] });
      toast({
        title: "Budget-Gesundheit aktualisiert",
        description: "Die Budget-Gesundheitsmetriken wurden erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Budget-Gesundheitsmetriken konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};
