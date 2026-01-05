import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalSettings } from './useGlobalSettings';

export const useTranslation = () => {
  const { settings } = useGlobalSettings();
  const [loading, setLoading] = useState(false);

  const translateText = async (
    text: string,
    sourceLang: string,
    targetLang?: string
  ): Promise<string> => {
    const target = targetLang || settings?.language || 'de';
    
    if (sourceLang === target || !text) {
      return text;
    }

    try {
      setLoading(true);

      // Hole User und Tenant-Kontext
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Nicht authentifiziert');
      }

      // Hole company_id
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.company_id) {
        throw new Error('Keine Firma zugeordnet');
      }

      // Rufe translate-enhanced Edge Function auf
      const { data, error } = await supabase.functions.invoke('translate-enhanced', {
        body: {
          text,
          source_lang: sourceLang,
          target_lang: target,
          tenant_id: userRole.company_id,
          user_id: user.id,
        },
      });

      if (error) throw error;

      return data.translated_text;
    } catch (error) {
      console.error('Übersetzungsfehler:', error);
      return text; // Fallback: Originaltext
    } finally {
      setLoading(false);
    }
  };

  return {
    translateText,
    loading,
    currentLanguage: settings?.language || 'de',
  };
};