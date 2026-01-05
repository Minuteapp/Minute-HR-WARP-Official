
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { de } from "date-fns/locale";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatiert ein Datum in ein lesbares Format (z.B. "01.04.2025")
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd.MM.yyyy', { locale: de });
  } catch (e) {
    console.error('Fehler beim Formatieren des Datums:', e);
    return 'Ungültiges Datum';
  }
}

/**
 * Formatiert eine Dateigröße in ein lesbares Format (z.B. "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formatiert einen Betrag als Währung (z.B. "1.234 €")
 */
export function formatCurrency(amount: number | null | undefined, currency = '€'): string {
  if (amount === null || amount === undefined) return `0 ${currency}`;
  
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.', ',')}M ${currency}`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k ${currency}`;
  }
  return `${amount.toLocaleString('de-DE')} ${currency}`;
}
