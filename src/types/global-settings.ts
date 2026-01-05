export interface GlobalSettings {
  id: string;
  user_id: string;
  language: 'de' | 'en' | 'fr' | 'es' | 'ar';
  dark_mode_enabled: boolean;
  dark_mode_mode: 'light' | 'dark' | 'auto';
  dark_mode_auto_start_hour: number;
  dark_mode_auto_end_hour: number;
  currency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  timezone: string;
  date_format: string;
  decimal_separator: string;
  thousands_separator: string;
  rtl_enabled: boolean;
  high_contrast_enabled: boolean;
  screen_reader_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Translation {
  id: string;
  key: string;
  language: string;
  value: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateGlobalSettingsInput {
  language?: GlobalSettings['language'];
  dark_mode_enabled?: boolean;
  dark_mode_mode?: GlobalSettings['dark_mode_mode'];
  dark_mode_auto_start_hour?: number;
  dark_mode_auto_end_hour?: number;
  currency?: GlobalSettings['currency'];
  timezone?: string;
  date_format?: string;
  decimal_separator?: string;
  thousands_separator?: string;
  rtl_enabled?: boolean;
  high_contrast_enabled?: boolean;
  screen_reader_mode?: boolean;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
] as const;

export const SUPPORTED_CURRENCIES = [
  { code: 'EUR' as const, name: 'Euro', symbol: '€' },
  { code: 'USD' as const, name: 'US Dollar', symbol: '$' },
  { code: 'CHF' as const, name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'GBP' as const, name: 'British Pound', symbol: '£' },
] as const;

export const DATE_FORMATS = [
  { format: 'DD.MM.YYYY', example: '31.12.2024' },
  { format: 'MM/DD/YYYY', example: '12/31/2024' },
  { format: 'YYYY-MM-DD', example: '2024-12-31' },
  { format: 'DD/MM/YYYY', example: '31/12/2024' },
] as const;

export const COMMON_TIMEZONES = [
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'Europe/Zurich',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
] as const;