import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    Container,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    IconButton,
    ThemeProvider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useMediaQuery,
    Card,
    CardContent,
} from '@mui/material';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import {
    ArrowBack as ArrowBackIcon,
    FitnessCenter as FitnessCenterIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { darkTheme } from '../../../theme/darkTheme';
import NavBar from '../../layout/NavBar';
import { TrainingApi, TestApi } from '../../../services/api';
import NavBarBot from '../../layout/NavBarBot';
import Notification from '../../util/notifications/Notification';
import LoadingNavBarBot from '../../layout/LoadingNavBarBot';
import HeaderCard from '../../layout/HeaderCard';
import LoadingPage from '../../layout/LoadingPage';

function SortableExerciseCard({ exercise, onEdit, onDelete, isEditing, isDragging, onDeleteSet }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: exercise.uebung_id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Accordion
            ref={setNodeRef}
            style={style}
            defaultExpanded
            sx={{
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px !important',
                mb: 1.5,
                '&:before': { display: 'none' },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#3b82f6' }} />}
                sx={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    '&:hover': { background: 'rgba(59, 130, 246, 0.15)' },
                    py: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {isEditing && (
                        <Box
                            {...attributes}
                            {...listeners}
                            size="small"
                            sx={{ cursor: 'grab', touchAction: 'none', '&:active': { cursor: 'grabbing' } }}
                        >
                            <DragIndicatorIcon sx={{ color: '#3b82f6' }} />
                        </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700} color="#e0f2fe">
                            {exercise.uebung_name}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                            {exercise.saetze.length} Satz{exercise.saetze.length !== 1 ? 'e' : ''}
                        </Typography>
                    </Box>
                    {isEditing && (
                        <Box
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            size="small"
                            sx={{ color: '#ef4444' }}
                        >
                            <DeleteIcon />
                        </Box>
                    )}
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {exercise.saetze.map((satz, idx) => (
                            <Box key={`${exercise.uebung_id}-satz-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography sx={{ color: '#93c5fd', minWidth: 60 }}>
                                    Satz {idx + 1}:
                                </Typography>
                                <TextField
                                    label="Wdh"
                                    type="number"
                                    size="small"
                                    value={satz.wiederholungen ?? ''} // Zeige null als ''
                                    onChange={(e) => onEdit(exercise.uebung_id, idx, 'wiederholungen', e.target.value)}
                                    sx={{ width: 80 }}
                                    inputProps={{ min: 0 }}
                                />
                                <TextField
                                    label="Gewicht (kg)"
                                    type="number"
                                    size="small"
                                    value={satz.gewicht_kg ?? ''} // Zeige null als ''
                                    onChange={(e) => onEdit(exercise.uebung_id, idx, 'gewicht_kg', e.target.value)}
                                    sx={{ width: 100 }}
                                    inputProps={{ step: "0.5", min: 0 }}
                                />
                                <IconButton
                                    onClick={() => onDeleteSet(exercise.uebung_id, idx)}
                                    size="small"
                                    sx={{ color: '#ef4444' }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                    <TableCell sx={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.75rem' }}>Satz</TableCell>
                                    <TableCell sx={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.75rem' }}>Wdh.</TableCell>
                                    <TableCell sx={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.75rem' }}>Gewicht</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exercise.saetze.map((satz, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell sx={{ color: '#e0f2fe', fontWeight: 600, py: 1 }}>{idx + 1}</TableCell>
                                        <TableCell sx={{ color: '#e0f2fe', fontWeight: 600, py: 1 }}>{satz.wiederholungen}</TableCell>
                                        <TableCell sx={{ color: '#e0f2fe', fontWeight: 600, py: 1 }}>
                                            {satz.gewicht_kg ? `${satz.gewicht_kg} kg` : '–'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </AccordionDetails>
        </Accordion>
    )
}

const TrainingDetail = () => {
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
    const { id } = useParams();
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [ergebnisse, setErgebnisse] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedSession, setEditedSession] = useState(null);
    const [editedErgebnisse, setEditedErgebnisse] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [alleUebungen, setAlleUebungen] = useState([]);
    const [filterKategorie, setFilterKategorie] = useState('');
    const [filterZielmuskel, setFilterZielmuskel] = useState('');
    const [selectedUebung, setSelectedUebung] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    useEffect(() => {
        fetchTrainingDetails();
        fetchAllUebungen(); // NEU
    }, [id]);

    const fetchTrainingDetails = async () => {
        try {
            setLoading(true);
            const sessionResponse = await TrainingApi.getSessionDetails(id);
            setSession(sessionResponse.data);

            const ergebnisseResponse = await TrainingApi.getSessionErgebnisse(id);

            // WICHTIG: Sortiere nach reihenfolge, falls vorhanden
            const sortedErgebnisse = ergebnisseResponse.data.sort((a, b) => {
                // Falls reihenfolge vorhanden ist, danach sortieren
                if (a.reihenfolge !== undefined && b.reihenfolge !== undefined) {
                    return a.reihenfolge - b.reihenfolge;
                }
                // Fallback: nach uebung_name oder uebung_id
                return (a.uebung_name || '').localeCompare(b.uebung_name || '');
            });

            setErgebnisse(sortedErgebnisse);
            setMessage({ type: 'success', text: 'Trainingsdetails geladen' });
        } catch (err) {
            console.error('Fehler beim Laden der Trainingsdetails:', err);
            setMessage({ type: 'error', text: 'Fehler beim Laden der Trainingsdetails' });
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUebungen = async () => {
        try {
            const response = await TestApi.getAllUebungen();
            setAlleUebungen(response.data);
        } catch (err) {
            console.error('Fehler beim Laden der Übungen:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Kein Datum';
        return new Date(dateString).toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return new Date(timeString).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return null;
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffMs = endTime - startTime;
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 60) {
            return `${diffMins} Min`;
        }
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}min`;
    };

    // Gruppiere Ergebnisse nach Übung
    const groupByExercise = () => {
        const grouped = {};
        ergebnisse.forEach((ergebnis) => {
            const key = ergebnis.uebung_name || 'Unbekannte Übung';
            if (!grouped[key]) {
                grouped[key] = {
                    uebung_name: key,
                    reihenfolge: ergebnis.reihenfolge || 999,
                    saetze: [],
                };
            }
            grouped[key].saetze.push(ergebnis);
        });

        // Sortiere nach Reihenfolge
        const sortedGrouped = Object.fromEntries(
            Object.entries(grouped).sort(([, a], [, b]) =>
                (a.reihenfolge || 999) - (b.reihenfolge || 999)
            )
        );

        return sortedGrouped;
    };

    const handleStartEdit = () => {
        setEditedSession({
            ...session,
            datum: session.datum ? new Date(session.datum).toISOString().split('T')[0] : ''
        });

        const grouped = {};
        ergebnisse.forEach(ergebnis => {
            if (!grouped[ergebnis.uebung_id]) {
                grouped[ergebnis.uebung_id] = {
                    uebung_id: ergebnis.uebung_id,
                    uebung_name: ergebnis.uebung_name || 'Unbekannte Übung',
                    kategorie: ergebnis.kategorie || '',
                    zielmuskel: ergebnis.zielmuskel || '',
                    reihenfolge: ergebnis.reihenfolge || 999, // Speichere die Reihenfolge
                    saetze: []
                };
            }
            grouped[ergebnis.uebung_id].saetze.push({
                satz_nummer: ergebnis.satz_nummer,
                wiederholungen: ergebnis.wiederholungen,
                gewicht_kg: ergebnis.gewicht_kg,
                notizen: ergebnis.notizen
            });
        });

        // Auffüllen auf genau 3 Sätze pro Übung
        Object.values(grouped).forEach(exercise => {
            while (exercise.saetze.length < 3) {
                exercise.saetze.push({
                    wiederholungen: null,
                    gewicht_kg: null,
                    notizen: null
                });
            }
        });

        // WICHTIG: Nach reihenfolge sortieren vor dem Setzen
        const sortedGrouped = Object.values(grouped).sort((a, b) =>
            (a.reihenfolge || 999) - (b.reihenfolge || 999)
        );

        setEditedErgebnisse(sortedGrouped);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedSession(null);
        setEditedErgebnisse([]);
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const alleErgebnisse = [];
            editedErgebnisse.forEach((exercise) => {
                exercise.saetze.forEach((satz, satzIdx) => {
                    if (satz.wiederholungen && satz.wiederholungen !== '' && satz.wiederholungen !== null) {
                        alleErgebnisse.push({
                            uebung_id: exercise.uebung_id,
                            satz_nummer: satzIdx + 1,
                            wiederholungen: parseInt(satz.wiederholungen),
                            gewicht_kg: satz.gewicht_kg && satz.gewicht_kg !== '' ? parseFloat(satz.gewicht_kg) : null,
                            notizen: satz.notizen || null
                        });
                    }
                });
            });

            const uebungenReihenfolge = editedErgebnisse.map((ex, idx) => ({
                uebung_id: ex.uebung_id,
                reihenfolge: idx + 1
            }));

            const formatDateForDB = (dateString) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };

            const formatTimeForDB = (timeString) => {
                if (!timeString) return null;
                const date = new Date(timeString);
                return date.toTimeString().split(' ')[0];
            };

            const payload = {
                nutzer_id: session.nutzer_id,
                trainingsplan_id: session.trainingsplan_typ === 'custom'
                    ? session.custom_plan_id
                    : session.standard_plan_id,
                trainingsplan_typ: session.trainingsplan_typ || 'standard', // NEU: Plantyp aus Session
                datum: formatDateForDB(editedSession.datum),
                startzeit: formatTimeForDB(editedSession.startzeit),
                endzeit: formatTimeForDB(editedSession.endzeit),
                notizen: editedSession.notizen,
                ergebnisse: alleErgebnisse,
                uebungen_reihenfolge: uebungenReihenfolge
            };

            await TrainingApi.updateSession(id, payload);

            setMessage({ type: 'success', text: 'Training erfolgreich gespeichert' });
            setIsEditing(false);

            await fetchTrainingDetails();

            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            console.error('Error response:', err.response?.data);
            setMessage({ type: 'error', text: err });
        } finally {
            setSaving(false);
        }
    };


    const handleSetChange = (uebungId, satzIdx, field, value) => {
        setEditedErgebnisse(prev => prev.map(ex => {
            if (ex.uebung_id === uebungId) {
                if (field === 'add') {
                    return {
                        ...ex,
                        saetze: [...ex.saetze, { wiederholungen: null, gewicht_kg: null, notizen: null }]
                    };
                }
                return {
                    ...ex,
                    saetze: ex.saetze.map((s, idx) => idx === satzIdx ? { ...s, [field]: value === '' ? null : value } : s
                    )
                };
            }
            return ex;
        }));
    };

    const handleDeleteSet = (uebungId, satzIdx) => {
        setEditedErgebnisse(prev => prev.map(ex => {
            if (ex.uebung_id === uebungId) {
                return {
                    ...ex,
                    saetze: ex.saetze.filter((_, idx) => idx !== satzIdx)
                };
            }
            return ex;
        }));
    };

    const handleDeleteExercise = (uebungId) => {
        if (window.confirm('Übung wirklich entfernen?')) {
            setEditedErgebnisse(prev => prev.filter(ex => ex.uebung_id !== uebungId));
        }
    };

    const handleAddUebung = () => {
        setSelectedUebung(null);
        setFilterKategorie('');
        setFilterZielmuskel('');
        setDialogOpen(true);
    };

    const handleDialogConfirm = () => {
        if (selectedUebung) {
            setEditedErgebnisse(prev => [...prev, {
                uebung_id: selectedUebung.id,
                uebung_name: selectedUebung.name,
                kategorie: selectedUebung.kategorie,
                zielmuskel: selectedUebung.zielmuskel,
                saetze: [
                    { wiederholungen: '', gewicht_kg: '', notizen: null },
                    { wiederholungen: '', gewicht_kg: '', notizen: null },
                    { wiederholungen: '', gewicht_kg: '', notizen: null },
                ]
            }]);
        }
        setDialogOpen(false);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (over && active.id !== over.id) {
            setEditedErgebnisse(prev => {
                const oldIndex = prev.findIndex(ex => ex.uebung_id === active.id);
                const newIndex = prev.findIndex(ex => ex.uebung_id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const handleDeleteSession = async () => {
        setDeleting(true);
        try {
            // Sende optional die Nutzer-ID mit, falls der Server diese zur Autorisierung erwartet
            const payload = session && session.nutzer_id ? { nutzer_id: session.nutzer_id } : undefined;
            await TrainingApi.deleteSession(id, payload);
            setDeleteDialogOpen(false);
            // Nach dem Löschen zurück zur Dashboard-Ansicht (früher '/login')
            navigate('/dashboard');
        } catch (err) {
            // Bessere Fehlerdiagnose: Status und Server-Antwort anzeigen
            console.error('Fehler beim Löschen:', err);
            if (err.response) {
                console.error('Antwort-Status:', err.response.status);
                console.error('Antwort-Daten:', err.response.data);
                if (err.response.status === 403) {
                    setMessage({ type: 'error', text: 'Keine Berechtigung, dieses Training zu löschen (403)' });
                } else if (err.response.data?.error) {
                    setMessage({ type: 'error', text: err.response.data.error });
                } else {
                    setMessage({ type: 'error', text: 'Training konnte nicht gelöscht werden' });
                }
            } else {
                setMessage({ type: 'error', text: 'Training konnte nicht gelöscht werden' });
            }
            setDeleteDialogOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    const groupedExercises = groupByExercise();

    if (loading) {
        return (
            <LoadingPage />
        );
    }

    if (!session) {
        return (
            <>
                <ThemeProvider theme={darkTheme}>
                    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                        <NavBar />
                        <Container maxWidth="sm" sx={{ pt: 4, px: 2 }}>
                            <Typography color="error">{message.text || 'Training nicht gefunden'}</Typography>
                        </Container>
                    </Box>
                </ThemeProvider>
                <NavBarBot mainBtnF={null} />
            </>
        );
    }

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{
                    bgcolor: 'background.default', minHeight: '100vh', pb: 10
                }}>
                    <NavBar />
                    <Container maxWidth="sm" sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
                        {/* Header */}

                        <HeaderCard title={isEditing ? "Training bearbeiten" : session.trainingsplan_name || 'Trainingseinheit'} />

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
                        {!isEditing && !isMobile && (
                            <Button variant="contained" onClick={() => handleStartEdit()}>Bearbeiten</Button>
                        )}
                        {isEditing && !isMobile && (
                            <Button variant="contained" onClick={() => handleSaveEdit()}>Speichern</Button>
                        )}
                        {isEditing && !isMobile && (
                            <Button variant="contained" onClick={() => handleCancelEdit()}>Abbrechen</Button>
                        )}
                        {isEditing && !isMobile && (
                            <Button variant="contained" onClick={() => setDeleteDialogOpen(true)}>Löschen</Button>
                        )}
                        {/* Session Info Card */}
                        <Paper
                            elevation={2}
                            sx={{
                                mb: 3,
                                p: 2,
                                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '16px'
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {!isEditing && (
                                    <Box sx={{ display: "flex" }}>
                                        {formatDate(session.datum)}
                                    </Box>
                                )}
                                {isEditing && (
                                    <>
                                        <TextField
                                            label="Datum"
                                            type="date"
                                            value={editedSession?.datum || ''}
                                            onChange={(e) => setEditedSession({ ...editedSession, datum: e.target.value })}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ mt: 1 }}
                                        />
                                        <TextField
                                            label="Notizen"
                                            value={editedSession?.notizen || ''}
                                            onChange={(e) => setEditedSession({ ...editedSession, notizen: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={2}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    </>
                                )}
                            </Box>

                            {session.notizen && !isEditing && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <Typography variant="caption" color="#93c5fd" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                        Notizen
                                    </Typography>
                                    <Typography variant="body2" color="#cbd5e1">
                                        {session.notizen}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {/* Übungen */}
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={700} color="#e0f2fe">
                                Übungen ({(isEditing ? editedErgebnisse : Object.keys(groupedExercises)).length})
                            </Typography>
                            {isEditing && (
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={handleAddUebung}
                                    variant="contained"
                                    size="small"
                                    sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
                                >
                                    Übung hinzufügen
                                </Button>
                            )}
                        </Box>

                        {(isEditing ? editedErgebnisse.length === 0 : Object.keys(groupedExercises).length === 0) ? (
                            <Paper sx={{ p: 3, bgcolor: '#1e293b', textAlign: 'center', borderRadius: '16px' }}>
                                <Typography color="#93c5fd">
                                    Keine Übungen für dieses Training gefunden
                                </Typography>
                            </Paper>
                        ) : isEditing ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={({ active }) => setActiveId(active.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={editedErgebnisse.map(ex => ex.uebung_id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {editedErgebnisse.map((exercise) => (
                                            <SortableExerciseCard
                                                key={exercise.uebung_id}
                                                exercise={exercise}
                                                onEdit={handleSetChange}
                                                onDelete={() => handleDeleteExercise(exercise.uebung_id)}
                                                onDeleteSet={handleDeleteSet}
                                                isEditing={true}
                                                isDragging={activeId === exercise.uebung_id}
                                            />
                                        ))}
                                    </Box>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {Object.entries(groupedExercises).map(([exerciseName, exercise], index) => (
                                    <Accordion
                                        key={index}
                                        defaultExpanded={index === 0}
                                        sx={{
                                            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '16px !important',
                                            '&:before': { display: 'none' },
                                            '&.Mui-expanded': { margin: 0 },
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{ color: '#3b82f6' }} />}
                                            sx={{
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                '&:hover': { background: 'rgba(59, 130, 246, 0.15)' },
                                                py: 1.5,
                                            }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <Typography fontWeight={700} color="#e0f2fe" sx={{ mb: 0.5 }}>
                                                    {exerciseName}
                                                </Typography>
                                                <Typography variant="caption" color="#64748b">
                                                    {exercise.saetze.length} Satz{exercise.saetze.length !== 1 ? 'e' : ''}
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                                            <TableContainer>
                                                <Table size="small" sx={{ mb: 1 }}>
                                                    <TableHead>
                                                        <TableRow sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                                            <TableCell sx={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.75rem' }}>Satz</TableCell>
                                                            <TableCell sx={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.75rem' }}>Wdh.</TableCell>
                                                            <TableCell sx={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.75rem' }}>Gewicht</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {exercise.saetze.map((set, setIndex) => (
                                                            <TableRow key={setIndex}>
                                                                <TableCell sx={{ color: '#e0f2fe', fontWeight: 600, py: 1 }}>{set.satz_nummer}</TableCell>
                                                                <TableCell sx={{ color: '#e0f2fe', fontWeight: 600, py: 1 }}>{set.wiederholungen}</TableCell>
                                                                <TableCell sx={{ color: '#e0f2fe', fontWeight: 600, py: 1 }}>
                                                                    {set.gewicht_kg ? `${set.gewicht_kg} kg` : '–'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            {exercise.saetze.some(s => s.notizen) && (
                                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                    <Typography variant="caption" color="#93c5fd" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                                                        Notizen
                                                    </Typography>
                                                    {exercise.saetze.map((set, idx) => (
                                                        set.notizen && (
                                                            <Typography key={idx} variant="caption" color="#cbd5e1" sx={{ display: 'block', mb: 0.5 }}>
                                                                <strong>Satz {set.satz_nummer}:</strong> {set.notizen}
                                                            </Typography>
                                                        )
                                                    ))}
                                                </Box>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        )}
                    </Container>

                    {/* Dialog zum Hinzufügen von Übungen */}
                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#e0f2fe' }}>
                            Übung hinzufügen
                        </DialogTitle>
                        <DialogContent sx={{ bgcolor: '#0f172a', pt: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Kategorie</InputLabel>
                                    <Select
                                        value={filterKategorie}
                                        onChange={(e) => setFilterKategorie(e.target.value)}
                                        label="Kategorie"
                                    >
                                        <MenuItem value="">Alle</MenuItem>
                                        {[...new Set(alleUebungen.map(u => u.kategorie))].map(kat => (
                                            <MenuItem key={kat} value={kat}>{kat}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel>Zielmuskel</InputLabel>
                                    <Select
                                        value={filterZielmuskel}
                                        onChange={(e) => setFilterZielmuskel(e.target.value)}
                                        label="Zielmuskel"
                                    >
                                        <MenuItem value="">Alle</MenuItem>
                                        {[...new Set(alleUebungen.map(u => u.zielmuskel))].map(zm => (
                                            <MenuItem key={zm} value={zm}>{zm}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Autocomplete
                                    options={alleUebungen.filter(u =>
                                        (!filterKategorie || u.kategorie === filterKategorie) &&
                                        (!filterZielmuskel || u.zielmuskel === filterZielmuskel)
                                    )}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedUebung}
                                    onChange={(e, newValue) => setSelectedUebung(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Übung wählen" />}
                                    size="small"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ bgcolor: '#0f172a', p: 2 }}>
                            <Button onClick={() => setDialogOpen(false)} sx={{ color: '#94a3b8' }}>
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleDialogConfirm}
                                variant="contained"
                                disabled={!selectedUebung}
                                sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                            >
                                Hinzufügen
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
                {/* Lösch-Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle sx={{ bgcolor: '#1e293b', color: '#e0f2fe' }}>
                        Training löschen?
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: '#0f172a', pt: 2 }}>
                        <Typography color="#cbd5e1">
                            Möchtest du diese Trainingseinheit wirklich unwiderruflich löschen?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: '#0f172a', p: 2, display: "flex", justifyContent: "space-evenly" }}>
                        <Button
                            onClick={() => handleDeleteSession()}
                            sx={{ color: '#94a3b8' }}
                            disabled={deleting}
                        >
                            Fortfahren
                        </Button>
                        <Button
                            onClick={() => setDeleteDialogOpen(false)}
                            sx={{ color: '#94a3b8' }}
                            disabled={deleting}
                        >
                            Abbrechen
                        </Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider >
            <NavBarBot
                mainBtnF={handleStartEdit}
                mainBtnTxt={<EditIcon />}

                // sideBtn1F={!isEditing ? (() => setDeleteDialogOpen(true)) : null}
                // sideBtn1Icon={!isEditing ? <DeleteIcon /> : null}

                sideBtn2F={isEditing ? (handleCancelEdit) : (() => setDeleteDialogOpen(true))}
                sideBtn2Icon={isEditing ? (<CancelIcon />) : <DeleteIcon />}

                sideBtn3F={isEditing ? (handleSaveEdit) : (null)}
                sideBtn3Icon={isEditing ? (<SaveIcon />) : (null)} />

        </>
    );
};

export default TrainingDetail;