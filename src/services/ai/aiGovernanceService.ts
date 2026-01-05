
import { supabase } from "@/integrations/supabase/client";
import { AIGovernanceRule, AIDataRestriction } from "@/types/ai";
import { toast } from "@/components/ui/use-toast";

export const aiGovernanceService = {
  async getGovernanceRules(): Promise<AIGovernanceRule[]> {
    try {
      // Hier würden wir Daten aus einer Supabase-Tabelle abrufen
      return mockGovernanceRules;
    } catch (error) {
      console.error("Fehler beim Abrufen der KI-Governance-Regeln:", error);
      toast({
        title: "Fehler",
        description: "Die KI-Governance-Regeln konnten nicht geladen werden.",
        variant: "destructive",
      });
      return [];
    }
  },

  async getRuleById(id: string): Promise<AIGovernanceRule | null> {
    try {
      const rule = mockGovernanceRules.find(r => r.id === id);
      if (!rule) {
        throw new Error("Regel nicht gefunden");
      }
      return rule;
    } catch (error) {
      console.error(`Fehler beim Abrufen der Regel ${id}:`, error);
      toast({
        title: "Fehler",
        description: "Die KI-Governance-Regel konnte nicht geladen werden.",
        variant: "destructive",
      });
      return null;
    }
  },

  async createRule(rule: Omit<AIGovernanceRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      // Hier würden wir eine neue Regel in einer Supabase-Tabelle erstellen
      console.log("Neue Regel erstellt:", rule);
      return true;
    } catch (error) {
      console.error("Fehler beim Erstellen der Regel:", error);
      toast({
        title: "Fehler",
        description: "Die KI-Governance-Regel konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return false;
    }
  },

  async updateRuleStatus(ruleId: string, status: AIGovernanceRule['status'], approvedBy?: string): Promise<boolean> {
    try {
      // Hier würden wir den Status einer Regel in einer Supabase-Tabelle aktualisieren
      console.log("Regelstatus aktualisiert:", ruleId, status, approvedBy);
      return true;
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Regelstatus:", error);
      toast({
        title: "Fehler",
        description: "Der Regelstatus konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      return false;
    }
  }
};

// Mockdaten
const mockGovernanceRules: AIGovernanceRule[] = [
  {
    id: "1",
    title: "Verwendung von KI für Mitarbeiterbewertungen",
    description: "Richtlinien für den Einsatz von KI-Technologien bei der Bewertung von Mitarbeiterleistungen.",
    scope: "global",
    createdBy: "Datenschutzbeauftragter",
    createdAt: new Date(2023, 0, 15),
    updatedAt: new Date(2023, 0, 15),
    version: "1.0",
    status: "active",
    approvedBy: ["Geschäftsführung", "Betriebsrat", "Datenschutzbeauftragter"],
    dataRestrictions: [
      {
        dataType: "Leistungsbewertungen",
        allowedUse: true,
        requiresConsent: true,
        retentionPeriod: 365
      },
      {
        dataType: "Private Kommunikation",
        allowedUse: false,
        requiresConsent: true
      }
    ]
  },
  {
    id: "2",
    title: "KI-gestützte Dokumentenanalyse",
    description: "Regeln für die Verwendung von KI zur Analyse von Unternehmens- und Mitarbeiterdokumenten.",
    scope: "department",
    scopeTarget: "HR",
    createdBy: "HR-Leitung",
    createdAt: new Date(2023, 1, 10),
    updatedAt: new Date(2023, 2, 5),
    version: "1.2",
    status: "active",
    approvedBy: ["HR-Leitung", "Datenschutzbeauftragter"],
    dataRestrictions: [
      {
        dataType: "Vertragsdokumente",
        allowedUse: true,
        requiresConsent: false,
        retentionPeriod: 730
      },
      {
        dataType: "Bewerbungsunterlagen",
        allowedUse: true,
        requiresConsent: true,
        retentionPeriod: 180
      }
    ]
  },
  {
    id: "3",
    title: "Automatisierte Entscheidungsprozesse",
    description: "Richtlinien für KI-basierte automatisierte Entscheidungen mit Auswirkung auf Mitarbeitende.",
    scope: "global",
    createdBy: "Rechtsabteilung",
    createdAt: new Date(2023, 2, 20),
    updatedAt: new Date(2023, 2, 20),
    version: "1.0",
    status: "review",
    dataRestrictions: [
      {
        dataType: "Personalbezogene Entscheidungen",
        allowedUse: true,
        requiresConsent: true,
        retentionPeriod: 365
      },
      {
        dataType: "Beförderungsentscheidungen",
        allowedUse: false,
        requiresConsent: true
      }
    ]
  }
];
