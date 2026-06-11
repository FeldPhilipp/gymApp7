const logger = {
  info: (msg) => console.log(`[Update] ℹ️ ${msg}`),
  success: (msg) => console.log(`[Update] ✅ ${msg}`),
  warn: (msg) => console.warn(`[Update] ⚠️ ${msg}`),
  error: (msg) => console.error(`[Update] ❌ ${msg}`),
};

class UpdateService {
  constructor() {
    this.currentVersion = '0.1.7.1.4'; // Diese Version muss mit package.json übereinstimmen
    this.checkInterval = null;
    this.onUpdateCallback = null;
  }

  // Prüfe auf neue Version
  async checkForAppUpdate() {
    try {
      logger.info('Prüfe auf App-Updates...');
      
      const response = await fetch('/version.json', { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      logger.info(`Server Version: ${data.version}, Local Version: ${this.currentVersion}`);

      // Vergleiche Versionen
      if (data.version !== this.currentVersion) {
        logger.warn(`Neue Version verfügbar: ${data.version}`);
        return {
          updateAvailable: true,
          newVersion: data.version,
          forceUpdate: data.forceUpdate || false
        };
      }

      logger.success('App ist auf dem neuesten Stand');
      return {
        updateAvailable: false,
        newVersion: this.currentVersion,
        forceUpdate: false
      };

    } catch (error) {
      logger.error(`Fehler beim Version-Check: ${error.message}`);
      return {
        updateAvailable: false,
        error: error.message
      };
    }
  }

  // Starte automatische Update-Prüfung
  startAutoCheck(intervalMinutes = 5, callback) {
    logger.info(`Starte Auto-Update-Check (alle ${intervalMinutes} Minuten)`);
    
    this.onUpdateCallback = callback;

    // Erste Prüfung sofort
    this.performCheck();

    // Dann regelmäßig prüfen
    this.checkInterval = setInterval(() => {
      this.performCheck();
    }, intervalMinutes * 60 * 1000);
  }

  async performCheck() {
    const result = await this.checkForAppUpdate();
    
    if (result.updateAvailable && this.onUpdateCallback) {
      this.onUpdateCallback(result);
    }
  }

  // Stoppe automatische Prüfung
  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Auto-Update-Check gestoppt');
    }
  }

  // Force Update durchführen
  async forceAppUpdate() {
    logger.info('Erzwinge App-Update...');
    
    try {
      // 1. Lösche alle Caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        logger.success('Alle Caches gelöscht');
      }

      // 2. Unregister Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(reg => reg.unregister())
        );
        logger.success('Service Worker deregistriert');
      }

      // 3. Hard Reload
      logger.info('Führe Hard Reload durch...');
      window.location.reload(true);
      
    } catch (error) {
      logger.error(`Fehler beim Force-Update: ${error.message}`);
      // Fallback: Normaler Reload
      window.location.reload();
    }
  }
}

export default new UpdateService();