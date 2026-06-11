import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    IconButton,
    Chip,
    Grid,
    Divider,
    ThemeProvider,
    Collapse,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    InputAdornment,
    Autocomplete,
    useMediaQuery
} from '@mui/material';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { darkTheme } from '../../../theme/darkTheme';
import { useAuth } from '../../context/AuthContext';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NavBar from '../../layout/NavBar';
import { TrainingApi, TestApi } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import NavBarBot from '../../layout/NavBarBot';
import Notification from '../../util/notifications/Notification';
import BackButton from '../../util/buttons/BackButton';
import HeaderCard from '../../layout/HeaderCard';

// ==================== HELPER COMPONENT ====================
function MobileFriendlyTooltip({ title, children }) {
    return (
        <Tooltip
            title={title}
            enterTouchDelay={0}          // Tooltip erscheint sofort auf Touch-Geräten
            leaveTouchDelay={1500}       // Tooltip bleibt kurz sichtbar
            disableHoverListener         // Hover auf Mobile deaktivieren
            disableFocusListener         // Fokus auf Mobile deaktivieren
            interactive
        >
            {children}
        </Tooltip>
    );
}

// ==================== Sortierbare Trainingsplan-Card ====================
function TrainingsplanCard({ plan, onSelect }) {
    return (
        <Card
            sx={{
                mb: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                    transform: 'translateY(-2px)',
                },
            }}
            onClick={onSelect}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box flex={1}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {plan.beschreibung}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Erstellt: {new Date(plan.erstellt_am).toLocaleDateString('de-DE')}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

// ==================== Sortierbare Übungs-Card ====================
function PlanUebungCard({ uebung, onEdit, onDelete, isDragging }) {
    const [expanded, setExpanded] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: uebung.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            sx={{
                mb: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                touchAction: 'pan-y',
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1} flex={1}>
                        <IconButton
                            {...attributes}
                            {...listeners}
                            size="small"
                            sx={{
                                cursor: isDragging ? 'grabbing' : 'grab',
                                touchAction: 'none',
                                flexShrink: 0
                            }}
                        >
                            <DragIndicatorIcon />
                        </IconButton>
                        <Box flex={1}>
                            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                {uebung.uebung_name}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                <Chip label={uebung.zielmuskel} size="small" color="primary" variant="outlined" />
                                <Chip label={uebung.kategorie} size="small" color="secondary" variant="outlined" />
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" gap={0.5}>
                        <IconButton onClick={() => setExpanded(!expanded)} size="small">
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <IconButton onClick={onEdit} size="small" color="warning">
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={onDelete} size="small" color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Collapse in={expanded}>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                        <Grid>
                            <Typography variant="caption" color="text.secondary">Notizen</Typography>
                            <Typography variant="body2">{uebung.notizen || '-'}</Typography>
                        </Grid>
                    </Grid>
                </Collapse>
            </CardContent>
        </Card>
    );
}

// ==================== Main Component ====================
function CustomTrainingsplanManager() {

    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { nutzer } = useAuth();
    const [showNotification, setShowNotification] = useState(false);
    const [trainingsplaene, setTrainingsplaene] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [uebungenInPlan, setUebungenInPlan] = useState([]);
    const [alleUebungen, setAlleUebungen] = useState([]);
    const [customUebungen, setCustomUebungen] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('createPlan');
    const [editingItem, setEditingItem] = useState(null);
    const [filterKategorie, setFilterKategorie] = useState('');
    const [filterZielmuskel, setFilterZielmuskel] = useState('');
    const [selectedUebung, setSelectedUebung] = useState(null);


    const [formData, setFormData] = useState({
        name: '',
        beschreibung: '',
        notizen: '',
        selectedUebung: null,
    });

    const sensors = useSensors(
        useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } }),
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const NUTZER_ID = nutzer?.id;

    useEffect(() => {
        if (NUTZER_ID) {
            loadTrainingsplaene();
            loadVerfuegbareUebungen();
            loadCustomUebungen();
        }
    }, [NUTZER_ID]);

    const loadTrainingsplaene = async () => {
        try {
            const response = await TrainingApi.getCustomPlaene(NUTZER_ID);
            setTrainingsplaene(response.data);
            setMessage({ type: "", text: "" });
        } catch (err) {
            setMessage({ type: "error", text: 'Trainingspläne konnten nicht geladen werden' });
            console.error(err);
        }
    };

    const loadVerfuegbareUebungen = async () => {
        try {
            const response = await TestApi.getAllUebungen();
            setAlleUebungen(response.data);
        } catch (err) {
            console.error('Fehler beim Laden der Übungen:', err);
        }
    };

    const loadCustomUebungen = async () => {
        try {
            const response = await TrainingApi.getUebungenByUserId(NUTZER_ID);
            setCustomUebungen(response.data);
        } catch (err) {
            console.error('Fehler beim Laden eigener Übungen:', err);
        }
    };

    const loadPlanDetails = async (planId) => {
        setLoading(true);
        try {
            const response = await TrainingApi.getCustomPlanUebungen(planId, NUTZER_ID);
            setSelectedPlan(response.data.plan);
            setUebungenInPlan(response.data.uebungen);
            setMessage({ type: "success", text: "Übung hinzugefügt" });
        } catch (err) {
            setMessage({ type: "error", text: 'Plandetails konnten nicht geladen werden' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // === Handler für Plan und Übungen (create, edit, delete) ===
    const handleCreatePlan = () => { setDialogType('createPlan'); setFormData({ name: '', beschreibung: '' }); setEditingItem(null); setDialogOpen(true); };
    const handleEditPlan = () => { if (!selectedPlan) return; setDialogType('editPlan'); setFormData({ name: selectedPlan.name, beschreibung: selectedPlan.beschreibung }); setEditingItem(selectedPlan); setDialogOpen(true); };
    const handleDeletePlan = async () => {
        if (!selectedPlan || !window.confirm('Trainingsplan wirklich löschen?')) return;
        try {
            await TrainingApi.deleteCustomPlan(selectedPlan.id, { nutzer_id: NUTZER_ID });
            await loadTrainingsplaene();
            setSelectedPlan(null);
            setMessage({ type: "success", text: "Trainingsplan gelöscht" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            setMessage({ type: "error", text: err });
            console.error(err);
        }
    };
    const handleAddUebung = () => { setDialogType('addUebung'); setFormData({ name: '', notizen: '', selectedUebung: null }); setEditingItem(null); setDialogOpen(true); };
    const handleEditUebung = (uebung) => { setDialogType('editUebung'); setFormData({ empfohlene_saetze: uebung.empfohlene_saetze, notizen: uebung.notizen }); setEditingItem(uebung); setDialogOpen(true); };
    const handleDeleteUebung = async (uebungId) => {
        if (!window.confirm('Übung wirklich entfernen?')) return;
        try {
            await TrainingApi.deleteCustomPlanUebung(uebungId, { nutzer_id: NUTZER_ID });
            await loadPlanDetails(selectedPlan.id);
            setMessage({ type: "success", text: "Übung gelöscht" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
        catch (err) {
            setMessage({ type: "error", text: 'Übung konnte nicht gelöscht werden' });
            console.error(err);
        }
    };

    const handleDialogConfirm = async () => {
        try {
            if (dialogType === 'createPlan') {
                await TrainingApi.createCustomPlan({ nutzer_id: NUTZER_ID, name: formData.name, beschreibung: formData.beschreibung });
                await loadTrainingsplaene();
            } else if (dialogType === 'editPlan') {
                await TrainingApi.updateCustomPlan(selectedPlan.id, { nutzer_id: NUTZER_ID, name: formData.name, beschreibung: formData.beschreibung });
                await loadPlanDetails(selectedPlan.id);
            } else if (dialogType === 'addUebung') {
                // support options that include uebung_id for custom and standard entries
                const selected = formData.selectedUebung;
                const uebungId = selected?.uebung_id ?? (typeof selected?.id === 'string' ? parseInt(selected.id.split('-').pop(), 10) : selected?.id);
                await TrainingApi.addUebungToPlan({
                    eigener_trainingsplan_id: selectedPlan.id,
                    uebung_id: uebungId,
                    reihenfolge: uebungenInPlan.length + 1,
                    notizen: formData.notizen || null,
                    nutzer_id: NUTZER_ID,
                    eigene_uebung: selected?.eigene_uebung ? 1 : 0,
                });
                await loadPlanDetails(selectedPlan.id);
            } else if (dialogType === 'editUebung') {
                await TrainingApi.updateUebungInPlan(editingItem.id, {
                    reihenfolge: editingItem.reihenfolge,
                    notizen: formData.notizen || null,
                    nutzer_id: NUTZER_ID,
                });
                await loadPlanDetails(selectedPlan.id);
            }

            setMessage({ type: "success", text: "Hat geklpatt" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            setDialogOpen(false);
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.error || err.message || 'Ein Fehler ist aufgetreten' });
            console.error('Error in handleDialogConfirm:', err);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (over && active.id !== over.id) {
            const oldIndex = uebungenInPlan.findIndex(u => u.id === active.id);
            const newIndex = uebungenInPlan.findIndex(u => u.id === over.id);
            const newOrder = arrayMove(uebungenInPlan, oldIndex, newIndex);
            setUebungenInPlan(newOrder);
            try {
                await Promise.all(newOrder.map((uebung, index) =>
                    TrainingApi.updateUebungInPlan(uebung.id, { ...uebung, reihenfolge: index + 1, nutzer_id: NUTZER_ID })
                ));
                setMessage({ type: "success", text: 'Reihenfolge gespeichert' });
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            } catch (err) {
                setMessage({ type: "error", text: 'Fehler beim Speichern der Reihenfolge' });
                console.error(err);
                setUebungenInPlan(uebungenInPlan);
            }
        }
    };

    const closeSelectedPlan = () => {
        setSelectedPlan(null);
        // window.location.reload()
    }

    // Gefilterte Übungen für Autocomplete
    const gefilterteUebungen = alleUebungen
        .filter(u => !filterKategorie || u.kategorie === filterKategorie)
        .filter(u => !filterZielmuskel || u.zielmuskel === filterZielmuskel)
        .sort((a, b) => a.name.localeCompare(b.name));

    const gefilterteCustomUebungen = customUebungen
        .filter(u => !filterKategorie || u.kategorie === filterKategorie)
        .filter(u => !filterZielmuskel || u.zielmuskel === filterZielmuskel)
        .sort((a, b) => (a.uebung_name || '').localeCompare(b.uebung_name || ''));

    // Einzigartige Kategorien und Zielmuskeln für Filter-Dropdowns
    const kategorien = [...new Set(alleUebungen.map(u => u.kategorie))].sort();
    const zielmuskeln = [...new Set(alleUebungen.map(u => u.zielmuskel))].sort();

    if (!NUTZER_ID) {
        return (
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                    <Alert severity="error">Bitte melden Sie sich an</Alert>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <>
            <NavBar />
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
                    <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
                        {!isMobile && (
                            selectedPlan ? (
                                <>
                                    <BackButton func={() => setSelectedPlan(null)} />
                                </>
                            ) : (
                                <BackButton />
                            )
                        )}
                        {!selectedPlan ? (
                            <>
                                <HeaderCard title={"Meine Trainingspläne"} />

                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreatePlan}
                                    sx={{
                                        mb: 2,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                        color: '#fff',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                                        },
                                    }}
                                >
                                    Neuer Plan
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

                                <Box>
                                    {trainingsplaene.length === 0 ? (
                                        <Card sx={{ mb: 2, borderRadius: "16px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                                            <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%" }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            fontSize: '1rem',
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        Noch keine Pläne erstellt
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        trainingsplaene.map(plan => (
                                            <TrainingsplanCard
                                                key={plan.id}
                                                plan={plan}
                                                onSelect={() => loadPlanDetails(plan.id)}
                                            />
                                        ))
                                    )}
                                </Box>
                            </>
                        ) : (
                            <>

                                <HeaderCard title={selectedPlan.name} subtitle={selectedPlan.beschreibung} />

                                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-around" }}>
                                    <Button onClick={handleAddUebung} variant="outlined"><AddIcon /></Button>
                                    <Button onClick={handleEditPlan} variant="outlined" color="warning"><EditIcon /></Button>
                                    <Button onClick={handleDeletePlan} variant="outlined" color="error"><DeleteIcon /></Button>
                                </Box>

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

                                {loading ? <CircularProgress sx={{ position: "absolute", top: "45%", left: "45%", display: 'block', mx: 'auto', mb: 2 }} />
                                    : uebungenInPlan.length === 0 ? (
                                        <Typography color="text.secondary">Keine Übungen im Plan</Typography>
                                    ) : (
                                        <DndContext 
                                        sensors={sensors} 
                                        collisionDetection={closestCenter} 
                                        onDragStart={(event) => setActiveId(event.active.id)} 
                                        onDragEnd={handleDragEnd}>
                                            <SortableContext 
                                            items={uebungenInPlan.map(u => u.id)} 
                                            strategy={verticalListSortingStrategy}>
                                                {uebungenInPlan.map((uebung) => (
                                                    <PlanUebungCard
                                                        key={uebung.id}
                                                        uebung={uebung}
                                                        onEdit={() => handleEditUebung(uebung)}
                                                        onDelete={() => handleDeleteUebung(uebung.id)}
                                                        isDragging={activeId === uebung.id}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    )}
                            </>
                        )}
                    </Container>

                    {/* ==================== Dialog ==================== */}
                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {dialogType === 'createPlan' && 'Neuer Trainingsplan'}
                            {dialogType === 'editPlan' && 'Trainingsplan bearbeiten'}
                            {dialogType === 'addUebung' && 'Übung hinzufügen'}
                            {dialogType === 'editUebung' && 'Übung bearbeiten'}
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                {/* Plan erstellen/bearbeiten */}
                                {(dialogType === 'createPlan' || dialogType === 'editPlan') && (
                                    <>
                                        <TextField
                                            label="Planname"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Beschreibung (optional)"
                                            value={formData.beschreibung}
                                            onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={3}
                                        />
                                    </>
                                )}

                                {/* Übung hinzufügen */}
                                {dialogType === 'addUebung' && (
                                    <>
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                            <FormControl size="small" fullWidth>
                                                <InputLabel>Kategorie filtern</InputLabel>
                                                <Select
                                                    value={filterKategorie}
                                                    onChange={(e) => setFilterKategorie(e.target.value)}
                                                    label="Kategorie filtern"
                                                >
                                                    <MenuItem value="">Alle Kategorien</MenuItem>
                                                    {kategorien.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                                                </Select>
                                            </FormControl>

                                            <FormControl size="small" fullWidth>
                                                <InputLabel>Zielmuskel filtern</InputLabel>
                                                <Select
                                                    value={filterZielmuskel}
                                                    onChange={(e) => setFilterZielmuskel(e.target.value)}
                                                    label="Zielmuskel filtern"
                                                >
                                                    <MenuItem value="">Alle Muskeln</MenuItem>
                                                    {zielmuskeln.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        <Autocomplete
                                            options={[
                                                ...gefilterteUebungen.map(u => ({
                                                    id: `standard-${u.id}`,
                                                    uebung_id: u.id,
                                                    name: u.name,
                                                    zielmuskel: u.zielmuskel,
                                                    kategorie: u.kategorie,
                                                    eigene_uebung: 0
                                                })),
                                                ...gefilterteCustomUebungen.map(u => ({
                                                    id: `custom-${u.id}`,
                                                    uebung_id: u.id,
                                                    name: u.uebung_name,
                                                    zielmuskel: u.zielmuskel,
                                                    kategorie: u.kategorie,
                                                    eigene_uebung: 1
                                                }))
                                            ]}
                                            getOptionLabel={(option) => `${option.name} (${option.zielmuskel})`}
                                            value={selectedUebung}
                                            onChange={(e, newValue) => {
                                                setSelectedUebung(newValue);
                                                setFormData({ ...formData, selectedUebung: newValue });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Übung suchen"
                                                    placeholder="Tippe zum Suchen..."
                                                    required
                                                />
                                            )}
                                            renderOption={(props, option) => {
                                                const { key, ...otherProps } = props;
                                                return (
                                                    <li key={key} {...otherProps}>
                                                        <Box>
                                                            <Typography variant="body1">{option.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {option.zielmuskel} • {option.kategorie}
                                                            </Typography>
                                                        </Box>
                                                    </li>
                                                );
                                            }}
                                            noOptionsText="Keine Übung gefunden"
                                        />

                                        <TextField
                                            label="Notizen (optional)"
                                            value={formData.notizen}
                                            onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={2}
                                        />
                                    </>
                                )}

                                {/* Übung bearbeiten */}
                                {dialogType === 'editUebung' && (
                                    <>
                                        <TextField
                                            label="Notizen"
                                            value={formData.notizen}
                                            onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={3}
                                        />
                                    </>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                            <Button
                                onClick={handleDialogConfirm}
                                variant="contained"
                                disabled={
                                    (dialogType === 'createPlan' && !formData.name) ||
                                    (dialogType === 'addUebung' && !formData.selectedUebung)
                                }
                            >
                                Speichern
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </ThemeProvider >
            <NavBarBot
                // mainBtnF={handleAddUebung} 
                // mainBtnTxt={<AddIcon />} 
                sideBtn1F={selectedPlan && (closeSelectedPlan)}
                sideBtn1Icon={<ArrowBackIcon />} />
        </>
    );
}

export default CustomTrainingsplanManager;
