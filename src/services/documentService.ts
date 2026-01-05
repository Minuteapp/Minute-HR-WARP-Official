
import { supabase } from "@/integrations/supabase/client";
import type { Document, DocumentCategory, DocumentStatus, DocumentStats } from "@/types/documents";
import { documentCrudService } from './documents/documentCrudService';
import { documentStatsService } from './documents/documentStatusService';

export type DocumentUserRole = 'superadmin' | 'admin' | 'hr' | 'hr_admin' | 'manager' | 'employee' | 'finance_controller';

interface GetDocumentsOptions {
  category?: DocumentCategory;
  status?: DocumentStatus;
  search?: string;
  employee_id?: string;
  role?: DocumentUserRole;
  userId?: string;
  teamId?: string;
}

export const documentService = {
  // CRUD Operations
  async getDocuments(options?: GetDocumentsOptions): Promise<(Document & { author_name?: string; author_avatar?: string })[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.employee_id) {
      query = query.eq('created_by', options.employee_id);
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%,file_name.ilike.%${options.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as (Document & { author_name?: string; author_avatar?: string })[];
  },

  // Rollenbasierte Dokumentenabfrage
  async getDocumentsForRole(role: DocumentUserRole, userId: string, teamId?: string): Promise<Document[]> {
    const canViewAll = ['superadmin', 'admin', 'hr', 'hr_admin', 'finance_controller'].includes(role);
    const canViewTeam = ['manager'].includes(role);

    let query = supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (canViewAll) {
      // Admin/HR können alle Dokumente sehen
      // Keine zusätzlichen Filter
    } else if (canViewTeam && teamId) {
      // Manager können Team-Dokumente und eigene sehen
      query = query.or(`created_by.eq.${userId},team_id.eq.${teamId}`);
    } else {
      // Mitarbeiter können nur eigene Dokumente sehen
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Document[];
  },

  async getDocumentsByCategory(category: DocumentCategory): Promise<Document[]> {
    return documentCrudService.getDocumentsByCategory(category);
  },

  async getDocumentById(id: string): Promise<Document> {
    const document = await documentCrudService.getDocumentById(id);
    
    // Log document access
    await this.logDocumentAccess(id, 'view');
    
    return document;
  },

  async createDocument(data: Partial<Document>): Promise<Document> {
    const { data: document, error } = await supabase
      .from('documents')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    
    // Log document creation
    await this.logDocumentAccess(document.id, 'create');
    
    return document as Document;
  },

  async uploadDocument(file: File, data: Partial<Document>, enableAiAnalysis: boolean = false): Promise<{ document: Document; aiAnalysis: any }> {
    const result = await documentCrudService.uploadDocument(file, data, enableAiAnalysis);
    
    // Log document upload
    await this.logDocumentAccess(result.document.id, 'upload');
    
    return result;
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const document = await documentCrudService.updateDocument(id, updates);
    
    // Log document update
    await this.logDocumentAccess(id, 'update');
    
    return document;
  },

  async deleteDocument(id: string): Promise<void> {
    await documentCrudService.deleteDocument(id);
    
    // Log document deletion
    await this.logDocumentAccess(id, 'delete');
  },

  async getDownloadUrl(filePath: string, documentId?: string) {
    if (documentId) {
      // Log download access
      await this.logDocumentAccess(documentId, 'download');
    }
    
    return documentCrudService.getDownloadUrl(filePath);
  },

  async logDocumentAccess(documentId: string, action: string): Promise<void> {
    const { error } = await supabase
      .from('document_access_logs')
      .insert({
        document_id: documentId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action,
        performed_at: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });

    if (error) {
      console.warn('Could not log document access:', error);
    }
  },

  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not get client IP:', error);
      return 'unknown';
    }
  },

  // Stats and Analytics
  async getDocumentStats(): Promise<DocumentStats> {
    try {
      // Gesamt-Dokumente
      const { count: totalDocuments, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (countError) throw countError;

      // Anzahl der Benutzer mit kürzlichen Dokumenten-Aktionen (letzten 30 Tage)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('document_access_logs')
        .select('user_id')
        .gt('performed_at', thirtyDaysAgo.toISOString());

      if (activeUsersError) {
        console.warn('Could not fetch active users:', activeUsersError);
      }

      // Eindeutige Benutzer zählen
      const uniqueUsers = new Set(activeUsersData?.map(log => log.user_id) || []);
      const activeUsers = uniqueUsers.size;

      // Kürzlich geänderte Dokumente (letzten 7 Tage)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentDocsData, error: recentError } = await supabase
        .from('documents')
        .select('id, status, created_by, updated_at, created_at')
        .gt('updated_at', sevenDaysAgo.toISOString())
        .is('deleted_at', null);

      if (recentError) throw recentError;

      const recentlyModified = recentDocsData?.length || 0;

      // Ausstehende Genehmigungen
      const { count: pendingApprovals, error: pendingError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .is('deleted_at', null);

      if (pendingError) throw pendingError;

      return {
        totalDocuments: totalDocuments || 0,
        activeUsers: activeUsers || 0,
        recentlyModified: recentlyModified || 0,
        pendingApprovals: pendingApprovals || 0
      };
    } catch (error) {
      console.error('Error fetching document stats:', error);
      return {
        totalDocuments: 0,
        activeUsers: 0,
        recentlyModified: 0,
        pendingApprovals: 0
      };
    }
  },

  // Document Approval Workflow
  async submitForApproval(documentId: string, approverIds: string[], workflowName: string, deadline?: string, comments?: string): Promise<Document> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) throw new Error('Nicht authentifiziert');

    // 1. Dokument aktualisieren
    const { data: document, error: docError } = await supabase
      .from('documents')
      .update({
        status: 'pending',
        requires_approval: true,
        approval_deadline: deadline ? new Date(deadline).toISOString() : null,
        approval_comments: comments
      })
      .eq('id', documentId)
      .select()
      .single();

    if (docError) throw docError;

    // 2. Einträge in document_approvals für jeden Genehmiger erstellen
    const approvalInserts = approverIds.map((approverId, index) => ({
      document_id: documentId,
      approver_id: approverId,
      status: 'pending',
      step_order: index + 1,
      workflow_name: workflowName
    }));

    const { error: approvalError } = await supabase
      .from('document_approvals')
      .insert(approvalInserts);

    if (approvalError) throw approvalError;

    // 3. Requester-Name holen
    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUser.id)
      .single();

    // 4. Edge Function für jeden Genehmiger aufrufen (E-Mail + In-App Benachrichtigung)
    for (const approverId of approverIds) {
      try {
        await supabase.functions.invoke('notify-document-approval', {
          body: {
            document_id: documentId,
            document_title: document.title,
            approver_id: approverId,
            requester_id: currentUser.id,
            requester_name: requesterProfile?.full_name || currentUser.email
          }
        });
      } catch (notifyError) {
        console.warn('Benachrichtigung konnte nicht gesendet werden:', notifyError);
      }
    }

    // 5. Log document submission
    await this.logDocumentAccess(documentId, 'submit_for_approval');

    return document as Document;
  },

  // Document Management
  async approveDocument(documentId: string, approvalId?: string): Promise<Document> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    const document = await documentStatsService.approveDocument(documentId);
    
    // Log approval
    await this.logDocumentAccess(documentId, 'approve');
    
    // E-Mail an Ersteller senden
    try {
      await supabase.functions.invoke('notify-document-decision', {
        body: {
          document_id: documentId,
          document_title: document.title,
          decision: 'approved',
          approver_id: currentUser?.id,
          requester_id: document.created_by
        }
      });
    } catch (notifyError) {
      console.warn('Entscheidungs-Benachrichtigung konnte nicht gesendet werden:', notifyError);
    }
    
    return document;
  },

  async rejectDocument(documentId: string, rejectionReason?: string): Promise<Document> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    const document = await documentStatsService.rejectDocument(documentId);
    
    // Log rejection
    await this.logDocumentAccess(documentId, 'reject');
    
    // E-Mail an Ersteller senden
    try {
      await supabase.functions.invoke('notify-document-decision', {
        body: {
          document_id: documentId,
          document_title: document.title,
          decision: 'rejected',
          rejection_reason: rejectionReason,
          approver_id: currentUser?.id,
          requester_id: document.created_by
        }
      });
    } catch (notifyError) {
      console.warn('Entscheidungs-Benachrichtigung konnte nicht gesendet werden:', notifyError);
    }
    
    return document;
  },

  async archiveDocument(documentId: string): Promise<Document> {
    const document = await documentStatsService.archiveDocument(documentId);
    
    // Log archiving
    await this.logDocumentAccess(documentId, 'archive');
    
    return document;
  },

  // Search
  async searchDocuments(query: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,file_name.ilike.%${query}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as Document[];
  }
};
