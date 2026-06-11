import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import NavBar from '../../layout/NavBar';
import { darkTheme } from '../../../theme/darkTheme';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

const OfflinePage = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(false);

  // Überwache Online/Offline-Status
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Offline] Verbindung wiederhergestellt');
      setIsOnline(true);
      // Automatisch zur vorherigen Seite zurück
      setTimeout(() => {
        window.history.back();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('[Offline] Verbindung verloren');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleRetry = async () => {
    setChecking(true);
    
    try {
      // Versuche eine einfache Anfrage zu machen
      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      if (response.ok) {
        setIsOnline(true);
        // Gehe zur vorherigen Seite zurück
        setTimeout(() => {
          window.history.back();
        }, 500);
      }
    } catch (error) {
      console.log('[Offline] Immer noch offline:', error);
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <NavBar />
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            py: 4,
          }}
        >
          <Card
            sx={{
              width: '100%',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
            }}
          >
            <CardContent
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <WifiOffIcon
                  sx={{
                    fontSize: 48,
                    color: '#ef4444',
                  }}
                />
              </Box>

              {/* Titel */}
              <Typography
                variant="h4"
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {isOnline ? 'Verbindung wiederhergestellt!' : 'Keine Internetverbindung'}
              </Typography>

              {/* Beschreibung */}
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 4,
                  maxWidth: 400,
                }}
              >
                {isOnline
                  ? 'Deine Internetverbindung ist wieder da. Du wirst gleich weitergeleitet...'
                  : 'Bitte überprüfe deine Internetverbindung und versuche es erneut. Einige Inhalte sind möglicherweise trotzdem verfügbar.'}
              </Typography>

              {/* Status-Indikator */}
              {isOnline ? (
                <CircularProgress
                  size={32}
                  sx={{
                    color: '#34d399',
                    mb: 2,
                  }}
                />
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={checking ? <CircularProgress size={20} /> : <RefreshIcon />}
                  onClick={handleRetry}
                  disabled={checking}
                  sx={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: '16px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                    },
                  }}
                >
                  {checking ? 'Prüfe Verbindung...' : 'Erneut versuchen'}
                </Button>
              )}

              {/* Zusätzliche Info */}
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  mt: 3,
                }}
              >
                Diese Seite wurde aus dem Cache geladen
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default OfflinePage;