import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Paper,
  ThemeProvider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackIcon from '@mui/icons-material/Feedback';
import GroupIcon from '@mui/icons-material/Group';
import NavBar from '../../layout/NavBar';
import NavBarBot from '../../layout/NavBarBot';
import GewichtStatistik from '../../shared/GewichtStatistik';
import { TrainingApi, GruppenApi } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { darkTheme } from '../../../theme/darkTheme';
import { Navigate } from 'react-router-dom';
import GymKalenderWidget from '../../shared/GurppenKalenderWidget';
import LoadingNavBarBot from '../../layout/LoadingNavBarBot';
import Notification from '../../util/notifications/Notification';
import HeaderCard from '../../layout/HeaderCard';
import Highscores from '../features/Highscores';
import LoadingPage from '../../layout/LoadingPage';

function HomeDark() {
  const navigate = useNavigate();
  const { nutzer, isLoggedIn, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [favoritGruppe, setFavoritGruppe] = useState(null);
  const [ansicht, setAnsicht] = useState('gruppe');
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [einladungen, setEinladungen] = useState([]);
  const [gruppeId, setGruppeId] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isLoggedIn || !nutzer?.id) {
      setLoading(false);
      return;
    }
    fetchFavoritGruppe();
  }, [nutzer, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !nutzer?.id) {
      setLoading(false);
      return;
    }
    fetchStats();
    fetchEinladungen();
  }, [nutzer, isLoggedIn, ansicht, favoritGruppe]);

  useEffect(() => {
    setGruppeId(ansicht === 'gruppe' && favoritGruppe?.id ? favoritGruppe.id : null);
  }, [ansicht, favoritGruppe]);

  const fetchFavoritGruppe = async () => {
    setLoading(true);
    try {
      const response = await GruppenApi.getFavoritGruppe(nutzer.id);
      setFavoritGruppe(response.data || null);
      if (!response.data) {
        setAnsicht('persoenlich');
      }
    } catch (err) {
      console.error('Fehler beim Laden der Favoriten-Gruppe:', err);
      setMessage({ type: "error", text: 'Favoriten-Gruppe konnte nicht geladen werden' });

    } finally {
      setLoading(false);
    }
  };

  const fetchEinladungen = async () => {
    setLoading(true)
    try {
      const response = await GruppenApi.getEinladungen(nutzer.id);
      setEinladungen(response.data);
    } catch (err) {
      setMessage({ type: "error", text: 'Fehler beim abrufen der Einladungen' });

      console.error("Fetch Fehler Einladungen: ", err);
    } finally {
      setLoading(false);
    }
  }

  const fetchStats = async () => {
    setLoading(true);
    try {
      const gruppeId = ansicht === 'gruppe' && favoritGruppe?.id ? favoritGruppe.id : null;
      const response = await TrainingApi.getDashboardStats(nutzer.id, gruppeId ? { gruppeId } : {});

      const letzteTrainings = Array.isArray(response.data?.letzteTrainings)
        ? response.data.letzteTrainings.filter((t) => t && t.id)
        : [];

      const verbesserungen = Array.isArray(response.data?.verbesserungen)
        ? response.data.verbesserungen.filter((v) => v && v.uebung_name)
        : [];

      // Accept any truthy highscores items (server may omit `id`); keep entries for display
      const highscores = Array.isArray(response.data?.highscores)
        ? response.data.highscores.filter((h) => !!h)
        : [];

      setStats({ letzteTrainings, verbesserungen, highscores });
    } catch (err) {
      console.error('Fehler beim Laden der Statistiken:', err);
      setMessage({ type: "error", text: 'Statistiken konnten nicht geladen werden' });

    } finally {
      setLoading(false);
    }
  };

  const handleAnsichtChange = (event, newAnsicht) => {
    if (newAnsicht !== null) {
      setAnsicht(newAnsicht);
    }
  };

  const handleOpenTraining = () => {
    navigate("/addTraining");
  }

  const handleOpenFeedback = () => {
    navigate("/feedback");
  }

  if (authLoading) {
    return (
      <>
        <ThemeProvider theme={darkTheme}>
          <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <NavBar />
            <Container maxWidth="lg" sx={{ pt: 4 }}>
              <LinearProgress />
            </Container>
            <LoadingNavBarBot />
          </Box>
        </ThemeProvider>
      </>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  return (
    <>
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
          <NavBar />
          <Container
            maxWidth="lg"
            sx={{
              pt: { xs: 2, md: 4 },
              px: { xs: 1, sm: 2 },
              flexGrow: 1,
              pb: '64px',
            }}
          >
            {favoritGruppe && (
              <ToggleButtonGroup
                value={ansicht}
                exclusive
                onChange={handleAnsichtChange}
                size="small"
                sx={{
                  mb: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: '16px',
                  '& .MuiToggleButton-root': {
                    color: 'primary.main',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.dark',
                      color: '#fff',
                    },
                  },
                }}
              >
                <ToggleButton value="gruppe">
                  <GroupIcon sx={{ mr: 0.5 }} fontSize="small" />
                  <Typography variant="caption">Gruppe</Typography>
                </ToggleButton>
                <ToggleButton value="persoenlich">
                  <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                  <Typography variant="caption">Persönlich</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            <HeaderCard title={`Willkommen zurück, ${nutzer?.vname}`} />

            {message.status === "error" || message.status === "success" && (
              <Notification
                type={message.type}
                message={message.text}
                onClose={() => {
                  setShowNotification(true);
                  setMessage({ type: "", text: "" });
                }}
              />
            )}
            {einladungen.length > 0 && (
              <Card
                sx={{
                  mb: 2,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                  }
                }}
                onClick={() => navigate("/einladungen")}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#1e3a8a', mr: 2, width: 40, height: 40 }}>
                      <GroupIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>
                        Neue Einladungen
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#93c5fd' }}>
                        {einladungen.length} {einladungen.length === 1 ? 'Einladung' : 'Einladungen'} ausstehend
                      </Typography>
                    </Box>
                    <Chip
                      label={einladungen.length}
                      size="small"
                      sx={{
                        bgcolor: '#3b82f6',
                        color: '#fff',
                        fontWeight: 600,
                        minWidth: '32px',
                      }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2, borderColor: 'rgba(59, 130, 246, 0.2)' }} />

                  <List sx={{ p: 0 }}>
                    {einladungen.slice(0, 3).map((item, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          px: 0,
                          py: 1,
                          borderBottom: index < Math.min(2, einladungen.length - 1) ? '1px solid rgba(59, 130, 246, 0.1)' : 'none'
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="body2" sx={{ color: '#fff', mb: 0.5 }}>
                            <Box component="span" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                              {item.einlader_name}
                            </Box>
                            {' '}hat dich eingeladen zu {' '}
                            <Box component="span" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                              {item.gruppen_name}
                            </Box>
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  {einladungen.length > 3 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#93c5fd' }}>
                        +{einladungen.length - 3} weitere {einladungen.length - 3 === 1 ? 'Einladung' : 'Einladungen'}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      endIcon={<LaunchIcon />}
                      sx={{
                        color: '#3b82f6',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                        }
                      }}
                    >
                      Alle ansehen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
            {favoritGruppe && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: '100%',
                    minHeight: { xs: '200px', sm: '400px' },
                    borderRadius: '16px',
                    overflow: 'hidden',
                  }}
                >
                  <GymKalenderWidget
                    gruppeId={favoritGruppe.id}
                    showAddButton={true}
                    showTerminList={true}
                    compact={false}
                    sx={{ width: '100%', height: '100%' }}
                  />
                </Box>
              </Box>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {[
                {
                  title: 'Letzte Trainings',
                  icon: <CalendarTodayIcon fontSize="small" />,
                  color: '#1e3a8a',
                  hoverColor: '#3b82f6',
                  content: stats?.letzteTrainings?.length > 0 ? (
                    <>
                      <List dense sx={{ overflow: 'auto', flex: 1, width: '100%' }}>
                        {stats.letzteTrainings.slice(0, 3).map((training) =>
                          training && training.id ? (
                            <ListItem
                              key={training.id}
                              sx={{
                                px: 0,
                                py: 0.5,
                                width: '100%',
                                flex: '0 0 auto',
                              }}
                            >
                              <Box
                                sx={{
                                  width: '100%',
                                  p: 1,
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  borderRadius: '16px',
                                  display: "flex",
                                  justifyContent: "space-between"
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                      <Box>
                                        <Typography variant="body2" fontWeight={600} color="#fff">
                                          {training.trainingsplan_name || 'Unbekannt'}
                                        </Typography>
                                        {ansicht === 'gruppe' && (
                                          <Typography variant="caption" color="#93c5fd">
                                            {training.vname || ''} {training.nname || ''}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                  }
                                  secondary={
                                    <Typography variant="caption" color="#93c5fd">
                                      {training.datum
                                        ? new Date(training.datum).toLocaleDateString('de-DE', {
                                          weekday: 'short',
                                          day: '2-digit',
                                          month: 'short',
                                        })
                                        : 'Kein Datum'}
                                    </Typography>
                                  }
                                />
                                <LaunchIcon
                                  onClick={() => navigate(`/trainingdetails/${training.id}`)}
                                  sx={{ cursor: 'pointer', color: '#3b82f6' }}
                                />
                              </Box>
                            </ListItem>
                          ) : null
                        )}
                      </List>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 0.5,
                          width: '100%',
                          flex: '0 0 auto',
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            p: 1,
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '16px',
                            display: "flex",
                            justifyContent: "space-between"
                          }}
                        >
                          <ListItemText>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography
                                variant="body2" fontWeight={600} color="#fff"
                              >
                                Historie
                              </Typography>
                              <LaunchIcon
                                onClick={() => navigate(`/historie/${nutzer.id}`)}
                                sx={{ cursor: 'pointer', color: '#3b82f6' }}
                              />
                            </Box>
                          </ListItemText>
                        </Box>
                      </ListItem>
                    </>
                  ) : (
                    <Typography color="#93c5fd" align="center" variant="caption" sx={{ py: 2 }}>
                      Noch keine Trainings vorhanden
                    </Typography>
                  ),
                }, {
                  title: `Highscores ${ansicht === 'gruppe' ? '(Gruppe)' : ''}`,
                  icon: <EmojiEventsIcon fontSize="small" />,
                  color: '#1e3a8a',
                  hoverColor: '#3b82f6',
                  content: (
                    <Highscores highscores={stats?.highscores} ansicht={ansicht} nutzer={nutzer} navigate={navigate} gruppeId={gruppeId} />
                  ),
                },
              ].map((card, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Card
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#1f2937',
                      borderRadius: '16px',
                    }}
                  >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: { xs: 1.5, sm: 2 } }}>
                      <Box display="flex" alignItems="center" mb={1.5}>
                        <Avatar sx={{ bgcolor: card.color, mr: 1, width: 32, height: 32 }}>{card.icon}</Avatar>
                        <Typography variant="subtitle2" fontWeight={600} color={card.hoverColor === '#3b82f6' ? '#e0f2fe' : '#ecfdf5'}>
                          {card.title}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 1.5, borderColor: `rgba(${card.hoverColor.match(/\d+/g).join(', ')}, 0.2)` }} />
                      {card.content}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
      <NavBarBot mainBtnF={handleOpenTraining} mainBtnTxt={"Start"} sideBtn1Icon={<FeedbackIcon />} sideBtn1F={handleOpenFeedback} />
    </>
  );
}

export default HomeDark;