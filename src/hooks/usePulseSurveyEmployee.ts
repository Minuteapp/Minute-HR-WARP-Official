import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface OpenSurvey {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedDuration: number;
  deadline?: string;
  isAnonymous: boolean;
}

export interface CompletedSurvey {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedDuration: number;
  completedAt: string;
  score: number;
}

export interface EmployeeStatistics {
  openSurveys: number;
  completedSurveys: number;
  participationRate: number;
}

export const usePulseSurveyEmployee = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Lade offene Umfragen für den aktuellen Mitarbeiter
  const { data: openSurveysData, isLoading: isLoadingOpen } = useQuery({
    queryKey: ['pulse-surveys-employee-open'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.tenant_id) throw new Error('No tenant found');

      // Lade aktive Umfragen
      const { data: surveys, error } = await supabase
        .from('pulse_surveys')
        .select(`
          id,
          title,
          description,
          end_date,
          is_anonymous,
          pulse_survey_questions(count)
        `)
        .eq('tenant_id', userRole.tenant_id)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      if (error) throw error;

      // Prüfe welche Umfragen der Benutzer bereits beantwortet hat
      const { data: completedResponses } = await supabase
        .from('pulse_survey_responses')
        .select('survey_id')
        .eq('respondent_id', user.id);

      const completedSurveyIds = new Set(completedResponses?.map(r => r.survey_id) || []);

      // Filtere bereits beantwortete Umfragen
      const openSurveys = surveys?.filter(s => !completedSurveyIds.has(s.id)) || [];

      return openSurveys.map(s => {
        const questionCount = (s.pulse_survey_questions as any)?.[0]?.count || 0;
        return {
          id: s.id,
          title: s.title,
          description: s.description || '',
          questionCount,
          estimatedDuration: Math.max(2, Math.ceil(questionCount / 2)),
          deadline: s.end_date,
          isAnonymous: s.is_anonymous
        };
      }) as OpenSurvey[];
    }
  });

  // Lade abgeschlossene Umfragen
  const { data: completedSurveysData, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['pulse-surveys-employee-completed'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.tenant_id) throw new Error('No tenant found');

      // Lade Responses des Benutzers mit Survey-Info
      const { data: responses, error } = await supabase
        .from('pulse_survey_responses')
        .select(`
          survey_id,
          created_at,
          answer_value,
          pulse_surveys(title)
        `)
        .eq('respondent_id', user.id)
        .eq('tenant_id', userRole.tenant_id);

      if (error) throw error;

      // Gruppiere nach Survey
      const surveyMap = new Map<string, { title: string; completedAt: string; scores: number[] }>();
      
      responses?.forEach(r => {
        if (!surveyMap.has(r.survey_id)) {
          surveyMap.set(r.survey_id, {
            title: (r.pulse_surveys as any)?.title || 'Umfrage',
            completedAt: r.created_at,
            scores: []
          });
        }
        if (r.answer_value && !isNaN(Number(r.answer_value))) {
          surveyMap.get(r.survey_id)!.scores.push(Number(r.answer_value));
        }
      });

      return Array.from(surveyMap.entries()).map(([id, data]) => ({
        id,
        title: data.title,
        description: '',
        questionCount: data.scores.length,
        estimatedDuration: Math.max(2, Math.ceil(data.scores.length / 2)),
        completedAt: data.completedAt,
        score: data.scores.length > 0 
          ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 20)
          : 0
      })) as CompletedSurvey[];
    }
  });

  // Berechne Statistiken
  const statistics: EmployeeStatistics = {
    openSurveys: openSurveysData?.length || 0,
    completedSurveys: completedSurveysData?.length || 0,
    participationRate: (openSurveysData?.length || 0) + (completedSurveysData?.length || 0) > 0
      ? Math.round(((completedSurveysData?.length || 0) / ((openSurveysData?.length || 0) + (completedSurveysData?.length || 0))) * 100)
      : 0
  };

  // Mutation zum Speichern einer Antwort
  const submitResponse = useMutation({
    mutationFn: async (params: { 
      surveyId: string; 
      questionId: string; 
      answerValue?: string; 
      textAnswer?: string 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.tenant_id) throw new Error('No tenant found');

      const { error } = await supabase
        .from('pulse_survey_responses')
        .insert({
          survey_id: params.surveyId,
          question_id: params.questionId,
          respondent_id: user.id,
          tenant_id: userRole.tenant_id,
          answer_value: params.answerValue,
          text_answer: params.textAnswer
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys-employee-open'] });
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys-employee-completed'] });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Die Antwort konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  });

  // Mutation zum Abschließen einer Umfrage
  const completeSurvey = useMutation({
    mutationFn: async (surveyId: string) => {
      // Die Umfrage gilt als abgeschlossen, wenn mindestens eine Antwort existiert
      // Der Trigger aktualisiert automatisch die Analytics
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys-employee-open'] });
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys-employee-completed'] });
      queryClient.invalidateQueries({ queryKey: ['pulse-kpis'] });
    },
    onSuccess: () => {
      toast({
        title: 'Umfrage abgeschlossen',
        description: 'Vielen Dank für Ihre Teilnahme!'
      });
    }
  });

  return {
    openSurveys: openSurveysData || [],
    completedSurveys: completedSurveysData || [],
    statistics,
    isLoading: isLoadingOpen || isLoadingCompleted,
    submitResponse: submitResponse.mutate,
    completeSurvey: completeSurvey.mutate,
    isSubmitting: submitResponse.isPending
  };
};
