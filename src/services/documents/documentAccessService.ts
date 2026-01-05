
import { supabase } from "@/integrations/supabase/client";
import type { DocumentPermission, DocumentVersion, DocumentAccessLog } from "@/types/documents";

export const documentAccessService = {
  async getDownloadUrl(filePath: string) {
    return await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60);
  },

  async getDocumentPermissions(documentId: string) {
    const { data, error } = await supabase
      .from('document_permissions')
      .select('*')
      .eq('document_id', documentId);

    if (error) throw error;
    return data as DocumentPermission[];
  },

  async grantDocumentPermission(documentId: string, userId: string, permissionLevel: 'view' | 'edit' | 'admin') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');

    const { data, error } = await supabase
      .from('document_permissions')
      .insert({
        document_id: documentId,
        user_id: userId,
        permission_level: permissionLevel,
        granted_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentPermission;
  },

  async getDocumentVersions(documentId: string) {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version', { ascending: false });

    if (error) throw error;
    return data as DocumentVersion[];
  },

  async logDocumentAccess(documentId: string, action: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');

    const { error } = await supabase
      .from('document_access_logs')
      .insert({
        document_id: documentId,
        user_id: user.id,
        action,
        ip_address: '', // This would come from the client
        user_agent: navigator.userAgent
      });

    if (error) throw error;
  }
};
