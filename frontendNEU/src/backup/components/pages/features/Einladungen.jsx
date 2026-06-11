import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  ThemeProvider,
  List,
  ListItem,
  Chip,
  Divider,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NavBar from '../../layout/NavBar';
import { useAuth } from '../../context/AuthContext';
import { GruppenApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import NavBarBot from '../../layout/NavBarBot';
import HeaderCard from '../../layout/HeaderCard';
import Notification from '../../util/notifications/Notification';

function Einladungen() {
  const [showNotification, setShowNotification] = useState(false);
  const { nutzer } = useAuth();
  const [einladungen, setEinladungen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchEinladungen();
  }, [nutzer]);

  const fetchEinladungen = async () => {
    if (!nutzer?.id) return;

    try {
      const response = await GruppenApi.getEinladungen(nutzer.id);
      setEinladungen(response.data);
    } catch (err) {
      console.error('Fehler beim Laden der Einladungen:', err);
      setMessage({ type: "error", text: 'Einladungen konnten nicht geladen werden' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (einladungId) => {
    try {
      await GruppenApi.acceptEinladung({
        einladungId,
        nutzerId: nutzer.id
      });
      setMessage({ type: "success", text: 'Einladung angenommen' });

      fetchEinladungen();
    } catch (err) {
      console.error('Fehler beim Annehmen:', err);
      setMessage({ type: "error", text: 'Einladung konnte nicht angenommen werden' });
    }
  };

  const handleDecline = async (einladungId) => {
    try {
      await GruppenApi.declineEinladung({
        einladungId,
        nutzerId: nutzer.id
      });
      setMessage({ type: "error", text: 'Einladung abgelehnt' });

      fetchEinladungen();
    } catch (err) {
      console.error('Fehler beim Ablehnen:', err);
      setMessage({ type: "error", text: 'Einladung konnte nicht abgelehnt werden' });
    }
  };

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: "44px" }}>
          <NavBar />
          <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 } }}>

            <HeaderCard title={"Benachrichtigungen"} subtitle={"Verwalte deine offenen Benachrichtigungen"} />

            {message.status === "error" || message.status === "success" && (
              <Notification
                type={message.type}
                message={message.text}
                onClose={() => {
                  setShowNotification(true);
                  setMessage({type: "", text: ""});
                }}
              />
            )}

            {loading ? (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Lädt
              </Typography>
            ) : einladungen.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Keine offenen Einladungen
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Du hast aktuell keine ausstehenden Gruppeneinladungen
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <List>
                  {einladungen.map((einladung, index) => (
                    <Box key={einladung.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: 2,
                          py: 3,
                        }}
                      >
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <GroupIcon color="primary" />
                            <Typography variant="h6">
                              {einladung.gruppen_name}
                            </Typography>
                            <Chip
                              label={`${einladung.mitglieder_anzahl} Mitglieder`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          {einladung.gruppen_beschreibung && (
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              {einladung.gruppen_beschreibung}
                            </Typography>
                          )}

                          <Typography variant="body2" color="text.secondary">
                            Einladung von <strong>{einladung.einlader_name}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(einladung.erstellt_am).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>

                        <Box display="flex" gap={2}>
                          <Button
                            variant="contained"
                            startIcon={<CheckIcon />}
                            onClick={() => handleAccept(einladung.id)}
                            fullWidth
                          >
                            Annehmen
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleDecline(einladung.id)}
                            fullWidth
                          >
                            Ablehnen
                          </Button>
                        </Box>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Card>
            )}
          </Container>
        </Box>
      </ThemeProvider>
      <NavBarBot mainBtnF={null} />
    </>
  );
}

export default Einladungen;