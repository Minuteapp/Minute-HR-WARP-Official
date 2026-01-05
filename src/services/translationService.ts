import { supabase } from '@/integrations/supabase/client';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const getSupportedLanguages = (): SupportedLanguage[] => {
  return [
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  ];
};

export const getUserLanguage = async (userId: string): Promise<string> => {
  return 'de';
};

export const updateUserLanguagePreference = async (
  userId: string, 
  language: string, 
  autoTranslate: boolean
): Promise<boolean> => {
  try {
    console.log(`Updating language preference for user ${userId}: language=${language}, autoTranslate=${autoTranslate}`);
    return true;
  } catch (error) {
    console.error('Error updating user language preference:', error);
    return false;
  }
};

export const translateText = async (
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string
): Promise<string> => {
  // Wenn Quell- und Zielsprache gleich sind, gib den Originaltext zurück
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text, targetLanguage }
    });

    if (error) {
      console.error('Translation error:', error);
      throw new Error(error.message || 'Übersetzungsfehler');
    }

    if (data?.translatedText) {
      return data.translatedText;
    }

    throw new Error('Keine Übersetzung erhalten');
  } catch (error) {
    console.error('Translation service error:', error);
    throw error;
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  return 'de';
};
