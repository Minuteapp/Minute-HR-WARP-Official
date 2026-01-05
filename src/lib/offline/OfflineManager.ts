// Zentrale Offline-Management Klasse
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineEntry {
  id: string;
  data: any;
  lastModified: number;
  status: 'synced' | 'pending' | 'conflict';
  operation: 'create' | 'update' | 'delete';
}

interface SyncMetadata {
  key: string;
  lastSync: number;
  lastServerTimestamp: number;
  pendingOperations: number;
}

interface OfflineDBSchema extends DBSchema {
  calendar_events: {
    key: string;
    value: OfflineEntry;
    indexes: { 'status': string; 'lastModified': number };
  };
  chat_messages: {
    key: string;
    value: OfflineEntry;
    indexes: { 'status': string; 'lastModified': number };
  };
  budget_entries: {
    key: string;
    value: OfflineEntry;
    indexes: { 'status': string; 'lastModified': number };
  };
  environment_data: {
    key: string;
    value: OfflineEntry;
    indexes: { 'status': string; 'lastModified': number };
  };
  sync_metadata: {
    key: string;
    value: SyncMetadata;
  };
}

type DataStore = 'calendar_events' | 'chat_messages' | 'budget_entries' | 'environment_data';

export class OfflineManager {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private syncInProgress = false;
  private eventListeners: { [key: string]: Function[] } = {};

  async initialize() {
    this.db = await openDB<OfflineDBSchema>('HREnterpriseOffline', 1, {
      upgrade(db) {
        // Calendar Events Store
        if (!db.objectStoreNames.contains('calendar_events')) {
          const calendarStore = db.createObjectStore('calendar_events', { keyPath: 'id' });
          calendarStore.createIndex('status', 'status');
          calendarStore.createIndex('lastModified', 'lastModified');
        }

        // Chat Messages Store
        if (!db.objectStoreNames.contains('chat_messages')) {
          const chatStore = db.createObjectStore('chat_messages', { keyPath: 'id' });
          chatStore.createIndex('status', 'status');
          chatStore.createIndex('lastModified', 'lastModified');
        }

        // Budget Entries Store
        if (!db.objectStoreNames.contains('budget_entries')) {
          const budgetStore = db.createObjectStore('budget_entries', { keyPath: 'id' });
          budgetStore.createIndex('status', 'status');
          budgetStore.createIndex('lastModified', 'lastModified');
        }

        // Environment Data Store
        if (!db.objectStoreNames.contains('environment_data')) {
          const envStore = db.createObjectStore('environment_data', { keyPath: 'id' });
          envStore.createIndex('status', 'status');
          envStore.createIndex('lastModified', 'lastModified');
        }

        // Sync Metadata Store
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
      },
    });

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Background Sync registrieren
        if ('sync' in window && 'serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if ('sync' in registration) {
            await (registration as any).sync.register('offline-sync');
          }
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    return this.db;
  }

  // Generische CRUD Operationen
  async create(store: DataStore, id: string, data: any): Promise<OfflineEntry> {
    if (!this.db) await this.initialize();
    
    const entry: OfflineEntry = {
      id,
      data,
      lastModified: Date.now(),
      status: 'pending',
      operation: 'create'
    };

    await this.db!.put(store, entry);
    this.emit('dataChanged', { store, operation: 'create', id });
    
    return entry;
  }

  async update(store: DataStore, id: string, data: any): Promise<OfflineEntry> {
    if (!this.db) await this.initialize();
    
    const existing = await this.db!.get(store, id);
    const entry: OfflineEntry = {
      id,
      data: { ...existing?.data, ...data },
      lastModified: Date.now(),
      status: 'pending',
      operation: existing ? 'update' : 'create'
    };

    await this.db!.put(store, entry);
    this.emit('dataChanged', { store, operation: 'update', id });
    
    return entry;
  }

  async delete(store: DataStore, id: string): Promise<OfflineEntry | undefined> {
    if (!this.db) await this.initialize();
    
    const existing = await this.db!.get(store, id);
    if (!existing) return;

    const entry: OfflineEntry = {
      ...existing,
      lastModified: Date.now(),
      status: 'pending',
      operation: 'delete'
    };

    await this.db!.put(store, entry);
    this.emit('dataChanged', { store, operation: 'delete', id });
    
    return entry;
  }

  async getAll(store: DataStore): Promise<OfflineEntry[]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAll(store);
  }

  async get(store: DataStore, id: string): Promise<OfflineEntry | undefined> {
    if (!this.db) await this.initialize();
    return await this.db!.get(store, id);
  }

  // Sync Operations
  async sync() {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    this.emit('syncStarted');

    try {
      await this.pullFromServer();
      await this.pushToServer();
      this.emit('syncCompleted');
    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('syncFailed', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pullFromServer() {
    const stores: DataStore[] = [
      'calendar_events', 
      'chat_messages', 
      'budget_entries', 
      'environment_data'
    ];

    for (const store of stores) {
      try {
        const metadata = await this.getSyncMetadata(store);
        const response = await fetch(`/api/${store}/sync?since=${metadata.lastServerTimestamp}`);
        
        if (response.ok) {
          const { data, serverTimestamp } = await response.json();
          
          for (const item of data) {
            const existing = await this.db!.get(store, item.id);
            
            if (!existing || existing.status === 'synced') {
              await this.db!.put(store, {
                id: item.id,
                data: item,
                lastModified: item.lastModified,
                status: 'synced',
                operation: 'update'
              });
            } else {
              await this.db!.put(store, {
                ...existing,
                status: 'conflict'
              });
            }
          }

          await this.setSyncMetadata(store, { 
            ...metadata, 
            lastServerTimestamp: serverTimestamp 
          });
        }
      } catch (error) {
        console.error(`Failed to pull ${store}:`, error);
      }
    }
  }

  private async pushToServer() {
    const stores: DataStore[] = [
      'calendar_events', 
      'chat_messages', 
      'budget_entries', 
      'environment_data'
    ];

    for (const store of stores) {
      try {
        const pendingEntries = await this.db!.getAllFromIndex(store, 'status', 'pending');
        
        for (const entry of pendingEntries) {
          const response = await fetch(`/api/${store}/${entry.id}`, {
            method: entry.operation === 'delete' ? 'DELETE' : 
                   entry.operation === 'create' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...entry.data,
              clientMutationId: `${entry.id}_${entry.lastModified}`
            })
          });

          if (response.ok) {
            await this.db!.put(store, {
              ...entry,
              status: 'synced'
            });
          }
        }
      } catch (error) {
        console.error(`Failed to push ${store}:`, error);
      }
    }
  }

  private async getSyncMetadata(store: string): Promise<SyncMetadata> {
    if (!this.db) await this.initialize();
    
    const metadata = await this.db!.get('sync_metadata', store);
    return metadata || {
      key: store,
      lastSync: 0,
      lastServerTimestamp: 0,
      pendingOperations: 0
    };
  }

  private async setSyncMetadata(store: string, metadata: Partial<SyncMetadata>) {
    if (!this.db) await this.initialize();
    
    await this.db!.put('sync_metadata', {
      key: store,
      lastSync: Date.now(),
      lastServerTimestamp: 0,
      pendingOperations: 0,
      ...metadata
    });
  }

  // Event System
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Utility Methods
  async getPendingOperationsCount(): Promise<number> {
    if (!this.db) return 0;
    
    const stores: DataStore[] = [
      'calendar_events', 
      'chat_messages', 
      'budget_entries', 
      'environment_data'
    ];

    let count = 0;
    for (const store of stores) {
      const pending = await this.db.getAllFromIndex(store, 'status', 'pending');
      count += pending.length;
    }
    
    return count;
  }

  async getConflictsCount(): Promise<number> {
    if (!this.db) return 0;
    
    const stores: DataStore[] = [
      'calendar_events', 
      'chat_messages', 
      'budget_entries', 
      'environment_data'
    ];

    let count = 0;
    for (const store of stores) {
      const conflicts = await this.db.getAllFromIndex(store, 'status', 'conflict');
      count += conflicts.length;
    }
    
    return count;
  }

  isOnline() {
    return navigator.onLine;
  }

  isSyncing() {
    return this.syncInProgress;
  }
}

// Singleton Instance
export const offlineManager = new OfflineManager();