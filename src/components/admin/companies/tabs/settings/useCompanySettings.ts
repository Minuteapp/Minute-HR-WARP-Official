
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CompanySettings {
  enableAutoInvite: boolean;
  enableNotifications: boolean;
  enableDataSync: boolean;
  allowUserRegistration: boolean;
  enforceStrongPasswords: boolean;
  autoDeactivateInactive: boolean;
  enableAuditLogs: boolean;
  allowMultiAdmin: boolean;
}

export const useCompanySettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Default settings
  const [settings, setSettings] = useState<CompanySettings>({
    enableAutoInvite: false,
    enableNotifications: true,
    enableDataSync: false,
    allowUserRegistration: true,
    enforceStrongPasswords: true,
    autoDeactivateInactive: false,
    enableAuditLogs: true,
    allowMultiAdmin: true
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Firmeneinstellungen wurden erfolgreich gespeichert."
      });
    }, 1000);
  };

  return {
    settings,
    isSaving,
    handleSettingChange,
    handleSaveSettings
  };
};
