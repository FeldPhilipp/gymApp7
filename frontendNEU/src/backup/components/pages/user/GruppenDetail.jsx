import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  ThemeProvider,
  Alert,
  Chip,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NavBar from '../../layout/NavBar';
import { useAuth } from '../../context/AuthContext';
import { GruppenApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import { useNavigate, useParams } from 'react-router-dom';
import { NotificationService } from '../../../services/notificationService';
import Notification from '../../util/notifications/Notification';
import BackButton from '../../util/buttons/BackButton';
import NavBarBot from '../../layout/NavBarBot';
import HeaderCard from '../../layout/HeaderCard';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function GruppenDetail() {
  const { nutzer } = useAuth();
  const navigate = useNavigate();
  const { gruppeId } = useParams();
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
  const [showNotification, setShowNotification] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [mitglieder, setMitglieder] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Einladungs-Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, [gruppeId]);

  const fetchData = async () => {
    try {
      const [mitgliederRes, statsRes] = await Promise.all([
        GruppenApi.getMitglieder(gruppeId),
        GruppenApi.getGruppenStats(gruppeId)
      ]);
      setMitglieder(mitgliederRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err);
      setMessage({ type: "error", text: "Daten konnten nicht geladen werden." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await GruppenApi.searchNutzer(searchQuery, gruppeId);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Fehler bei der Suche:', err);
      setMessage({ type: "error", text: "Suche fehlgeschlagen." });
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (empfaengerId) => {
    try {
      console.log(123)
      const response = await GruppenApi.createEinladung({
        gruppe_id: parseInt(gruppeId),
        einlader_id: nutzer.id,
        empfaenger_id: empfaengerId
      });
      console.log("Einladungsantwort:", response.data);
      setMessage({ type: "success", text: "Einladung erfolgreich versendet." });
      setSearchQuery('');
      setSearchResults([]);
      setDialogOpen(false);

    } catch (err) {
      console.error('Fehler beim Einladen:', err);
      setMessage({ type: "error", text: "Einladung konnte nicht versendet werden." });
    }
  };

  const handleRemoveMitglied = async (mitgliedId, mitgliedName) => {
    if (!window.confirm(`Möchtest du ${mitgliedName} wirklich aus der Gruppe entfernen?`)) {
      return;
    }

    try {
      await GruppenApi.removeMitglied({
        gruppeId: parseInt(gruppeId),
        mitgliedId,
        erstellerId: nutzer.id
      });
      setMessage({ type: "success", text: "Mitglied erfolgreich entfernt." });
      fetchData();
    } catch (err) {
      console.error('Fehler beim Entfernen:', err);
      setMessage({ type: "error", text: "Mitglied konnte nicht entfernt werden." });
    }
  };

  const openKalender = () => {
    navigate(`/gruppen/${gruppeId}/kalender`)
  };

  const ersteller = mitglieder.find(m => m.ist_ersteller);
  const isErsteller = ersteller?.id === nutzer.id;

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              {!isMobile && (
                <BackButton />
              )}
              <HeaderCard title={"Gruppendetails"} subtitle={`${mitglieder.length} Mitglied${mitglieder.length !== 1 ? 'er' : ''}`} />
            </Box>
            <Box sx={{ mb: 2 }}>
              {!isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={() => navigate(`/gruppen/${gruppeId}/kalender`)}
                >
                  Kalender
                </Button>
              )}
            </ Box>
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

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="Mitglieder" />
                <Tab label="Aktivität" />
                <Tab label="Statistiken" />
              </Tabs>
            </Box>

            {/* Tab: Mitglieder */}
            <TabPanel value={tabValue} index={0}>
              {isErsteller && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setDialogOpen(true)}
                  sx={{ mb: 2 }}
                >
                  Mitglied einladen
                </Button>
              )}
              <Card>
                <CardContent>
                  <List>
                    {mitglieder.map((mitglied, index) => (
                      <Box key={mitglied.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          secondaryAction={
                            isErsteller && !mitglied.ist_ersteller && (
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveMitglied(mitglied.id, `${mitglied.vname} ${mitglied.nname}`)}
                                color="error"
                              >
                                <PersonRemoveIcon />
                              </IconButton>
                            )
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {mitglied.vname.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1">
                                  {mitglied.vname} {mitglied.nname}
                                </Typography>
                                {mitglied.ist_ersteller && (
                                  <Chip icon={<StarIcon />} label="Ersteller" size="small" color="primary" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="span">
                                <Box component="span" display="block" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                  Beigetreten: {new Date(mitglied.beigetreten_am).toLocaleDateString('de-DE')}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab: Aktivität */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Trainingsaktivität (letzte 30 Tage)
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      {stats?.aktivitaet?.length > 0 ? (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Mitglied</TableCell>
                                <TableCell align="right">Trainings</TableCell>
                                <TableCell align="right">Trainingstage</TableCell>
                                <TableCell align="right">Gesamt Sätze</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {stats.aktivitaet.map((a) => (
                                <TableRow key={a.id}>
                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        {a.vname.charAt(0)}
                                      </Avatar>
                                      <Typography variant="body2">
                                        {a.vname} {a.nname}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip label={a.anzahl_trainings || 0} size="small" color="primary" />
                                  </TableCell>
                                  <TableCell align="right">{a.trainingstage || 0}</TableCell>
                                  <TableCell align="right">{a.gesamt_saetze || 0}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                          Noch keine Aktivitäten
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Beliebteste Übungen */}
                <Grid>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                          <FitnessCenterIcon />
                        </Avatar>
                        <Typography variant="h6">Beliebteste Übungen</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {stats?.beliebteUebungen?.length > 0 ? (
                        <Grid container spacing={2}>
                          {stats.beliebteUebungen.map((u, idx) => (
                            <Grid key={idx}>
                              <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                                <CardContent>
                                  <Typography variant="body1" fontWeight={600} gutterBottom>
                                    {u.uebung_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    {u.zielmuskel} • {u.kategorie}
                                  </Typography>
                                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                                    <Chip label={`${u.anzahl_nutzer} Nutzer`} size="small" variant="outlined" />
                                    <Chip label={`Ø ${parseFloat(u.durchschnitt_gewicht).toFixed(1)}kg`} size="small" color="primary" />
                                    <Chip label={`Max ${u.max_gewicht}kg`} size="small" color="secondary" />
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                          Noch keine Daten
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab: Statistiken */}
            <TabPanel value={tabValue} index={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <EmojiEventsIcon />
                    </Avatar>
                    <Typography variant="h6">Gruppen-Highscores</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {stats?.gruppenHighscores?.length > 0 ? (
                    <Grid container spacing={2}>
                      {stats.gruppenHighscores.map((h, idx) => (
                        <Grid key={idx}>
                          <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                            <CardContent>
                              <Typography variant="body1" fontWeight={600} noWrap>
                                {h.uebung_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {h.zielmuskel}
                              </Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                  {h.vname} {h.nname}
                                </Typography>
                                <Chip
                                  label={`${h.max_gewicht}kg`}
                                  color="secondary"
                                  size="small"
                                  sx={{ fontWeight: 700 }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                      Noch keine Highscores
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          </Container>

          {/* Dialog: Mitglied einladen */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Mitglied einladen</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Name oder E-Mail suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                >
                  <SearchIcon />
                </Button>
              </Box>

              {searchResults.length > 0 && (
                <List>
                  {searchResults.map((user) => (
                    <ListItem
                      key={user.id}
                      secondaryAction={
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleInvite(user.id)}
                        >
                          Einladen
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          {user.vname.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.vname} ${user.nname}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {searchQuery && searchResults.length === 0 && !searching && (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  Keine Nutzer gefunden
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Schließen</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ThemeProvider >
      <NavBarBot mainBtnF={openKalender} mainBtnTxt={<EventIcon />} />
    </>
  );
}

export default GruppenDetail;