import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  ThemeProvider,
  Alert,
  Fab,
  LinearProgress,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DeleteIcon from '@mui/icons-material/Delete';
import NavBar from '../../layout/NavBar';
import { useAuth } from '../../context/AuthContext';
import { GruppenApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import { useNavigate, Navigate } from 'react-router-dom';
import NavBarBot from '../../layout/NavBarBot';
import Notification from '../../util/notifications/Notification';
import BackButton from '../../util/buttons/BackButton';
import HeaderCard from '../../layout/HeaderCard';

function GruppenUebersicht() {
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
  const { nutzer, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [gruppen, setGruppen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [neuGruppe, setNeuGruppe] = useState({ name: '', beschreibung: '' });

  useEffect(() => {
    if (!isLoggedIn || !nutzer?.id) {
      setLoading(false);
      return;
    }
    fetchGruppen();
  }, [nutzer, isLoggedIn]);

  const fetchGruppen = async () => {
    try {
      const response = await GruppenApi.getGruppenByNutzer(nutzer.id);
      const validGruppen = Array.isArray(response.data) ? response.data.filter((gruppe) => gruppe && gruppe.id) : [];
      setGruppen(validGruppen);
    } catch (err) {
      console.error('Fehler beim Laden der Gruppen:', err);
      setMessage({ type: 'error', text: 'Gruppen konnten nicht geladen werden' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGruppe = async () => {
    if (!neuGruppe.name.trim()) {
      setMessage({ type: 'error', text: 'Bitte Gruppennamen eingeben' });
      return;
    }

    try {
      await GruppenApi.createGruppe({
        name: neuGruppe.name,
        beschreibung: neuGruppe.beschreibung,
        ersteller_id: nutzer.id,
      });
      setMessage({ type: 'success', text: 'Gruppe erfolgreich erstellt' });
      setDialogOpen(false);
      setNeuGruppe({ name: '', beschreibung: '' });
      fetchGruppen();
    } catch (err) {
      console.error('Fehler beim Erstellen der Gruppe:', err);
      setMessage({ type: 'error', text: 'Gruppe konnte nicht erstellt werden' });
    }
  };

  const handleSetFavorit = async (gruppeId) => {
    try {
      await GruppenApi.setFavorit({
        gruppeId,
        nutzerId: nutzer.id,
      });
      setMessage({ type: 'success', text: 'Favorit gesetzt' });
      fetchGruppen();
    } catch (err) {
      console.error('Fehler beim Setzen des Favoriten:', err);
      setMessage({ type: 'error', text: 'Favorit konnte nicht gesetzt werden' });
    }
  };

  const handleLeaveGruppe = async (gruppeId, gruppeName) => {
    if (!window.confirm(`Möchtest du die Gruppe "${gruppeName}" wirklich verlassen?`)) {
      return;
    }

    try {
      await GruppenApi.leaveGruppe({
        gruppeId,
        nutzerId: nutzer.id,
      });
      setMessage({ type: 'success', text: 'Gruppe verlassen' });
      fetchGruppen();
    } catch (err) {
      console.error('Fehler beim Verlassen der Gruppe:', err);
      setMessage({ type: 'error', text: 'Gruppe konnte nicht verlassen werden' });
    }
  };

  const handleDeleteGruppe = async (gruppeId, gruppeName) => {
    if (!window.confirm(`Möchtest du die Gruppe "${gruppeName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      await GruppenApi.deleteGruppe({
        gruppeId,
        erstellerId: nutzer.id,
      });
      setMessage({ type: 'success', text: 'Gruppe gelöscht' });
      fetchGruppen();
    } catch (err) {
      console.error('Fehler beim Löschen der Gruppe:', err);
      setMessage({ type: 'error', text: 'Gruppe konnte nicht gelöscht werden' });
    }
  };

  // Warten bis Auth geladen ist
  if (authLoading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ pt: 4 }}>
            <LinearProgress />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // Wenn nicht eingeloggt, zur Login-Seite navigieren
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: "44px" }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
            {!isMobile && (
              <BackButton />
            )}
            <HeaderCard title={"Meine Gruppen"} subtitle={"Verwalte deine Traiingsgruppen"} />
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

            {loading ? (
              <LinearProgress />
            ) : gruppen.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Noch keine Gruppen
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Erstelle deine erste Gruppe oder warte auf eine Einladung
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                  >
                    Gruppe erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {gruppen.map((gruppe) =>
                  gruppe && gruppe.id ? (
                    <Grid key={gruppe.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          border: gruppe.ist_favorit ? '2px solid' : '1px solid',
                          borderColor: gruppe.ist_favorit ? 'primary.main' : 'divider',
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                            <Typography variant="h6" component="div" sx={{ pr: 1 }}>
                              {gruppe.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleSetFavorit(gruppe.id)}
                              sx={{ color: gruppe.ist_favorit ? 'primary.main' : 'text.secondary' }}
                            >
                              {gruppe.ist_favorit ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                          </Box>

                          {gruppe.beschreibung && (
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              {gruppe.beschreibung}
                            </Typography>
                          )}

                          <Box display="flex" gap={1} mb={2}>
                            <Chip
                              icon={<GroupIcon />}
                              label={`${gruppe.mitglieder_anzahl} Mitglieder`}
                              size="small"
                              variant="outlined"
                            />
                            {gruppe.ist_favorit && (
                              <Chip label="Favorit" size="small" color="primary" />
                            )}
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            Erstellt von {gruppe.ersteller_name}
                          </Typography>
                        </CardContent>

                        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate(`/gruppen/${gruppe.id}`)}
                          >
                            Öffnen
                          </Button>
                          {gruppe.ersteller_id === nutzer.id ? (
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteGruppe(gruppe.id, gruppe.name)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              color="warning"
                              onClick={() => handleLeaveGruppe(gruppe.id, gruppe.name)}
                            >
                              <ExitToAppIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ) : null
                )}
              </Grid>
            )}
          </Container>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Neue Gruppe erstellen</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="Gruppenname"
                  value={neuGruppe.name}
                  onChange={(e) => setNeuGruppe({ ...neuGruppe, name: e.target.value })}
                  fullWidth
                  required
                  autoFocus
                />
                <TextField
                  label="Beschreibung (optional)"
                  value={neuGruppe.beschreibung}
                  onChange={(e) => setNeuGruppe({ ...neuGruppe, beschreibung: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleCreateGruppe} variant="contained">
                Erstellen
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ThemeProvider>
      <NavBarBot mainBtnF={setDialogOpen} mainBtnTxt={<AddIcon />} />
    </>
  );
}

export default GruppenUebersicht;