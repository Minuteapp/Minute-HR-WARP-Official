import { supabase } from '@/integrations/supabase/client';
import type { Document } from '@/types/documents';

export interface DocumentProjectLink {
  id: string;
  document_id: string;
  project_id: string;
  relevance_score: number;
  auto_linked: boolean;
  linked_at: string;
  linked_by?: string;
  metadata: Record<string, any>;
}

export interface DocumentTaskLink {
  id: string;
  document_id: string;
  task_id: string;
  relevance_score: number;
  auto_linked: boolean;
  linked_at: string;
  linked_by?: string;
  metadata: Record<string, any>;
}

export interface DocumentLinkingRule {
  id: string;
  rule_name: string;
  rule_type: 'keyword' | 'category' | 'title_match' | 'content_analysis';
  rule_config: Record<string, any>;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export const documentLinkingService = {
  // Dokument-Projekt-Verknüpfungen abrufen
  async getDocumentProjectLinks(documentId?: string, projectId?: string) {
    let query = supabase
      .from('document_project_links')
      .select(`
        *,
        documents(id, title, category),
        projects(id, name, description)
      `);

    if (documentId) {
      query = query.eq('document_id', documentId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('relevance_score', { ascending: false });
    
    if (error) throw error;
    return data as DocumentProjectLink[];
  },

  // Dokument-Aufgaben-Verknüpfungen abrufen
  async getDocumentTaskLinks(documentId?: string, taskId?: string) {
    let query = supabase
      .from('document_task_links')
      .select(`
        *,
        documents(id, title, category),
        tasks(id, title, description)
      `);

    if (documentId) {
      query = query.eq('document_id', documentId);
    }
    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data, error } = await query.order('relevance_score', { ascending: false });
    
    if (error) throw error;
    return data as DocumentTaskLink[];
  },

  // Manuelle Dokument-Projekt-Verknüpfung erstellen
  async createDocumentProjectLink(documentId: string, projectId: string, relevanceScore: number = 1.0) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('document_project_links')
      .insert({
        document_id: documentId,
        project_id: projectId,
        relevance_score: relevanceScore,
        auto_linked: false,
        linked_by: user?.id,
        metadata: { manual_link: true }
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentProjectLink;
  },

  // Manuelle Dokument-Aufgaben-Verknüpfung erstellen
  async createDocumentTaskLink(documentId: string, taskId: string, relevanceScore: number = 1.0) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('document_task_links')
      .insert({
        document_id: documentId,
        task_id: taskId,
        relevance_score: relevanceScore,
        auto_linked: false,
        linked_by: user?.id,
        metadata: { manual_link: true }
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentTaskLink;
  },

  // Verknüpfung löschen
  async removeDocumentProjectLink(linkId: string) {
    const { error } = await supabase
      .from('document_project_links')
      .delete()
      .eq('id', linkId);

    if (error) throw error;
  },

  async removeDocumentTaskLink(linkId: string) {
    const { error } = await supabase
      .from('document_task_links')
      .delete()
      .eq('id', linkId);

    if (error) throw error;
  },

  // Verknüpfungsregeln abrufen
  async getLinkingRules() {
    const { data, error } = await supabase
      .from('document_linking_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    return data as DocumentLinkingRule[];
  },

  // Verknüpfungsregel erstellen/aktualisieren
  async upsertLinkingRule(rule: Partial<DocumentLinkingRule>) {
    const { data, error } = await supabase
      .from('document_linking_rules')
      .upsert(rule)
      .select()
      .single();

    if (error) throw error;
    return data as DocumentLinkingRule;
  },

  // Automatische Verknüpfung für Dokument auslösen
  async triggerAutoLinking(documentId: string) {
    const { data, error } = await supabase.rpc('auto_link_documents', {
      document_id: documentId
    });

    if (error) throw error;
    return data;
  },

  // Verknüpfte Projekte für ein Dokument abrufen
  async getLinkedProjects(documentId: string) {
    const { data, error } = await supabase
      .from('document_project_links')
      .select(`
        id,
        relevance_score,
        auto_linked,
        projects!inner(id, name, description, status)
      `)
      .eq('document_id', documentId)
      .order('relevance_score', { ascending: false });

    if (error) throw error;
    
    // Transform data to ensure projects is an object, not an array
    return data?.map(link => ({
      ...link,
      projects: Array.isArray(link.projects) ? link.projects[0] : link.projects
    })) || [];
  },

  // Verknüpfte Aufgaben für ein Dokument abrufen
  async getLinkedTasks(documentId: string) {
    const { data, error } = await supabase
      .from('document_task_links')
      .select(`
        id,
        relevance_score,
        auto_linked,
        tasks!inner(id, title, description, status, priority)
      `)
      .eq('document_id', documentId)
      .order('relevance_score', { ascending: false });

    if (error) throw error;
    
    // Transform data to ensure tasks is an object, not an array
    return data?.map(link => ({
      ...link,
      tasks: Array.isArray(link.tasks) ? link.tasks[0] : link.tasks
    })) || [];
  },

  // Ähnliche Dokumente basierend auf Verknüpfungen finden
  async getSimilarDocuments(documentId: string) {
    const { data: projectLinks } = await supabase
      .from('document_project_links')
      .select('project_id')
      .eq('document_id', documentId);

    const { data: taskLinks } = await supabase
      .from('document_task_links')
      .select('task_id')
      .eq('document_id', documentId);

    if (!projectLinks && !taskLinks) return [];

    const projectIds = projectLinks?.map(link => link.project_id) || [];
    const taskIds = taskLinks?.map(link => link.task_id) || [];

    let similarDocs: any[] = [];

    if (projectIds.length > 0) {
      const { data: similarByProject } = await supabase
        .from('document_project_links')
        .select(`
          document_id,
          relevance_score,
          documents(id, title, category, created_at)
        `)
        .in('project_id', projectIds)
        .neq('document_id', documentId);

      if (similarByProject) {
        similarDocs = [...similarDocs, ...similarByProject];
      }
    }

    if (taskIds.length > 0) {
      const { data: similarByTask } = await supabase
        .from('document_task_links')
        .select(`
          document_id,
          relevance_score,
          documents(id, title, category, created_at)
        `)
        .in('task_id', taskIds)
        .neq('document_id', documentId);

      if (similarByTask) {
        similarDocs = [...similarDocs, ...similarByTask];
      }
    }

    // Dubletten entfernen und nach Relevanz sortieren
    const uniqueDocs = similarDocs.reduce((acc, doc) => {
      const existing = acc.find((d: any) => d.document_id === doc.document_id);
      if (!existing) {
        acc.push(doc);
      } else if (doc.relevance_score > existing.relevance_score) {
        acc[acc.indexOf(existing)] = doc;
      }
      return acc;
    }, []);

    return uniqueDocs.sort((a, b) => b.relevance_score - a.relevance_score);
  }
};
