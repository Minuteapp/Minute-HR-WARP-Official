/**
 * React Hook für Realtime-Synchronisation
 * Initialisiert und verwaltet den RealtimeSyncService
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeSyncService } from '@/services/realtimeSyncService';

/**
 * Hook zur Initialisierung des Realtime-Sync-Service
 * Sollte einmal im App-Root verwendet werden
 */
export const useRealtimeSyncInitializer = () => {
  const queryClient = useQueryClient();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Service initialisieren
    cleanupRef.current = realtimeSyncService.initialize(queryClient);
    
    console.log('[useRealtimeSyncInitializer] Realtime sync initialized');

    // Cleanup bei Unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [queryClient]);

  return {
    isActive: () => realtimeSyncService.isActive(),
    invalidateTable: (table: string) => realtimeSyncService.invalidateTable(table)
  };
};

/**
 * Hook für manuelle Tabellen-Invalidierung
 */
export const useTableInvalidation = () => {
  return {
    invalidate: (tableName: string) => {
      realtimeSyncService.invalidateTable(tableName);
    },
    invalidateMultiple: (tableNames: string[]) => {
      tableNames.forEach(table => realtimeSyncService.invalidateTable(table));
    }
  };
};
