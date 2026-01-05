import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenant } from '@/contexts/TenantContext';

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: 'contract' | 'payslip' | 'certificate' | 'training' | 'privacy' | 'identification' | 'tax' | 'insurance' | 'other';
  file_url: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
  category?: string;
  is_confidential: boolean;
  expiry_date?: string;
  version: number;
  notes?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeDocuments = (employeeId: string) => {
  const queryClient = useQueryClient();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployeeDocument[];
    },
    enabled: !!employeeId,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      metadata 
    }: { 
      file: File; 
      metadata: Partial<EmployeeDocument> 
    }) => {
      if (!companyId) throw new Error("Company ID fehlt - bitte neu laden");
      
      const { data: user } = await supabase.auth.getUser();
      
      // Upload zu Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${employeeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(filePath);

      // Insert metadata mit company_id und uploaded_by
      const { data, error } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          company_id: companyId,
          uploaded_by: user?.user?.id,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          ...metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast.success('Dokument erfolgreich hochgeladen');
    },
    onError: (error: any) => {
      console.error('Error uploading document:', error);
      toast.error(`Fehler beim Hochladen des Dokuments: ${error.message}`);
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ 
      documentId, 
      updates 
    }: { 
      documentId: string; 
      updates: Partial<EmployeeDocument> 
    }) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast.success('Dokument aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating document:', error);
      toast.error('Fehler beim Aktualisieren des Dokuments');
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // Get document to find file path
      const { data: doc } = await supabase
        .from('employee_documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      // Delete from storage
      if (doc?.file_url) {
        const filePath = doc.file_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('employee-documents')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast.success('Dokument gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error('Fehler beim Löschen des Dokuments');
    },
  });

  const downloadDocument = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download gestartet');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Fehler beim Herunterladen');
    }
  };

  return {
    documents,
    isLoading,
    uploadDocument: uploadDocument.mutateAsync,
    updateDocument: updateDocument.mutateAsync,
    deleteDocument: deleteDocument.mutateAsync,
    downloadDocument,
    isUploading: uploadDocument.isPending,
    isUpdating: updateDocument.isPending,
    isDeleting: deleteDocument.isPending,
  };
};
