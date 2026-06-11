import { ThemeProvider, Box, Container } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { useAuth } from '../../context/AuthContext';
import { darkTheme } from '../../../theme/darkTheme';

// Layout
import NavBarBot from '../../layout/NavBarBot';
import LoadingPage from '../../layout/LoadingPage';
import HeaderCard from '../../layout/HeaderCard';

// Shared
import ViewToggle from '../../shared/ViewToggle';
import EinladungenCard from '../../shared/EinladungenCard';
import GruppenKalenderSection from '../../shared/GruppenKalenderSection';
import DashboardCard from '../../shared/DashboardCard';
import LetzteTrainingsCard from '../../shared/LetzteTrainingsCard';
import Notification from '../../util/notifications/Notification';

// Features
import Highscores from '../features/Highscores';

// Hook
import useDashboard from '../../shared/hooks/useDashboard';

function HomeDark() {
  const navigate = useNavigate();
  const { nutzer, isLoggedIn, loading: authLoading } = useAuth();

  const {
    stats,
    favoritGruppe,
    einladungen,
    ansicht,
    handleAnsichtChange,
    gruppeId,
    loading,
    message,
    setMessage,
  } = useDashboard();

  if (authLoading || loading) return <LoadingPage />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: 4,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ pt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 }, flexGrow: 1, pb: '64px' }}
        >
          {/* Ansicht-Umschalter */}
          {favoritGruppe && (
            <ViewToggle ansicht={ansicht} onChange={handleAnsichtChange} />
          )}

          {/* Begrüßung */}
          <HeaderCard title={`Willkommen zurück, ${nutzer?.vname}`} />

          {/* Fehler-/Erfolgsbenachrichtigung */}
          {(message.type === 'error' || message.type === 'success') && (
            <Notification
              type={message.type}
              message={message.text}
              onClose={() => setMessage({ type: '', text: '' })}
            />
          )}

          {/* Einladungen */}
          <EinladungenCard einladungen={einladungen} />

          {/* Gruppenkalender */}
          {favoritGruppe && <GruppenKalenderSection gruppeId={favoritGruppe.id} />}

          {/* Dashboard-Karten */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <DashboardCard title="Letzte Trainings" icon={<CalendarTodayIcon fontSize="small" />}>
              <LetzteTrainingsCard
                trainings={stats?.letzteTrainings}
                ansicht={ansicht}
                nutzerId={nutzer?.id}
              />
            </DashboardCard>

            <DashboardCard
              title={`Highscores${ansicht === 'gruppe' ? ' (Gruppe)' : ''}`}
              icon={<EmojiEventsIcon fontSize="small" />}
            >
              <Highscores
                highscores={stats?.highscores}
                ansicht={ansicht}
                nutzer={nutzer}
                navigate={navigate}
                gruppeId={gruppeId}
              />
            </DashboardCard>
          </Box>
        </Container>
      </Box>

      <NavBarBot
        mainBtnF={() => navigate('/addTraining')}
        mainBtnTxt="Start"
        sideBtn1Icon={<FeedbackIcon />}
        sideBtn1F={() => navigate('/feedback')}
      />
    </ThemeProvider>
  );
}

export default HomeDark;