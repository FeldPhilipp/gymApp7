// Service Worker Registrierung mit automatischer Aktivierung

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const logger = {
  info: (msg) => console.log(`[SW] ℹ️ ${msg}`),
  success: (msg) => console.log(`[SW] ✅ ${msg}`),
  warn: (msg) => console.warn(`[SW] ⚠️ ${msg}`),
  error: (msg) => console.error(`[SW] ❌ ${msg}`),
};

// Automatische Registrierung beim App-Start
let autoRegisterAttempted = false;

export function autoRegister(config = {}) {
  if (autoRegisterAttempted) {
    logger.warn('Auto-Registrierung bereits versucht');
    return;
  }
  
  autoRegisterAttempted = true;

  // Prüfe ob SW unterstützt wird
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker wird vom Browser nicht unterstützt');
    return;
  }

  // Nur in Production automatisch registrieren
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Dev-Modus: Auto-Registrierung übersprungen (manuelle Registrierung möglich)');
    return;
  }

  // Prüfe PUBLIC_URL
  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  if (publicUrl.origin !== window.location.origin) {
    logger.warn('PUBLIC_URL hat unterschiedliche Origin - SW wird nicht registriert');
    return;
  }

  // Registriere SW automatisch nach dem Laden
  if (document.readyState === 'complete') {
    registerServiceWorker(config);
  } else {
    window.addEventListener('load', () => registerServiceWorker(config));
  }
}

// Manuelle Registrierung (für Settings-Page) - funktioniert auch im Dev-Modus
export function register(config = {}) {
  // Prüfe nur ob Browser SW unterstützt
  if (!('serviceWorker' in navigator)) {
    const error = new Error('Service Worker wird vom Browser nicht unterstützt');
    logger.error(error.message);
    config.onError?.(error);
    return Promise.reject(error);
  }

  // Prüfe PUBLIC_URL nur wenn gesetzt
  if (process.env.PUBLIC_URL) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      const error = new Error('PUBLIC_URL Origin-Mismatch');
      logger.warn(error.message);
      config.onError?.(error);
      return Promise.reject(error);
    }
  }

  logger.info('Starte manuelle Service Worker Registrierung...');
  return registerServiceWorker(config);
}

function registerServiceWorker(config) {
  const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

  if (isLocalhost) {
    logger.info('Running on localhost - prüfe ob SW existiert');
    return checkValidServiceWorker(swUrl, config);
  } else {
    logger.info('Running on production - registering SW');
    return registerValidSW(swUrl, config);
  }
}

function registerValidSW(swUrl, config) {
  return navigator.serviceWorker
    .register(swUrl, { scope: '/' })
    .then((registration) => {
      logger.success(`Service Worker registriert mit Scope: ${registration.scope}`);

      // Event: Update gefunden
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        logger.info('Service Worker Update wird installiert...');

        installingWorker.onstatechange = () => {
          logger.info(`Service Worker State: ${installingWorker.state}`);
          
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Neuer Content verfügbar
              logger.info('Neuer SW Content verfügbar - Callback onUpdate');
              config.onUpdate?.(registration);
            } else {
              // Alles gecacht
              logger.success('Content ist offline verfügbar');
              config.onSuccess?.(registration);
            }
          }
        };
      };

      // Wenn bereits aktiv, rufe onSuccess auf
      if (registration.active && !navigator.serviceWorker.controller) {
        logger.success('Service Worker bereits aktiv');
        config.onSuccess?.(registration);
      }

      // Prüfe auf Updates
      checkForUpdates(registration);
      
      return registration;
    })
    .catch((error) => {
      logger.error(`Fehler bei SW Registrierung: ${error.message}`);
      config.onError?.(error);
      throw error;
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Prüfe ob SW existiert (bei Localhost)
  return fetch(swUrl, { 
    headers: { 'Service-Worker': 'script' },
    cache: 'no-cache'
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      
      logger.info(`SW Fetch Response: Status ${response.status}, Content-Type: ${contentType}`);

      // Nur bei 404 abbrechen
      if (response.status === 404) {
        logger.warn('Service Worker Datei nicht gefunden (404)');
        
        // Versuche bestehende Registrierungen zu entfernen
        return navigator.serviceWorker.ready
          .then((registration) => {
            return registration.unregister();
          })
          .then(() => {
            logger.info('Alte Service Worker Registrierung entfernt');
            const error = new Error('Service Worker Datei existiert nicht');
            throw error;
          })
          .catch((error) => {
            logger.error(`Fehler: ${error.message}`);
            throw error;
          });
      }
      
      // Bei anderen Status-Codes oder Content-Types: Versuche trotzdem zu registrieren
      if (contentType && !contentType.includes('javascript') && !contentType.includes('text/html')) {
        logger.warn(`Unerwarteter Content-Type: ${contentType} - versuche trotzdem zu registrieren`);
      } else {
        logger.success('Service Worker Datei gefunden');
      }
      
      return registerValidSW(swUrl, config);
    })
    .catch((fetchError) => {
      // Wenn Fetch fehlschlägt (z.B. offline), versuche trotzdem zu registrieren
      logger.warn(`Fetch fehlgeschlagen: ${fetchError.message} - versuche trotzdem zu registrieren`);
      return registerValidSW(swUrl, config);
    });
}

function checkForUpdates(registration) {
  // Prüfe alle 60 Minuten auf Updates
  const updateInterval = 60 * 60 * 1000;
  
  const intervalId = setInterval(() => {
    registration.update()
      .then(() => {
        if (registration.waiting) {
          logger.info('Update für Service Worker verfügbar');
        }
      })
      .catch((error) => {
        logger.error(`Fehler beim Update-Check: ${error.message}`);
      });
  }, updateInterval);

  // Cleanup bei Seiten-Unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready
      .then((registration) => {
        return registration.unregister();
      })
      .then(() => {
        logger.success('Service Worker deregistriert');
        return true;
      })
      .catch((error) => {
        logger.error(`Fehler beim Deregistrieren: ${error.message}`);
        throw error;
      });
  }
  return Promise.resolve(false);
}

// Ermögliche manuelles Update-Trigger von der Anwendung
export function checkSWUpdates() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistrations().then((registrations) => {
      const promises = registrations.map((registration) => {
        return registration.update().then(() => {
          if (registration.waiting) {
            logger.info('SW Update verfügbar - postMessage wird gesendet');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
      return Promise.all(promises);
    });
  }
  return Promise.resolve();
}

// Service Worker als aktiv machen (Skip Waiting)
export function activateSWUpdate() {
  return checkSWUpdates();
}

// Hilfsfunktion: Prüfe SW Status
export function getServiceWorkerStatus() {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve({ supported: false, registered: false });
  }

  return navigator.serviceWorker.getRegistrations().then((registrations) => {
    return {
      supported: true,
      registered: registrations.length > 0,
      registrations: registrations.map(reg => ({
        scope: reg.scope,
        active: !!reg.active,
        installing: !!reg.installing,
        waiting: !!reg.waiting
      }))
    };
  });
}