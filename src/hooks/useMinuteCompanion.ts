import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMinuteCompanionActions } from './useMinuteCompanionActions';

export interface ChatAction {
  label: string;
  path: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  timestamp: Date;
}

export const useMinuteCompanion = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const { user } = useAuth();
  const { executeAction } = useMinuteCompanionActions();

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('📨 Sende Nachricht an Minute Companion:', messageContent);
      console.log('📍 Kontext:', { path: location.pathname, userId: user?.id });
      
      const requestBody = {
        message: userMessage.content,
        context: {
          currentPath: location.pathname,
          userRole: user?.user_metadata?.role || 'employee',
          userId: user?.id,
        },
        messageHistory: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
      };
      
      console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));
      
      const { data, error } = await supabase.functions.invoke('minute-companion', {
        body: requestBody,
      });

      if (error) {
        console.error('❌ Supabase Edge Function Fehler:', error);
        console.error('❌ Error Details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Antwort erhalten:', JSON.stringify(data, null, 2));

      // Aktion ausführen wenn vorhanden
      if (data.executeAction) {
        console.log('🎯 Führe Aktion aus:', data.executeAction);
        await executeAction(data.executeAction.action, data.executeAction.parameters || {});
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        actions: data.actions || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('❌ Minute Companion error:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Fehler bei der Kommunikation mit dem Companion');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location.pathname, user, messages, executeAction]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
