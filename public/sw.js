// Service Worker für Offline-First Architektur
const CACHE_NAME = 'hr-enterprise-v1';
const OFFLINE_URL = '/offline';

// App Shell - Cache First Strategy
const APP_SHELL_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  // Statische Assets werden automatisch von Vite gecacht
];

// API Routes für Background Sync
const SYNC_ENDPOINTS = [
  '/api/calendar/sync',
  '/api/chat/sync', 
  '/api/budget/sync',
  '/api/environment/sync'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  
  // Aktiviere sofort ohne auf andere Tabs zu warten
  self.skipWaiting();
});

// Aktivierung
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Übernimme Kontrolle über alle Clients
  return self.clients.claim();
});

// Fetch Handler mit verschiedenen Strategien
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // App Shell: Cache First
  if (APP_SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }
  
  // API Calls: Network First mit Offline Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithOfflineQueue(request));
    return;
  }
  
  // Stammdaten: Stale While Revalidate
  if (url.pathname.includes('/users') || url.pathname.includes('/teams')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Standard: Network First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((response) => {
        return response || caches.match(OFFLINE_URL);
      });
    })
  );
});

// Network First mit Offline Queue
async function networkFirstWithOfflineQueue(request) {
  try {
    const response = await fetch(request);
    
    // Cache erfolgreiche GET Requests
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, checking cache and offline queue');
    
    // Bei POST/PUT/DELETE: Zur Offline Queue hinzufügen
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      await addToOfflineQueue(request);
      return new Response(
        JSON.stringify({ 
          success: true, 
          offline: true, 
          message: 'Request queued for when online' 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // GET: Aus Cache versuchen
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cachedResponse || fetchPromise;
}

// Offline Queue Management
async function addToOfflineQueue(request) {
  const requestData = {
    id: generateULID(),
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now(),
    retryCount: 0
  };
  
  // Speichere in IndexedDB
  const db = await openOfflineDB();
  const transaction = db.transaction(['offline_queue'], 'readwrite');
  const store = transaction.objectStore('offline_queue');
  await store.add(requestData);
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

// Offline Queue verarbeiten
async function processOfflineQueue() {
  const db = await openOfflineDB();
  const transaction = db.transaction(['offline_queue'], 'readwrite');
  const store = transaction.objectStore('offline_queue');
  const requests = await store.getAll();
  
  for (const requestData of requests) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: new Headers(requestData.headers),
        body: requestData.body
      });
      
      if (response.ok) {
        // Erfolgreich gesendet - aus Queue entfernen
        await store.delete(requestData.id);
        console.log('Offline request processed:', requestData.url);
      } else {
        // Fehler - Retry Count erhöhen
        requestData.retryCount++;
        if (requestData.retryCount < 3) {
          await store.put(requestData);
        } else {
          await store.delete(requestData.id);
          console.error('Max retries reached for:', requestData.url);
        }
      }
    } catch (error) {
      console.error('Failed to process offline request:', error);
      
      // Exponential Backoff
      requestData.retryCount++;
      if (requestData.retryCount < 5) {
        requestData.nextRetry = Date.now() + (Math.pow(2, requestData.retryCount) * 1000);
        await store.put(requestData);
      } else {
        await store.delete(requestData.id);
      }
    }
  }
}

// IndexedDB Helper
async function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offline_queue')) {
        const store = db.createObjectStore('offline_queue', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// ULID Generator (vereinfacht)
function generateULID() {
  const timestamp = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2, 15);
  return timestamp + randomness;
}

// Message Handler für Client Communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_OFFLINE_STATUS') {
    event.ports[0].postMessage({
      isOnline: navigator.onLine,
      hasQueuedRequests: false // TODO: Check actual queue
    });
  }
});