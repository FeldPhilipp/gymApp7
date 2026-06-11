import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingPage from '../layout/LoadingPage';
import NavBar from '../layout/NavBar';
import NavBarBot from '../layout/NavBarBot';
import Notification from '../util/notifications/Notification';

function ProtectedRoute({ children, checkAccess }) {
  const { isLoggedIn, loading: authLoading, nutzer } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Wenn keine spezielle Zugriffsprüfung nötig ist, nur Login-Check
  const needsAccessCheck = typeof checkAccess === 'function';

  useEffect(() => {
    async function validateAccess() {
      // Warte bis Auth geladen ist
      if (authLoading) return;

      // Wenn nicht eingeloggt, wird Navigate unten behandelt
      if (!isLoggedIn || !nutzer) return;

      // Wenn keine spezielle Prüfung nötig, Zugriff gewähren
      if (!needsAccessCheck) {
        setHasAccess(true);
        return;
      }

      try {
        setIsChecking(true);
        
        // Führe die übergebene Zugriffsprüfung aus
        const accessGranted = await checkAccess(nutzer);
        
        if (accessGranted) {
          setHasAccess(true);
        } else {
          // 404 für Hacker-Verwirrung
          setMessage({ type: "error", text: "404" });
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        // Bei 500er Fehler richtige Fehlermeldung
        setMessage({ 
          type: "error", 
          text: error.response?.status === 500 
            ? "Serverfehler. Bitte versuche es später erneut." 
            : "404" 
        });
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    }

    validateAccess();
  }, [authLoading, isLoggedIn, nutzer, checkAccess, needsAccessCheck]);

  // Zeige Loading während Auth lädt
  if (authLoading) {
    return <LoadingPage />;
  }

  // Wenn nicht eingeloggt, zum Login weiterleiten
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Zeige Loading während Zugriffsprüfung läuft
  if (needsAccessCheck && isChecking) {
    return <LoadingPage />;
  }

  // Wenn Zugriffsprüfung fehlgeschlagen, zeige Fehler
  if (needsAccessCheck && !hasAccess) {
    return (
      <>
        <NavBar>
          {message.text && (
            <Notification
              type={message.type}
              message={message.text}
              onClose={() => {
                setMessage({ type: "", text: "" });
              }}
            />
          )}
        </NavBar>
        <NavBarBot />
      </>
    );
  }

  return children;
}

export default ProtectedRoute;