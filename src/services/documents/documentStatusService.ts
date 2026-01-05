
import { supabase } from "@/integrations/supabase/client";
import type { Document, DocumentStats } from "@/types/documents";

export const documentStatsService = {
  async getDocumentStats(): Promise<DocumentStats> {
    // Gesamt-Dokumente
    const { count: totalDocuments, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (countError) throw countError;

    // Anzahl der Benutzer mit kürzlichen Dokumenten-Aktionen
    const { data: activeUsersData, error: activeUsersError } = await supabase
      .from('document_access_logs')
      .select('user_id')
      .gt('performed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (activeUsersError) throw activeUsersError;
    
    // Eindeutige Benutzer zählen
    const uniqueUsers = new Set(activeUsersData?.map(log => log.user_id));
    const activeUsers = uniqueUsers.size;

    // Kürzlich geänderte Dokumente
    const { count: recentlyModified, error: recentError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .gt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .is('deleted_at', null);

    if (recentError) throw recentError;

    // Ausstehende Genehmigungen
    const { count: pendingApprovals, error: pendingError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('requires_approval', true)
      .is('deleted_at', null);

    if (pendingError) throw pendingError;

    return {
      totalDocuments: totalDocuments || 0,
      activeUsers: activeUsers || 0,
      recentlyModified: recentlyModified || 0,
      pendingApprovals: pendingApprovals || 0
    };
  },

  async approveDocument(documentId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');

    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  },

  async rejectDocument(documentId: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'rejected'
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  },

  async archiveDocument(documentId: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  }
};
