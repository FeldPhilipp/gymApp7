import { useState, useEffect } from "react";
import HeaderCard from "../../layout/HeaderCard";
import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
import {
    Box,
    Container,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    ThemeProvider,
    Card,
    CardContent,
    Collapse,
    useMediaQuery,
    LinearProgress
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
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { darkTheme } from '../../../theme/darkTheme';
import BackButton from "../../util/buttons/BackButton";
import { TrainingApi, TestApi, UserApi } from "../../../services/api";
import { useAuth } from '../../context/AuthContext';
import { useApiProtectionContext } from '../../context/ApiProtectionContext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LoadingPage from "../../layout/LoadingPage";
import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Notification from "../../util/notifications/Notification";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

function UebungCard({
    uebung,
    onEdit,
    onDelete,
    ergebnisse,
    onChange,
    onToggleHistory,
    showHistory,
    letzteErgebnisse,
    isDragging
}) {
    const [expanded, setExpanded] = useState(false);
    const [expandedHistory, setExpandedHistory] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: uebung.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Gruppiere Ergebnisse nach Session
    const groupedBySession = letzteErgebnisse && Array.isArray(letzteErgebnisse)
        ? letzteErgebnisse.reduce((acc, result) => {
            const sessionKey = result.session_id;

            if (!acc[sessionKey]) {
                acc[sessionKey] = {
                    session_id: result.session_id,
                    timestamp: result.erstellt_am,
                    saetze: []
                };
            }

            acc[sessionKey].saetze.push(result);
            return acc;
        }, {})
        : {};

    const sortedSessions = Object.values(groupedBySession)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
                                flexShrink: 0,
                                '&:active': {
                                    cursor: 'grabbing',
                                }
                            }}
                        >
                            <DragIndicatorIcon />
                        </IconButton>
                        <Box flex={1}>
                            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                {uebung.name}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                <Chip label={uebung.zielmuskel} size="small" color="primary" variant="outlined" />
                                <Chip label={uebung.kategorie} size="small" color="secondary" variant="outlined" />
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" gap={0.5} sx={{ flexShrink: 0 }}>
                        {expanded && (
                            <IconButton onClick={onToggleHistory} size="small" color="info">
                                <HistoryIcon />
                            </IconButton>
                        )}
                        {/* Delete confirmation: first click toggles confirm state and shows cancel/confirm icons */}
                        {!confirmDelete ? (
                            <IconButton
                                onClick={() => setConfirmDelete(true)}
                                size="small"
                                color="error"
                                aria-label={`Lösche Übung ${uebung.name}`}
                            >
                                <DeleteIcon />
                            </IconButton>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                    onClick={() => { setConfirmDelete(false); }}
                                    size="small"
                                    color="inherit"
                                    aria-label="Abbrechen"
                                >
                                    <CloseIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => { setConfirmDelete(false); onDelete && onDelete(); }}
                                    size="small"
                                    color="error"
                                    aria-label="Löschen bestätigen"
                                >
                                    <CheckIcon />
                                </IconButton>
                            </Box>
                        )}
                        <IconButton onClick={onEdit} size="small" color="warning">
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => setExpanded(!expanded)} size="small">
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                </Box>

                <Collapse in={expanded}>
                    {/* HISTORY SECTION */}
                    {showHistory && sortedSessions.length > 0 && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                    Trainings-Historie:
                                </Typography>
                            </Box>

                            {sortedSessions.slice(0, 1).map((session, sessionIdx) => (
                                <Box key={sessionIdx}>
                                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                                        {session.timestamp ? new Date(session.timestamp).toLocaleDateString('de-DE', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        }) : 'Datum unbekannt'} • {session.saetze.length} Sätze
                                    </Typography>
                                    {session.saetze.map((satz, satzIdx) => (
                                        <Typography key={satzIdx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
                                        </Typography>
                                    ))}
                                </Box>
                            ))}

                            {sortedSessions.length > 1 && (
                                <Box mt={2}>
                                    <Button
                                        size="small"
                                        onClick={() => setExpandedHistory(!expandedHistory)}
                                        sx={{ color: '#667eea', textTransform: 'none' }}
                                    >
                                        {expandedHistory ? 'Weniger anzeigen' : `Weitere ${Math.min(2, sortedSessions.length - 1)} Trainings anzeigen`}
                                    </Button>

                                    <Collapse in={expandedHistory}>
                                        {sortedSessions.slice(1, 3).map((session, sessionIdx) => (
                                            <Box key={sessionIdx} mt={2}>
                                                <Divider sx={{ my: 1.5, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
                                                <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                                                    {session.timestamp ? new Date(session.timestamp).toLocaleDateString('de-DE', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    }) : 'Datum unbekannt'} • {session.saetze.length} Sätze
                                                </Typography>
                                                {session.saetze.map((satz, satzIdx) => (
                                                    <Typography key={satzIdx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
                                                    </Typography>
                                                ))}
                                            </Box>
                                        ))}
                                    </Collapse>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* INPUT SECTION */}
                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {ergebnisse.saetze.map((satz, satzIdx) => (
                            <Box key={satzIdx}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Satz {satzIdx + 1}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Gewicht (kg)"
                                            type="number"
                                            slotProps={{
                                                htmlInput: {
                                                    inputMode: 'decimal',
                                                    pattern: '[0-9.]*',
                                                },
                                            }}
                                            size="small"
                                            fullWidth
                                            value={satz.gewicht}
                                            onChange={(e) => onChange(uebung.id, satzIdx, 'gewicht', e.target.value)}
                                            inputProps={{ step: "0.5" }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Wiederholungen"
                                            type="number"
                                            slotProps={{
                                                htmlInput: {
                                                    inputMode: 'decimal',
                                                    pattern: '[0-9.]*',
                                                },
                                            }}
                                            size="small"
                                            fullWidth
                                            value={satz.wiederholungen}
                                            onChange={(e) => onChange(uebung.id, satzIdx, 'wiederholungen', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}

const IndividuellerPlan = () => {

    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));

    const [showNotification, setShowNotification] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const { protect } = useApiProtectionContext();
    const { nutzer } = useAuth();
    const [editIndex, setEditIndex] = useState(null);
    const [selectedUebung, setSelectedUebung] = useState(null);
    const [filterKategorie, setFilterKategorie] = useState('');
    const [filterZielmuskel, setFilterZielmuskel] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alleUebungen, setAlleUebungen] = useState([]);
    const [gewaehlteUebungen, setGewaehlteUebungen] = useState([]);
    const [ergebnisse, setErgebnisse] = useState({});
    const [activeId, setActiveId] = useState(null);
    const [showHistory, setShowHistory] = useState({});
    const [timerStart, setTimerStart] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [letzteErgebnisse, setLetzteErgebnisse] = useState({});

    const nutzerId = nutzer?.id;

    // Sensoren für Drag & Drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchUebungen = async () => {
            setLoading(true);
            try {
                const response = await TestApi.getAllUebungenWithCustom(nutzerId);
                const alleUebungenData = response.data;
                setAlleUebungen(alleUebungenData);
            } catch (err) {
                console.error('Fehler beim Laden der Übungen:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUebungen();
    }, [nutzerId]); // nutzerId als Dependency hinzufügen

    useEffect(() => {
        console.log("All Exercises:", alleUebungen);
    }, [alleUebungen]);

    // ============ AUTO-SAVE ============
    useEffect(() => {
        if (gewaehlteUebungen.length > 0) {
            const saveSession = async () => {
                try {
                    await TrainingApi.saveTempIndiSession({
                        nutzer_id: nutzerId,
                        gewaehlte_uebungen: gewaehlteUebungen,
                        ergebnisse,
                        timer_start: timerStart
                    });
                } catch (err) {
                    console.error('Fehler beim Auto-Save:', err);
                }
            };

            const timeoutId = setTimeout(saveSession, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [ergebnisse, gewaehlteUebungen, nutzerId, timerStart]);

    // ============ AUTO-GET-TEMP-SESSION (statt IndexedDB) ============
    useEffect(() => {
        if (!nutzerId) {
            return;
        }

        const loadSession = async () => {
            setLoading(true);
            try {
                const response = await TrainingApi.getTempIndiSession(nutzerId);
                const saved = response.data;
                if (saved) {
                    const { gewaehlte_uebungen, ergebnisse, timer_start } = saved;

                    if (gewaehlte_uebungen && gewaehlte_uebungen.length > 0) {
                        setGewaehlteUebungen(gewaehlte_uebungen);
                        setErgebnisse(ergebnisse || {});
                        // Timer wiederherstellen
                        if (timer_start) {
                            const now = new Date().getTime();
                            const start = new Date(timer_start).getTime();
                            const diff = Math.floor((now - start) / 1000);

                            setTimerStart(timer_start);
                            setElapsedTime(diff);
                            setIsTimerRunning(true); // WICHTIG: Als letztes setzen, damit der useEffect triggert
                        }
                    }
                }
            } catch (err) {
                console.error('Fehler beim Laden der Temp-Session:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, [nutzerId]);

    // ============ TIMER TOGGLE ============
    const handleToggleTimer = () => {
        if (!isTimerRunning) {
            // Timer starten
            const now = new Date().toISOString();
            setTimerStart(now);
            setIsTimerRunning(true);
            setElapsedTime(0);
        } else {
            // Timer stoppen
            setIsTimerRunning(false);
        }
    };

    const handleAddUebung = () => {
        setEditIndex(null);
        setSelectedUebung(null);
        setFilterKategorie('');
        setFilterZielmuskel('');
        setDialogOpen(true);
    };

    const handleDialogConfirm = () => {
        if (!selectedUebung) return;

        if (editIndex !== null) {
            const updated = [...gewaehlteUebungen];
            updated[editIndex] = selectedUebung;
            setGewaehlteUebungen(updated);
        } else {
            setGewaehlteUebungen([...gewaehlteUebungen, selectedUebung]);
            setErgebnisse(prev => ({
                ...prev,
                [selectedUebung.id]: {
                    saetze: Array(3).fill().map(() => ({ wiederholungen: '', gewicht: '' }))
                }
            }));
        }
        setDialogOpen(false);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setGewaehlteUebungen(prev => {
                const oldIndex = prev.findIndex(u => u.id === active.id);
                const newIndex = prev.findIndex(u => u.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const toggleHistory = async (uebungId) => {
        setShowHistory(prev => ({ ...prev, [uebungId]: !prev[uebungId] }));
        if (!letzteErgebnisse[uebungId] && !showHistory[uebungId]) {
            try {
                const response = await TrainingApi.getLetzteErgebnisse(uebungId, nutzer.id);
                setLetzteErgebnisse(prev => ({ ...prev, [uebungId]: response.data }));
            } catch (err) {
                console.error('Fehler beim Laden der Historie:', err);
            }
        }
    };

    const handleEditUebung = (index) => {
        setEditIndex(index);
        setSelectedUebung(gewaehlteUebungen[index]);
        setDialogOpen(true);
    };

    const handleInputChange = (uebungId, satzIdx, field, value) => {
        setErgebnisse(prev => ({
            ...prev,
            [uebungId]: {
                ...prev[uebungId],
                saetze: prev[uebungId].saetze.map((satz, idx) =>
                    idx === satzIdx ? { ...satz, [field]: value } : satz
                )
            }
        }));
    };

    const handleDeleteUebung = (index) => {
        const uebungId = gewaehlteUebungen[index].id;
        setGewaehlteUebungen(gewaehlteUebungen.filter((_, i) => i !== index));
        const { [uebungId]: removed, ...rest } = ergebnisse;
        setErgebnisse(rest);
    };

    const gefilterteUebungen = alleUebungen
        .filter(u => !filterKategorie || u.kategorie === filterKategorie)
        .filter(u => !filterZielmuskel || u.zielmuskel === filterZielmuskel)
        .sort((a, b) => {
            const nameA = a.name || a.uebungen_name || '';
            const nameB = b.name || b.uebungen_name || '';
            return nameA.localeCompare(nameB);
        });

    const kategorien = [...new Set(alleUebungen.map(u => u.kategorie))];
    const zielmuskeln = [...new Set(alleUebungen.map(u => u.zielmuskel))];

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const alleErgebnisse = [];
            Object.entries(ergebnisse).forEach(([uebungId, data]) => {
                data.saetze.forEach((satz, idx) => {
                    if (satz.wiederholungen && satz.gewicht) {
                        alleErgebnisse.push({
                            uebung_id: parseInt(uebungId),
                            satz_nummer: idx + 1,
                            wiederholungen: parseInt(satz.wiederholungen),
                            gewicht_kg: parseFloat(satz.gewicht),
                            notizen: null
                        });
                    }
                });
            });

            if (alleErgebnisse.length === 0) {
                setMessage({ type: "error", text: "Bitte fülle mindestens eine Übung aus." });
                setLoading(false);
                return;
            }

            const uebungenReihenfolge = gewaehlteUebungen.map((u, idx) => ({
                // Verwende id falls vorhanden (System-Übungen), sonst nutzer_id (Nutzer-Übungen)
                uebung_id: u.id || u.nutzer_id,
                reihenfolge: idx + 1
            }));

            await protect("Trainingsergebnisse - createSessionMitHistorie", async () => {
                await TrainingApi.createSessionMitHistorie({
                    nutzer_id: nutzer.id,
                    trainingsplan_id: 0,
                    trainingsplan_typ: "individual",
                    datum: new Date().toISOString().split('T')[0],
                    startzeit: null,
                    endzeit: null,
                    notizen: null,
                    ergebnisse: alleErgebnisse,
                    uebungen_reihenfolge: uebungenReihenfolge
                });

                // NEU: Temp-Session nach erfolgreichem Speichern löschen
                await TrainingApi.deleteTempIndiSession(nutzerId);

                setMessage({ type: "success", text: "Training erfolgreich gespeichert!" });

                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            });
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            setMessage({ type: "error", text: "Fehler beim Speichern des Trainings." });
        }
    };

    if (loading) {
        <LoadingPage />
    }

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
                    {!loading ? (
                        <>
                            <NavBar />
                            <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: "44px" }}>
                                {!isMobile && (
                                    <BackButton />
                                )}
                                <HeaderCard title="Individueller Plan" subtitle="Ein Plan für einmalige Trainingseinheiten" />
                                {!isMobile && (
                                    <Grid size={{ xs: 12, sm: 12 }} sx={{ pb: "15px" }}>
                                        <Button
                                            onClick={handleSave}
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            sx={{
                                                padding: { xs: '10px 16px', sm: '14px 28px' },
                                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                                fontWeight: 600,
                                                borderRadius: '16px',
                                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                                color: '#fff',
                                                textTransform: 'none',
                                                transition: 'all 0.3s ease',
                                                height: '100%',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
                                                },
                                            }}
                                        >
                                            Training speichern
                                        </Button>
                                    </Grid>
                                )}
                                {gewaehlteUebungen.length > 0 ? (
                                    <>
                                        < DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragStart={(event) => setActiveId(event.active.id)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={gewaehlteUebungen.map(u => u.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {gewaehlteUebungen.map((uebung) => (
                                                    <UebungCard
                                                        key={uebung.id}
                                                        uebung={uebung}
                                                        onEdit={() => handleEditUebung(gewaehlteUebungen.findIndex(u => u.id === uebung.id))}
                                                        onDelete={() => handleDeleteUebung(gewaehlteUebungen.findIndex(u => u.id === uebung.id))}
                                                        ergebnisse={ergebnisse[uebung.id] || { saetze: [] }}
                                                        onChange={handleInputChange}
                                                        onToggleHistory={() => toggleHistory(uebung.id)}
                                                        showHistory={showHistory[uebung.id]}
                                                        letzteErgebnisse={letzteErgebnisse[uebung.id]}
                                                        isDragging={activeId === uebung.id}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext></>
                                ) : (
                                    <>
                                        <Typography variant="body1" color="text.secondary">
                                            {"Füge deinem individuellen Trainingsplan Übungen hinzu, indem du auf das "}<AddCircleOutlineIcon sx={{ verticalAlign: 'middle' }} />{"-Symbol unten klickst."}
                                            <br/>
                                            <br/>
                                            <PriorityHighIcon sx={{ verticalAlign: 'middle' }} />{"Dies sind einmalige Pläne. Sie erstellen keinen wiederverwendbaren Trainingsplan. "}
                                        </Typography>

                                    </>
                                )}
                                <NavBarBot
                                    mainBtnF={() => handleSave()}
                                    mainBtnTxt={"Speichern"}
                                    sideBtn2Icon={<AddCircleOutlineIcon />}
                                    sideBtn2F={handleAddUebung}
                                />
                            </Container>
                            <Dialog
                                open={dialogOpen}
                                onClose={() => setDialogOpen(false)}
                                maxWidth="md"
                                fullWidth
                                fullScreen={window.innerWidth < 600}
                            >
                                <DialogTitle>
                                    {editIndex !== null ? 'Übung ändern' : 'Übung hinzufügen'}
                                </DialogTitle>
                                <DialogContent>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                            <FormControl size="small" fullWidth>
                                                <InputLabel>Kategorie</InputLabel>
                                                <Select
                                                    value={filterKategorie}
                                                    onChange={(e) => setFilterKategorie(e.target.value)}
                                                    label="Kategorie"
                                                >
                                                    <MenuItem value="">Alle</MenuItem>
                                                    {kategorien.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                            <FormControl size="small" fullWidth>
                                                <InputLabel>Zielmuskel</InputLabel>
                                                <Select
                                                    value={filterZielmuskel}
                                                    onChange={(e) => setFilterZielmuskel(e.target.value)}
                                                    label="Zielmuskel"
                                                >
                                                    <MenuItem value="">Alle</MenuItem>
                                                    {zielmuskeln.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        <Autocomplete
                                            options={gefilterteUebungen}
                                            getOptionLabel={(option) => `${option.name} (${option.zielmuskel})`}
                                            value={selectedUebung}
                                            onChange={(e, newValue) => setSelectedUebung(newValue)}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Übung suchen" />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Box>
                                                        <Typography variant="body1">{option.name || option.uebungen_name}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {option.zielmuskel} • {option.kategorie}
                                                        </Typography>
                                                    </Box>
                                                </li>
                                            )}
                                        />
                                    </Box>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                                    <Button
                                        onClick={handleDialogConfirm}
                                        variant="contained"
                                        disabled={!selectedUebung}
                                    >
                                        {editIndex !== null ? 'Ändern' : 'Hinzufügen'}
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    ) : (
                        <LoadingPage />
                    )}
                </Box >
            </ThemeProvider >
        </>
    );
}

export default IndividuellerPlan;
