import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/components/context/AuthContext';
import { ApiProtectionProvider } from './components/context/ApiProtectionContext';
import HomeDark from './components/pages/basis/HomeDark';
import LoginDark from './components/pages/user/LoginDark';
import RegisterDark from './components/pages/user/RegisterDark';
import Trainingsergebnisse from './components/pages/training/Trainingsergebnisse';
import GruppenUebersicht from './components/pages/user/GruppenUebersicht';
import GruppenDetail from './components/pages/user/GruppenDetail';
import Einladungen from './components/pages/features/Einladungen';
import GruppenKalender from './components/pages/user/Gruppenkalender';
import FeedbackForm from './components/pages/features/FeedbackForm';
import FeedbackUebersicht from './components/pages/features/FeedbackUebersicht';
import CustomTrainingsplanManager from './components/pages/training/CustomTrainingsplan';
import Profil from './components/pages/user/Profil';
import TrainingDetail from './components/pages/training/TrainingDetail';
import LandingPage from './components/pages/basis/LandingPage';
import ForgotPassword from './components/pages/features/ForgotPassword';
import ResetPassword from './components/pages/features/ResetPassword';
import Test from './components/pages/basis/Test';
import Historie from './components/pages/training/Historie';
import AdminPanel from './components/pages/admin/AdminPanel';
import updateService from './services/updateService';
import { Box, Typography, Button } from '@mui/material';
import GewichtTrackingPage from './components/pages/features/GewichtTrackingPage';
import { DrawerProvider } from './components/context/DrawerContext';
import AllHighscores from './components/pages/features/AllHighscores';
import OneRepMaxCalc from './components/pages/features/OneRepMaxCalc';
import Kommentare from './components/shared/Kommentare';
import {
  ProtectedGroupRoute,
  ProtectedUserRoute,
  ProtectedTrainingRoute,
  ProtectedKommentarRoute
} from './components/auth/ProtectedRouteWrappers';
import UserUebung from './components/pages/user/UserUebung';

function App() {

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  // Update-Check beim App-Start und regelmäßig
  useEffect(() => {
    // Starte Auto-Update-Check (alle 5 Minuten)
    updateService.startAutoCheck(30, (result) => {
      console.log('[App] Update verfügbar:', result);
      setUpdateInfo(result);
      setUpdateAvailable(true);
    });

    // Cleanup beim Unmount
    return () => {
      updateService.stopAutoCheck();
    };
  }, []);

  return (
    <>
      {/* Update Modal */}
      {updateAvailable && updateInfo && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.75)',
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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Gradient Accent */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: updateInfo.forceUpdate
                  ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
                  : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              }}
            />

            {/* Icon */}
            <Box
              sx={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: updateInfo.forceUpdate
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                border: updateInfo.forceUpdate
                  ? '1px solid rgba(245, 158, 11, 0.2)'
                  : '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <Typography variant="h3" sx={{ fontSize: '32px' }}>
                {updateInfo.forceUpdate ? '⚠️' : '🎉'}
              </Typography>
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                color: '#e0f2fe',
                fontWeight: 700,
                mb: 1.5,
                fontSize: '1.5rem'
              }}
            >
              {updateInfo.forceUpdate ? 'Wichtiges Update' : 'Update verfügbar'}
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                color: '#94a3b8',
                mb: 1,
                lineHeight: 1.6
              }}
            >
              {updateInfo.forceUpdate
                ? 'Ein wichtiges Update ist verfügbar und muss installiert werden.'
                : 'Eine neue Version der App ist verfügbar und bringt Verbesserungen und neue Funktionen.'}
            </Typography>

            {/* Version Info */}
            <Box
              sx={{
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '16px',
                p: 2,
                mb: 3,
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <Typography variant="caption" sx={{ color: '#93c5fd', display: 'block', mb: 0.5 }}>
                Neue Version
              </Typography>
              <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>
                v{updateInfo.newVersion}
              </Typography>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="contained"
                onClick={() => updateService.forceAppUpdate()}
                fullWidth
                sx={{
                  background: updateInfo.forceUpdate
                    ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  py: 1.5,
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: updateInfo.forceUpdate
                    ? '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
                    : '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                  '&:hover': {
                    background: updateInfo.forceUpdate
                      ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    boxShadow: updateInfo.forceUpdate
                      ? '0 15px 30px -5px rgba(245, 158, 11, 0.5)'
                      : '0 15px 30px -5px rgba(59, 130, 246, 0.5)',
                  }
                }}
              >
                Jetzt aktualisieren
              </Button>

              {!updateInfo.forceUpdate && (
                <Button
                  variant="text"
                  onClick={() => {
                    setUpdateAvailable(false);
                    setUpdateInfo(null);
                  }}
                  fullWidth
                  sx={{
                    color: '#64748b',
                    py: 1,
                    borderRadius: '16px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      bgcolor: 'rgba(100, 116, 139, 0.1)',
                      color: '#94a3b8'
                    }
                  }}
                >
                  Später erinnern
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}

      < AuthProvider >
        <ApiProtectionProvider defaultDelay={500}>
          <DrawerProvider>
            <BrowserRouter>
              <Routes>
                <Route path='/test' element={<Test />} />
                <Route path='/' element={<LandingPage />} />
                <Route path='/login' element={<LoginDark />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/register' element={<RegisterDark />} />
                <Route path='/dashboard' element={<HomeDark />} />
                <Route path='/addTraining' element={<ProtectedUserRoute><Trainingsergebnisse /></ProtectedUserRoute>} />
                <Route path='/customTraining' element={<ProtectedUserRoute><CustomTrainingsplanManager /></ProtectedUserRoute>} />
                <Route path='/gruppen' element={<GruppenUebersicht />} />
                <Route path='/gruppen/:gruppeId' element={<ProtectedGroupRoute><GruppenDetail /></ProtectedGroupRoute>} />
                <Route path='/einladungen' element={<Einladungen />} />
                <Route path='/gruppen/:gruppeId/kalender' element={<ProtectedGroupRoute><GruppenKalender /></ProtectedGroupRoute>} />
                <Route path='/chat/:id' element={<ProtectedKommentarRoute><Kommentare /></ProtectedKommentarRoute>} />
                <Route path='/feedback' element={<FeedbackForm />} />
                <Route path='/feedback-ubersicht' element={<FeedbackUebersicht />} />
                <Route path='/profil/' element={<Profil />} />
                <Route path='/trainingdetails/:id' element={<ProtectedTrainingRoute><TrainingDetail /></ProtectedTrainingRoute>} />
                <Route path='/historie/:id' element={<ProtectedUserRoute><Historie /></ProtectedUserRoute>} />
                <Route path='/admin' element={<AdminPanel />} />
                <Route path='/tracker' element={<GewichtTrackingPage />} />
                <Route path='/allHighscores/:gruppeId' element={<ProtectedGroupRoute><AllHighscores /></ProtectedGroupRoute>} />
                <Route path='/user/uebung-erstellen' element={<ProtectedUserRoute><UserUebung /></ProtectedUserRoute>} />
                <Route path='/maxRepCalc' element={<ProtectedUserRoute><OneRepMaxCalc /></ProtectedUserRoute>} />
              </Routes>
            </BrowserRouter>
          </DrawerProvider>
        </ApiProtectionProvider>
      </AuthProvider >
    </>
  );
}

export default App;