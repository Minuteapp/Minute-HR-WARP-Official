import { useState, useEffect, useCallback } from 'react';
import { offlineManager } from '@/lib/offline/OfflineManager';

type StoreType = 'calendar_events' | 'chat_messages' | 'budget_entries' | 'environment_data';

export const useOfflineData = <T = any>(
  store: StoreType,
  id?: string
) => {
  const [data, setData] = useState<T[]>([]);
  const [singleItem, setSingleItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'synced' | 'pending' | 'conflict'>('synced');

  // Daten laden
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (id) {
        // Einzelnes Item laden
        const item = await offlineManager.get(store, id);
        setSingleItem(item?.data || null);
        setStatus(item?.status || 'synced');
      } else {
        // Alle Items laden
        const items = await offlineManager.getAll(store);
        const processedData = items
          .filter(item => item.operation !== 'delete') // Gelöschte Items ausblenden
          .map(item => ({
            ...item.data,
            _offlineStatus: item.status,
            _lastModified: item.lastModified
          }));
        setData(processedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }, [store, id]);

  // CRUD Operationen
  const create = useCallback(async (itemData: Partial<T>) => {
    try {
      const newId = `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      await offlineManager.create(store, newId, itemData);
      await loadData(); // Daten neu laden
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
      throw err;
    }
  }, [store, loadData]);

  const update = useCallback(async (itemId: string, updates: Partial<T>) => {
    try {
      await offlineManager.update(store, itemId, updates);
      await loadData(); // Daten neu laden
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
      throw err;
    }
  }, [store, loadData]);

  const remove = useCallback(async (itemId: string) => {
    try {
      await offlineManager.delete(store, itemId);
      await loadData(); // Daten neu laden
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
      throw err;
    }
  }, [store, loadData]);

  // Event Listener für Datenänderungen
  useEffect(() => {
    const handleDataChanged = (event: any) => {
      if (event.store === store) {
        loadData();
      }
    };

    offlineManager.on('dataChanged', handleDataChanged);
    offlineManager.on('syncCompleted', loadData);

    return () => {
      offlineManager.off('dataChanged', handleDataChanged);
      offlineManager.off('syncCompleted', loadData);
    };
  }, [store, loadData]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    singleItem,
    loading,
    error,
    status,
    create,
    update,
    remove,
    reload: loadData
  };
};