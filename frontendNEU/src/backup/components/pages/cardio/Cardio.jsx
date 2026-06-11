import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    ThemeProvider,
    Card,
    CardContent,
    Collapse,
    useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import NavBar from '../../layout/NavBar';
import NavBarBot from '../../layout/NavBarBot';
import BackButton from '../../util/buttons/BackButton';
import HeaderCard from '../../layout/HeaderCard';
import LoadingPage from '../../layout/LoadingPage';
import Notification from '../../util/notifications/Notification';
import { useAuth } from '../../context/AuthContext';
import { darkTheme } from '../../../theme/darkTheme';
import { CardioApi } from '../../../services/api';

// ─── Konstanten ──────────────────────────────────────────────────────────────
const CARDIO_TYPEN = [
    { value: 'laufen', label: 'Laufen', emoji: '🏃' },
    { value: 'radfahren', label: 'Radfahren', emoji: '🚴' },
    { value: 'schwimmen', label: 'Schwimmen', emoji: '🏊' },
    { value: 'rudern', label: 'Rudern', emoji: '🚣' },
    { value: 'seilspringen', label: 'Seilspringen', emoji: '🪢' },
    { value: 'ellipse', label: 'Ellipse', emoji: '🔄' },
    { value: 'stepper', label: 'Stepper', emoji: '🪜' },
    { value: 'sonstiges', label: 'Sonstiges', emoji: '⚡' },
];

const INTENSITAETEN = [
    { value: 'leicht', label: 'Leicht', color: '#4ade80' },
    { value: 'moderat', label: 'Moderat', color: '#facc15' },
    { value: 'intensiv', label: 'Intensiv', color: '#fb923c' },
    { value: 'maximal', label: 'Maximal', color: '#f87171' },
];

const TYPEN_MIT_DISTANZ = ['laufen', 'radfahren', 'schwimmen', 'rudern'];

const leereForm = {
    datum: new Date().toISOString().split('T')[0],
    cardio_typ: '',
    dauer_minuten: '',
    distanz_km: '',
    durchschnitts_bpm: '',
    max_bpm: '',
    kalorien: '',
    intensitaet: '',
    notizen: '',
};

// ─── Gradient-Button sx (identisch zu Trainingsergebnisse) ───────────────────
const btnSx = {
    padding: { xs: '10px 16px', sm: '14px 28px' },
    fontSize: { xs: '0.85rem', sm: '1rem' },
    fontWeight: 600,
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff',
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
    },
    '&:disabled': { opacity: 0.5 },
};

// ─── SessionKarte ─────────────────────────────────────────────────────────────
function SessionKarte({ session, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const typInfo = CARDIO_TYPEN.find(t => t.value === session.cardio_typ);
    const intensitaetInfo = INTENSITAETEN.find(i => i.value === session.intensitaet);

    const formatDatum = (d) =>
        d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

    return (
        <Card sx={{
            mb: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
        }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={expanded ? 2 : 0}>
                    <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                        <Typography sx={{ fontSize: '1.6rem', lineHeight: 1 }}>
                            {typInfo?.emoji || '⚡'}
                        </Typography>
                        <Box>
                            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 700 }}>
                                {typInfo?.label || session.cardio_typ}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {formatDatum(session.datum)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Schnell-Stats immer sichtbar */}
                    <Box display="flex" gap={1} alignItems="center" sx={{ flexWrap: 'wrap', justifyContent: 'flex-end', mr: 1 }}>
                        <Chip
                            icon={<DirectionsRunIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label={`${session.dauer_minuten} min`}
                            size="small"
                            variant="outlined"
                            color="primary"
                        />
                        {session.durchschnitts_bpm && (
                            <Chip
                                icon={<FavoriteIcon sx={{ fontSize: '0.85rem !important' }} />}
                                label={`${session.durchschnitts_bpm} bpm`}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#f87171', color: '#f87171' }}
                            />
                        )}
                        {session.kalorien && (
                            <Chip
                                icon={<LocalFireDepartmentIcon sx={{ fontSize: '0.85rem !important' }} />}
                                label={`${session.kalorien} kcal`}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#fb923c', color: '#fb923c' }}
                            />
                        )}
                        {intensitaetInfo && (
                            <Chip
                                label={intensitaetInfo.label}
                                size="small"
                                sx={{
                                    borderColor: intensitaetInfo.color,
                                    color: intensitaetInfo.color,
                                    border: '1px solid',
                                    bgcolor: 'transparent',
                                    fontWeight: 600,
                                }}
                            />
                        )}
                    </Box>

                    <Box display="flex" gap={0.5} sx={{ flexShrink: 0 }}>
                        {!confirmDelete ? (
                            <IconButton onClick={() => setConfirmDelete(true)} size="small" color="error">
                                <DeleteIcon />
                            </IconButton>
                        ) : (
                            <Box display="flex" gap={0.5}>
                                <IconButton onClick={() => setConfirmDelete(false)} size="small" color="inherit">
                                    <CloseIcon />
                                </IconButton>
                                <IconButton onClick={() => { setConfirmDelete(false); onDelete(); }} size="small" color="error">
                                    <CheckIcon />
                                </IconButton>
                            </Box>
                        )}
                        <IconButton onClick={onEdit} size="small" color="warning"><EditIcon /></IconButton>
                        <IconButton onClick={() => setExpanded(e => !e)} size="small">
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                </Box>

                <Collapse in={expanded}>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        {session.distanz_km && (
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">Distanz</Typography>
                                <Typography variant="body1" fontWeight={600}>{session.distanz_km} km</Typography>
                            </Grid>
                        )}
                        {session.durchschnitts_bpm && (
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">Ø Herzfrequenz</Typography>
                                <Typography variant="body1" fontWeight={600}>{session.durchschnitts_bpm} bpm</Typography>
                            </Grid>
                        )}
                        {session.max_bpm && (
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">Max. HF</Typography>
                                <Typography variant="body1" fontWeight={600}>{session.max_bpm} bpm</Typography>
                            </Grid>
                        )}
                        {session.kalorien && (
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">Kalorien</Typography>
                                <Typography variant="body1" fontWeight={600}>{session.kalorien} kcal</Typography>
                            </Grid>
                        )}
                        {session.notizen && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Notizen</Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                    {session.notizen}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Collapse>
            </CardContent>
        </Card>
    );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────
function Cardio() {
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
    const { nutzer } = useAuth();

    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [editSession, setEditSession] = useState(null); // null = neue Session
    const [form, setForm] = useState(leereForm);

    // ── Daten laden ──
    const laden = useCallback(async () => {
        setLoading(true);
        try {
            const [sessionsRes, statsRes] = await Promise.all([
                CardioApi.getSessions(),
                CardioApi.getStats(),
            ]);
            setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
            setStats(statsRes.data);
        } catch {
            setMessage({ type: 'error', text: 'Daten konnten nicht geladen werden.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { laden(); }, [laden]);

    // ── Dialog öffnen ──
    const handleNeu = () => {
        setForm(leereForm);
        setEditSession(null);
        setDialogOpen(true);
    };

    const handleBearbeiten = (session) => {
        setForm({
            datum: session.datum?.split('T')[0] || session.datum,
            cardio_typ: session.cardio_typ || '',
            dauer_minuten: session.dauer_minuten ?? '',
            distanz_km: session.distanz_km ?? '',
            durchschnitts_bpm: session.durchschnitts_bpm ?? '',
            max_bpm: session.max_bpm ?? '',
            kalorien: session.kalorien ?? '',
            intensitaet: session.intensitaet ?? '',
            notizen: session.notizen ?? '',
        });
        setEditSession(session);
        setDialogOpen(true);
    };

    // ── Speichern ──
    const handleSaveConfirm = () => setSaveConfirmOpen(true);

    const handleSave = async () => {
        setSaveConfirmOpen(false);
        if (!form.cardio_typ || !form.dauer_minuten || !form.datum) {
            setMessage({ type: 'error', text: 'Datum, Typ und Dauer sind Pflichtfelder.' });
            return;
        }
        setLoading(true);
        try {
            if (editSession) {
                await CardioApi.updateSession(editSession.id, form);
                setMessage({ type: 'success', text: 'Session aktualisiert.' });
            } else {
                await CardioApi.createSession(form);
                setMessage({ type: 'success', text: 'Cardio-Session gespeichert!' });
            }
            setDialogOpen(false);
            await laden();
        } catch (e) {
            setMessage({ type: 'error', text: e?.response?.data?.error || 'Fehler beim Speichern.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Löschen ──
    const handleLoeschen = async (id) => {
        try {
            await CardioApi.deleteSession(id);
            setMessage({ type: 'success', text: 'Session gelöscht.' });
            await laden();
        } catch {
            setMessage({ type: 'error', text: 'Löschen fehlgeschlagen.' });
        }
    };

    const hatDistanz = TYPEN_MIT_DISTANZ.includes(form.cardio_typ);
    const formValid = !!form.cardio_typ && !!form.dauer_minuten && !!form.datum;

    if (loading && sessions.length === 0) return <LoadingPage />;

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: '44px' }}>
                        {!isMobile && <BackButton />}
                        <HeaderCard title="Cardio erfassen" />

                        {/* ── Notification ── */}
                        {(message.type === 'error' || message.type === 'success') && (
                            <Notification
                                type={message.type}
                                message={message.text}
                                onClose={() => setMessage({ type: '', text: '' })}
                            />
                        )}

                        {/* ── Stats-Karten ── */}
                        {stats?.gesamt && (
                            <Card sx={{
                                mb: 2,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                            }}>
                                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                                    <Typography variant="subtitle2" color="text.secondary" mb={2} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                                        Gesamt
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {[
                                            { label: 'Sessions', wert: stats.gesamt.anzahl_sessions ?? '—', einheit: '' },
                                            { label: 'Minuten', wert: stats.gesamt.gesamt_minuten ?? '—', einheit: '' },
                                            { label: 'Kilometer', wert: stats.gesamt.gesamt_km ?? '—', einheit: ' km' },
                                            { label: 'Kalorien', wert: stats.gesamt.gesamt_kalorien ?? '—', einheit: ' kcal' },
                                        ].map(({ label, wert, einheit }) => (
                                            <Grid size={{ xs: 6, sm: 3 }} key={label}>
                                                <Box textAlign="center">
                                                    <Typography sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' }, fontWeight: 700, lineHeight: 1, color: '#3b82f6' }}>
                                                        {wert}{einheit}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                        {label}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        {/* ── Aktions-Button (Desktop) ── */}
                        {!isMobile && (
                            <Grid container sx={{ pb: '15px' }}>
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        onClick={handleNeu}
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        startIcon={<AddIcon />}
                                        sx={btnSx}
                                    >
                                        Neue Cardio-Session
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {/* ── Session-Liste ── */}
                        {sessions.length === 0 && !loading ? (
                            <Card sx={{ borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🏃</Typography>
                                    <Typography variant="h6" color="text.secondary" mb={2}>
                                        Noch keine Cardio-Sessions
                                    </Typography>
                                    <Button onClick={handleNeu} variant="contained" sx={btnSx} startIcon={<AddIcon />}>
                                        Erste Session eintragen
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            sessions.map(session => (
                                <SessionKarte
                                    key={session.id}
                                    session={session}
                                    onEdit={() => handleBearbeiten(session)}
                                    onDelete={() => handleLoeschen(session.id)}
                                />
                            ))
                        )}
                    </Container>

                    {/* ── Formular-Dialog ── */}
                    <Dialog
                        open={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                        fullScreen={isMobile}
                    >
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            {editSession ? 'Session bearbeiten' : 'Neue Cardio-Session'}
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

                                {/* Datum + Dauer */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Datum *"
                                            type="date"
                                            fullWidth
                                            value={form.datum}
                                            onChange={e => setForm({ ...form, datum: e.target.value })}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Dauer (Minuten) *"
                                            type="number"
                                            fullWidth
                                            value={form.dauer_minuten}
                                            onChange={e => setForm({ ...form, dauer_minuten: e.target.value })}
                                            slotProps={{ htmlInput: { min: 1, max: 600 } }}
                                            placeholder="z.B. 45"
                                        />
                                    </Grid>
                                </Grid>

                                {/* Cardio-Typ */}
                                <Box>
                                    <Typography variant="body2" color="text.secondary" mb={1} sx={{ fontWeight: 500 }}>
                                        Cardio-Typ *
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {CARDIO_TYPEN.map(typ => (
                                            <Chip
                                                key={typ.value}
                                                label={`${typ.emoji} ${typ.label}`}
                                                onClick={() => setForm({ ...form, cardio_typ: typ.value, distanz_km: '' })}
                                                variant={form.cardio_typ === typ.value ? 'filled' : 'outlined'}
                                                color={form.cardio_typ === typ.value ? 'primary' : 'default'}
                                                sx={{ cursor: 'pointer', fontWeight: form.cardio_typ === typ.value ? 700 : 400 }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                {/* Intensität */}
                                <Box>
                                    <Typography variant="body2" color="text.secondary" mb={1} sx={{ fontWeight: 500 }}>
                                        Intensität
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {INTENSITAETEN.map(i => (
                                            <Chip
                                                key={i.value}
                                                label={i.label}
                                                onClick={() => setForm({ ...form, intensitaet: form.intensitaet === i.value ? '' : i.value })}
                                                variant={form.intensitaet === i.value ? 'filled' : 'outlined'}
                                                sx={{
                                                    cursor: 'pointer',
                                                    borderColor: i.color,
                                                    color: form.intensitaet === i.value ? '#fff' : i.color,
                                                    bgcolor: form.intensitaet === i.value ? i.color : 'transparent',
                                                    fontWeight: form.intensitaet === i.value ? 700 : 400,
                                                    '&:hover': { bgcolor: `${i.color}22` },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <Divider />

                                {/* Messwerte */}
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', mt: -1 }}>
                                    Messwerte (optional)
                                </Typography>
                                <Grid container spacing={2}>
                                    {hatDistanz && (
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                label="Distanz (km)"
                                                type="number"
                                                fullWidth
                                                value={form.distanz_km}
                                                onChange={e => setForm({ ...form, distanz_km: e.target.value })}
                                                slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                                                placeholder="z.B. 5.30"
                                            />
                                        </Grid>
                                    )}
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Ø Herzfrequenz (bpm)"
                                            type="number"
                                            fullWidth
                                            value={form.durchschnitts_bpm}
                                            onChange={e => setForm({ ...form, durchschnitts_bpm: e.target.value })}
                                            slotProps={{ htmlInput: { min: 40, max: 250 } }}
                                            placeholder="z.B. 145"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Max. HF (bpm)"
                                            type="number"
                                            fullWidth
                                            value={form.max_bpm}
                                            onChange={e => setForm({ ...form, max_bpm: e.target.value })}
                                            slotProps={{ htmlInput: { min: 40, max: 250 } }}
                                            placeholder="z.B. 178"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Kalorien (kcal)"
                                            type="number"
                                            fullWidth
                                            value={form.kalorien}
                                            onChange={e => setForm({ ...form, kalorien: e.target.value })}
                                            slotProps={{ htmlInput: { min: 0 } }}
                                            placeholder="z.B. 320"
                                        />
                                    </Grid>
                                </Grid>

                                {/* Notizen */}
                                <TextField
                                    label="Notizen"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={form.notizen}
                                    onChange={e => setForm({ ...form, notizen: e.target.value })}
                                    placeholder="Wie hat sich die Session angefühlt?"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                            <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: '12px' }}>
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleSaveConfirm}
                                variant="contained"
                                disabled={!formValid || loading}
                                sx={{ ...btnSx, padding: '10px 24px' }}
                            >
                                {editSession ? 'Aktualisieren' : 'Speichern'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* ── Bestätigungs-Dialog ── */}
                    <Dialog open={saveConfirmOpen} onClose={() => setSaveConfirmOpen(false)}>
                        <DialogTitle>Session speichern?</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Möchtest du die Cardio-Session wirklich speichern?
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSaveConfirmOpen(false)}>Abbrechen</Button>
                            <Button
                                onClick={handleSave}
                                variant="contained"
                                sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                            >
                                Speichern
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </ThemeProvider>

            {/* ── Mobile Bottom Bar ── */}
            <NavBarBot
                mainBtnF={handleNeu}
                mainBtnTxt={<AddIcon />}
                mainBtnDisabled={false}
            />
        </>
    );
}

export default Cardio;