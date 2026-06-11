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
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../layout/NavBar';
import { UserApi } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { darkTheme } from '../../../theme/darkTheme';
import { useApiProtectionContext } from '../../context/ApiProtectionContext';
import Notification from '../../util/notifications/Notification';

function LoginDark() {

  const { protect } = useApiProtectionContext();
  const [showNotification, setShowNotification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    // Warte bis loading fertig ist, dann check ob eingeloggt
    if (!authLoading && isLoggedIn) {
      console.log('User ist eingeloggt, redirect zu Dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Bitte E-Mail und Passwort eingeben' });
      return;
    }

    setLoading(true);

    try {
      await protect("user-login", async () => {
        const response = await UserApi.login({ email, pw: password });

        login(response.data.nutzer);
        navigate('/dashboard');
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setMessage({ type: 'error', text: err.response.data.error });
      } else {
        setMessage({ type: 'error', text: 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.' });
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
                Willkommen zurück
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                Melde dich an um fortzufahren
              </Typography>

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

              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                <TextField
                  label="Passwort"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                  disabled={loading}
                  autoComplete="current-password"
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
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, mt: 1 }}
                >
                  {loading ? 'Einloggen...' : 'Einloggen'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', mt: 1 }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/forgot-password')}
                    fullWidth
                    disabled={loading}
                    size="small"
                  >
                    Passwort vergessen?
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => navigate('/register')}
                    fullWidth
                    disabled={loading}
                    size="small"
                  >
                    Registrieren
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default LoginDark;