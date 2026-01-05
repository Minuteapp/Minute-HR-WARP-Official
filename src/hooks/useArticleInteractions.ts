import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Helper hook for tenant_id
const useCurrentTenant = () => {
  return { tenantId: 'default-tenant-id' };
};

export const useArticleInteractions = (articleId: string) => {
  const { user } = useAuth();
  const { tenantId } = useCurrentTenant();
  const queryClient = useQueryClient();

  // Track article view
  const trackView = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('knowledge_article_views')
        .insert({
          tenant_id: tenantId,
          article_id: articleId,
          user_id: user.id,
        });

      if (error) throw error;
    },
  });

  // Toggle favorite
  const { data: isFavorite } = useQuery({
    queryKey: ['favorite', articleId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('knowledge_article_favorites')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      if (isFavorite) {
        const { error } = await supabase
          .from('knowledge_article_favorites')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('knowledge_article_favorites')
          .insert({
            tenant_id: tenantId,
            article_id: articleId,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', articleId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        description: isFavorite ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt',
      });
    },
  });

  // Submit feedback
  const { data: userFeedback } = useQuery({
    queryKey: ['feedback', articleId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('knowledge_article_feedback')
        .select('*')
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitFeedback = useMutation({
    mutationFn: async (isHelpful: boolean) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('knowledge_article_feedback')
        .upsert({
          tenant_id: tenantId,
          article_id: articleId,
          user_id: user.id,
          is_helpful: isHelpful,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', articleId] });
      toast({ description: 'Feedback gespeichert' });
    },
  });

  // Comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_article_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('knowledge_article_comments')
        .insert({
          tenant_id: tenantId,
          article_id: articleId,
          user_id: user.id,
          content,
          parent_comment_id: parentId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      toast({ description: 'Kommentar hinzugefügt' });
    },
  });

  const updateComment = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const { error } = await supabase
        .from('knowledge_article_comments')
        .update({ content })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      toast({ description: 'Kommentar aktualisiert' });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('knowledge_article_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      toast({ description: 'Kommentar gelöscht' });
    },
  });

  // Related articles
  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['related-articles', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_article_relations')
        .select(`
          related_article_id,
          knowledge_articles!knowledge_article_relations_related_article_id_fkey (
            id,
            title,
            category,
            view_count
          )
        `)
        .eq('source_article_id', articleId)
        .order('relevance_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data?.map((d: any) => d.knowledge_articles) || [];
    },
  });

  return {
    trackView,
    isFavorite,
    toggleFavorite,
    userFeedback,
    submitFeedback,
    comments,
    commentsLoading,
    addComment,
    updateComment,
    deleteComment,
    relatedArticles,
  };
};
