
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';

interface TodaySettings {
  showAIInsights: boolean;
  showTimeTracking: boolean;
  showCalendar: boolean;
  showTasks: boolean;
  showProjects: boolean;
  showTeamStatus: boolean;
  showGoals: boolean;
  showTraining: boolean;
  showApprovals: boolean;
  showDocuments: boolean;
  showNotifications: boolean;
}

export const useTodaySettings = () => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  
  const defaultSettings: TodaySettings = {
    showAIInsights: true,
    showTimeTracking: true,
    showCalendar: true,
    showTasks: true,
    showProjects: true,
    showTeamStatus: true,
    showGoals: true,
    showTraining: true,
    showApprovals: true,
    showDocuments: true,
    showNotifications: true,
  };
  
  const [storedSettings, setStoredSettings] = useLocalStorage<TodaySettings>(
    `today-settings-${userId}`,
    defaultSettings
  );
  
  const [settings, setSettings] = useState<TodaySettings>(defaultSettings);
  
  useEffect(() => {
    if (storedSettings) {
      setSettings(storedSettings);
    }
  }, [storedSettings]);
  
  const toggleCardVisibility = (cardKey: keyof TodaySettings) => {
    const newSettings = {
      ...settings,
      [cardKey]: !settings[cardKey]
    };
    
    setSettings(newSettings);
    setStoredSettings(newSettings);
  };
  
  const resetSettings = () => {
    setSettings(defaultSettings);
    setStoredSettings(defaultSettings);
  };
  
  return {
    settings,
    toggleCardVisibility,
    resetSettings
  };
};
