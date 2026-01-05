import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook für Statistiken der Hauptseite
export const useKnowledgeHubStats = () => {
  // Meistgelesene Themen (Top-Kategorien nach Views)
  const { data: topCategories = [], isLoading: topCategoriesLoading } = useQuery({
    queryKey: ['knowledge-top-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('category, view_count')
        .eq('status', 'published')
        .order('view_count', { ascending: false });
      
      if (error) throw error;
      
      // Aggregiere nach Kategorie
      const categoryViews: Record<string, number> = {};
      (data || []).forEach((article: any) => {
        const category = article.category || 'Allgemein';
        categoryViews[category] = (categoryViews[category] || 0) + (article.view_count || 0);
      });
      
      // Sortiere und nimm Top 10
      return Object.entries(categoryViews)
        .map(([category, views]) => ({ category, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    },
  });

  // Berechne "Meistgelesene Themen" als Anzahl der Kategorien mit Views
  const mostReadTopicsCount = topCategories.filter(c => c.views > 0).length;

  // Aktualisierungsquote (Artikel, die in den letzten 90 Tagen aktualisiert wurden)
  const { data: updateRate = 0, isLoading: updateRateLoading } = useQuery({
    queryKey: ['knowledge-update-rate'],
    queryFn: async () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: allArticles, error: allError } = await supabase
        .from('knowledge_articles')
        .select('id')
        .eq('status', 'published');
      
      if (allError) throw allError;
      
      const { data: recentArticles, error: recentError } = await supabase
        .from('knowledge_articles')
        .select('id')
        .eq('status', 'published')
        .gte('updated_at', ninetyDaysAgo.toISOString());
      
      if (recentError) throw recentError;
      
      const total = allArticles?.length || 0;
      const recent = recentArticles?.length || 0;
      
      if (total === 0) return 100;
      return Math.round((recent / total) * 100);
    },
  });

  // Offene Feedbacks/Kommentare
  const { data: openFeedbackCount = 0, isLoading: feedbackLoading } = useQuery({
    queryKey: ['knowledge-open-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_article_comments')
        .select('id')
        .eq('is_resolved', false);
      
      if (error) {
        // Tabelle existiert vielleicht nicht - return 0
        console.log('knowledge_article_comments table may not exist');
        return 0;
      }
      
      return data?.length || 0;
    },
  });

  return {
    mostReadTopicsCount,
    updateRate,
    openFeedbackCount,
    topCategories,
    isLoading: topCategoriesLoading || updateRateLoading || feedbackLoading,
  };
};

// Hook für AI Governance Dashboard Daten
export const useAIGovernanceStats = () => {
  // Qualitätsprobleme: Artikel mit needs_review Status oder älter als 6 Monate ohne Update
  const { data: qualityIssues = [], isLoading: qualityLoading } = useQuery({
    queryKey: ['knowledge-quality-issues'],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('id, title, category, updated_at, status, ai_quality_score')
        .or(`status.eq.needs_review,updated_at.lt.${sixMonthsAgo.toISOString()}`)
        .order('updated_at', { ascending: true })
        .limit(20);
      
      if (error) throw error;
      
      return (data || []).map((article: any) => {
        const lastUpdate = new Date(article.updated_at);
        const monthsOld = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        let severity = 'medium';
        let issue = 'Prüfung erforderlich';
        
        if (monthsOld > 12) {
          severity = 'critical';
          issue = 'Stark veraltet';
        } else if (monthsOld > 6) {
          severity = 'high';
          issue = 'Veraltet';
        } else if (article.status === 'needs_review') {
          severity = 'medium';
          issue = 'Überprüfung angefordert';
        }
        
        return {
          id: article.id,
          title: article.title,
          category: article.category || 'Allgemein',
          severity,
          issue,
          lastUpdate: article.updated_at,
          suggestion: `Artikel aktualisieren (Letzte Änderung vor ${monthsOld} Monaten)`,
        };
      });
    },
  });

  // Autoren-Statistiken aus echten Daten
  const { data: authors = [], isLoading: authorsLoading } = useQuery({
    queryKey: ['knowledge-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('author_id, author_name, id, title, created_at, ai_quality_score, view_count')
        .eq('status', 'published');
      
      if (error) throw error;
      
      // Aggregiere nach Autor
      const authorStats: Record<string, any> = {};
      (data || []).forEach((article: any) => {
        const authorId = article.author_id || 'unknown';
        if (!authorStats[authorId]) {
          authorStats[authorId] = {
            id: authorId,
            name: article.author_name || 'Unbekannt',
            articleCount: 0,
            totalQuality: 0,
            totalViews: 0,
            recentArticles: [],
          };
        }
        authorStats[authorId].articleCount++;
        authorStats[authorId].totalQuality += article.ai_quality_score || 80;
        authorStats[authorId].totalViews += article.view_count || 0;
        authorStats[authorId].recentArticles.push({
          title: article.title,
          date: article.created_at,
          quality: article.ai_quality_score || 80,
        });
      });
      
      // Berechne Durchschnitte und sortiere
      return Object.values(authorStats)
        .map((author: any) => ({
          ...author,
          quality: Math.round(author.totalQuality / author.articleCount),
          views: author.totalViews > 1000 
            ? `${(author.totalViews / 1000).toFixed(1)}k` 
            : author.totalViews.toString(),
          recentArticles: author.recentArticles
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3),
        }))
        .sort((a: any, b: any) => b.articleCount - a.articleCount)
        .slice(0, 10);
    },
  });

  // Content Health Score
  const { data: contentHealth = 87, isLoading: healthLoading } = useQuery({
    queryKey: ['knowledge-content-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('ai_quality_score, status')
        .eq('status', 'published');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 100;
      
      const avgQuality = data.reduce((sum: number, a: any) => sum + (a.ai_quality_score || 80), 0) / data.length;
      return Math.round(avgQuality);
    },
  });

  // Offene Issues Count
  const openIssuesCount = qualityIssues.length;
  const criticalCount = qualityIssues.filter((i: any) => i.severity === 'critical').length;

  return {
    qualityIssues,
    authors,
    contentHealth,
    openIssuesCount,
    criticalCount,
    isLoading: qualityLoading || authorsLoading || healthLoading,
  };
};
