import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { autoRegister } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker AUTOMATISCH beim App-Start registrieren
autoRegister({
  onSuccess: () => {
    console.log('[App] Service Worker erfolgreich registriert und Content ist offline verfügbar');
  },
  onUpdate: (registration) => {
    console.log('[App] Neuer Service Worker verfügbar. Update wird installiert...');
    
    // Optional: Zeige dem User eine Benachrichtigung über das Update
    if (registration.waiting) {
      // Du kannst hier eine Benachrichtigung anzeigen
      // z.B. mit einem Toast oder Banner
      console.log('[App] Neuer Content verfügbar - bitte Seite neu laden');
    }
  },
  onError: (error) => {
    console.error('[App] Service Worker Registrierung fehlgeschlagen:', error);
  }
});

// Web Vitals messen (optional)
reportWebVitals();