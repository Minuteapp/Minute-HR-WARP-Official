import { Currency } from '@/types/expenses';

export const formatCurrency = (amount: number, currency: Currency = 'EUR'): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,.-]/g, '');
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized) || 0;
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    EUR: '€', USD: '$', GBP: '£', CHF: 'CHF',
    JPY: '¥', CAD: 'C$', AUD: 'A$', CNY: '¥',
  };
  return symbols[currency] || currency;
};