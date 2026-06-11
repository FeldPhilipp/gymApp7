/* eslint-disable no-restricted-globals */

// Service Worker für Development und Production
// Diese Datei muss im public/ Ordner liegen!

const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
];

// Installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installation gestartet');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache geöffnet');
        // Versuche zu cachen, aber scheitere nicht wenn es fehlschlägt
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('[SW] Einige Dateien konnten nicht gecacht werden:', err);
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[SW] Installation abgeschlossen');
        // Erzwinge sofortige Aktivierung
        return self.skipWaiting();
      })
  );
});

// Aktivierung
self.addEventListener('activate', (event) => {
  console.log('[SW] Aktivierung gestartet');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Lösche alten Cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Aktivierung abgeschlossen');
        // Übernehme Kontrolle über alle Clients
        return self.clients.claim();
      })
  );
});

// Fetch - Network First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Wenn erfolgreich, cache die Antwort
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Bei Fehler, versuche aus Cache zu laden
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('[SW] Lade aus Cache:', event.request.url);
            return response;
          }
          // Fallback für Navigation Requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline - Ressource nicht verfügbar', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Message Handler - für SKIP_WAITING
self.addEventListener('message', (event) => {
  console.log('[SW] Message empfangen:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip Waiting aktiviert');
    self.skipWaiting();
  }
});

// Push-Benachrichtigungen empfangen
self.addEventListener('push', (event) => {
  console.log('[SW] 📬 Push-Benachrichtigung empfangen', event);

  let data = {
    title: 'Neue Benachrichtigung',
    body: 'Du hast eine neue Nachricht',
    icon: '/logo192.png',
    badge: '/badge.png',
    tag: 'default',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      data = event.data.json();
      console.log('[SW] 📦 Push-Daten:', data);
    } catch (e) {
      console.error('[SW] ❌ Fehler beim Parsen der Push-Daten:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/badge.png',
    tag: data.tag || 'default',
    data: data.data || { url: '/' },
    requireInteraction: false, // Nicht zu aufdringlich
    vibrate: [200, 100, 200], // Vibrationsmuster
    actions: [
      { action: 'open', title: 'Öffnen', icon: '/logo192.png' },
      { action: 'close', title: 'Schließen' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        console.log('[SW] ✅ Benachrichtigung angezeigt:', data.title);
      })
      .catch((err) => {
        console.error('[SW] ❌ Fehler beim Anzeigen der Benachrichtigung:', err);
      })
  );
});

// Notification Click Handler - WICHTIG für clickbare Notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Benachrichtigung geklickt:', event.action);

  // Schließe die Benachrichtigung
  event.notification.close();

  // Wenn "Schließen" geklickt wurde, tue nichts
  if (event.action === 'close') {
    console.log('[SW] Benachrichtigung geschlossen');
    return;
  }

  // URL aus den Notification-Daten holen
  const urlToOpen = event.notification.data?.url || '/';
  console.log('[SW] 🔗 Öffne URL:', urlToOpen);

  // Öffne oder fokussiere Tab mit der URL
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
      .then((clientList) => {
        console.log('[SW] Gefundene Clients:', clientList.length);

        // Prüfe ob bereits ein Tab mit der App offen ist
        for (let client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            console.log('[SW] ✅ Fokussiere existierenden Tab und navigiere zu:', urlToOpen);
            // Navigiere zum gewünschten Pfad
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          }
        }

        // Wenn kein Tab offen ist, öffne einen neuen
        if (self.clients.openWindow) {
          console.log('[SW] ✅ Öffne neues Fenster mit:', urlToOpen);
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((err) => {
        console.error('[SW] ❌ Fehler beim Öffnen/Fokussieren:', err);
      })
  );
});

// Error Handling
self.addEventListener('error', (event) => {
  console.error('[SW] ❌ Error:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] ❌ Unhandled Promise Rejection:', event.reason);
});

console.log('[SW] ✅ Service Worker geladen');