import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Standardisierte KI-Antwort-Struktur
export interface AIResponse {
  summary: string;
  explanation: string;
  suggested_actions?: Array<{
    action: string;
    description: string;
    link?: string;
  }>;
  links_to_ui?: Array<{
    label: string;
    path: string;
  }>;
  data_sources: Array<{
    module: string;
    description: string;
    time_period?: string;
  }>;
  confidence: 'high' | 'medium' | 'low';
  limitations?: string[];
}

export interface AIGatewayRequest {
  module: string;
  action_type: string;
  prompt: string;
  context?: Record<string, any>;
  data_sources?: Array<{
    module: string;
    description: string;
    time_period?: string;
  }>;
}

export interface AIGatewayResult {
  success: boolean;
  response?: AIResponse;
  meta?: {
    model_used: string;
    used_fallback: boolean;
    tokens: {
      input: number;
      output: number;
    };
    ai_mode: 'disabled' | 'readonly' | 'suggesting';
    require_confirmation: boolean;
    budget_warning?: {
      message: string;
      used: number;
      limit: number;
    };
  };
  error?: string;
  code?: string;
}

export interface UseAIGatewayOptions {
  onSuccess?: (result: AIGatewayResult) => void;
  onError?: (error: string, code?: string) => void;
  showToasts?: boolean;
}

/**
 * Zentraler Hook für alle KI-Anfragen in Minute HR.
 * 
 * Alle Module müssen diesen Hook verwenden - direkte KI-API-Aufrufe sind verboten.
 * 
 * Leitsatz: "KI erklärt, unterstützt und verlinkt – sie entscheidet nicht."
 */
export const useAIGateway = (options: UseAIGatewayOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AIGatewayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sendet eine Anfrage an das zentrale KI-Gateway.
   * 
   * @param request - Die KI-Anfrage mit Modul, Aktionstyp und Prompt
   * @returns Promise mit dem strukturierten KI-Ergebnis
   */
  const sendRequest = useCallback(async (request: AIGatewayRequest): Promise<AIGatewayResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Session für Auth-Header holen
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const errorMsg = 'Nicht angemeldet';
        setError(errorMsg);
        if (showToasts) toast.error(errorMsg);
        onError?.(errorMsg, 'NOT_AUTHENTICATED');
        return null;
      }

      // Anfrage an das KI-Gateway senden
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-gateway`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(request),
        }
      );

      const data = await response.json();

      // Fehlerbehandlung basierend auf Status-Codes
      if (!response.ok) {
        const errorMsg = data.error || 'KI-Anfrage fehlgeschlagen';
        const errorCode = data.code;
        
        setError(errorMsg);
        
        // Spezifische Fehlermeldungen
        if (errorCode === 'AI_DISABLED') {
          if (showToasts) toast.info('KI ist für Ihr Unternehmen deaktiviert');
        } else if (errorCode === 'MODULE_NOT_ENABLED') {
          if (showToasts) toast.info(errorMsg);
        } else if (errorCode === 'BUDGET_EXCEEDED') {
          if (showToasts) toast.warning('Das monatliche KI-Budget wurde erreicht');
        } else if (response.status === 401) {
          if (showToasts) toast.error('Sitzung abgelaufen - bitte erneut anmelden');
        } else {
          if (showToasts) toast.error(errorMsg);
        }
        
        onError?.(errorMsg, errorCode);
        return { success: false, error: errorMsg, code: errorCode };
      }

      // Erfolgreiche Antwort
      const result: AIGatewayResult = data;
      setLastResult(result);

      // Budget-Warnung anzeigen
      if (result.meta?.budget_warning && showToasts) {
        toast.warning(result.meta.budget_warning.message);
      }

      onSuccess?.(result);
      return result;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMsg);
      if (showToasts) toast.error('Verbindungsfehler zum KI-Gateway');
      onError?.(errorMsg, 'NETWORK_ERROR');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, showToasts]);

  /**
   * Hilfsfunktion für Erklärungsanfragen
   */
  const explain = useCallback((
    module: string,
    topic: string,
    context?: Record<string, any>
  ) => {
    return sendRequest({
      module,
      action_type: 'explain',
      prompt: `Erkläre folgendes Thema im Kontext von ${module}: ${topic}`,
      context
    });
  }, [sendRequest]);

  /**
   * Hilfsfunktion für Analyse-Anfragen
   */
  const analyze = useCallback((
    module: string,
    data: Record<string, any>,
    question: string,
    dataSources?: Array<{ module: string; description: string; time_period?: string }>
  ) => {
    return sendRequest({
      module,
      action_type: 'analyze',
      prompt: question,
      context: data,
      data_sources: dataSources
    });
  }, [sendRequest]);

  /**
   * Hilfsfunktion für Zusammenfassungen
   */
  const summarize = useCallback((
    module: string,
    content: string | Record<string, any>,
    focus?: string
  ) => {
    const prompt = focus 
      ? `Fasse folgende Informationen zusammen, mit Fokus auf ${focus}:`
      : 'Fasse folgende Informationen zusammen:';
    
    return sendRequest({
      module,
      action_type: 'summarize',
      prompt: `${prompt}\n\n${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}`
    });
  }, [sendRequest]);

  /**
   * Hilfsfunktion für Empfehlungen
   */
  const recommend = useCallback((
    module: string,
    situation: string,
    context?: Record<string, any>,
    dataSources?: Array<{ module: string; description: string; time_period?: string }>
  ) => {
    return sendRequest({
      module,
      action_type: 'recommend',
      prompt: `Gib Empfehlungen für folgende Situation: ${situation}`,
      context,
      data_sources: dataSources
    });
  }, [sendRequest]);

  return {
    // Hauptfunktion
    sendRequest,
    
    // Hilfsfunktionen für häufige Use Cases
    explain,
    analyze,
    summarize,
    recommend,
    
    // Status
    isLoading,
    lastResult,
    error,
    
    // Utility
    clearError: () => setError(null),
    clearResult: () => setLastResult(null)
  };
};

export default useAIGateway;
