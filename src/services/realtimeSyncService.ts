/**
 * Zentraler Realtime-Synchronisations-Service
 * Verwaltet alle Echtzeit-Subscriptions und invalidiert React Query Caches
 */

import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Tabellen-zu-Query-Keys Mapping
const TABLE_QUERY_MAPPINGS: Record<string, string[]> = {
  employees: [
    'employees',
    'employee',
    'employee-list',
    'timetracking-employees',
    'shift-employees',
    'tasks',
    'project-members',
    'team-members',
    'company-departments',
    'company-teams'
  ],
  tasks: [
    'tasks',
    'task',
    'project-tasks',
    'roadmap-tasks',
    'employee-tasks',
    'kanban-tasks',
    'task-statistics'
  ],
  projects: [
    'projects',
    'project',
    'project-list',
    'roadmap-projects',
    'project-statistics',
    'gantt-data'
  ],
  departments: [
    'departments',
    'company-departments',
    'department-employees',
    'organization-structure'
  ],
  unified_notifications: [
    'notifications',
    'unread-notifications',
    'notification-count'
  ],
  system_events: [
    'system-events',
    'cross-module-events',
    'event-log'
  ],
  global_settings: [
    'global-settings',
    'translations',
    'user-settings',
    'theme-settings'
  ]
};

// Event-Handler für spezifische Tabellen-Änderungen
type ChangeHandler = (payload: any, queryClient: QueryClient) => void;

const CHANGE_HANDLERS: Record<string, ChangeHandler> = {
  employees: (payload, queryClient) => {
    console.log('[RealtimeSync] Employee change detected:', payload.eventType);
    
    // Bei INSERT: Sofort alle abhängigen Module invalidieren
    if (payload.eventType === 'INSERT') {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['timetracking-employees'] });
      queryClient.invalidateQueries({ queryKey: ['shift-employees'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
    
    // Bei UPDATE: Spezifische Invalidierung
    if (payload.eventType === 'UPDATE') {
      const employeeId = payload.new?.id;
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      }
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
    
    // Bei DELETE: Alle Listen aktualisieren
    if (payload.eventType === 'DELETE') {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  },
  
  tasks: (payload, queryClient) => {
    console.log('[RealtimeSync] Task change detected:', payload.eventType);
    
    // Alle Task-bezogenen Queries invalidieren
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['kanban-tasks'] });
    
    // Bei neuer Aufgabe mit Zuweisung: Notification-Queries auch invalidieren
    if (payload.eventType === 'INSERT' && payload.new?.assigned_to) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    }
    
    // Projekt-Tasks bei Änderung invalidieren
    if (payload.new?.project_id) {
      queryClient.invalidateQueries({ 
        queryKey: ['project-tasks', payload.new.project_id] 
      });
    }
  },
  
  projects: (payload, queryClient) => {
    console.log('[RealtimeSync] Project change detected:', payload.eventType);
    
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project-list'] });
    queryClient.invalidateQueries({ queryKey: ['gantt-data'] });
    
    // Bei neuem Projekt: Roadmap-Daten aktualisieren
    if (payload.eventType === 'INSERT') {
      queryClient.invalidateQueries({ queryKey: ['roadmap-projects'] });
    }
  },
  
  departments: (payload, queryClient) => {
    console.log('[RealtimeSync] Department change detected:', payload.eventType);
    
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    queryClient.invalidateQueries({ queryKey: ['company-departments'] });
    queryClient.invalidateQueries({ queryKey: ['organization-structure'] });
    
    // Bei neuer Abteilung: Filter-Optionen in allen Modulen aktualisieren
    if (payload.eventType === 'INSERT') {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  },
  
  unified_notifications: (payload, queryClient) => {
    console.log('[RealtimeSync] Notification change detected:', payload.eventType);
    
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notification-count'] });
  },
  
  global_settings: (payload, queryClient) => {
    console.log('[RealtimeSync] Settings change detected:', payload.eventType);
    
    // Sprache geändert?
    if (payload.old?.language !== payload.new?.language) {
      console.log('[RealtimeSync] Language changed from', payload.old?.language, 'to', payload.new?.language);
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['global-settings'] });
      
      // Custom Event für UI-Komponenten
      window.dispatchEvent(new CustomEvent('language-changed', {
        detail: { 
          oldLanguage: payload.old?.language, 
          newLanguage: payload.new?.language 
        }
      }));
    }
    
    queryClient.invalidateQueries({ queryKey: ['global-settings'] });
    queryClient.invalidateQueries({ queryKey: ['user-settings'] });
  },
  
  system_events: (payload, queryClient) => {
    console.log('[RealtimeSync] System event received:', payload.new?.event_type);
    
    queryClient.invalidateQueries({ queryKey: ['system-events'] });
    queryClient.invalidateQueries({ queryKey: ['crossModuleEvents'] });
  }
};

class RealtimeSyncService {
  private channels: RealtimeChannel[] = [];
  private queryClient: QueryClient | null = null;
  private isInitialized = false;

  /**
   * Initialisiert den Realtime-Sync-Service
   */
  initialize(queryClient: QueryClient): () => void {
    if (this.isInitialized) {
      console.log('[RealtimeSync] Already initialized, skipping...');
      return () => this.cleanup();
    }

    this.queryClient = queryClient;
    this.isInitialized = true;
    
    console.log('[RealtimeSync] Initializing realtime sync service...');

    // Kanal für alle Kerntabellen erstellen
    const tables = Object.keys(TABLE_QUERY_MAPPINGS);
    
    tables.forEach(table => {
      const channel = supabase
        .channel(`sync-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          (payload) => {
            console.log(`[RealtimeSync] Change in ${table}:`, payload.eventType);
            
            // Spezifischen Handler aufrufen falls vorhanden
            const handler = CHANGE_HANDLERS[table];
            if (handler && this.queryClient) {
              handler(payload, this.queryClient);
            } else if (this.queryClient) {
              // Fallback: Alle zugehörigen Queries invalidieren
              const queryKeys = TABLE_QUERY_MAPPINGS[table] || [];
              queryKeys.forEach(key => {
                this.queryClient?.invalidateQueries({ queryKey: [key] });
              });
            }
          }
        )
        .subscribe((status) => {
          console.log(`[RealtimeSync] Channel ${table} status:`, status);
        });

      this.channels.push(channel);
    });

    console.log(`[RealtimeSync] Subscribed to ${tables.length} tables`);

    // Cleanup-Funktion zurückgeben
    return () => this.cleanup();
  }

  /**
   * Bereinigt alle Subscriptions
   */
  cleanup(): void {
    console.log('[RealtimeSync] Cleaning up subscriptions...');
    
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    
    this.channels = [];
    this.queryClient = null;
    this.isInitialized = false;
  }

  /**
   * Manuelles Invalidieren von Queries für eine Tabelle
   */
  invalidateTable(tableName: string): void {
    if (!this.queryClient) return;
    
    const queryKeys = TABLE_QUERY_MAPPINGS[tableName] || [];
    queryKeys.forEach(key => {
      this.queryClient?.invalidateQueries({ queryKey: [key] });
    });
  }

  /**
   * Prüft ob der Service initialisiert ist
   */
  isActive(): boolean {
    return this.isInitialized && this.channels.length > 0;
  }
}

// Singleton-Instanz
export const realtimeSyncService = new RealtimeSyncService();

// Hook für React-Komponenten
export const useRealtimeSync = (queryClient: QueryClient) => {
  return {
    initialize: () => realtimeSyncService.initialize(queryClient),
    cleanup: () => realtimeSyncService.cleanup(),
    invalidateTable: (table: string) => realtimeSyncService.invalidateTable(table),
    isActive: () => realtimeSyncService.isActive()
  };
};
