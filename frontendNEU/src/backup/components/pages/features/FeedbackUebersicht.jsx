import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Grid,
  ThemeProvider,
  Avatar,
  Divider,
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../../layout/NavBar';
import { FeedbackApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import { useNavigate } from 'react-router-dom';
import Notification from '../../util/notifications/Notification';

function FeedbackUebersicht() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filter, setFilter] = useState('alle');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const response = await FeedbackApi.getAllFeedback();
      setFeedback(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Fehler beim Laden des Feedbacks:', err);
      setMessage({ type: "error", text: 'Feedback konnte nicht geladen werden' });
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await FeedbackApi.updateFeedbackStatus(id, newStatus);
      setMessage({ type: "success", text: '404' });
      loadFeedback();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Status:', error);
      setMessage({ type: "error", text: 'Status konnte nicht aktualisiert werden' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Wirklich löschen?')) return;

    try {
      await FeedbackApi.deleteFeedback(id);
      setMessage({ type: "success", text: 'Feedback gelöscht' });

      loadFeedback();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setMessage({ type: "error", text: 'Feedback konnte nicht gelöscht werden' });
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    if (filter === 'alle') return true;
    return item.typ === filter;
  });

  const getTypeIcon = (typ) => {
    switch (typ) {
      case 'fehler':
        return <BugReportIcon />;
      case 'verbesserung':
        return <TrendingUpIcon />;
      case 'wunsch':
        return <StarIcon />;
      default:
        return null;
    }
  };

  const getTypeColor = (typ) => {
    switch (typ) {
      case 'fehler':
        return 'error';
      case 'verbesserung':
        return 'warning';
      case 'wunsch':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (typ) => {
    switch (typ) {
      case 'fehler':
        return 'Fehler';
      case 'verbesserung':
        return 'Verbesserung';
      case 'wunsch':
        return 'Wunsch';
      default:
        return typ;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'neu':
        return 'error';
      case 'in_bearbeitung':
        return 'warning';
      case 'erledigt':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'neu':
        return 'Neu';
      case 'in_bearbeitung':
        return 'In Bearbeitung';
      case 'erledigt':
        return 'Erledigt';
      default:
        return status;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
        <NavBar />

        <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 2 }}
            >
              Zurück
            </Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Feedback-Übersicht
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/feedback')}
              >
                Neues Feedback
              </Button>
            </Box>
          </Box>

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

          {/* Loading */}
          {loading ? (
            <CircularProgress sx={{ position: "absolute", top: "45%", left: "45%", display: 'block', mx: 'auto', mb: 2 }} />
          ) : (
            <>
              {/* Filter Buttons */}
              <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant={filter === 'alle' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('alle')}
                >
                  Alle ({feedback.length})
                </Button>
                <Button
                  variant={filter === 'fehler' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => setFilter('fehler')}
                  startIcon={<BugReportIcon />}
                >
                  Fehler ({feedback.filter((f) => f.typ === 'fehler').length})
                </Button>
                <Button
                  variant={filter === 'verbesserung' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => setFilter('verbesserung')}
                  startIcon={<TrendingUpIcon />}
                >
                  Verbesserungen ({feedback.filter((f) => f.typ === 'verbesserung').length})
                </Button>
                <Button
                  variant={filter === 'wunsch' ? 'contained' : 'outlined'}
                  color="info"
                  onClick={() => setFilter('wunsch')}
                  startIcon={<StarIcon />}
                >
                  Wünsche ({feedback.filter((f) => f.typ === 'wunsch').length})
                </Button>
              </Box>

              {/* Feedback List */}
              {filteredFeedback.length > 0 ? (
                <Grid container spacing={2}>
                  {filteredFeedback.map((item) => (
                    <Grid key={item.id}>
                      <Card
                        sx={{
                          borderLeft: 4,
                          borderColor: `${getTypeColor(item.typ)}.main`,
                          opacity: item.status === 'erledigt' ? 0.6 : 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: 3,
                          },
                        }}
                      >
                        <CardContent>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: `${getTypeColor(item.typ)}.main` }}>
                                {getTypeIcon(item.typ)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {item.titel}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Von: <strong>{item.vname} {item.nname}</strong>
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={getTypeLabel(item.typ)}
                              color={getTypeColor(item.typ)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Beschreibung */}
                          <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                            {item.beschreibung}
                          </Typography>

                          {/* Datum */}
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.erstellt_am).toLocaleDateString('de-DE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </CardContent>

                        {/* Actions */}
                        <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              sx={{
                                bgcolor: 'background.default',
                              }}
                            >
                              <MenuItem value="neu">Neu</MenuItem>
                              <MenuItem value="in_bearbeitung">In Bearbeitung</MenuItem>
                              <MenuItem value="erledigt">Erledigt</MenuItem>
                            </Select>
                          </FormControl>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={getStatusLabel(item.status)}
                              color={getStatusColor(item.status)}
                              size="small"
                            />
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(item.id)}
                            >
                              Löschen
                            </Button>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Kein Feedback gefunden
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/feedback')}>
                    Erstes Feedback erstellen
                  </Button>
                </Paper>
              )}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default FeedbackUebersicht;