
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationContext';

export const useSickLeaveDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { addNotification } = useNotifications();
  
  const deleteSickLeave = async (id: string) => {
    setIsDeleting(true);
    
    try {
      // First, delete any associated documents
      const { error: documentsError } = await supabase
        .from('sick_leave_documents')
        .delete()
        .eq('sick_leave_id', id);
      
      if (documentsError) {
        throw new Error(`Fehler beim Löschen der Dokumente: ${documentsError.message}`);
      }
      
      // Then, delete the sick leave record
      const { error } = await supabase
        .from('sick_leaves')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Fehler beim Löschen der Krankmeldung: ${error.message}`);
      }
      
      // Send a notification
      if (addNotification) {
        addNotification({
          title: "Krankmeldung gelöscht",
          message: `Ihre Krankmeldung wurde erfolgreich gelöscht.`,
          category: "hr",
          priority: "info",
          actionRequired: false,
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting sick leave:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    deleteSickLeave,
    isDeleting,
  };
};
