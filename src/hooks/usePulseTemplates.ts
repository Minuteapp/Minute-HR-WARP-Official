import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TemplateQuestion {
  id: string;
  question: string;
  category: string;
  type: string;
  rationale?: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  questions: TemplateQuestion[];
  is_system_template: boolean;
  created_at: string;
}

export const usePulseTemplates = () => {
  const queryClient = useQueryClient();

  // Lade alle Templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['pulse-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Lade System-Templates und eigene Templates
      const { data, error } = await supabase
        .from('pulse_survey_templates')
        .select('*')
        .or(`is_system_template.eq.true,created_by.eq.${user?.id || '00000000-0000-0000-0000-000000000000'}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return (data || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        questions: (t.questions as TemplateQuestion[]) || [],
        is_system_template: t.is_system_template,
        created_at: t.created_at
      })) as Template[];
    }
  });

  // Speichere neues Template
  const saveTemplate = useMutation({
    mutationFn: async ({ name, description, questions }: { 
      name: string; 
      description?: string;
      questions: TemplateQuestion[] 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      // Hole tenant_id
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('pulse_survey_templates')
        .insert({
          name,
          description: description || null,
          questions: questions as any,
          template_type: 'custom',
          is_system_template: false,
          is_active: true,
          created_by: user.id,
          tenant_id: userRole?.tenant_id || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-templates'] });
      toast.success('Vorlage erfolgreich gespeichert');
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast.error('Fehler beim Speichern der Vorlage');
    }
  });

  // Template-Vorschläge für den Dialog (kombiniert DB + Fallback)
  const templateSuggestions = templates?.slice(0, 4).map(t => ({
    id: t.id,
    label: t.name,
    description: t.description
  })) || [];

  // Fallback wenn keine Templates in DB
  const fallbackSuggestions = [
    { id: "remote", label: "Feedback zur Remote-Work-Kultur", description: null },
    { id: "onboarding", label: "Onboarding-Erfahrung neuer Mitarbeiter", description: null },
    { id: "diversity", label: "Diversity & Inclusion im Team", description: null },
    { id: "mentoring", label: "Mentoring-Programm Evaluation", description: null },
  ];

  return {
    templates: templates || [],
    templateSuggestions: templateSuggestions.length > 0 ? templateSuggestions : fallbackSuggestions,
    isLoading,
    saveTemplate: saveTemplate.mutate,
    isSaving: saveTemplate.isPending
  };
};
