
import { supabase } from "@/integrations/supabase/client";
import { AIUsageData, ModuleUsageData, AIActivityLog } from "@/types/ai";
import { toast } from "@/components/ui/use-toast";

export const aiUsageService = {
  async getUsersAIUsage(): Promise<AIUsageData[]> {
    try {
      // Lade echte Daten aus Supabase
      const { data: aiUsage, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('usage_date', { ascending: false });

      if (error) {
        throw error;
      }

      return aiUsage || [];
    } catch (error) {
      console.error("Fehler beim Abrufen der AI-Nutzungsdaten:", error);
      toast({
        title: "Fehler",
        description: "Die KI-Nutzungsdaten konnten nicht geladen werden.",
        variant: "destructive",
      });
      return [];
    }
  },

  async getDepartmentAIUsage(): Promise<Record<string, number>> {
    try {
      // Hier würden wir Abteilungsdaten aggregieren
      return {
        "HR": 453,
        "Finanzen": 287,
        "Entwicklung": 895,
        "Marketing": 356,
        "Vertrieb": 412,
        "Kundendienst": 324,
        "Produktion": 189,
        "Logistik": 147
      };
    } catch (error) {
      console.error("Fehler beim Abrufen der Abteilungs-Nutzungsdaten:", error);
      toast({
        title: "Fehler",
        description: "Die Abteilungs-Nutzungsdaten konnten nicht geladen werden.",
        variant: "destructive",
      });
      return {};
    }
  },

  async getPopularAIModules(): Promise<Record<string, number>> {
    try {
      // Mockdaten für beliebteste KI-Module
      return {
        "Dokumentenanalyse": 624,
        "HR-Chatbot": 583,
        "Bewerbungsfilter": 421,
        "Vertragsanalyse": 347, 
        "Mitarbeiterempfehlung": 312,
        "Leistungsvorhersage": 289,
        "Stimmungsanalyse": 246
      };
    } catch (error) {
      console.error("Fehler beim Abrufen der beliebten KI-Module:", error);
      return {};
    }
  },

  async logAIActivity(activity: Omit<AIActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      // Hier würden wir die Aktivität in einer Supabase-Tabelle speichern
      console.log("KI-Aktivität protokolliert:", activity);
    } catch (error) {
      console.error("Fehler beim Protokollieren der KI-Aktivität:", error);
    }
  },
  
  async getActivityLogs(limit: number = 50): Promise<AIActivityLog[]> {
    try {
      // Lade echte Aktivitätsprotokolle aus Supabase - leer für neue Firmen
      const { data: logs, error } = await supabase
        .from('ai_activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching activity logs:", error);
        return [];
      }

      return logs || [];
    } catch (error) {
      console.error("Fehler beim Abrufen der Aktivitätsprotokolle:", error);
      return [];
    }
  }
};
