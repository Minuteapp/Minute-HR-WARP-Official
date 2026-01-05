import { supabase } from "@/integrations/supabase/client";

export interface DocumentApproval {
  id: string;
  document_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejection_reason?: string;
}

export const documentApprovalService = {
  async getDocumentApprovals(documentId: string) {
    const { data, error } = await supabase
      .from('document_approvals')
      .select(`
        *,
        approver:approver_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (DocumentApproval & { approver: any })[];
  },

  async approveDocument(approvalId: string, comments?: string) {
    const { data, error } = await supabase
      .from('document_approvals')
      .update({
        status: 'approved',
        comments,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) throw error;
    return data as DocumentApproval;
  },

  async rejectDocument(approvalId: string, rejectionReason: string) {
    const { data, error } = await supabase
      .from('document_approvals')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) throw error;
    return data as DocumentApproval;
  },

  async getPendingApprovals(userId: string) {
    const { data, error } = await supabase
      .from('document_approvals')
      .select(`
        *,
        document:document_id (
          id,
          title,
          category,
          created_by,
          created_at
        )
      `)
      .eq('approver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};