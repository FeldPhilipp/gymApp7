import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../../services/notificationService';
import { UserApi } from '../../services/api';
import { clearAuthToken } from '../../services/authStorage';

if (process.env.NODE_ENV === 'development') {
  window.NotificationService = NotificationService;
  console.log('[Debug] NotificationService ist jetzt global verfügbar');
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [nutzer, setNutzer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Token-Validierung und automatisches Refresh
  const validateSession = useCallback(async () => {
    try {
      // API-Call zum Validieren der Session (Token wird automatisch via Cookie gesendet)
      const response = await UserApi.validateSession();
      
      if (response.data?.nutzer) {
        setNutzer(response.data.nutzer);
        setIsLoggedIn(true);
        
        // Push-Benachrichtigungen initialisieren
        if (response.data.nutzer.id) {
          NotificationService.initialize(response.data.nutzer.id)
            .catch(err => console.error('Push-Init Fehler:', err));
        }
      } else {
        setNutzer(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      // Nur loggen, kein State-Change wenn es ein Netzwerkfehler ist
      console.log('Session-Validierung: Kein Cookie gefunden oder Session abgelaufen');
      setNutzer(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []); // Leere Dependencies sind OK

  // Initial-Validierung beim App-Start - NUR EINMAL
  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
      if (mounted) {
        await validateSession();
      }
    };
    
    initSession();
    
    return () => {
      mounted = false;
    };
  }, []); // Leere Dependencies - läuft nur beim Mount

  // Periodische Session-Validierung (alle 15 Minuten)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      validateSession();
    }, 15 * 60 * 1000); // 15 Minuten

    return () => clearInterval(interval);
  }, [isLoggedIn, validateSession]);

  const login = (nutzerData) => {
    setNutzer(nutzerData);
    setIsLoggedIn(true);
    // Token wird jetzt nur noch im httpOnly Cookie gespeichert (vom Server gesetzt)
  };

  const logout = async () => {
    try {
      // Backend-Call zum Löschen des Cookies
      await UserApi.logout();
    } catch (error) {
      console.error('Logout-Fehler:', error);
    } finally {
      await clearAuthToken();
      setNutzer(null);
      setIsLoggedIn(false);
    }
  };

  const updateNutzer = (updatedData) => {
    setNutzer(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{
      nutzer,
      isLoggedIn,
      loading,
      login,
      logout,
      updateNutzer,
      validateSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  }
  return context;
};