
import React, { createContext, useContext, useCallback, useRef } from 'react';

const ApiProtectionContext = createContext();

export const ApiProtectionProvider = ({ children, defaultDelay = 500 }) => {
  const activeRequestsRef = useRef(new Map());

  const protect = useCallback(async (key, asyncFn, customDelay = null) => {
    const delay = customDelay ?? defaultDelay;
    
    // Wenn Anfrage mit diesem Key bereits läuft, ignorieren
    if (activeRequestsRef.current.has(key)) {
      console.warn(`⏳ Anfrage "${key}" läuft bereits. Bitte warten...`);
      return null;
    }

    activeRequestsRef.current.set(key, true);

    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error(`❌ Fehler bei "${key}":`, error);
      throw error;
    } finally {
      setTimeout(() => {
        activeRequestsRef.current.delete(key);
      }, delay);
    }
  }, [defaultDelay]);

  // Funktion um alle aktiven Requests zu canceln (z.B. bei Navigation)
  const cancelAll = useCallback(() => {
    activeRequestsRef.current.clear();
  }, []);

  // Funktion um spezifische Requests zu canceln
  const cancel = useCallback((key) => {
    activeRequestsRef.current.delete(key);
  }, []);

  // Funktion um Status zu prüfen
  const isLoading = useCallback((key) => {
    return activeRequestsRef.current.has(key);
  }, []);

  return (
    <ApiProtectionContext.Provider value={{ protect, cancelAll, cancel, isLoading }}>
      {children}
    </ApiProtectionContext.Provider>
  );
};

export const useApiProtectionContext = () => {
  const context = useContext(ApiProtectionContext);
  if (!context) {
    throw new Error(
      '🚨 useApiProtectionContext muss innerhalb ApiProtectionProvider verwendet werden'
    );
  }
  return context;
};