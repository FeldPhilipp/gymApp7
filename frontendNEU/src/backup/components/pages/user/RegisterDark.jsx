import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Container,
  ThemeProvider,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../layout/NavBar';
import { UserApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import { useApiProtectionContext } from '../../context/ApiProtectionContext';
import { useAuth } from '../../context/AuthContext';
import Notification from '../../util/notifications/Notification';

const steps = ['Account', 'Persönliche Daten', 'Körperdaten'];

function RegisterDark() {

  const [showNotification, setShowNotification] = useState(false);
  const { protect } = useApiProtectionContext();
  const { login } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    vname: '',
    nname: '',
    email: '',
    password: '',
    confirmPassword: '',
    geb_datum: '',
    geschlecht: 'm',
    gewicht: '',
    ziel_gewicht: '',
    groesse: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setMessage({ type: '', text: '' });

    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Bitte fülle alle Felder aus' });
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Passwort muss mindestens 6 Zeichen lang sein' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein' });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage({ type: 'error', text: 'Bitte gültige E-Mail-Adresse eingeben' });
        return;
      }
    }

    if (activeStep === 1 && (!formData.vname || !formData.nname)) {
      setMessage({ type: 'error', text: 'Bitte Vor- und Nachname eingeben' });
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setMessage({ type: '', text: '' });
  };

  const handleRegister = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await protect("user-register", async () => {
        // Registrierung
        await UserApi.createNewUser({
          vname: formData.vname,
          nname: formData.nname,
          email: formData.email,
          pw: formData.password,
          geb_datum: formData.geb_datum || null,
          geschlecht: formData.geschlecht,
          gewicht: formData.gewicht ? parseFloat(formData.gewicht) : null,
          ziel_gewicht: formData.ziel_gewicht ? parseFloat(formData.ziel_gewicht) : null,
          groesse: formData.groesse ? parseInt(formData.groesse) : null
        });

        // Automatisch einloggen nach erfolgreicher Registrierung
        const loginResponse = await UserApi.login({
          email: formData.email,
          pw: formData.password
        });

        // Token speichern
        localStorage.setItem('token', loginResponse.data.token);
        localStorage.setItem('user', JSON.stringify(loginResponse.data.nutzer));

        // User im Context setzen
        login(loginResponse.data.nutzer);

        // Zur Startseite weiterleiten
        navigate('/dashboard', {
          state: { message: 'Willkommen! Registrierung erfolgreich.' }
        });
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setMessage({ type: 'error', text: err.response.data.error });
      } else {
        setMessage({ type: 'error', text: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="E-Mail"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="email"
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="new-password"
              InputProps={{
                maxLength: 50,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Passwort bestätigen"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="new-password"
              inputProps={{ maxLength: 50 }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  label="Vorname"
                  name="vname"
                  value={formData.vname}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid>
                <TextField
                  label="Nachname"
                  name="nname"
                  value={formData.nname}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Geburtsdatum"
              type="date"
              name="geb_datum"
              value={formData.geb_datum}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Geschlecht</InputLabel>
              <Select
                name="geschlecht"
                value={formData.geschlecht}
                onChange={handleChange}
                label="Geschlecht"
              >
                <MenuItem value="m">Männlich</MenuItem>
                <MenuItem value="w">Weiblich</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Optional - kann später ergänzt werden
            </Typography>
            <Grid container spacing={2} sx={{ width: "100%" }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Gewicht (kg)"
                  type="number"
                  name="gewicht"
                  value={formData.gewicht}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 50, step: "0.1", min: 0, max: 500 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Zielgewicht (kg)"
                  type="number"
                  name="ziel_gewicht"
                  value={formData.ziel_gewicht}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 50, step: "0.1", min: 1, max: 500 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Größe (cm)"
                  type="number"
                  name="groesse"
                  value={formData.groesse}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, max: 250, maxLength: 50 }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <NavBar />
        <Container maxWidth="md">
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
            <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%' }}>
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
                  <PersonAddIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
              </Box>

              <Typography variant="h5" align="center" gutterBottom fontWeight={700}>
                Account erstellen
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" mb={4}>
                Schritt {activeStep + 1} von {steps.length}
              </Typography>

              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {message.status === "error" || message.status === "success" && (
                <Notification
                  type={message.type}
                  message={message.text}
                  onClose={() => {
                    setShowNotification(true);
                    setMessage("");
                  }}
                />
              )}


              {getStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Zurück
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    {loading ? 'Registriere...' : 'Registrieren'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Weiter
                  </Button>
                )}
              </Box>

              <Button
                variant="text"
                onClick={() => navigate('/login')}
                fullWidth
                sx={{ mt: 2 }}
              >
                Bereits registriert? Zum Login
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default RegisterDark;