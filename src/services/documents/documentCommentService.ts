import { supabase } from "@/integrations/supabase/client";

export interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const documentCommentService = {
  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    const { data, error } = await supabase
      .from('document_comments')
      .select(`
        *,
        user:profiles!document_comments_user_id_fkey(full_name, avatar_url)
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as DocumentComment[];
  },

  async createComment(documentId: string, commentText: string): Promise<DocumentComment> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) throw new Error('Nicht authentifiziert');

    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        user_id: currentUser.id,
        comment_text: commentText
      })
      .select(`
        *,
        user:profiles!document_comments_user_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data as DocumentComment;
  },

  async updateComment(commentId: string, commentText: string): Promise<DocumentComment> {
    const { data, error } = await supabase
      .from('document_comments')
      .update({ 
        comment_text: commentText,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        user:profiles!document_comments_user_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data as DocumentComment;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }
};
