import { GruppenApi } from './api';

export class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Browser unterstützt keine Benachrichtigungen');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async subscribeToPushNotifications(nutzerId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push-Benachrichtigungen nicht unterstützt');
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
        
        // Hole VAPID Public Key vom Backend (korrigierte URL)
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
        
        console.log('[Push] Subscription erstellt');
      } else {
        console.log('[Push] Bestehende Subscription gefunden');
      }

      // Sende Subscription zum Server (korrigierte URL)
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
  }

  static async sendSubscriptionToServer(subscription, nutzerId) {
    try {
      // Verwende die API aus api.js (korrigierte URL)
      await GruppenApi.subscribePush({
        nutzer_id: nutzerId,
        subscription: subscription.toJSON()
      });
      return true;
    } catch (error) {
      console.error('[Push] Fehler beim Speichern der Subscription:', error);
      return false;
    }
  }

  static async unsubscribeFromPush(nutzerId) {
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
  }

  static showLocalNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });
    }
  }

  // Initialisierung - sollte beim App-Start aufgerufen werden
  static async initialize(nutzerId) {
    console.log('[Push] Initialisiere Push-Benachrichtigungen...');
    
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
    }

    // 3. Erstelle/Aktualisiere Push-Subscription
    const subscription = await NotificationService.subscribeToPushNotifications(nutzerId);
    
    if (subscription) {
      console.log('[Push] Push-Benachrichtigungen erfolgreich aktiviert');
      return true;
    }

    return false;
  }
}

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