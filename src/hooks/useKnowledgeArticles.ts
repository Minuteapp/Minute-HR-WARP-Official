import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Simple tenant hook - get current tenant from user_tenants
const useCurrentTenant = () => {
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();
      
      return data ? { id: data.tenant_id } : null;
    },
  });
  
  return { currentTenant };
};

export const useKnowledgeArticles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTenant } = useCurrentTenant();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: async () => {
      // Tabelle hat keine tenant_id Spalte - lade alle veröffentlichten Artikel
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: pendingApprovals = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ['knowledge-approvals', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      
      const { data, error } = await supabase
        .from('knowledge_article_approvals')
        .select(`
          *,
          knowledge_articles (*)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  const createArticle = useMutation({
    mutationFn: async (articleData: any) => {
      if (!currentTenant?.id) throw new Error('Kein Tenant ausgewählt');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      const { data, error } = await supabase
        .from('knowledge_articles')
        .insert([{
          ...articleData,
          tenant_id: currentTenant.id,
          author_id: user.id,
          word_count: articleData.content?.split(/\s+/).length || 0,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      toast({
        title: "Artikel erstellt",
        description: "Der Artikel wurde erfolgreich erstellt.",
      });
    },
  });

  const updateArticle = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      toast({
        title: "Artikel aktualisiert",
        description: "Der Artikel wurde erfolgreich aktualisiert.",
      });
    },
  });

  const submitForApproval = useMutation({
    mutationFn: async (articleId: string) => {
      if (!currentTenant?.id) throw new Error('Kein Tenant ausgewählt');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      // Update article status
      await supabase
        .from('knowledge_articles')
        .update({ status: 'pending_review' })
        .eq('id', articleId);

      // Create approval entry
      const { data, error } = await supabase
        .from('knowledge_article_approvals')
        .insert([{
          tenant_id: currentTenant.id,
          article_id: articleId,
          status: 'pending',
          reviewer_id: user.id, // In real app, assign to actual reviewer
          priority: 'medium'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-approvals'] });
      toast({
        title: "Zur Freigabe eingereicht",
        description: "Der Artikel wurde zur Prüfung eingereicht.",
      });
    },
  });

  const approveArticle = useMutation({
    mutationFn: async ({ approvalId, articleId }: { approvalId: string, articleId: string }) => {
      // Update approval
      await supabase
        .from('knowledge_article_approvals')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      // Update article
      const { data, error } = await supabase
        .from('knowledge_articles')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', articleId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-approvals'] });
      toast({
        title: "Artikel genehmigt",
        description: "Der Artikel wurde genehmigt und veröffentlicht.",
      });
    },
  });

  const rejectArticle = useMutation({
    mutationFn: async ({ approvalId, articleId, feedback }: { approvalId: string, articleId: string, feedback: string }) => {
      // Update approval
      await supabase
        .from('knowledge_article_approvals')
        .update({ 
          status: 'rejected',
          feedback,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      // Update article
      const { data, error } = await supabase
        .from('knowledge_articles')
        .update({ status: 'rejected' })
        .eq('id', articleId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-approvals'] });
      toast({
        title: "Artikel abgelehnt",
        description: "Der Artikel wurde abgelehnt.",
      });
    },
  });

  return {
    articles,
    pendingApprovals,
    isLoading: isLoading || approvalsLoading,
    createArticle: createArticle.mutateAsync,
    updateArticle: updateArticle.mutateAsync,
    submitForApproval: submitForApproval.mutateAsync,
    approveArticle: approveArticle.mutateAsync,
    rejectArticle: rejectArticle.mutateAsync,
    isCreating: createArticle.isPending,
    isUpdating: updateArticle.isPending,
  };
};
