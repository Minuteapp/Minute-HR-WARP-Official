import { useState, useEffect } from 'react';
import { offlineManager } from '@/lib/offline/OfflineManager';

export const useOfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [conflicts, setConflicts] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize offline manager
    offlineManager.initialize();

    // Online/Offline Event Listeners
    const handleOnline = () => {
      setIsOnline(true);
      offlineManager.sync(); // Auto-sync when coming online
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Offline Manager Event Listeners
    const handleSyncStarted = () => {
      setIsSyncing(true);
    };

    const handleSyncCompleted = () => {
      setIsSyncing(false);
      setLastSync(new Date());
      updateCounts();
    };

    const handleSyncFailed = () => {
      setIsSyncing(false);
    };

    const handleDataChanged = () => {
      updateCounts();
    };

    offlineManager.on('syncStarted', handleSyncStarted);
    offlineManager.on('syncCompleted', handleSyncCompleted);
    offlineManager.on('syncFailed', handleSyncFailed);
    offlineManager.on('dataChanged', handleDataChanged);

    // Initial counts
    const updateCounts = async () => {
      const pendingCount = await offlineManager.getPendingOperationsCount();
      const conflictCount = await offlineManager.getConflictsCount();
      setPendingOperations(pendingCount);
      setConflicts(conflictCount);
    };

    updateCounts();

    // Periodic sync when online
    const syncInterval = setInterval(() => {
      if (navigator.onLine && !offlineManager.isSyncing()) {
        offlineManager.sync();
      }
    }, 30000); // Sync every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      offlineManager.off('syncStarted', handleSyncStarted);
      offlineManager.off('syncCompleted', handleSyncCompleted);
      offlineManager.off('syncFailed', handleSyncFailed);
      offlineManager.off('dataChanged', handleDataChanged);
      
      clearInterval(syncInterval);
    };
  }, []);

  const manualSync = async () => {
    if (isOnline && !isSyncing) {
      await offlineManager.sync();
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingOperations,
    conflicts,
    lastSync,
    manualSync,
    offlineManager
  };
};