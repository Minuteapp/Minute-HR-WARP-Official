import { supabase } from '@/integrations/supabase/client';
import { Report, ReportAttachment, ReportComment, ReportType } from '@/types/reports';
import { useToast } from "@/hooks/use-toast";

export const reportService = {
  async createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async updateReport(id: string, updates: Partial<Report>) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  async deleteReport(id: string) {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'deleted' as const,
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  async archiveReport(id: string) {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'archived' as const,
          archived_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving report:', error);
      throw error;
    }
  },

  async getReports(type?: ReportType) {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .neq('status', 'deleted');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Report[];
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async addAttachment(reportId: string, file: File) {
    try {
      const filePath = `${reportId}/${file.name}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('reports')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('report_attachments')
        .insert({
          report_id: reportId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      return data;
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
  },

  async addComment(reportId: string, comment: string) {
    try {
      const { data, error } = await supabase
        .from('report_comments')
        .insert({
          report_id: reportId,
          comment,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};
