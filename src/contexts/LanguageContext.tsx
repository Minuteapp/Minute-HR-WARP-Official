/**
 * Globaler Language-Context mit Realtime-Synchronisation
 * Lauscht auf global_settings Änderungen und aktualisiert die Sprache in allen Modulen
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export type SupportedLanguage = 'de' | 'en' | 'fr' | 'es' | 'it' | 'pl' | 'tr';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fallback-Übersetzungen für häufig verwendete Strings
const FALLBACK_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  de: {
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.add': 'Hinzufügen',
    'common.search': 'Suchen',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
  },
  en: {
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  fr: {
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
  },
  es: {
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Añadir',
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
  },
  it: {
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.add': 'Aggiungi',
    'common.search': 'Cerca',
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.success': 'Successo',
  },
  pl: {
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
    'common.delete': 'Usuń',
    'common.edit': 'Edytuj',
    'common.add': 'Dodaj',
    'common.search': 'Szukaj',
    'common.loading': 'Ładowanie...',
    'common.error': 'Błąd',
    'common.success': 'Sukces',
  },
  tr: {
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.add': 'Ekle',
    'common.search': 'Ara',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('de');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Übersetzungen laden
  const loadTranslations = useCallback(async (lang: SupportedLanguage) => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language', lang);

      if (error) {
        console.error('[LanguageContext] Error loading translations:', error);
        return;
      }

      const translationMap = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);

      setTranslations(translationMap);
      console.log(`[LanguageContext] Loaded ${Object.keys(translationMap).length} translations for ${lang}`);
    } catch (error) {
      console.error('[LanguageContext] Error loading translations:', error);
    }
  }, []);

  // Initiale Sprache laden
  useEffect(() => {
    const loadInitialLanguage = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: settings } = await supabase
            .from('global_settings')
            .select('language')
            .eq('user_id', user.id)
            .single();

          if (settings?.language) {
            const lang = settings.language as SupportedLanguage;
            setLanguageState(lang);
            await loadTranslations(lang);
          }
        }
      } catch (error) {
        console.error('[LanguageContext] Error loading initial language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialLanguage();
  }, [loadTranslations]);

  // Realtime-Listener für Sprachänderungen
  useEffect(() => {
    const channel = supabase
      .channel('language-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'global_settings'
        },
        async (payload) => {
          const oldLang = payload.old?.language;
          const newLang = payload.new?.language as SupportedLanguage;
          
          if (oldLang !== newLang && newLang) {
            console.log(`[LanguageContext] Language changed from ${oldLang} to ${newLang}`);
            setLanguageState(newLang);
            await loadTranslations(newLang);
            
            // Alle Queries invalidieren für UI-Aktualisierung
            queryClient.invalidateQueries({ queryKey: ['translations'] });
          }
        }
      )
      .subscribe();

    // Custom Event Listener für manuelle Sprachänderungen
    const handleLanguageChanged = async (event: CustomEvent) => {
      const { newLanguage } = event.detail;
      if (newLanguage && newLanguage !== language) {
        setLanguageState(newLanguage);
        await loadTranslations(newLanguage);
      }
    };

    window.addEventListener('language-changed', handleLanguageChanged as EventListener);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('language-changed', handleLanguageChanged as EventListener);
    };
  }, [language, loadTranslations, queryClient]);

  // Sprache ändern
  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('[LanguageContext] No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('global_settings')
        .update({ language: lang })
        .eq('user_id', user.id);

      if (error) {
        console.error('[LanguageContext] Error updating language:', error);
        return;
      }

      setLanguageState(lang);
      await loadTranslations(lang);
      
      // Event für andere Komponenten
      window.dispatchEvent(new CustomEvent('language-changed', {
        detail: { oldLanguage: language, newLanguage: lang }
      }));

      console.log(`[LanguageContext] Language updated to ${lang}`);
    } catch (error) {
      console.error('[LanguageContext] Error setting language:', error);
    }
  }, [language, loadTranslations]);

  // Übersetzungsfunktion
  const t = useCallback((key: string, fallback?: string): string => {
    // Erst in geladenen Übersetzungen suchen
    if (translations[key]) {
      return translations[key];
    }
    
    // Dann in Fallback-Übersetzungen
    if (FALLBACK_TRANSLATIONS[language]?.[key]) {
      return FALLBACK_TRANSLATIONS[language][key];
    }
    
    // Fallback oder Key zurückgeben
    return fallback || key;
  }, [translations, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Convenience-Hook nur für Übersetzungen
export const useTranslation = () => {
  const { t, language, isLoading } = useLanguage();
  return { t, language, isLoading };
};
