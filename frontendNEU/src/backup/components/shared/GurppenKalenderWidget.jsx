import { useState, useEffect, useRef } from 'react';
import {
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
  ThemeProvider,
  Avatar,
  AvatarGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Badge,
  Grid,
  Chip,
} from '@mui/material';
import Notification from '../util/notifications/Notification';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/AuthContext';
import { GruppenApi } from '../../services/api';
import { darkTheme } from '../../theme/darkTheme';
import { useApiProtectionContext } from '../context/ApiProtectionContext';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { Navigate, useNavigate } from 'react-router-dom';
import TerminDetailDialog from '../util/Dialogs/TerminDetailDialog';

dayjs.locale('de');

// Custom Day Component mit Badges
function ServerDay(props) {
  const { day, outsideCurrentMonth, termine = [], ...other } = props;
  const dateStr = day.format('YYYY-MM-DD');
  const termineForDay = termine.filter((t) => t.datum.startsWith(dateStr));

  // Prüfe ob Tag in der Vergangenheit liegt
  const today = dayjs().startOf('day');
  const isDisabled = day.isBefore(today);

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={termineForDay.length > 0 && !isDisabled ? termineForDay.length : undefined}
      sx={{ '& .MuiBadge-badge': { bgcolor: '#3b82f6', color: '#fff' } }}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        disabled={isDisabled}
        sx={{
          bgcolor: termineForDay.length > 0 && !isDisabled ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
          fontWeight: termineForDay.length > 0 && !isDisabled ? 700 : 400,
          color: '#e0f2fe',
          ...(isDisabled && {
            opacity: 0.5,
            cursor: 'not-allowed',
          }),
        }}
      />
    </Badge>
  );
}

function GymKalenderWidget({ gruppeId, showAddButton = true, showTerminList = true, compact = false }) {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const { protect } = useApiProtectionContext();
  const { nutzer } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [termine, setTermine] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTermin, setSelectedTermin] = useState(null);
  const [editTermin, setEditTermin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    datum: '',
    startzeit: '',
    notiz: '',
  });

  const [dateFormat, setDateFormat] = useState('DD. MMMM YYYY');
  const headerRef = useRef(null);

  useEffect(() => {
    if (message.type === "success") {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.type]);

  useEffect(() => {
    if (message.type === "error") {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message.type]);

  // visibleMonth is the month/year currently shown in the calendar view.
  const [visibleMonth, setVisibleMonth] = useState(selectedDate.startOf('month'));

  useEffect(() => {
    if (gruppeId) {
      fetchTermine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gruppeId, visibleMonth]);

  useEffect(() => {
    const checkOverflow = () => {
      if (headerRef.current) {
        const { scrollWidth, clientWidth } = headerRef.current;
        setDateFormat(scrollWidth > clientWidth ? 'DD.MM.YYYY' : 'DD. MMMM YYYY');
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [selectedDate]);

  // Helper-Funktion erweitern
  const getTeilnahmeStatus = (termin) => {
    const teilnehmer = termin.teilnehmer.find(t => t.id === nutzer.id);
    return teilnehmer?.status || null; // 'zusage', 'absage', oder null
  };

  const fetchTermine = async (monatParam, jahrParam) => {
    if (!gruppeId) return;
    try {
      // if month/year provided, use them (useful after creating a termin), otherwise use visibleMonth
      const mon = monatParam != null ? monatParam : visibleMonth.month() + 1;
      const jahr = jahrParam != null ? jahrParam : visibleMonth.year();
      // pad month to two digits to be safe for API
      const monat = String(mon).padStart(2, '0');
      const response = await GruppenApi.getGymTermine(gruppeId, { monat, jahr: String(jahr) });
      setTermine(response.data);
    } catch (err) {
      console.error('Fehler beim Laden der Termine:', err);
      setMessage({ type: "error", text: 'Termine konnten nicht geladen werden' });
    }
  };

  const getTermineForSelectedDate = () => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    return termine.filter((t) => t.datum.startsWith(dateStr));
  };

  const isDateInPast = (date) => {
    const today = dayjs().startOf('day');
    return date.isBefore(today);
  };

  const handleNewTermin = () => {
    if (isDateInPast(selectedDate)) {
      setMessage({ type: "error", text: 'Termine können nicht in der Vergangenheit erstellt werden' });
      return;
    }
    setFormData({
      datum: selectedDate.format('YYYY-MM-DD'),
      startzeit: '09:00',
      notiz: '',
    });
    setEditTermin(null);
    setDialogOpen(true);
  };

  const handleEditTermin = (termin) => {
    if (isDateInPast(dayjs(termin.datum))) {
      setMessage({ type: "error", text: 'Termine in der Vergangenheit können nicht bearbeitet werden' });
      return;
    }
    setEditTermin(termin);
    setFormData({
      datum: termin.datum.split('T')[0],
      startzeit: termin.startzeit.substring(0, 5),
      notiz: termin.notiz || '',
    });
    setDialogOpen(true);
  };

  const handleSaveTermin = async () => {
    const selectedDateTime = dayjs(formData.datum);
    if (isDateInPast(selectedDateTime)) {
      setMessage({ type: "error", text: 'Termine können nicht in der Vergangenheit erstellt werden' });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const datumMitZeit = `${formData.datum}T12:00:00`;
      if (editTermin) {
        await protect('update-gym-termin', async () => {
          await GruppenApi.updateGymTermin(editTermin.id, {
            ...formData,
            datum: datumMitZeit,
            nutzer_id: nutzer.id,
          });
          setMessage({ type: "success", text: 'Termin aktualisiert' });
        });
      } else {
        await protect('create-gym-termin', async () => {
          await GruppenApi.createGymTermin({
            nutzer_id: nutzer.id,
            gruppe_id: parseInt(gruppeId),
            ...formData,
            datum: datumMitZeit,
          });
          setMessage({ type: "success", text: 'Termin erstellt' });
        });
      }
      setDialogOpen(false);
      // ensure the calendar shows the month of the newly created/edited termin
      const newDate = dayjs(formData.datum);
      setSelectedDate(newDate);
      setVisibleMonth(newDate.startOf('month'));
      // fetch the month where the new termin lives so it appears immediately
      await fetchTermine(newDate.month() + 1, newDate.year());
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      setMessage({ type: "error", text: 'Termin konnte nicht gespeichert werden' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTermin = async (terminId) => {
    if (!window.confirm('Termin wirklich löschen?')) return;
    try {
      await protect('delete-gym-termin', async () => {
        await GruppenApi.deleteGymTermin(terminId, { nutzer_id: nutzer.id });
        setMessage({ type: "success", text: 'Termin gelöscht' });
        setDetailDialogOpen(false);
        fetchTermine();
      });
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      setMessage({ type: "error", text: 'Termin konnte nicht gelöscht werden' });
    }
  };

  const handleTerminClick = (termin) => {
    setSelectedTermin(termin);
    setDetailDialogOpen(true);
  };

  const nimmtTeil = (termin) => {
    return termin.teilnehmer.some((t) => t.id === nutzer.id);
  };

  const handleTeilnahmeStatus = async (terminId, status) => {
    // Optimistisches Update für sofortiges UI-Feedback
    const oldTermine = [...termine];
    const oldSelected = { ...selectedTermin };

    // UI sofort aktualisieren
    const updatedTermine = termine.map(t => {
      if (t.id === terminId) {
        const existingTeilnehmer = t.teilnehmer.find(tn => tn.id === nutzer.id);
        if (existingTeilnehmer) {
          return {
            ...t,
            teilnehmer: t.teilnehmer.map(tn =>
              tn.id === nutzer.id ? { ...tn, status } : tn
            )
          };
        } else {
          return {
            ...t,
            teilnehmer: [...t.teilnehmer, {
              id: nutzer.id,
              name: `${nutzer.vname} ${nutzer.nname}`,
              status
            }]
          };
        }
      }
      return t;
    });

    setTermine(updatedTermine);
    const updatedSelected = updatedTermine.find(t => t.id === terminId);
    if (updatedSelected) setSelectedTermin(updatedSelected);

    try {
      await protect('set-teilnahme-status', async () => {
        await GruppenApi.setTeilnahmeStatus({
          terminId,
          nutzerId: nutzer.id,
          status
        });
        setMessage({ type: "success", text: status === 'zusage' ? 'Erfolgreich zugesagt' : 'Erfolgreich abgesagt' });
        // Finale Daten vom Server laden
        await fetchTermine();
      });
    } catch (err) {
      // Bei Fehler: Rollback zum alten Zustand
      setTermine(oldTermine);
      setSelectedTermin(oldSelected);
      console.error('Fehler beim Setzen des Status:', err);
      setMessage({ type: "error", text: 'Status konnte nicht aktualisiert werden' });
    }
  };

  const handleRemoveTeilnahme = async (terminId) => {
    const oldTermine = [...termine];
    const oldSelected = { ...selectedTermin };

    // Optimistisches Update
    const updatedTermine = termine.map(t => {
      if (t.id === terminId) {
        return {
          ...t,
          teilnehmer: t.teilnehmer.filter(tn => tn.id !== nutzer.id)
        };
      }
      return t;
    });

    setTermine(updatedTermine);
    const updatedSelected = updatedTermine.find(t => t.id === terminId);
    if (updatedSelected) setSelectedTermin(updatedSelected);

    try {
      await protect('remove-teilnahme', async () => {
        await GruppenApi.removeTeilnahme({
          terminId,
          nutzerId: nutzer.id
        });
        setMessage({ type: "success", text: 'Teilnahme zurückgezogen' });
        await fetchTermine();
      });
    } catch (err) {
      setTermine(oldTermine);
      setSelectedTermin(oldSelected);
      console.error('Fehler beim Entfernen:', err);
      setMessage({ type: "error", text: 'Teilnahme konnte nicht entfernt werden' });
    }
  };

  const termineForSelectedDate = getTermineForSelectedDate();
  const isSelectedDateInPast = isDateInPast(selectedDate);

  if (!gruppeId) {
    return (
      <Card
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1f2937',
          borderRadius: '16px',
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body1" color="#93c5fd" align="center">
            Keine Favoriten-Gruppe ausgewählt
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ width: '100%', height: '100%' }}>
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

        <Grid container spacing={2} sx={{ width: '100%' }}>
          {/* Kalender */}
          <Grid
            sx={{
              display: 'flex',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <Card
              sx={{
                width: '100%',
                backgroundColor: '#1f2937',
                borderRadius: '16px',
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
                  <DateCalendar
                    value={selectedDate}
                    // allow selecting past dates for viewing; creation/editing of past Termine is still blocked elsewhere
                    onChange={(newDate) => {
                      setSelectedDate(newDate);
                      // ensure we fetch for the month of the selected date (handles clicks on days from adjacent months)
                      setVisibleMonth(newDate.startOf('month'));
                    }}
                    // when the month displayed in the calendar changes, update visibleMonth so we fetch for that month
                    onMonthChange={(newMonth) => {
                      setVisibleMonth(newMonth.startOf('month'));
                    }}
                    slots={{ day: ServerDay }}
                    slotProps={{ day: { termine } }}
                    sx={{
                      width: '100%',
                      maxWidth: 'none',
                      color: '#e0f2fe',
                      '& .MuiPickersCalendarHeader-root': {
                        paddingLeft: 2,
                        paddingRight: 2,
                        color: '#e0f2fe',
                      },
                      '& .MuiDayCalendar-header': {
                        justifyContent: 'space-around',
                        paddingLeft: 2,
                        paddingRight: 2,
                        color: '#93c5fd',
                      },
                      '& .MuiDayCalendar-weekContainer': {
                        justifyContent: 'space-around',
                        margin: 0,
                      },
                      '& .MuiPickersDay-root': {
                        fontSize: compact ? '0.875rem' : '1rem',
                        width: compact ? 40 : 48,
                        height: compact ? 40 : 48,
                        color: '#e0f2fe',
                      },
                    }}
                  />
                </LocalizationProvider>
              </CardContent>
            </Card>
          </Grid>

          {/* Termine für ausgewählten Tag */}
          {showTerminList && (
            <Grid
              sx={{
                display: 'flex',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Card
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#1f2937',
                  borderRadius: '16px',
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box
                    ref={headerRef}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    sx={{ overflow: 'hidden' }}
                  >
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        minWidth: 0,
                        flexShrink: 1,
                        color: '#e0f2fe',
                      }}
                    >
                      {selectedDate.format(dateFormat)}
                    </Typography>
                    {showAddButton && !isSelectedDateInPast && (
                      <Chip
                        label="+"
                        onClick={handleNewTermin}
                        size="small"
                        sx={{
                          minWidth: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                          color: '#fff',
                          flexShrink: 0,
                          ml: 1,
                          cursor: 'pointer',
                        }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ mb: 2, borderColor: 'rgba(59, 130, 246, 0.2)' }} />

                  {isSelectedDateInPast && (
                    <Box sx={{ mb: 2, p: 1.5, borderRadius: '16px', bgcolor: 'rgba(59,130,246,0.04)' }}>
                      <Typography variant="body2" color="#93c5fd">
                        Termine in der Vergangenheit können nicht erstellt werden
                      </Typography>
                    </Box>
                  )}

                  {termineForSelectedDate.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="#93c5fd">
                        Keine Termine an diesem Tag
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {termineForSelectedDate
                        .sort((a, b) => a.startzeit.localeCompare(b.startzeit))
                        .map((termin) => (
                          <Paper
                            key={termin.id}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: nimmtTeil(termin) ? '#8b5cf6' : '#1e3a8a',
                              bgcolor: nimmtTeil(termin) ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '16px',
                            }}
                            onClick={() => handleTerminClick(termin)}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="h6" color="#3b82f6">
                                {termin.startzeit.substring(0, 5)} Uhr
                              </Typography>
                              {nimmtTeil(termin) && (
                                <CheckCircleIcon sx={{ color: '#8b5cf6' }} />
                              )}
                            </Box>
                            <Typography variant="body2" color="#93c5fd" gutterBottom>
                              {termin.ersteller_vname} {termin.ersteller_nname}
                            </Typography>
                            {termin.notiz && (
                              <Typography variant="body2" color="#93c5fd" sx={{ mb: 1 }}>
                                {termin.notiz}
                              </Typography>
                            )}
                            {termin.teilnehmer.length > 0 && (
                              <Box display="flex" alignItems="center" gap={1} mt={2}>
                                <Typography variant="caption" color="#93c5fd">
                                  Teilnehmer:
                                </Typography>
                                <AvatarGroup
                                  max={4}
                                  sx={{
                                    '& .MuiAvatar-root': {
                                      width: 28,
                                      height: 28,
                                      fontSize: '0.75rem',
                                      bgcolor: '#1e3a8a',
                                      color: '#e0f2fe',
                                    },
                                  }}
                                >
                                  {termin.teilnehmer.some(t => t.status !== "absage") ? (
                                    termin.teilnehmer.map((t) => (
                                      t.status !== "absage" && (
                                        < Avatar key={t.id} > {t.name.charAt(0)}</Avatar>
                                      )
                                    ))
                                  ) : (
                                    <Typography variant="caption" color="#93c5fd">
                                      Noch keine Zusagen
                                    </Typography>
                                  )}
                                </AvatarGroup>
                              </Box>
                            )}
                          </Paper>
                        ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Termin erstellen/bearbeiten Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#1f2937', color: '#e0f2fe' }}>
            {editTermin ? 'Termin bearbeiten' : 'Neuer Gym-Termin'}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#1f2937' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Datum"
                type="date"
                value={formData.datum}
                onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true, sx: { color: '#93c5fd' } }}
                inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
                sx={{ input: { color: '#e0f2fe' }, '& .MuiOutlinedInput-root': { borderColor: '#1e3a8a' } }}
                required
              />
              <TextField
                label="Startzeit"
                type="time"
                value={formData.startzeit}
                onChange={(e) => setFormData({ ...formData, startzeit: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true, sx: { color: '#93c5fd' } }}
                sx={{ input: { color: '#e0f2fe' }, '& .MuiOutlinedInput-root': { borderColor: '#1e3a8a' } }}
                required
              />
              <TextField
                label="Notiz (optional)"
                value={formData.notiz}
                onChange={(e) => setFormData({ ...formData, notiz: e.target.value })}
                fullWidth
                multiline
                rows={3}
                InputLabelProps={{ sx: { color: '#93c5fd' } }}
                sx={{ textarea: { color: '#e0f2fe' }, '& .MuiOutlinedInput-root': { borderColor: '#1e3a8a' } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#1f2937' }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{ color: '#93c5fd' }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSaveTermin}
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#fff',
                borderRadius: '16px',
              }}
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Termin-Detail Dialog */}
        <TerminDetailDialog
          detailDialogOpen={detailDialogOpen}
          setDetailDialogOpen={setDetailDialogOpen}
          selectedTermin={selectedTermin}
          handleTeilnahmeStatus={handleTeilnahmeStatus}
          getTeilnahmeStatus={getTeilnahmeStatus}
          handleDeleteTermin={handleDeleteTermin}
          handleRemoveTeilnahme={handleRemoveTeilnahme}
          handleEditTermin={handleEditTermin}
          nutzer={nutzer}
          isDateInPast={isDateInPast}
        />

      </Box>
    </ThemeProvider >
  );
}

export default GymKalenderWidget;