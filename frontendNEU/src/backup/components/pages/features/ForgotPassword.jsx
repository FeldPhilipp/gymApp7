import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  ThemeProvider,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../layout/NavBar';
import { UserApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import Notification from '../../util/notifications/Notification';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: "error", text: 'Bitte E-Mail eingeben' });
      return;
    }

    setLoading(true);

    try {
      await UserApi.forgotPassword(email);
      setMessage({ type: "success", text: "Hat geklappt" });
      setEmail('');
    } catch (err) {
      if (err.response?.data?.error) {
        setMessage({ type: "error", text: err.response?.data?.error });
      } else {
        setMessage({ type: "error", text: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <NavBar />
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 64px)',
              py: 3,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, sm: 4 },
                width: '100%',
                maxWidth: 450,
              }}
            >
              <Box display="flex" justifyContent="center" mb={3}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
              </Box>

              <Typography variant="h5" align="center" gutterBottom fontWeight={700}>
                Passwort zurücksetzen
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                Gib deine E-Mail ein und wir senden dir einen Reset-Link
              </Typography>

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

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="E-Mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                  disabled={loading}
                  autoComplete="email"
                  inputProps={{ maxLength: 50 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, mt: 1 }}
                >
                  {loading ? 'Wird versendet...' : 'Reset-Link versendet'}
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  fullWidth
                  disabled={loading}
                >
                  Zurück zum Login
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default ForgotPassword;