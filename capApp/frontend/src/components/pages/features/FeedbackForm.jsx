import { useState, useContext } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  ThemeProvider,
  useMediaQuery
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../../layout/NavBar';
import { useAuth } from '../../context/AuthContext';
import { FeedbackApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import { useNavigate } from 'react-router-dom';
import { useApiProtectionContext } from '../../context/ApiProtectionContext';
import BackButton from '../../util/buttons/BackButton';
import NavBarBot from '../../layout/NavBarBot';
import Notification from '../../util/notifications/Notification';
import HeaderCard from '../../layout/HeaderCard';

function FeedbackForm() {

  const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
  const [showNotification, setShowNotification] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const { nutzer } = useAuth();
  const { protect } = useApiProtectionContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    typ: 'fehler',
    titel: '',
    beschreibung: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await protect("send-feedback", async () => {

        await FeedbackApi.createFeedback({
          nutzer_id: nutzer.id,
          typ: formData.typ,
          titel: formData.titel,
          beschreibung: formData.beschreibung,
        });

        setMessage({ type: "success", text: 'Danke für dein Feedback! ✓' });
        setFormData({ typ: 'fehler', titel: '', beschreibung: '' });

        setTimeout(() => {
          setMessage({ type: "", text: "" });
          navigate('/dashboard');
        }, 2000);
      });
    } catch (error) {
      console.error('Fehler beim Speichern des Feedbacks:', error);
      setMessage({ type: "error", text: 'Fehler beim Speichern des Feedbacks' });
    }
  };

  const feedbackTypes = [
    { value: 'fehler', label: 'Fehler', icon: BugReportIcon },
    { value: 'verbesserung', label: 'Verbesserung', icon: TrendingUpIcon },
    { value: 'wunsch', label: 'Wunsch', icon: StarIcon },
  ];

  const CurrentIcon = feedbackTypes.find(f => f.value === formData.typ)?.icon;

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
          <NavBar />

          {!loading ? (
            <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 } }}>
              {!isMobile && (
                <BackButton />
              )}
              {/* Header */}
              <HeaderCard title={"Feedback geben"} icon={<CurrentIcon />} />

              {/* Form Card */}
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <form onSubmit={handleSubmit}>
                    {/* Feedback Typ */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel sx={{ color: 'text.secondary' }}>Feedback-Typ</InputLabel>
                      <Select
                        name="typ"
                        value={formData.typ}
                        onChange={handleChange}
                        label="Feedback-Typ"
                        sx={{
                          bgcolor: 'background.default',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                          },
                        }}
                      >
                        <MenuItem value="fehler">🐛 Fehler melden</MenuItem>
                        <MenuItem value="verbesserung">⚡ Verbesserung vorschlagen</MenuItem>
                        <MenuItem value="wunsch">⭐ Wunsch äußern</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Titel */}
                    <TextField
                      fullWidth
                      name="titel"
                      label="Titel"
                      placeholder="Kurze Zusammenfassung deines Feedbacks"
                      value={formData.titel}
                      onChange={handleChange}
                      required
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.default',
                        },
                      }}
                    />

                    {/* Beschreibung */}
                    <TextField
                      fullWidth
                      name="beschreibung"
                      label="Beschreibung"
                      placeholder="Beschreibe dein Feedback detailliert. Je mehr Details, desto besser können wir helfen..."
                      value={formData.beschreibung}
                      onChange={handleChange}
                      multiline
                      rows={6}
                      required
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.default',
                        },
                      }}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {loading ? 'Wird gespeichert...' : 'Feedback senden'}
                    </Button>

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
                  </form>
                </CardContent>
              </Card>

            </Container>
          ) : (
            <>
              {message.status === "error" || message.status === "success" && (
                <Notification
                  type={message.type}
                  message={message.text}
                  onClose={() => {
                    setShowNotification(false);
                    setMessage('');
                  }}
                />
              )}
              <CircularProgress sx={{ position: "absolute", top: "45%", left: "45%", display: 'block', mx: 'auto', mb: 2 }} />
            </>
          )}
        </Box>
      </ThemeProvider>
      <NavBarBot />
    </>
  );
}

export default FeedbackForm;