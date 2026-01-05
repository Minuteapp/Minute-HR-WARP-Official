import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GlobalSettings, UpdateGlobalSettingsInput, Translation } from '@/types/global-settings';

export const useGlobalSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default settings if none exist
        const defaultSettings = {
          user_id: user.id,
          language: 'de' as const,
          dark_mode_enabled: false,
          dark_mode_mode: 'light' as const,
          dark_mode_auto_start_hour: 20,
          dark_mode_auto_end_hour: 6,
          currency: 'EUR' as const,
          timezone: 'Europe/Berlin',
          date_format: 'DD.MM.YYYY',
          decimal_separator: ',',
          thousands_separator: '.',
          rtl_enabled: false,
          high_contrast_enabled: false,
          screen_reader_mode: false
        };

        const { data: newSettings, error: createError } = await supabase
          .from('global_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (createError) {
          console.error('Error creating default settings:', createError);
          throw createError;
        }
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
      toast({
        title: 'Fehler',
        description: 'Globale Einstellungen konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: UpdateGlobalSettingsInput) => {
    if (!settings) return;

    try {
      setSaving(true);
      
      // Prüfen ob Sprache geändert wird
      const isLanguageChange = updates.language && updates.language !== settings.language;
      const oldLanguage = settings.language;
      
      const { data, error } = await supabase
        .from('global_settings')
        .update(updates)
        .eq('user_id', settings.user_id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      
      // Bei Sprachänderung: Event emittieren
      if (isLanguageChange) {
        window.dispatchEvent(new CustomEvent('language-changed', {
          detail: { 
            oldLanguage, 
            newLanguage: updates.language 
          }
        }));
        console.log('[useGlobalSettings] Language changed from', oldLanguage, 'to', updates.language);
      }
      
      toast({
        title: 'Gespeichert',
        description: 'Einstellungen wurden erfolgreich aktualisiert.',
      });
    } catch (error) {
      console.error('Error updating global settings:', error);
      toast({
        title: 'Fehler',
        description: 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings,
  };
};

export const useTranslations = (language: string = 'de') => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language', language);

      if (error) throw error;

      const translationMap = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);

      setTranslations(translationMap);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string, fallback?: string) => {
    return translations[key] || fallback || key;
  };

  useEffect(() => {
    fetchTranslations();
  }, [language]);

  return {
    t,
    translations,
    loading,
    refetch: fetchTranslations,
  };
};

// Hook für Theme-Management
export const useTheme = () => {
  const { settings, updateSettings } = useGlobalSettings();

  const getCurrentTheme = () => {
    if (!settings?.dark_mode_enabled) return 'light';
    
    if (settings.dark_mode_mode === 'auto') {
      const currentHour = new Date().getHours();
      const isNightTime = currentHour >= settings.dark_mode_auto_start_hour || 
                         currentHour < settings.dark_mode_auto_end_hour;
      return isNightTime ? 'dark' : 'light';
    }
    
    return settings.dark_mode_mode;
  };

  const setTheme = (mode: 'light' | 'dark' | 'auto') => {
    updateSettings({ dark_mode_mode: mode });
  };

  const toggleTheme = () => {
    const currentTheme = getCurrentTheme();
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (settings) {
      const theme = getCurrentTheme();
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.classList.toggle('high-contrast', settings.high_contrast_enabled);
      document.documentElement.setAttribute('dir', settings.rtl_enabled ? 'rtl' : 'ltr');
    }
  }, [settings]);

  return {
    currentTheme: getCurrentTheme(),
    setTheme,
    toggleTheme,
    settings,
  };
};