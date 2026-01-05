
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationContext';

export const useSickLeaveEdit = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification } = useNotifications();
  
  const updateSickLeave = async (id: string, data: any) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('sick_leaves')
        .update({
          start_date: data.start_date,
          end_date: data.end_date,
          is_partial_day: data.is_partial_day,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason,
          is_child_sick_leave: data.is_child_sick_leave,
          child_name: data.child_name,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        throw new Error(`Fehler beim Aktualisieren der Krankmeldung: ${error.message}`);
      }
      
      // Send a notification
      if (addNotification) {
        addNotification({
          title: "Krankmeldung aktualisiert",
          message: `Ihre Krankmeldung wurde erfolgreich aktualisiert.`,
          category: "hr",
          priority: "info",
          actionRequired: false,
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating sick leave:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    updateSickLeave,
    isUpdating,
  };
};
