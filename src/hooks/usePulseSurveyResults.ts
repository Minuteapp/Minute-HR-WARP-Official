import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SurveyResultsData {
  kpis: {
    avgScore: number;
    scoreTrend: string;
    participation: number;
    totalEmployees: number;
    respondents: number;
    comments: number;
    commentRate: number;
    criticalAreas: string[];
  };
  categories: Array<{
    category: string;
    value: number;
  }>;
  sentiment: {
    positive: number;
    neutral: number;
    critical: number;
  };
  departments: Array<{
    name: string;
    count: number;
    engagement: number;
    workload: number;
    satisfaction: number;
  }>;
  themes: Array<{
    name: string;
    sentiment: 'mixed' | 'positive' | 'negative';
    mentions: number;
    progress: number;
  }>;
  aiInsights: {
    main: {
      title: string;
      description: string;
    };
    critical: {
      title: string;
      description: string;
      action: string;
    };
    positive: {
      title: string;
      description: string;
    };
  };
}

const emptyResults: SurveyResultsData = {
  kpis: {
    avgScore: 0,
    scoreTrend: '+0',
    participation: 0,
    totalEmployees: 0,
    respondents: 0,
    comments: 0,
    commentRate: 0,
    criticalAreas: []
  },
  categories: [],
  sentiment: {
    positive: 0,
    neutral: 0,
    critical: 0
  },
  departments: [],
  themes: [],
  aiInsights: {
    main: {
      title: 'Keine Daten',
      description: 'Es liegen noch keine Umfrageergebnisse vor.'
    },
    critical: {
      title: '',
      description: '',
      action: ''
    },
    positive: {
      title: '',
      description: ''
    }
  }
};

export const usePulseSurveyResults = (surveyId?: string) => {
  const { data: results, isLoading } = useQuery({
    queryKey: ['pulse-survey-results', surveyId],
    queryFn: async (): Promise<SurveyResultsData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.tenant_id) throw new Error('No tenant found');

      // Lade Analytics für die spezifische Umfrage oder alle
      let analyticsQuery = supabase
        .from('pulse_survey_analytics')
        .select('*')
        .eq('tenant_id', userRole.tenant_id);

      if (surveyId) {
        analyticsQuery = analyticsQuery.eq('survey_id', surveyId);
      }

      const { data: analytics } = await analyticsQuery.order('calculated_at', { ascending: false }).limit(1).maybeSingle();

      // Lade alle Responses
      let responsesQuery = supabase
        .from('pulse_survey_responses')
        .select('*, pulse_survey_questions(category, question_text)')
        .eq('tenant_id', userRole.tenant_id);

      if (surveyId) {
        responsesQuery = responsesQuery.eq('survey_id', surveyId);
      }

      const { data: responses } = await responsesQuery;

      // Lade Mitarbeiter-Anzahl
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Lade AI Insights
      let insightsQuery = supabase
        .from('pulse_ai_insights')
        .select('*')
        .eq('tenant_id', userRole.tenant_id);

      if (surveyId) {
        insightsQuery = insightsQuery.eq('survey_id', surveyId);
      }

      const { data: aiInsights } = await insightsQuery.order('created_at', { ascending: false }).limit(3);

      if (!responses || responses.length === 0) {
        return emptyResults;
      }

      // Berechne KPIs
      const uniqueRespondents = new Set(responses.map(r => r.respondent_id)).size;
      const textResponses = responses.filter(r => r.text_answer && r.text_answer.length > 0);
      
      // Kategorisiere Antworten
      const categoryScores = new Map<string, number[]>();
      responses.forEach(r => {
        const category = (r.pulse_survey_questions as any)?.category || 'Allgemein';
        if (!categoryScores.has(category)) {
          categoryScores.set(category, []);
        }
        if (r.answer_value && !isNaN(Number(r.answer_value))) {
          categoryScores.get(category)!.push(Number(r.answer_value));
        }
      });

      const categories = Array.from(categoryScores.entries()).map(([category, scores]) => ({
        category,
        value: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 20) : 0
      }));

      // Sentiment-Analyse (basierend auf Scores)
      const allScores = responses
        .filter(r => r.answer_value && !isNaN(Number(r.answer_value)))
        .map(r => Number(r.answer_value));

      const positive = allScores.filter(s => s >= 4).length;
      const neutral = allScores.filter(s => s === 3).length;
      const critical = allScores.filter(s => s <= 2).length;
      const total = positive + neutral + critical || 1;

      // Kritische Bereiche identifizieren
      const criticalAreas = categories
        .filter(c => c.value < 50)
        .map(c => c.category);

      // AI Insights formatieren
      const mainInsight = aiInsights?.find(i => i.insight_type === 'main');
      const criticalInsight = aiInsights?.find(i => i.insight_type === 'critical');
      const positiveInsight = aiInsights?.find(i => i.insight_type === 'positive');

      return {
        kpis: {
          avgScore: analytics?.engagement_score || 0,
          scoreTrend: analytics ? '+0' : '+0',
          participation: analytics?.participation_rate || 0,
          totalEmployees: employeeCount || 0,
          respondents: uniqueRespondents,
          comments: textResponses.length,
          commentRate: uniqueRespondents > 0 ? Math.round((textResponses.length / uniqueRespondents) * 100) : 0,
          criticalAreas
        },
        categories,
        sentiment: {
          positive: Math.round((positive / total) * 100),
          neutral: Math.round((neutral / total) * 100),
          critical: Math.round((critical / total) * 100)
        },
        departments: [], // Müsste aus Department-Zuordnung kommen
        themes: [], // Müsste aus AI-Analyse kommen
        aiInsights: {
          main: {
            title: mainInsight?.title || 'Analyse ausstehend',
            description: mainInsight?.description || 'Die KI-Analyse wird nach Abschluss der Umfrage durchgeführt.'
          },
          critical: {
            title: criticalInsight?.title || '',
            description: criticalInsight?.description || '',
            action: (criticalInsight?.recommendations as any)?.[0] || ''
          },
          positive: {
            title: positiveInsight?.title || '',
            description: positiveInsight?.description || ''
          }
        }
      };
    },
    enabled: true
  });

  return {
    results: results || emptyResults,
    isLoading
  };
};
