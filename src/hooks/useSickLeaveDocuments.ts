
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSickLeaveDocuments = (sickLeaveId: string) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const fetchDocuments = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('sick_leave_documents')
        .select('*')
        .eq('sick_leave_id', sickLeaveId);
      
      if (error) {
        throw new Error(`Fehler beim Laden der Dokumente: ${error.message}`);
      }
      
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadDocument = async (file: File) => {
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `sick_leave_documents/${sickLeaveId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sick_leave_documents')
        .upload(filePath, file);
      
      if (uploadError) {
        throw new Error(`Fehler beim Hochladen des Dokuments: ${uploadError.message}`);
      }
      
      // Insert the document reference
      const { error: documentError } = await supabase
        .from('sick_leave_documents')
        .insert({
          sick_leave_id: sickLeaveId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        });
      
      if (documentError) {
        throw new Error(`Fehler beim Speichern des Dokumentenverweises: ${documentError.message}`);
      }
      
      // Update the sick leave record to indicate documents are available
      const { error: updateError } = await supabase
        .from('sick_leaves')
        .update({ has_documents: true })
        .eq('id', sickLeaveId);
      
      if (updateError) {
        throw new Error(`Fehler beim Aktualisieren des Dokumentenstatus: ${updateError.message}`);
      }
      
      // Refresh the documents list
      await fetchDocuments();
      
      return true;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };
  
  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      const { data: documentData } = await supabase
        .from('sick_leave_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (!documentData) {
        throw new Error('Dokument nicht gefunden');
      }
      
      const { data, error } = await supabase.storage
        .from('sick_leave_documents')
        .download(documentData.file_path);
      
      if (error) {
        throw new Error(`Fehler beim Herunterladen des Dokuments: ${error.message}`);
      }
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err: any) {
      console.error('Error downloading document:', err);
      throw err;
    }
  };
  
  useEffect(() => {
    if (sickLeaveId) {
      fetchDocuments();
    }
  }, [sickLeaveId]);
  
  return {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    downloadDocument,
    fetchDocuments,
  };
};
