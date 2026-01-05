
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BudgetTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: string;
  budget_categories: any[];
  fields: any[];
  default_values: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useBudgetTemplates = () => {
  return useQuery({
    queryKey: ['budget-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BudgetTemplate[];
    },
  });
};

export const useCreateBudgetTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: Omit<BudgetTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Stelle sicher, dass template_type ein gültiger Wert ist
      const validTemplateTypes = ['budget', 'personnel', 'project', 'growth', 'crisis', 'custom', 'forecast', 'budget_plan', 'expense_report', 'payroll'];
      const templateType = validTemplateTypes.includes(template.template_type) 
        ? template.template_type 
        : 'budget';
      
      const { data, error } = await supabase
        .from('budget_templates')
        .insert({
          ...template,
          template_type: templateType,
          created_by: user?.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as BudgetTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-templates'] });
      toast({
        title: "Vorlage erstellt",
        description: "Die Budget-Vorlage wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Budget-Vorlage konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};
