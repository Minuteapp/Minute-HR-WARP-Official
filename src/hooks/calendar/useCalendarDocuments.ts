
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EventDocument, EventDocumentType } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

export const useCalendarDocuments = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (file: File, eventId: string, documentType: string): Promise<EventDocument | null> => {
    setIsUploading(true);
    
    try {
      // Erstellen eines eindeutigen Dateinamens (Vermeidung von Kollisionen)
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}/${timestamp}_${file.name}`;
      const filePath = `calendar_documents/${fileName}`;
      
      // Hochladen der Datei in den Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Fehler beim Hochladen des Dokuments:', uploadError);
        toast({
          title: 'Fehler beim Hochladen',
          description: 'Das Dokument konnte nicht hochgeladen werden.',
          variant: 'destructive'
        });
        return null;
      }
      
      // Abrufen der öffentlichen URL
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      if (!urlData) {
        toast({
          title: 'Fehler beim Verarbeiten',
          description: 'Die Datei-URL konnte nicht abgerufen werden.',
          variant: 'destructive'
        });
        return null;
      }
      
      // Sicherstellen, dass der Dokumententyp gültig ist
      const validDocType = (documentType as EventDocumentType) || 'other';
      
      // Erstellen des Dokument-Objekts
      const documentObject: EventDocument = {
        id: `${timestamp}`,
        name: file.name,
        url: urlData.publicUrl,
        type: validDocType,
        size: file.size,
        uploadedAt: new Date(),
        containsPersonalData: validDocType === 'resume' || validDocType === 'contract'
      };
      
      // Eintrag in der Datenbank speichern für Referenzen
      const { error: dbError } = await supabase
        .from('calendar_document_references')
        .insert({
          event_id: eventId,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          document_type: documentType,
          contains_personal_data: documentObject.containsPersonalData
        });
      
      if (dbError) {
        console.error('Fehler beim Speichern der Dokumentenreferenz:', dbError);
        // Das Dokument wurde hochgeladen, wir geben daher trotzdem das Objekt zurück
      }
      
      return documentObject;
    } catch (error) {
      console.error('Fehler bei der Dokumentenverarbeitung:', error);
      toast({
        title: 'Fehler',
        description: 'Bei der Verarbeitung des Dokuments ist ein unerwarteter Fehler aufgetreten.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const downloadDocument = async (eventDocument: EventDocument) => {
    try {
      // Extrahieren des Dateipfads aus der URL
      const url = eventDocument.url;
      
      // Herunterladen der Datei
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Dokument konnte nicht heruntergeladen werden');
      }
      
      const blob = await response.blob();
      
      // Erstellen eines temporären Links zum Herunterladen
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = eventDocument.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      
      // Bereinigen
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: 'Herunterladen erfolgreich',
        description: `${eventDocument.name} wurde heruntergeladen.`
      });
    } catch (error) {
      console.error('Fehler beim Herunterladen:', error);
      toast({
        title: 'Fehler beim Herunterladen',
        description: 'Das Dokument konnte nicht heruntergeladen werden.',
        variant: 'destructive'
      });
    }
  };

  const deleteDocument = async (document: EventDocument, eventId: string) => {
    try {
      // Extrahieren des Dateipfads aus der URL
      const filePath = document.url.split('/').pop();
      if (!filePath) throw new Error('Ungültiger Dateipfad');
      
      // Löschen aus dem Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([`calendar_documents/${eventId}/${filePath}`]);
      
      if (storageError) {
        console.error('Fehler beim Löschen aus dem Storage:', storageError);
        throw storageError;
      }
      
      // Löschen der Referenz aus der Datenbank
      const { error: dbError } = await supabase
        .from('calendar_document_references')
        .delete()
        .match({ 
          event_id: eventId, 
          file_path: `calendar_documents/${eventId}/${filePath}` 
        });
      
      if (dbError) {
        console.error('Fehler beim Löschen der Datenbankeinträge:', dbError);
        throw dbError;
      }
      
      toast({
        title: 'Dokument gelöscht',
        description: `${document.name} wurde erfolgreich gelöscht.`
      });
      
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des Dokuments:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: 'Das Dokument konnte nicht gelöscht werden.',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    uploadDocument,
    downloadDocument,
    deleteDocument,
    isUploading,
    isLoading
  };
};
