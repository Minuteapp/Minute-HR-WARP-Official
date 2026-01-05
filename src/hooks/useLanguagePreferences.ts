import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LanguagePreference {
  id: string;
  user_id: string;
  language: string;
  auto_translate: boolean;
}

export const useLanguagePreferences = () => {
  const [preference, setPreference] = useState<LanguagePreference | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('language_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreference(data);
      } else {
        // Create default preference
        const { data: newPref, error: insertError } = await supabase
          .from('language_preferences')
          .insert({
            user_id: user.id,
            language: 'de',
            auto_translate: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreference(newPref);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLanguage = async (language: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('language_preferences')
        .update({ language })
        .eq('user_id', user.id);

      if (error) throw error;
      setPreference(prev => prev ? { ...prev, language } : null);
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const toggleAutoTranslate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newValue = !preference?.auto_translate;
      const { error } = await supabase
        .from('language_preferences')
        .update({ auto_translate: newValue })
        .eq('user_id', user.id);

      if (error) throw error;
      setPreference(prev => prev ? { ...prev, auto_translate: newValue } : null);
    } catch (error) {
      console.error('Error toggling auto translate:', error);
    }
  };

  useEffect(() => {
    loadPreference();
  }, []);

  return {
    preference,
    loading,
    updateLanguage,
    toggleAutoTranslate,
  };
};
