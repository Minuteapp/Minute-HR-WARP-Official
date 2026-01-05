
import { supabase } from "@/integrations/supabase/client";

export interface ProjectApproval {
  id: string;
  project_id: string;
  approver_id: string;
  approval_type: 'budget' | 'timeline' | 'resources' | 'completion';
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export const projectApprovalService = {
  // Neue Genehmigungsanfrage erstellen
  async requestApproval(
    projectId: string, 
    approverId: string, 
    approvalType: ProjectApproval['approval_type'], 
    comments?: string
  ): Promise<ProjectApproval> {
    console.log('Creating approval request:', { projectId, approverId, approvalType, comments });
    
    const { data, error } = await supabase
      .from('project_approvals')
      .insert({
        project_id: projectId,
        approver_id: approverId,
        approval_type: approvalType,
        comments: comments,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating approval request:', error);
      throw error;
    }

    console.log('Approval request created successfully:', data);
    return data;
  },

  // Genehmigungen für ein Projekt abrufen
  async getProjectApprovals(projectId: string): Promise<ProjectApproval[]> {
    console.log('Fetching approvals for project:', projectId);
    
    const { data, error } = await supabase
      .from('project_approvals')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project approvals:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} approvals for project ${projectId}`);
    return data || [];
  },

  // Genehmigungen für einen Genehmiger abrufen
  async getApprovalRequests(approverId: string): Promise<ProjectApproval[]> {
    console.log('Fetching approval requests for approver:', approverId);
    
    const { data, error } = await supabase
      .from('project_approvals')
      .select(`
        *,
        projects!inner(name, description)
      `)
      .eq('approver_id', approverId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approval requests:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} approval requests for approver ${approverId}`);
    return data || [];
  },

  // Genehmigung erteilen
  async approveRequest(approvalId: string, comments?: string): Promise<ProjectApproval> {
    console.log('Approving request:', approvalId, comments);
    
    const { data, error } = await supabase
      .from('project_approvals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        comments: comments
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) {
      console.error('Error approving request:', error);
      throw error;
    }

    console.log('Request approved successfully:', data);
    return data;
  },

  // Genehmigung ablehnen
  async rejectRequest(approvalId: string, comments?: string): Promise<ProjectApproval> {
    console.log('Rejecting request:', approvalId, comments);
    
    const { data, error } = await supabase
      .from('project_approvals')
      .update({
        status: 'rejected',
        comments: comments
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }

    console.log('Request rejected successfully:', data);
    return data;
  },

  // Prüfen ob alle erforderlichen Genehmigungen erteilt wurden
  async checkApprovalStatus(projectId: string): Promise<{ 
    allApproved: boolean; 
    pendingApprovals: ProjectApproval[];
    approvedApprovals: ProjectApproval[];
  }> {
    console.log('Checking approval status for project:', projectId);
    
    const { data, error } = await supabase
      .from('project_approvals')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error checking approval status:', error);
      throw error;
    }

    const approvals = data || [];
    const pendingApprovals = approvals.filter(a => a.status === 'pending');
    const approvedApprovals = approvals.filter(a => a.status === 'approved');
    const allApproved = pendingApprovals.length === 0 && approvals.length > 0;

    console.log('Approval status:', { allApproved, pendingCount: pendingApprovals.length, approvedCount: approvedApprovals.length });
    
    return {
      allApproved,
      pendingApprovals,
      approvedApprovals
    };
  }
};
