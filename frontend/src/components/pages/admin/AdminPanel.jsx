import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
import { darkTheme } from "../../../theme/darkTheme";
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import {
    Box, Container, Button, Typography, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Card, CardContent,
    Grid, Tab, Tabs, Select, MenuItem, FormControl, InputLabel,
    IconButton, CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorageIcon from '@mui/icons-material/Storage';
import { AdminApi } from "../../../services/api";
import { useState, useCallback } from "react";
import Notification from "../../util/notifications/Notification";
import FeedbackIcon from '@mui/icons-material/Feedback';

// ─── Konstanten ───────────────────────────────────────────────────────────────

const ALLOWED_TABLES = [
    'nutzer', 'uebungen', 'nutzer_eigene_uebungen', 'trainings_ergebnisse'
];

const darkCard = {
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
};

const btnSx = {
    fontWeight: 600, borderRadius: '12px', textTransform: 'none',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff', transition: 'all 0.2s ease',
    '&:hover': { background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)', transform: 'translateY(-1px)' },
    '&:disabled': { opacity: 0.45 },
};

const inputSx = {
    '& .MuiOutlinedInput-root': {
        fontSize: '13px',
        background: '#1e293b',
        '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
        '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
        '&.Mui-focused fieldset': { borderColor: 'rgba(59,130,246,0.6)' },
    },
    '& .MuiInputLabel-root': { fontSize: '13px', color: '#64748b' },
    '& .MuiSelect-select': { fontSize: '13px' },
};

// ─── DB Explorer ──────────────────────────────────────────────────────────────

function DbExplorer() {
    const [table, setTable] = useState('');
    const [fields, setFields] = useState('');
    const [orderBy, setOrderBy] = useState('');
    const [orderDir, setOrderDir] = useState('ASC');
    const [limit, setLimit] = useState(50);
    const [filters, setFilters] = useState([]);
    const [dbCols, setDbCols] = useState([]);
    const [result, setResult] = useState(null);
    const [querying, setQuerying] = useState(false);
    const [error, setError] = useState('');

    const handleTableChange = async (val) => {
        setTable(val);
        setResult(null);
        setError('');
        setFilters([]);
        setDbCols([]);
        if (!val) return;
        try {
            const params = new URLSearchParams({ table: val, limit: 0 });
            const res = await AdminApi.getIndividual(params.toString());
            setDbCols(res.data.columns || []);
        } catch { }
    };

    const addFilter = () => setFilters(prev => [...prev, { col: '', val: '' }]);
    const updateFilter = (i, key, val) =>
        setFilters(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));
    const removeFilter = (i) => setFilters(prev => prev.filter((_, idx) => idx !== i));

    const runQuery = async () => {
        if (!table) return;
        setQuerying(true);
        setError('');
        setResult(null);
        try {
            const params = new URLSearchParams({ table, limit });
            if (fields.trim()) params.set('fields', fields.trim());
            if (orderBy.trim()) params.set('order_by', orderBy.trim());
            params.set('order_dir', orderDir);
            const validFilters = filters.filter(f => f.col && f.val);
            if (validFilters.length)
                params.set('filters', validFilters.map(f => `${f.col}:${f.val}`).join(','));
            const res = await AdminApi.getIndividual(params.toString());
            setResult(res.data);
        } catch (e) {
            setError(e.response?.data?.error || e.message);
        } finally {
            setQuerying(false);
        }
    };

    const resultCols = result?.rows?.length ? Object.keys(result.rows[0]) : [];

    return (
        <Box>
            {/* Tabelle + Limit */}
            <Grid container spacing={1.5} mb={1.5}>
                <Grid size={8}>
                    <FormControl fullWidth size="small" sx={inputSx}>
                        <InputLabel>Tabelle</InputLabel>
                        <Select value={table} onChange={e => handleTableChange(e.target.value)} label="Tabelle">
                            <MenuItem value=""><em>Wählen…</em></MenuItem>
                            {ALLOWED_TABLES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={4}>
                    <TextField
                        label="Limit" type="number" size="small" fullWidth
                        value={limit} onChange={e => setLimit(Math.min(500, Math.max(1, +e.target.value)))}
                        inputProps={{ min: 1, max: 500 }} sx={inputSx}
                    />
                </Grid>
            </Grid>

            {/* Felder */}
            <TextField
                label="Felder (leer = alle)" size="small" fullWidth
                value={fields} onChange={e => setFields(e.target.value)}
                placeholder="z.B. id, name, email" sx={{ ...inputSx, mb: 1.5 }}
            />

            {/* Sortierung */}
            <Grid container spacing={1.5} mb={1.5}>
                <Grid size={8}>
                    <TextField
                        label="Sortierung nach" size="small" fullWidth
                        value={orderBy} onChange={e => setOrderBy(e.target.value)}
                        placeholder="z.B. erstellt_am" sx={inputSx}
                    />
                </Grid>
                <Grid size={4}>
                    <FormControl fullWidth size="small" sx={inputSx}>
                        <InputLabel>Richtung</InputLabel>
                        <Select value={orderDir} onChange={e => setOrderDir(e.target.value)} label="Richtung">
                            <MenuItem value="ASC">ASC</MenuItem>
                            <MenuItem value="DESC">DESC</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Filter */}
            <Typography sx={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', mb: 0.75 }}>
                Filter
            </Typography>
            {filters.map((f, i) => (
                <Grid key={i} container spacing={1} mb={0.75} alignItems="center">
                    <Grid size={5}>
                        <FormControl size="small" fullWidth sx={inputSx}>
                            <InputLabel>Spalte</InputLabel>
                            <Select value={f.col} onChange={e => updateFilter(i, 'col', e.target.value)} label="Spalte">
                                <MenuItem value=""><em>Spalte…</em></MenuItem>
                                {dbCols.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            size="small" fullWidth placeholder="Wert" value={f.val}
                            onChange={e => updateFilter(i, 'val', e.target.value)}
                            sx={inputSx}
                        />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center">
                        <IconButton size="small" onClick={() => removeFilter(i)}
                            sx={{ color: '#ef4444', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: '8px', p: '5px' }}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button
                fullWidth size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                onClick={addFilter}
                sx={{ mb: 1.5, fontSize: '11px', color: '#3b82f6', border: '0.5px solid rgba(59,130,246,.25)', borderRadius: '8px', textTransform: 'none', '&:hover': { background: 'rgba(59,130,246,.06)' } }}
            >
                Filter hinzufügen
            </Button>

            {/* Run */}
            <Button
                fullWidth variant="contained" disabled={!table || querying}
                startIcon={querying ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                onClick={runQuery} sx={btnSx}
            >
                {querying ? 'Lädt…' : 'Abfrage ausführen'}
            </Button>

            {/* Error */}
            {error && (
                <Typography sx={{ fontSize: '12px', color: '#ef4444', mt: 1.5, p: 1, bgcolor: 'rgba(239,68,68,.08)', borderRadius: '8px' }}>
                    {error}
                </Typography>
            )}

            {/* Ergebnis */}
            {result && (
                <Box mt={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                        <Typography sx={{ fontSize: '11px', color: '#64748b' }}>
                            {result.count} Zeile{result.count !== 1 ? 'n' : ''}
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: '#3b82f6', bgcolor: 'rgba(59,130,246,.1)', px: 1, py: 0.25, borderRadius: '20px' }}>
                            {result.table}
                        </Typography>
                    </Box>
                    {result.rows?.length ? (
                        <Box sx={{ overflowX: 'auto', border: '0.5px solid rgba(255,255,255,.07)', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <thead>
                                    <tr>
                                        {resultCols.map(c => (
                                            <th key={c} style={{ background: 'rgba(59,130,246,.08)', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em', padding: '7px 10px', textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                {c}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.rows.map((row, ri) => (
                                        <tr key={ri}>
                                            {resultCols.map(c => (
                                                <td key={c} title={String(row[c] ?? '')}
                                                    style={{ padding: '7px 10px', borderTop: '0.5px solid rgba(255,255,255,.05)', color: row[c] == null ? '#475569' : '#cbd5e1', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {row[c] == null ? 'null' : String(row[c])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    ) : (
                        <Typography sx={{ fontSize: '12px', color: '#475569', textAlign: 'center', py: 2 }}>
                            Keine Ergebnisse.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

function LogsTab({ logs }) {
    if (!logs) return (
        <Typography sx={{ fontSize: '12px', color: '#64748b', py: 2, textAlign: 'center' }}>
            Logs werden geladen…
        </Typography>
    );

    const levelColor = { ERROR: '#dc2626', WARN: '#d97706', INFO: '#3b82f6' };

    const renderSection = (label, text) => {
        if (!text || text.startsWith('Datei nicht')) return (
            <Box mb={2}>
                <Typography sx={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', mb: 0.75 }}>{label}</Typography>
                <Typography sx={{ fontSize: '12px', color: '#475569' }}>Nicht verfügbar.</Typography>
            </Box>
        );
        const lines = text.split('\n').filter(Boolean).slice(-60);
        return (
            <Box mb={2}>
                <Typography sx={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', mb: 0.75 }}>{label}</Typography>
                <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
                    {lines.map((l, i) => {
                        const s = String(l);
                        const lvl = s.match(/\b(ERROR|WARN|INFO)\b/i)?.[1]?.toUpperCase() || 'INFO';
                        return (
                            <Box key={i} display="flex" gap={1} sx={{ py: '3px', borderBottom: '0.5px solid rgba(255,255,255,.04)', '&:last-child': { border: 'none' } }}>
                                <Typography component="span" sx={{ fontSize: '10px', fontFamily: 'monospace', color: levelColor[lvl], fontWeight: 600, flexShrink: 0, width: 48 }}>
                                    [{lvl}]
                                </Typography>
                                <Typography component="span" sx={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', wordBreak: 'break-all' }}>
                                    {s.replace(/\[(ERROR|WARN|INFO)\]/i, '').trim()}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    };

    return (
        <Box>
            {renderSection('stdout', logs?.out)}
            {renderSection('stderr', logs?.error)}
        </Box>
    );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [logs, setLogs] = useState(null);
    const [logsLoaded, setLogsLoaded] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', zielmuskel: '', kategorie: '', beschreibung: '' });
    const [formErrors, setFormErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    const handleTabChange = useCallback(async (_, newVal) => {
        setActiveTab(newVal);
        if (newVal === 1 && !logsLoaded) {
            try {
                const res = await AdminApi.getLogs();
                setLogs(res.data.logs);
            } catch {
                setLogs({ out: '', error: '' });
            } finally {
                setLogsLoaded(true);
            }
        }
    }, [logsLoaded]);

    const handleOpenModal = () => { setOpenModal(true); setFormErrors({}); };
    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({ name: '', zielmuskel: '', kategorie: '', beschreibung: '' });
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name ist erforderlich';
        if (!formData.zielmuskel.trim()) errors.zielmuskel = 'Zielmuskel ist erforderlich';
        if (!formData.kategorie) errors.kategorie = 'Kategorie ist erforderlich';
        if (!formData.beschreibung.trim()) errors.beschreibung = 'Beschreibung ist erforderlich';
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
        try {
            await AdminApi.addUebung(formData);
            setMessage({ type: 'success', text: 'Übung erfolgreich hinzugefügt!' });
        } catch {
            setMessage({ type: 'error', text: 'Fehler beim Hinzufügen der Übung.' });
        }
        handleCloseModal();
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column', pb: 4 }}>
                <NavBar />

                {(message.type === 'error' || message.type === 'success') && (
                    <Notification type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
                )}

                <Container maxWidth="md" sx={{ pt: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2.5 }, flexGrow: 1, pb: '72px' }}>

                    {/* Header */}
                    <Card sx={{ ...darkCard, mb: 1.5 }}>
                        <CardContent sx={{ p: '1.25rem 1.75rem !important' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <AdminPanelSettingsIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '17px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3 }}>Administration</Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748b' }}>DB-Explorer &amp; System-Logs</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Übung hinzufügen */}
                    <Button
                        fullWidth variant="outlined"
                        startIcon={<FitnessCenterIcon sx={{ fontSize: 15 }} />}
                        onClick={handleOpenModal}
                        sx={{ mb: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '13px', fontWeight: 500, borderColor: 'rgba(148,163,184,.25)', color: '#94a3b8', '&:hover': { background: 'rgba(255,255,255,.04)', borderColor: 'rgba(148,163,184,.4)' } }}
                    >
                        Übung hinzufügen
                    </Button>

                    {/* Navigation zur Feedbackübersicht */}
                    <Button
                        fullWidth variant="outlined"
                        startIcon={<FeedbackIcon sx={{ fontSize: 15 }} />}
                        onClick={() => navigate('/feedback-ubersicht')}
                        sx={{ mb: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '13px', fontWeight: 500, borderColor: 'rgba(148,163,184,.25)', color: '#94a3b8', '&:hover': { background: 'rgba(255,255,255,.04)', borderColor: 'rgba(148,163,184,.4)' } }}
                    >
                        Feedback anzeigen
                    </Button>

                    {/* Haupt-Card */}
                    <Card sx={{ ...darkCard }}>
                        <Tabs
                            value={activeTab} onChange={handleTabChange}
                            sx={{
                                px: 1.75, minHeight: 40,
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                '& .MuiTab-root': { textTransform: 'none', fontSize: '12px', fontWeight: 500, minWidth: 'auto', minHeight: 40, px: 2, color: '#64748b' },
                                '& .Mui-selected': { color: '#3b82f6 !important' },
                                '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: '2px' },
                            }}
                        >
                            <Tab icon={<StorageIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="DB-Explorer" />
                            <Tab label="Logs" />
                        </Tabs>
                        <CardContent sx={{ p: '1.25rem 1.75rem 1.5rem !important' }}>
                            {activeTab === 0 && <DbExplorer />}
                            {activeTab === 1 && <LogsTab logs={logsLoaded ? logs : null} />}
                        </CardContent>
                    </Card>

                </Container>

                {/* Modal: Übung hinzufügen */}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: '16px', background: '#1e293b', border: '1px solid rgba(59,130,246,0.2)' } }}>
                    <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 500, pb: 1 }}>Neue Übung hinzufügen</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField label="Name" name="name" value={formData.name}
                                onChange={handleInputChange} error={!!formErrors.name} helperText={formErrors.name} fullWidth required sx={inputSx} />
                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <TextField label="Zielmuskel" name="zielmuskel" value={formData.zielmuskel}
                                        onChange={handleInputChange} error={!!formErrors.zielmuskel} helperText={formErrors.zielmuskel} fullWidth required sx={inputSx} />
                                </Grid>
                                <Grid size={6}>
                                    <FormControl fullWidth error={!!formErrors.kategorie} required sx={inputSx}>
                                        <InputLabel>Kategorie</InputLabel>
                                        <Select name="kategorie" value={formData.kategorie} onChange={handleInputChange} label="Kategorie">
                                            {['Push', 'Pull', 'Beine', 'Core'].map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <TextField label="Beschreibung" name="beschreibung" value={formData.beschreibung}
                                onChange={handleInputChange} error={!!formErrors.beschreibung} helperText={formErrors.beschreibung}
                                fullWidth required multiline rows={3} sx={inputSx} />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                        <Button onClick={handleCloseModal} sx={{ color: '#94a3b8', textTransform: 'none' }}>Abbrechen</Button>
                        <Button onClick={handleSubmit} variant="contained" startIcon={<FitnessCenterIcon />} sx={{ ...btnSx, padding: '9px 20px' }}>
                            Hinzufügen
                        </Button>
                    </DialogActions>
                </Dialog>

                <NavBarBot />
            </Box>
        </ThemeProvider>
    );
};

export default AdminPanel;