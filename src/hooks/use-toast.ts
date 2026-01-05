
import { toast as sonnerToast } from "sonner";

// Define the toast options type
type ToastOptions = {
  title?: string; // Make title optional to support existing code
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  id?: string; // Hinzufügen der id-Eigenschaft für Deduplizierung
};

// Deduplizierungsmechanismus
let lastToastMessage = "";
let lastToastTime = 0;
const TOAST_THRESHOLD_MS = 3000; // 3 Sekunden Schwellenwert
let locationToastsCount = 0; // Zähler für Standort-Benachrichtigungen
const MAX_LOCATION_TOASTS = 1; // Maximal 1 Standort-Benachrichtigung

// Wrapper um toast-Funktion mit Deduplizierung
const toast = (options: string | ToastOptions) => {
  const now = Date.now();
  
  // Extract message from options
  const message = typeof options === 'string' 
    ? options 
    : options.description || options.title || "";
  
  // Prüfen, ob es eine Standort-bezogene Nachricht ist
  const isLocationMessage = message.toLowerCase().includes('standort') || 
                           (typeof options !== 'string' && 
                            options.description?.toLowerCase().includes('standort'));
  
  // Bei Standort-Nachrichten die Anzahl begrenzen
  if (isLocationMessage) {
    if (locationToastsCount >= MAX_LOCATION_TOASTS) {
      console.log("Verhindere wiederholte Standort-Benachrichtigung:", message);
      return;
    }
    locationToastsCount++;
    
    // Nach 30 Sekunden den Zähler zurücksetzen, um neue Benachrichtigungen zu erlauben
    setTimeout(() => {
      locationToastsCount = 0;
    }, 30000);
  }
  
  // Prüfen, ob es eine Duplikatmeldung innerhalb des Schwellenwerts ist
  if (message === lastToastMessage && (now - lastToastTime < TOAST_THRESHOLD_MS)) {
    console.log("Verhindere doppelte Benachrichtigung:", message);
    return;
  }
  
  // Aktualisieren der letzten Nachricht und Zeit
  lastToastMessage = message;
  lastToastTime = now;
  
  // Convert options format to match sonner's expected format
  if (typeof options === 'string') {
    return sonnerToast(options);
  } else {
    const { title, description, variant, id, ...rest } = options;
    
    // Use the most appropriate field content
    const content = description || title || "";
    
    if (variant === 'destructive') {
      return sonnerToast.error(content, { id, ...rest });
    }
    
    return sonnerToast(content, { id, ...rest });
  }
};

// Create a custom hook that returns the toast function
const useToast = () => {
  return {
    toast
  };
};

export { useToast, toast };
