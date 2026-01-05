
import { supabase } from "@/integrations/supabase/client";
import type { DocumentStats } from "@/types/documents";

export const documentStatsService = {
  async getDocumentStats(): Promise<DocumentStats> {
    const { count: totalDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .is('archived_at', null);

    const { data: activeUsersData } = await supabase
      .from('document_access_logs')
      .select('user_id', { count: 'exact', head: true })
      .gte('performed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .not('user_id', 'is', null);

    const { data: recentlyModified } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .is('deleted_at', null)
      .is('archived_at', null);

    const { data: pendingApprovals } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .is('deleted_at', null)
      .is('archived_at', null);

    return {
      totalDocuments: totalDocuments || 0,
      activeUsers: activeUsersData?.length || 0,
      recentlyModified: recentlyModified?.length || 0,
      pendingApprovals: pendingApprovals?.length || 0
    };
  }
};
