import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Container,
  ThemeProvider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../../layout/NavBar';
import { UserApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import Notification from '../../util/notifications/Notification';

function ResetPassword() {
  const [showNotification, setShowNotification] = useState(false);
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage({ type: "error", text: 'Token nicht gefunden' });

    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: 'Bitte beide Passwortfelder ausfüllen' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: 'Passwort muss mindestens 6 Zeichen lang sein' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: 'Passwörter stimmen nicht überein' });
      return;
    }

    setLoading(true);

    try {
      await UserApi.resetPassword(token, newPassword);
      setMessage({ type: "success", text: 'Passwort erfolgreich zurückgesetzt! Du wirst zum Login weitergeleitet...' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.error) {
        setMessage({ type: "error", text: err.response.data.error });
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
                Neues Passwort setzen
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                Gib dein neues Passwort ein
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
                  label="Neues Passwort"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  InputProps={{
                    maxLength: 50,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Passwort bestätigen"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  InputProps={{
                    maxLength: 50,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, mt: 1 }}
                >
                  {loading ? 'Wird gespeichert...' : 'Passwort ändern'}
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

export default ResetPassword;