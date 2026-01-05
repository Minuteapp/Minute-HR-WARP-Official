
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetEnterpriseService } from '@/services/budgetEnterpriseService';
import { useToast } from '@/hooks/use-toast';
import type {
  EnterpriseForcast,
  CreateEnterpriseForcastRequest,
  BudgetApprovalWorkflow
} from '@/types/budgetEnterprise';

export const useBudgetEnterprise = () => {
  return useQuery({
    queryKey: ['budget-enterprise'],
    queryFn: () => budgetEnterpriseService.getEnterpriseForecasts(),
  });
};

export const useEnterpriseForecasts = (filters?: {
  dimension_type?: string;
  scenario_type?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['enterprise-forecasts', filters],
    queryFn: () => budgetEnterpriseService.getEnterpriseForecasts(filters),
  });
};

export const useBudgetDimensions = () => {
  return useQuery({
    queryKey: ['budget-dimensions'],
    queryFn: () => budgetEnterpriseService.getBudgetDimensions(),
  });
};

export const useCreateEnterpriseForecast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CreateEnterpriseForcastRequest) =>
      budgetEnterpriseService.createEnterpriseForecast(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-forecasts'] });
      toast({
        title: "Enterprise Forecast erstellt",
        description: "Der Enterprise Forecast wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Enterprise Forecast konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useApprovalWorkflows = () => {
  return useQuery({
    queryKey: ['approval-workflows'],
    queryFn: () => budgetEnterpriseService.getApprovalWorkflows(),
  });
};

export const useApproveWorkflowStep = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ workflowId, stepId, comments }: { 
      workflowId: string; 
      stepId: string; 
      comments?: string 
    }) => budgetEnterpriseService.approveWorkflowStep(workflowId, stepId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast({
        title: "Genehmigung erfolgreich",
        description: "Der Workflow-Schritt wurde genehmigt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Genehmigung konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
    },
  });
};
