import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

import { AuthProvider } from './components/context/AuthContext';
import { ApiProtectionProvider } from './components/context/ApiProtectionContext';
import { DrawerProvider } from './components/context/DrawerContext';

import NavBar from './components/layout/NavBar';
import updateService from './services/updateService';

// Pages
import HomeDark from './components/pages/basis/HomeDark';
import LandingPage from './components/pages/basis/LandingPage';
import Test from './components/pages/basis/Test';

import LoginDark from './components/pages/user/LoginDark';
import RegisterDark from './components/pages/user/RegisterDark';
import GruppenUebersicht from './components/pages/user/GruppenUebersicht';
import GruppenDetail from './components/pages/user/GruppenDetail';
import GruppenKalender from './components/pages/user/Gruppenkalender';
import Profil from './components/pages/user/Profil';
import PremiumAcc from './components/pages/user/PremiumAcc';
import UserUebung from './components/pages/user/UserUebung';

import Trainingsergebnisse from './components/pages/training/Trainingsergebnisse';
import CustomTrainingsplanManager from './components/pages/training/CustomTrainingsplan';
import TrainingDetail from './components/pages/training/TrainingDetail';
import Historie from './components/pages/training/Historie';

import Einladungen from './components/pages/features/Einladungen';
import FeedbackForm from './components/pages/features/FeedbackForm';
import FeedbackUebersicht from './components/pages/features/FeedbackUebersicht';
import ForgotPassword from './components/pages/features/ForgotPassword';
import ResetPassword from './components/pages/features/ResetPassword';
import GewichtTrackingPage from './components/pages/features/GewichtTrackingPage';
import AllHighscores from './components/pages/features/AllHighscores';
import OneRepMaxCalc from './components/pages/features/OneRepMaxCalc';
import Highscores from './components/pages/features/Highscores';

import AdminPanel from './components/pages/admin/AdminPanel';
import Cardio from './components/pages/cardio/Cardio';

import Kommentare from './components/shared/Kommentare';

import {
  ProtectedGroupRoute,
  ProtectedUserRoute,
  ProtectedTrainingRoute,
  ProtectedKommentarRoute,
} from './components/auth/ProtectedRouteWrappers';

// ──────────────────────────────────────────────
// Update-Modal (unverändert aus Original)
// ──────────────────────────────────────────────
function UpdateModal({ updateInfo, onDismiss }) {
  if (!updateInfo) return null;
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: '#1e293b',
          borderRadius: '16px',
          maxWidth: '440px',
          width: '100%',
          p: 4,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '1px solid rgba(148,163,184,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: updateInfo.forceUpdate
              ? 'linear-gradient(90deg,#f59e0b 0%,#ef4444 100%)'
              : 'linear-gradient(90deg,#3b82f6 0%,#8b5cf6 100%)',
          }}
        />

        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            background: updateInfo.forceUpdate
              ? 'linear-gradient(135deg,rgba(245,158,11,.15) 0%,rgba(239,68,68,.15) 100%)'
              : 'linear-gradient(135deg,rgba(59,130,246,.15) 0%,rgba(139,92,246,.15) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            border: updateInfo.forceUpdate
              ? '1px solid rgba(245,158,11,.2)'
              : '1px solid rgba(59,130,246,.2)',
          }}
        >
          <Typography variant="h3" sx={{ fontSize: '32px' }}>
            {updateInfo.forceUpdate ? '⚠️' : '🎉'}
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ color: '#e0f2fe', fontWeight: 700, mb: 1.5 }}>
          {updateInfo.forceUpdate ? 'Wichtiges Update' : 'Update verfügbar'}
        </Typography>

        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 1, lineHeight: 1.6 }}>
          {updateInfo.forceUpdate
            ? 'Ein wichtiges Update ist verfügbar und muss installiert werden.'
            : 'Eine neue Version der App ist verfügbar und bringt Verbesserungen und neue Funktionen.'}
        </Typography>

        <Box
          sx={{
            bgcolor: 'rgba(59,130,246,.1)',
            borderRadius: '16px',
            p: 2,
            mb: 3,
            border: '1px solid rgba(59,130,246,.2)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#93c5fd', display: 'block', mb: 0.5 }}>
            Neue Version
          </Typography>
          <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>
            v{updateInfo.newVersion}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            variant="contained"
            onClick={() => updateService.forceAppUpdate()}
            fullWidth
            sx={{
              background: updateInfo.forceUpdate
                ? 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)'
                : 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)',
              color: 'white',
              py: 1.5,
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Jetzt aktualisieren
          </Button>

          {!updateInfo.forceUpdate && (
            <Button
              variant="text"
              onClick={onDismiss}
              fullWidth
              sx={{
                color: '#64748b',
                py: 1,
                borderRadius: '16px',
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': { bgcolor: 'rgba(100,116,139,.1)', color: '#94a3b8' },
              }}
            >
              Später erinnern
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ──────────────────────────────────────────────
// App
// ──────────────────────────────────────────────
function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    updateService.startAutoCheck(30, (result) => {
      setUpdateInfo(result);
      setUpdateAvailable(true);
    });
    return () => updateService.stopAutoCheck();
  }, []);

  return (
    <>
      {updateAvailable && (
        <UpdateModal
          updateInfo={updateInfo}
          onDismiss={() => {
            setUpdateAvailable(false);
            setUpdateInfo(null);
          }}
        />
      )}

      <AuthProvider>
        <ApiProtectionProvider defaultDelay={500}>
          <DrawerProvider>
            <BrowserRouter>
              {/*
               * NavBar wird EINMAL hier eingebunden und umschließt alle Routen.
               * Einzelne Seiten müssen <NavBar /> nicht mehr selbst importieren.
               */}
              <NavBar />

              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginDark />} />
                <Route path="/register" element={<RegisterDark />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<HomeDark />} />

                {/* Training */}
                <Route
                  path="/addTraining"
                  element={<ProtectedUserRoute><Trainingsergebnisse /></ProtectedUserRoute>}
                />
                <Route
                  path="/customTraining"
                  element={<ProtectedUserRoute><CustomTrainingsplanManager /></ProtectedUserRoute>}
                />
                <Route
                  path="/trainingdetails/:id"
                  element={<ProtectedTrainingRoute><TrainingDetail /></ProtectedTrainingRoute>}
                />
                <Route
                  path="/historie/:id"
                  element={<ProtectedUserRoute><Historie /></ProtectedUserRoute>}
                />

                {/* Gruppen */}
                <Route path="/gruppen" element={<GruppenUebersicht />} />
                <Route
                  path="/gruppen/:gruppeId"
                  element={<ProtectedGroupRoute><GruppenDetail /></ProtectedGroupRoute>}
                />
                <Route
                  path="/gruppen/:gruppeId/kalender"
                  element={<ProtectedGroupRoute><GruppenKalender /></ProtectedGroupRoute>}
                />
                <Route path="/einladungen" element={<Einladungen />} />

                {/* Features */}
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/feedback-ubersicht" element={<FeedbackUebersicht />} />
                <Route path="/tracker" element={<GewichtTrackingPage />} />
                <Route
                  path="/allHighscores/:gruppeId"
                  element={<ProtectedGroupRoute><AllHighscores /></ProtectedGroupRoute>}
                />
                <Route
                  path="/maxRepCalc"
                  element={<ProtectedUserRoute><OneRepMaxCalc /></ProtectedUserRoute>}
                />
                <Route
                  path="/cardio"
                  element={<ProtectedUserRoute><Cardio /></ProtectedUserRoute>}
                />

                {/* User */}
                <Route path="/profil/" element={<Profil />} />
                <Route
                  path="/user/uebung-erstellen"
                  element={<ProtectedUserRoute><UserUebung /></ProtectedUserRoute>}
                />
                <Route path="/test" element={<PremiumAcc />} />

                {/* Chat */}
                <Route
                  path="/chat/:id"
                  element={<ProtectedKommentarRoute><Kommentare /></ProtectedKommentarRoute>}
                />

                {/* Admin */}
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </BrowserRouter>
          </DrawerProvider>
        </ApiProtectionProvider>
      </AuthProvider>
    </>
  );
}

export default App;