import { GruppenApi } from './api';

// Helper-Funktion für VAPID Key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationService = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('[Push] Browser unterstützt keine Benachrichtigungen');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('[Push] Berechtigung bereits erteilt');
      return true;
    }

    if (Notification.permission !== 'denied') {
      console.log('[Push] Frage nach Berechtigung...');
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    console.warn('[Push] Berechtigung wurde verweigert');
    return false;
  },

  async subscribeToPushNotifications(nutzerId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] Push-Benachrichtigungen nicht unterstützt');
      return null;
    }

    try {
      // Warte auf Service Worker
      const registration = await navigator.serviceWorker.ready;
      console.log('[Push] Service Worker bereit');
      
      // Prüfe ob bereits eine Subscription existiert
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('[Push] Keine Subscription vorhanden, erstelle neue...');
        
        // Hole VAPID Public Key vom Backend
        const response = await GruppenApi.getVapidPublicKey();
        const { publicKey } = response.data;
        
        if (!publicKey) {
          throw new Error('VAPID Public Key nicht verfügbar');
        }
        
        console.log('[Push] VAPID Key erhalten, erstelle Subscription...');
        
        // Erstelle neue Subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
        
        console.log('[Push] Subscription erstellt:', subscription.endpoint);
      } else {
        console.log('[Push] Bestehende Subscription gefunden');
      }

      // Sende Subscription zum Server
      if (nutzerId) {
        const success = await NotificationService.sendSubscriptionToServer(subscription, nutzerId);
        if (success) {
          console.log('[Push] Subscription erfolgreich am Server registriert');
        } else {
          console.error('[Push] Fehler beim Registrieren der Subscription am Server');
        }
      }

      return subscription;
    } catch (error) {
      console.error('[Push] Fehler bei Push-Subscription:', error);
      return null;
    }
  },

  async sendSubscriptionToServer(subscription, nutzerId) {
    try {
      console.log('[Push] Sende Subscription an Server...');
      await GruppenApi.subscribePush({
        nutzer_id: nutzerId,
        subscription: subscription.toJSON()
      });
      return true;
    } catch (error) {
      console.error('[Push] Fehler beim Speichern der Subscription:', error);
      return false;
    }
  },

  async unsubscribeFromPush(nutzerId) {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[Push] Lokale Subscription entfernt');
      }

      // Informiere Server
      await GruppenApi.unsubscribePush(nutzerId);
      console.log('[Push] Server-Subscription entfernt');
      
      return true;
    } catch (error) {
      console.error('[Push] Fehler beim Deaktivieren:', error);
      return false;
    }
  },

  // Prüfe ob Push-Subscription aktiv ist
  async isPushSubscribed() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      return !!subscription;
    } catch (error) {
      console.error('[Push] Fehler beim Prüfen der Subscription:', error);
      return false;
    }
  },

  showLocalNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });
    } else {
      console.warn('[Push] Keine Berechtigung für lokale Benachrichtigungen');
    }
  },

  // Initialisierung - sollte beim App-Start aufgerufen werden
  async initialize(nutzerId) {
    console.log('[Push] Initialisiere Push-Benachrichtigungen für Nutzer', nutzerId);
    
    if (!nutzerId) {
      console.warn('[Push] Keine Nutzer-ID angegeben');
      return false;
    }

    // 1. Prüfe Permission
    const hasPermission = await NotificationService.requestPermission();
    
    if (!hasPermission) {
      console.warn('[Push] Keine Berechtigung für Benachrichtigungen');
      return false;
    }

    // 2. Registriere Service Worker falls nötig
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.ready;
        console.log('[Push] Service Worker bereit');
      } catch (error) {
        console.error('[Push] Service Worker nicht verfügbar:', error);
        return false;
      }
    } else {
      console.warn('[Push] Service Worker nicht unterstützt');
      return false;
    }

    // 3. Erstelle/Aktualisiere Push-Subscription
    const subscription = await NotificationService.subscribeToPushNotifications(nutzerId);
    
    if (subscription) {
      console.log('[Push] Push-Benachrichtigungen erfolgreich aktiviert');
      return true;
    }

    console.warn('[Push] Konnte Push-Benachrichtigungen nicht aktivieren');
    return false;
  }
};