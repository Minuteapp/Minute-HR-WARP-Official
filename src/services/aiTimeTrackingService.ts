
import { AiSuggestion, ProjectSuggestion } from '@/hooks/time-tracking/useAiTimeTracking';

// Simulierte historische Daten für KI-Lernen
const workPatterns = [
  {
    location: 'office',
    timeOfDay: { start: 9, end: 17 },
    dayOfWeek: [1, 2, 3, 4, 5], // Mo-Fr
    commonProjects: ['office-admin', 'meetings', 'development'],
    confidence: 85
  },
  {
    location: 'home',
    timeOfDay: { start: 8, end: 16 },
    dayOfWeek: [1, 2, 3, 4, 5],
    commonProjects: ['remote-work', 'development', 'documentation'],
    confidence: 90
  },
  {
    location: 'client',
    timeOfDay: { start: 10, end: 18 },
    dayOfWeek: [1, 2, 3, 4, 5],
    commonProjects: ['customer-support', 'consulting', 'meetings'],
    confidence: 95
  }
];

// Keine Demo-Projekte - Projekte werden aus der Datenbank geladen
const demoProjects: { id: string; name: string; category: string }[] = [];

const activeSuggestions: AiSuggestion[] = [];

export const aiTimeTrackingService = {
  async generateProjectSuggestions(
    location?: string, 
    timeOfDay?: number, 
    dayOfWeek?: number
  ): Promise<ProjectSuggestion[]> {
    console.log('Generating AI project suggestions for:', { location, timeOfDay, dayOfWeek });
    
    // Simuliere AI-Analyse
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestions: ProjectSuggestion[] = [];

    // Location-basierte Vorschläge
    if (location) {
      const pattern = workPatterns.find(p => p.location === location);
      if (pattern) {
        const matchingProjects = demoProjects.filter(project => 
          pattern.commonProjects.some(common => project.id.includes(common) || project.category === common)
        );

        matchingProjects.slice(0, 3).forEach(project => {
          suggestions.push({
            project_id: project.id,
            project_name: project.name,
            confidence: pattern.confidence + Math.random() * 10,
            reason: `Basierend auf Ihrem Arbeitsverhalten am Standort "${location}"`,
            based_on: 'location'
          });
        });
      }
    }

    // Zeit-basierte Vorschläge
    if (timeOfDay !== undefined) {
      if (timeOfDay >= 9 && timeOfDay <= 11) {
        suggestions.push({
          project_id: 'meetings',
          project_name: 'Team Meetings',
          confidence: 80,
          reason: 'Morgens finden häufig Meetings statt',
          based_on: 'time_pattern'
        });
      } else if (timeOfDay >= 13 && timeOfDay <= 17) {
        suggestions.push({
          project_id: 'dev-frontend',
          project_name: 'Frontend Development',
          confidence: 85,
          reason: 'Nachmittags arbeiten Sie meist an Entwicklungsaufgaben',
          based_on: 'time_pattern'
        });
      }
    }

    // Sortiere nach Confidence
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  },

  async generateContextSuggestions(
    location?: string,
    calendarEvents?: any[]
  ): Promise<AiSuggestion[]> {
    const suggestions: AiSuggestion[] = [];

    // Calendar-basierte Vorschläge
    if (calendarEvents?.length) {
      const nextEvent = calendarEvents.find(event => 
        new Date(event.start_time) > new Date()
      );

      if (nextEvent) {
        suggestions.push({
          id: `calendar-${nextEvent.id}`,
          type: 'project_assignment',
          title: 'Projektzuordnung basierend auf Kalender',
          description: `Ihr nächster Termin "${nextEvent.title}" könnte mit einem Projekt verknüpft werden.`,
          confidence: 75,
          data: { eventId: nextEvent.id, eventTitle: nextEvent.title },
          created_at: new Date().toISOString()
        });
      }
    }

    // Location-basierte Optimierungsvorschläge
    if (location === 'home') {
      suggestions.push({
        id: 'home-optimization',
        type: 'time_optimization',
        title: 'Home Office Optimierung',
        description: 'Im Home Office sind Sie besonders produktiv bei Entwicklungsaufgaben.',
        confidence: 88,
        data: { recommendedProjects: ['dev-frontend', 'dev-backend', 'documentation'] },
        created_at: new Date().toISOString()
      });
    }

    return suggestions;
  },

  async getActiveSuggestions(): Promise<AiSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Entferne abgelaufene Vorschläge (älter als 1 Stunde)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const validSuggestions = activeSuggestions.filter(s => 
      new Date(s.created_at).getTime() > oneHourAgo
    );

    return validSuggestions;
  },

  async handleSuggestion(suggestionId: string, accepted: boolean): Promise<void> {
    console.log(`AI Suggestion ${suggestionId} ${accepted ? 'accepted' : 'rejected'}`);
    
    // Finde und aktualisiere den Vorschlag
    const suggestionIndex = activeSuggestions.findIndex(s => s.id === suggestionId);
    if (suggestionIndex !== -1) {
      activeSuggestions[suggestionIndex].is_accepted = accepted;
    }

    // Simuliere Feedback-Lernen
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In einer echten Implementierung würde hier das ML-Modell trainiert
    console.log('AI learning from user feedback:', { suggestionId, accepted });
  },

  async createSmartNotification(
    type: 'break_reminder' | 'project_suggestion' | 'time_optimization',
    data: any
  ): Promise<AiSuggestion> {
    const suggestion: AiSuggestion = {
      id: Date.now().toString(),
      type: type as any,
      title: this.getNotificationTitle(type),
      description: this.getNotificationDescription(type, data),
      confidence: data.confidence || 85,
      data,
      created_at: new Date().toISOString()
    };

    activeSuggestions.push(suggestion);
    return suggestion;
  },

  getNotificationTitle(type: string): string {
    const titles = {
      'break_reminder': 'Pausenerinnerung',
      'project_suggestion': 'Projektzuordnung vorgeschlagen',
      'time_optimization': 'Zeitoptimierung verfügbar'
    };
    return titles[type] || 'Smart Notification';
  },

  getNotificationDescription(type: string, data: any): string {
    switch (type) {
      case 'break_reminder':
        return `Sie arbeiten bereits seit ${data.hoursWorked?.toFixed(1)} Stunden. Eine Pause ist empfohlen.`;
      case 'project_suggestion':
        return `Basierend auf Ihrem Standort und der Tageszeit wird "${data.projectName}" vorgeschlagen.`;
      case 'time_optimization':
        return `Ihre Produktivität könnte durch ${data.suggestion} verbessert werden.`;
      default:
        return 'Eine intelligente Empfehlung ist verfügbar.';
    }
  }
};
