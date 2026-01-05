
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialisierung: Wert aus LocalStorage oder Initialwert
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Fehler beim Lesen des LocalStorage-Schlüssels "${key}":`, error);
      return initialValue;
    }
  });

  // Aktualisiert LocalStorage bei Änderungen des Werts
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Fehler beim Schreiben in LocalStorage-Schlüssel "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
