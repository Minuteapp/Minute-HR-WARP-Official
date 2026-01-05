
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSickLeaveSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('settings_configurations')
          .select('*')
          .eq('category', 'sick_leave')
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw new Error(`Fehler beim Laden der Einstellungen: ${error.message}`);
        }
        
        if (data) {
          setSettings(data.settings);
        } else {
          // Default settings
          const defaultSettings = {
            enableAutomaticNotifications: true,
            requireDocumentUpload: true,
            documentUploadDays: 3,
            enableChildSickLeave: true,
            enablePartialDaySickLeave: true,
            defaultApprovalRequired: false,
            notifyManager: true,
            notifyHR: true,
            notifyColleagues: false,
            notificationChannels: ['email', 'in-app'],
            reminderEnabled: true,
            reminderDays: 2,
            restrictSensitiveData: true,
            dataRetentionMonths: 12,
            anonymizeStatistics: false,
            showOnlyToAuthorizedUsers: true
          };
          
          setSettings(defaultSettings);
          
          // Create the default settings record in the database
          await supabase
            .from('settings_configurations')
            .insert({
              category: 'sick_leave',
              settings: defaultSettings
            });
        }
      } catch (error: any) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const updateSettings = async (newSettings: any) => {
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('settings_configurations')
        .update({
          settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('category', 'sick_leave');
      
      if (error) {
        throw new Error(`Fehler beim Speichern der Einstellungen: ${error.message}`);
      }
      
      setSettings(newSettings);
      return true;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    settings,
    isLoading,
    updateSettings,
    isSaving
  };
};
